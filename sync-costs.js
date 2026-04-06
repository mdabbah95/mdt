#!/usr/bin/env node
// ============================================================
// SAP B1 → Google Sheets Cost & Expense Sync
// Run on the same machine as SAP (same network)
// Usage: node sync-costs.js
// ============================================================

const https = require('https');
const http = require('http');

// ---- CONFIG ----
const SAP_HOST = '192.168.27.37';
const SAP_PORT = 50000;
const SAP_COMPANY = 'JJEZ';
const SAP_USER = 'nemi';
const SAP_PASS = '9999';

const SHEET_ID = '1IL5tujMfG22j5mAVkkdGae_czUu4Ec0ZQnUeiqrNfzU';
const APPS_SCRIPT_URL = 'https://script.google.com/macros/s/AKfycbyP0VCm0xjm-JnkOAvsY6mmbdSOKAPI-541k25qqumev9doPwL4ewi4WHByTm9Q5iCz/exec';

// ---- SAP B1 Service Layer ----
let sessionId = null;

function sapRequest(method, path, body) {
  return new Promise((resolve, reject) => {
    const options = {
      hostname: SAP_HOST,
      port: SAP_PORT,
      path: '/b1s/v1' + path,
      method: method,
      headers: {
        'Content-Type': 'application/json',
        ...(sessionId ? { 'Cookie': `B1SESSION=${sessionId}` } : {})
      },
      rejectUnauthorized: false // SAP often uses self-signed certs
    };

    const proto = SAP_PORT === 443 || SAP_PORT === 50000 ? https : http;
    const req = proto.request(options, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        try {
          // Handle session cookie
          if (res.headers['set-cookie']) {
            const match = res.headers['set-cookie'].join(';').match(/B1SESSION=([^;]+)/);
            if (match) sessionId = match[1];
          }
          resolve({ status: res.statusCode, data: data ? JSON.parse(data) : {} });
        } catch (e) {
          resolve({ status: res.statusCode, data: data });
        }
      });
    });
    req.on('error', reject);
    if (body) req.write(JSON.stringify(body));
    req.end();
  });
}

async function sapLogin() {
  console.log('🔑 Logging into SAP B1...');
  const res = await sapRequest('POST', '/Login', {
    CompanyDB: SAP_COMPANY,
    UserName: SAP_USER,
    Password: SAP_PASS
  });
  if (res.status !== 200) throw new Error('SAP Login failed: ' + JSON.stringify(res.data));
  console.log('✅ SAP Login successful');
}

async function sapLogout() {
  try { await sapRequest('POST', '/Logout'); } catch (e) {}
}

// ---- Fetch BOM Costs from ProductTrees ----
async function fetchCosts() {
  console.log('📦 Fetching BOM costs from ProductTrees...');
  const costs = [];
  let skip = 0;
  const top = 100;

  while (true) {
    const res = await sapRequest('GET',
      `/ProductTrees?$top=${top}&$skip=${skip}&$select=TreeCode,Quantity,TreeType,DistributionRule`
    );
    if (res.status !== 200 || !res.data || !res.data.value) break;
    const items = res.data.value;
    if (items.length === 0) break;

    for (const tree of items) {
      const code = tree.TreeCode;
      // Get item details for price
      try {
        const itemRes = await sapRequest('GET',
          `/Items('${encodeURIComponent(code)}')?$select=ItemCode,ItemName,AvgPrice,ItemPrices`
        );
        if (itemRes.status === 200 && itemRes.data) {
          const item = itemRes.data;
          let totalBomCost = 0;

          // Fetch BOM lines
          const bomRes = await sapRequest('GET',
            `/ProductTrees('${encodeURIComponent(code)}')`
          );
          if (bomRes.status === 200 && bomRes.data && bomRes.data.ProductTreeLines) {
            for (const line of bomRes.data.ProductTreeLines) {
              const childCode = line.ItemCode;
              const qty = line.Quantity || 0;
              // Get child item cost
              try {
                const childRes = await sapRequest('GET',
                  `/Items('${encodeURIComponent(childCode)}')?$select=AvgPrice`
                );
                if (childRes.status === 200 && childRes.data) {
                  totalBomCost += qty * (childRes.data.AvgPrice || 0);
                }
              } catch (e) {}
            }
          }

          const batchQty = tree.Quantity || 1;
          costs.push({
            ParentCode: code,
            CostPerUnit: totalBomCost / batchQty,
            BatchCost: totalBomCost,
            BatchQty: batchQty,
            WasteCost: 0,
            WastePercent: 0,
            OverheadPerUnit: 0,
            TotalCost: totalBomCost / batchQty,
            Components: '[]'
          });
        }
      } catch (e) {
        console.log(`  ⚠️ Skip ${code}: ${e.message}`);
      }
    }
    skip += top;
    if (items.length < top) break;
  }

  console.log(`✅ Found ${costs.length} products with BOM costs`);
  return costs;
}

// ---- Fetch Expenses from JournalEntries ----
async function fetchExpenses() {
  console.log('💰 Fetching expenses from JournalEntries...');
  const expenses = {};

  // Get expense accounts (8xxx) grouped by month
  let skip = 0;
  const top = 500;
  const since = '2024-01-01';

  while (true) {
    const filter = `RefDate ge '${since}' and startswith(AccountCode,'8')`;
    const res = await sapRequest('GET',
      `/JournalEntries?$top=${top}&$skip=${skip}&$filter=${encodeURIComponent(filter)}&$select=ReferenceDate,JournalEntryLines`
    );
    if (res.status !== 200 || !res.data || !res.data.value) break;
    const entries = res.data.value;
    if (entries.length === 0) break;

    for (const entry of entries) {
      const date = entry.ReferenceDate;
      if (!date) continue;
      const month = date.substring(0, 7); // YYYY-MM

      if (!expenses[month]) expenses[month] = { total: 0 };

      if (entry.JournalEntryLines) {
        for (const line of entry.JournalEntryLines) {
          if (line.AccountCode && line.AccountCode.startsWith('8')) {
            expenses[month].total += (line.Debit || 0) - (line.Credit || 0);
          }
        }
      }
    }
    skip += top;
    if (entries.length < top) break;
  }

  console.log(`✅ Found expenses for ${Object.keys(expenses).length} months`);
  return expenses;
}

// ---- Write to Google Sheets via Apps Script ----
async function writeToSheet(sheetName, headers, rows) {
  return new Promise((resolve, reject) => {
    const payload = JSON.stringify({
      action: 'writeSheet',
      sheetName,
      headers,
      rows
    });

    const url = new URL(APPS_SCRIPT_URL);
    const options = {
      hostname: url.hostname,
      path: url.pathname,
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(payload)
      }
    };

    const req = https.request(options, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        // Follow redirects (Apps Script returns 302)
        if (res.statusCode === 302 || res.statusCode === 301) {
          const redirectUrl = res.headers.location;
          https.get(redirectUrl, (res2) => {
            let data2 = '';
            res2.on('data', chunk => data2 += chunk);
            res2.on('end', () => resolve(data2));
          }).on('error', reject);
        } else {
          resolve(data);
        }
      });
    });
    req.on('error', reject);
    req.write(payload);
    req.end();
  });
}

// Alternative: Write directly via Google Sheets API (needs API key or service account)
// For now, use a simpler approach — generate CSV and use gviz import

// ---- Write CSV to Google Sheets using importData formula trick ----
// Actually, simplest: write a local CSV and the user can upload
// Or use the Google Sheets API with a service account

// ---- MAIN ----
async function main() {
  try {
    await sapLogin();

    // 1. Fetch and save costs
    const costs = await fetchCosts();
    if (costs.length > 0) {
      // Write to local CSV
      const costHeaders = ['ParentCode','CostPerUnit','BatchCost','BatchQty','WasteCost','WastePercent','OverheadPerUnit','TotalCost','Components'];
      let csv = costHeaders.join(',') + '\n';
      for (const c of costs) {
        csv += costHeaders.map(h => {
          const v = c[h];
          return typeof v === 'string' && v.includes(',') ? `"${v}"` : v;
        }).join(',') + '\n';
      }
      require('fs').writeFileSync('costs.csv', csv);
      console.log('📄 Saved costs.csv (' + costs.length + ' products)');

      // Also try to write to Google Sheets via Apps Script
      try {
        await writeToSheet('CostData', costHeaders, costs.map(c => costHeaders.map(h => c[h])));
        console.log('📊 Written to Google Sheets CostData tab');
      } catch (e) {
        console.log('⚠️ Could not write to Sheets directly. Upload costs.csv manually.');
      }
    }

    // 2. Fetch and save expenses
    const expenses = await fetchExpenses();
    if (Object.keys(expenses).length > 0) {
      require('fs').writeFileSync('expenses.json', JSON.stringify(expenses, null, 2));
      console.log('📄 Saved expenses.json (' + Object.keys(expenses).length + ' months)');
    }

    await sapLogout();
    console.log('\n✅ Sync complete!');
    console.log('📋 Next steps:');
    console.log('   1. Copy costs.csv and expenses.json to the Netlify site folder');
    console.log('   2. Or upload costs.csv to CostData tab in Google Sheets');
    console.log('   3. Refresh the dashboard');

  } catch (err) {
    console.error('❌ Error:', err.message);
    await sapLogout();
  }
}

main();
