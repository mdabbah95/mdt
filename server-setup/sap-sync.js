/**
 * MEDI SAP B1 Sync Engine
 *
 * Connects to SAP B1 Service Layer, fetches DeliveryNotes + Items,
 * transforms data, and pushes to Google Sheets via Apps Script.
 */

'use strict';

const https = require('node:https');
const http = require('node:http');

// ── Config ──
const CFG = {
    sapHost:    process.env.SAP_HOST || '192.168.1.100',
    sapPort:    parseInt(process.env.SAP_PORT || '50000'),
    company:    process.env.SAP_COMPANY || '',
    user:       process.env.SAP_USER || '',
    password:   process.env.SAP_PASSWORD || '',
    months:     parseInt(process.env.SAP_MONTHS || '18'),
    scriptUrl:  process.env.APPS_SCRIPT_URL || '',
    syncInterval: parseInt(process.env.SYNC_INTERVAL_MS || '3600000'),
};

// Shared HTTPS agent that accepts self-signed certs
const agent = new https.Agent({ rejectUnauthorized: false, keepAlive: true });

// ── State ──
let sessionId = null;
let lastSync = null;
let lastSyncRows = 0;
let syncInProgress = false;

const stockCache = { data: null, ts: 0 };
const costCache = { data: null, ts: 0 };

// ═══════════════════════════════════════
//  SAP B1 SERVICE LAYER CLIENT
// ═══════════════════════════════════════

function sapRequest(method, path, body) {
    return new Promise((resolve, reject) => {
        const url = new URL(`https://${CFG.sapHost}:${CFG.sapPort}/b1s/v1/${path}`);
        const opts = {
            hostname: url.hostname,
            port: url.port,
            path: url.pathname + url.search,
            method,
            agent,
            headers: {
                'Content-Type': 'application/json',
                'Prefer': 'odata.maxpagesize=5000',
            },
            timeout: 120000,
        };

        if (sessionId) {
            opts.headers['Cookie'] = `B1SESSION=${sessionId}`;
        }

        const payload = body ? JSON.stringify(body) : null;
        if (payload) opts.headers['Content-Length'] = Buffer.byteLength(payload);

        const req = https.request(opts, res => {
            const chunks = [];
            res.on('data', c => chunks.push(c));
            res.on('end', () => {
                const raw = Buffer.concat(chunks).toString('utf8');
                let json;
                try { json = JSON.parse(raw); } catch { json = raw; }
                resolve({ status: res.statusCode, data: json, headers: res.headers });
            });
        });

        req.on('error', reject);
        req.on('timeout', () => { req.destroy(); reject(new Error('SAP request timeout')); });
        if (payload) req.write(payload);
        req.end();
    });
}

async function sapLogin() {
    log('SAP', 'Logging in...');
    const res = await sapRequest('POST', 'Login', {
        CompanyDB: CFG.company,
        UserName: CFG.user,
        Password: CFG.password,
    });

    if (res.status !== 200) {
        const msg = res.data?.error?.message?.value || res.data?.error?.message || JSON.stringify(res.data);
        throw new Error(`SAP login failed (${res.status}): ${msg}`);
    }

    sessionId = res.data.SessionId;
    log('SAP', `Logged in. Session: ${sessionId.substring(0, 8)}...`);
    return sessionId;
}

async function sapFetch(path) {
    if (!sessionId) await sapLogin();

    let res = await sapRequest('GET', path);

    // Auto-retry on 401 (session expired)
    if (res.status === 401) {
        log('SAP', 'Session expired, re-logging in...');
        await sapLogin();
        res = await sapRequest('GET', path);
    }

    if (res.status !== 200) {
        const msg = res.data?.error?.message?.value || JSON.stringify(res.data);
        throw new Error(`SAP fetch failed (${res.status}): ${msg}`);
    }

    return res.data;
}

async function sapFetchAll(path, filter) {
    const all = [];
    let skip = 0;
    const top = 5000;
    const sep = path.includes('?') ? '&' : '?';
    const filterPart = filter ? `&$filter=${encodeURIComponent(filter)}` : '';

    while (true) {
        const url = `${path}${sep}$top=${top}&$skip=${skip}${filterPart}`;
        const data = await sapFetch(url);
        const items = data.value || [];
        all.push(...items);
        log('SAP', `Fetched ${items.length} records (total: ${all.length})`);
        if (items.length < top) break;
        skip += top;
    }

    return all;
}

// ═══════════════════════════════════════
//  DATA TRANSFORMATION
// ═══════════════════════════════════════

function getDateFilter() {
    const d = new Date();
    d.setMonth(d.getMonth() - CFG.months);
    return d.toISOString().split('T')[0]; // YYYY-MM-DD
}

function flattenDeliveryNotes(docs, itemLookup) {
    const rows = [];
    let logged = false;
    for (const doc of docs) {
        const date = (doc.DocDate || '').split('T')[0];
        const cardName = doc.CardName || '';
        const lines = doc.DocumentLines || [];

        for (const line of lines) {
            const qty = line.InventoryQuantity ?? line.Quantity ?? 0;
            const price = line.UnitPrice ?? line.Price ?? 0;

            if (!logged || rows.length < 5) {
                const cost = line.GrossBuyPrice || 0;
                const profit = line.GrossProfit || 0;
                const margin = line.LineTotal > 0 ? ((profit / line.LineTotal) * 100).toFixed(1) : 0;
                log('DEBUG', `${line.ItemCode} "${(line.ItemDescription||'').substring(0,25)}" | Qty=${qty} | SellPrice=${price} | CostPrice=${cost} | LineTotal=${line.LineTotal} | GrossProfit=${profit} | Margin=${margin}%`);
                logged = true;
            }

            rows.push({
                ItemCode:   line.ItemCode || '',
                ItemName:   line.ItemDescription || '',
                CardName:   cardName,
                Date:       date,
                Quantity:   qty,
                UnitWeight: line.Weight1PerUnit || 0,
                Price:      price,
                Total:      line.LineTotal || 0,
            });
        }
    }
    return rows;
}

// ═══════════════════════════════════════
//  GOOGLE SHEETS (VIA APPS SCRIPT)
// ═══════════════════════════════════════

function postToAppsScript(payload) {
    return new Promise((resolve, reject) => {
        if (!CFG.scriptUrl) {
            return reject(new Error('APPS_SCRIPT_URL not configured'));
        }

        const url = new URL(CFG.scriptUrl);
        const data = JSON.stringify(payload);
        const isHttps = url.protocol === 'https:';
        const mod = isHttps ? https : http;

        const opts = {
            hostname: url.hostname,
            port: url.port || (isHttps ? 443 : 80),
            path: url.pathname + url.search,
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Content-Length': Buffer.byteLength(data),
            },
            timeout: 120000, // 2 min for large datasets
        };

        // Follow redirects (Apps Script redirects on deploy)
        const makeReq = (reqOpts, body, depth = 0) => {
            if (depth > 5) return reject(new Error('Too many redirects'));
            const r = mod.request(reqOpts, res => {
                if (res.statusCode >= 300 && res.statusCode < 400 && res.headers.location) {
                    const loc = new URL(res.headers.location);
                    const rmod = loc.protocol === 'https:' ? https : http;
                    const ropts = {
                        hostname: loc.hostname,
                        port: loc.port || (loc.protocol === 'https:' ? 443 : 80),
                        path: loc.pathname + loc.search,
                        method: 'GET', // Redirects from POST become GET
                        headers: {},
                        timeout: 120000,
                    };
                    const rr = rmod.request(ropts, rres => {
                        const chunks = [];
                        rres.on('data', c => chunks.push(c));
                        rres.on('end', () => {
                            const raw = Buffer.concat(chunks).toString('utf8');
                            try { resolve(JSON.parse(raw)); } catch { resolve(raw); }
                        });
                    });
                    rr.on('error', reject);
                    rr.end();
                    return;
                }
                const chunks = [];
                res.on('data', c => chunks.push(c));
                res.on('end', () => {
                    const raw = Buffer.concat(chunks).toString('utf8');
                    try { resolve(JSON.parse(raw)); } catch { resolve(raw); }
                });
            });
            r.on('error', reject);
            r.on('timeout', () => { r.destroy(); reject(new Error('Apps Script timeout')); });
            r.write(body);
            r.end();
        };

        makeReq(opts, data);
    });
}

// ═══════════════════════════════════════
//  SYNC ORCHESTRATION
// ═══════════════════════════════════════

async function syncNow(full = false) {
    if (syncInProgress) {
        log('SYNC', 'Sync already in progress, skipping');
        return { ok: false, reason: 'already running' };
    }

    syncInProgress = true;
    const t0 = Date.now();
    const mode = full ? 'FULL' : 'QUICK';
    log('SYNC', `══════ Starting ${mode} sync ══════`);

    try {
        // 1. Login to SAP
        await sapLogin();

        // 2. Determine date range
        const now = new Date();
        let startDate;
        if (full) {
            // Full sync: go back SAP_MONTHS months
            startDate = new Date(now);
            startDate.setMonth(startDate.getMonth() - CFG.months);
        } else {
            // Quick sync: only last 2 months (fast, ~1 min)
            startDate = new Date(now.getFullYear(), now.getMonth() - 1, 1);
        }

        log('SYNC', `Fetching DeliveryNotes from ${startDate.toISOString().split('T')[0]}...`);

        // Fetch month by month to avoid timeout
        let allDocs = [];
        let cur = new Date(startDate.getFullYear(), startDate.getMonth(), 1);

        while (cur <= now) {
            const y = cur.getFullYear();
            const m = String(cur.getMonth() + 1).padStart(2, '0');
            const nextM = new Date(y, cur.getMonth() + 1, 1);
            const fromStr = `${y}-${m}-01`;
            const toStr = `${nextM.getFullYear()}-${String(nextM.getMonth() + 1).padStart(2, '0')}-01`;

            log('SYNC', `Fetching ${y}-${m}...`);
            try {
                const docs = await sapFetchAll(
                    'DeliveryNotes?$select=DocDate,CardName,DocumentLines',
                    `DocDate ge '${fromStr}' and DocDate lt '${toStr}'`
                );
                allDocs.push(...docs);
                log('SYNC', `  ${docs.length} docs (total: ${allDocs.length})`);
            } catch (e) {
                log('SYNC', `  Error: ${e.message}`);
            }
            cur = nextM;
        }

        log('SYNC', `Got ${allDocs.length} delivery notes total`);

        // 4. Fetch item master data (stock + units per carton)
        log('SYNC', 'Fetching item data...');
        const items = await sapFetchAll('Items?$select=ItemCode,ItemName,QuantityOnStock,U_M4UUnitsInBox');

        // Build lookup: ItemCode → units per box
        const itemLookup = {};
        let upcCount = 0;
        for (const it of items) {
            const upb = it.U_M4UUnitsInBox || 1;
            itemLookup[it.ItemCode] = { unitsInBox: upb };
            if (upb > 1) upcCount++;
        }
        log('SYNC', `Units-per-box: ${upcCount} items have >1 unit per box`);

        const rows = flattenDeliveryNotes(allDocs, itemLookup);
        log('SYNC', `Flattened to ${rows.length} rows`);
        log('SYNC', `Got ${items.length} items with stock`);

        // Update stock cache
        stockCache.data = items;
        stockCache.ts = Date.now();

        // 4b. Fetch BOM costs
        let costs = [];
        try {
            costs = await fetchBomCosts();
            costCache.data = costs;
            costCache.ts = Date.now();
            log('SYNC', `Calculated costs for ${costs.length} products`);
        } catch (err) {
            log('SYNC', `BOM cost fetch failed (non-fatal): ${err.message}`);
        }

        // 4c. Fetch monthly GL expenses
        let monthlyExpenses = {};
        try {
            monthlyExpenses = await fetchMonthlyExpenses(full ? 18 : 3);
        } catch (err) {
            log('SYNC', `Monthly expenses fetch failed (non-fatal): ${err.message}`);
        }

        // 5. Push to Google Sheets via Apps Script
        if (CFG.scriptUrl) {
            log('SYNC', `Pushing to Google Sheets (${mode})...`);
            const result = await postToAppsScript({
                action: full ? 'sync' : 'update',
                sales: {
                    headers: ['ItemCode', 'ItemName', 'CardName', 'DocDate', 'InvQty', 'NetWeight', 'Price', 'LineTotal'],
                    rows: rows.map(r => [r.ItemCode, r.ItemName, r.CardName, r.Date, r.Quantity, r.UnitWeight, r.Price, r.Total]),
                },
                stock: items.map(i => [i.ItemCode, i.ItemName || '', i.QuantityOnStock || 0]),
                costs: costs.map(c => [c.parentCode, c.costPerUnit, c.batchCost, c.batchQty, c.totalWasteCost, c.wastePercent, JSON.stringify(c.components)]),
                expenses: monthlyExpenses,
                cutoffDate: startDate.toISOString().split('T')[0],
            });
            log('SYNC', `Sheets response: ${JSON.stringify(result).substring(0, 200)}`);
        } else {
            log('SYNC', 'APPS_SCRIPT_URL not set, skipping Sheets push');
        }

        // Write monthly expenses JSON to _deploy folder for dashboard
        try {
            const fs = require('fs');
            const expPath = require('path').join(__dirname, '..', '_deploy', 'expenses.json');
            fs.writeFileSync(expPath, JSON.stringify(monthlyExpenses));
            log('SYNC', `Wrote expenses.json (${Object.keys(monthlyExpenses).length} months)`);
        } catch (e) {
            log('SYNC', `expenses.json write failed: ${e.message}`);
        }

        const duration = ((Date.now() - t0) / 1000).toFixed(1);
        lastSync = new Date().toISOString();
        lastSyncRows = rows.length;

        log('SYNC', `══════ Sync complete: ${rows.length} rows in ${duration}s ══════`);
        return { ok: true, rows: rows.length, stock: items.length, duration: `${duration}s` };

    } catch (err) {
        log('SYNC', `ERROR: ${err.message}`);
        return { ok: false, error: err.message };
    } finally {
        syncInProgress = false;
    }
}

// ═══════════════════════════════════════
//  STOCK ENDPOINT
// ═══════════════════════════════════════

async function getStock(itemCode) {
    // Use cache if fresh (5 min)
    if (stockCache.data && (Date.now() - stockCache.ts < 300000)) {
        const data = stockCache.data;
        if (itemCode) return data.filter(i => i.ItemCode === itemCode);
        return data;
    }

    // Fetch fresh
    try {
        const items = await sapFetchAll('Items?$select=ItemCode,ItemName,QuantityOnStock,U_M4UUnitsInBox');
        stockCache.data = items;
        stockCache.ts = Date.now();
        if (itemCode) return items.filter(i => i.ItemCode === itemCode);
        return items;
    } catch (err) {
        log('STOCK', `Error: ${err.message}`);
        // Return stale cache if available
        if (stockCache.data) {
            if (itemCode) return stockCache.data.filter(i => i.ItemCode === itemCode);
            return stockCache.data;
        }
        throw err;
    }
}

// ═══════════════════════════════════════
//  BOM COST CALCULATION
// ═══════════════════════════════════════

async function fetchBomCosts() {
    log('COST', 'Fetching ProductTrees (BOM)...');
    const trees = await sapFetchAll(
        'ProductTrees?$select=TreeCode,Quantity,TreeType,ProductTreeLines'
    );
    log('COST', `Got ${trees.length} BOMs`);

    // Fetch items with prices (PriceList 10 = last purchase price in this SAP)
    log('COST', 'Fetching item prices...');
    const items = await sapFetchAll(
        'Items?$select=ItemCode,ItemName,AvgStdPrice,MovingAveragePrice,ItemPrices'
    );

    // Build price map: ItemCode → { name, price }
    // Priority: PriceList 10 (last purchase) > MovingAveragePrice > AvgStdPrice
    const priceMap = {};
    for (const it of items) {
        let price = 0;
        // Try PriceList 10 (last purchase price)
        const pl10 = (it.ItemPrices || []).find(p => p.PriceList === 10);
        if (pl10 && pl10.Price > 0) price = pl10.Price;
        // Fallback to MovingAveragePrice
        if (price === 0 && it.MovingAveragePrice > 0) price = it.MovingAveragePrice;
        // Fallback to AvgStdPrice
        if (price === 0 && it.AvgStdPrice > 0) price = it.AvgStdPrice;
        priceMap[it.ItemCode] = {
            name: it.ItemName || '',
            avgPrice: price,
            lastPrice: price,
        };
    }
    log('COST', `Price map: ${Object.keys(priceMap).length} items`);

    // Build BOM lookup for multi-level resolution
    const bomMap = {};
    for (const tree of trees) {
        bomMap[tree.TreeCode] = tree;
    }

    // Resolve a component's cost — if it's a semi-finished item with its own BOM, recurse
    function resolveComponentCost(code, qty, scrap, depth) {
        if (depth > 5) return []; // prevent infinite recursion
        const pm = priceMap[code] || {};
        const price = pm.avgPrice || 0;

        // If it has a price, use it directly
        if (price > 0) {
            const grossQty = qty;
            const wastePercent = scrap || 0;
            const netQty = grossQty * (1 - wastePercent / 100);
            const lineCost = grossQty * price;
            const wasteCost = grossQty * (wastePercent / 100) * price;
            return [{
                code, name: pm.name || '', grossQty, netQty, wastePercent,
                unitPrice: price, lineCost, wasteCost,
            }];
        }

        // If it has its own BOM, resolve recursively (semi-finished product)
        const subBom = bomMap[code];
        if (subBom) {
            const subBatchQty = subBom.Quantity || 1;
            const results = [];
            for (const subLine of (subBom.ProductTreeLines || [])) {
                // Scale sub-component qty: (parent needs `qty` of this semi-finished) × (sub-component per batch / batch output)
                const scaledQty = qty * ((subLine.Quantity || 0) / subBatchQty);
                const subResults = resolveComponentCost(subLine.ItemCode, scaledQty, subLine.ScrapPercentage || 0, depth + 1);
                results.push(...subResults);
            }
            return results;
        }

        // No price and no BOM — return with zero (will be flagged)
        return [{
            code, name: pm.name || '', grossQty: qty, netQty: qty, wastePercent: scrap || 0,
            unitPrice: 0, lineCost: 0, wasteCost: 0,
        }];
    }

    // Calculate cost per product
    const costs = [];
    for (const tree of trees) {
        const parentCode = tree.TreeCode;
        const batchQty = tree.Quantity || 1;
        const lines = tree.ProductTreeLines || [];

        let batchCost = 0;
        let batchWaste = 0;
        const components = [];

        for (const line of lines) {
            if (!line.ItemCode) continue; // skip phantom/null components
            const resolved = resolveComponentCost(line.ItemCode, line.Quantity || 0, line.ScrapPercentage || 0, 0);
            for (const comp of resolved) {
                if (!comp.code) continue; // skip null resolved components
                batchCost += comp.lineCost;
                batchWaste += comp.wasteCost;
                components.push({
                    code: comp.code,
                    name: comp.name,
                    grossQty: Math.round(comp.grossQty * 1000) / 1000,
                    netQty: Math.round(comp.netQty * 1000) / 1000,
                    wastePercent: comp.wastePercent,
                    unitPrice: Math.round(comp.unitPrice * 100) / 100,
                    lineCost: Math.round(comp.lineCost * 100) / 100,
                    wasteCost: Math.round(comp.wasteCost * 100) / 100,
                });
            }
        }

        const costPerUnit = batchQty > 0 ? Math.round((batchCost / batchQty) * 100) / 100 : 0;
        const overallWaste = batchCost > 0 ? Math.round((batchWaste / batchCost) * 10000) / 100 : 0;

        costs.push({
            parentCode,
            costPerUnit,
            batchQty,
            batchCost: Math.round(batchCost * 100) / 100,
            totalWasteCost: Math.round(batchWaste * 100) / 100,
            wastePercent: overallWaste,
            components,
        });
    }

    log('COST', `Calculated costs for ${costs.length} products`);
    return costs;
}

async function getCosts(itemCode) {
    // Use cache if fresh (5 min)
    if (costCache.data && (Date.now() - costCache.ts < 300000)) {
        const data = costCache.data;
        if (itemCode) return data.filter(c => c.parentCode === itemCode);
        return data;
    }

    try {
        const costs = await fetchBomCosts();
        costCache.data = costs;
        costCache.ts = Date.now();
        if (itemCode) return costs.filter(c => c.parentCode === itemCode);
        return costs;
    } catch (err) {
        log('COST', `Error: ${err.message}`);
        if (costCache.data) {
            if (itemCode) return costCache.data.filter(c => c.parentCode === itemCode);
            return costCache.data;
        }
        throw err;
    }
}

// ═══════════════════════════════════════
//  MONTHLY EXPENSES FROM SAP GL
// ═══════════════════════════════════════

async function fetchMonthlyExpenses(monthsBack = 18) {
    log('EXPENSES', 'Fetching monthly GL expenses...');

    // Get account names first
    const accts = await sapFetchAll("ChartOfAccounts?$select=Code,Name&$filter=AccountType eq 'at_Expenses'");
    const acctNames = {};
    for (const a of accts) acctNames[a.Code] = a.Name || a.Code;
    log('EXPENSES', `Loaded ${accts.length} expense account names`);

    const results = {};
    const now = new Date();

    for (let i = 0; i < monthsBack; i++) {
        const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
        const y = d.getFullYear();
        const m = String(d.getMonth() + 1).padStart(2, '0');
        const ym = `${y}-${m}`;
        const from = `${ym}-01`;
        const nextM = new Date(y, d.getMonth() + 1, 1);
        const to = `${nextM.getFullYear()}-${String(nextM.getMonth() + 1).padStart(2, '0')}-01`;

        try {
            const entries = await sapFetchAll(
                "JournalEntries?$select=JournalEntryLines",
                `ReferenceDate ge '${from}' and ReferenceDate lt '${to}'`
            );

            let total = 0;
            const accounts = {};
            for (const je of entries) {
                for (const line of (je.JournalEntryLines || [])) {
                    if (line.AccountCode && line.AccountCode.startsWith('8') && line.Debit > 0) {
                        total += line.Debit;
                        const code = line.AccountCode;
                        if (!accounts[code]) accounts[code] = { name: acctNames[code] || line.ShortName || code, amount: 0 };
                        accounts[code].amount += line.Debit;
                    }
                }
            }
            // Sort by amount descending and keep top items
            const sorted = Object.entries(accounts)
                .map(([code, d]) => ({ code, name: d.name, amount: Math.round(d.amount) }))
                .sort((a, b) => b.amount - a.amount);
            results[ym] = { total: Math.round(total), entries: entries.length, accounts: sorted.slice(0, 15) };
            log('EXPENSES', `  ${ym}: ₪${Math.round(total).toLocaleString()} (${entries.length} JEs)`);
        } catch (e) {
            log('EXPENSES', `  ${ym} error: ${e.message}`);
        }
    }

    return results;
}

// ═══════════════════════════════════════
//  SCHEDULER
// ═══════════════════════════════════════

let schedulerTimer = null;

function startScheduler() {
    if (CFG.syncInterval < 60000) {
        log('SCHED', 'Sync interval too short, minimum 1 minute');
        return;
    }

    const mins = (CFG.syncInterval / 60000).toFixed(0);
    log('SCHED', `Scheduling QUICK sync every ${mins} minutes (only last 2 months)`);
    log('SCHED', `Use /api/sync?full=true for full historical sync`);

    // First sync: quick (only last 2 months) - fast startup
    setTimeout(() => {
        syncNow(false).catch(err => log('SCHED', `Initial sync failed: ${err.message}`));
    }, 10000);

    // Recurring syncs: always quick (last 2 months only, ~1 min)
    schedulerTimer = setInterval(() => {
        syncNow(false).catch(err => log('SCHED', `Scheduled sync failed: ${err.message}`));
    }, CFG.syncInterval);
}

function stopScheduler() {
    if (schedulerTimer) {
        clearInterval(schedulerTimer);
        schedulerTimer = null;
        log('SCHED', 'Scheduler stopped');
    }
}

// ═══════════════════════════════════════
//  STATUS
// ═══════════════════════════════════════

function getStatus() {
    const nextSync = lastSync
        ? new Date(new Date(lastSync).getTime() + CFG.syncInterval).toISOString()
        : null;

    return {
        sapHost: CFG.sapHost,
        sapConnected: !!sessionId,
        lastSync,
        nextSync,
        rowsSynced: lastSyncRows,
        syncInProgress,
        stockCacheAge: stockCache.ts ? Math.round((Date.now() - stockCache.ts) / 1000) + 's' : null,
    };
}

// ═══════════════════════════════════════
//  LOGGING
// ═══════════════════════════════════════

function log(tag, msg) {
    const ts = new Date().toISOString().substring(11, 19);
    console.log(`[${ts}] [${tag}] ${msg}`);
}

// ═══════════════════════════════════════
//  EXPORTS
// ═══════════════════════════════════════

module.exports = {
    sapLogin,
    sapFetch,
    sapFetchAll,
    syncNow,
    getStock,
    getCosts,
    getStatus,
    startScheduler,
    stopScheduler,
    log,
};
