/**
 * MEDI SAP B1 Sync Server
 *
 * - CORS proxy at /sap/* → SAP B1 Service Layer
 * - REST API: /api/stock, /api/sync, /api/status
 * - Auto-scheduler for SAP → Google Sheets sync
 */

'use strict';

require('dotenv').config({ path: require('path').join(__dirname, '.env') });

const http = require('node:http');
const https = require('node:https');
const { URL } = require('node:url');
const sync = require('./sap-sync');

const PORT = parseInt(process.env.PORT || '8080');
const API_TOKEN = process.env.API_TOKEN || '';
const SAP_BASE = `https://${process.env.SAP_HOST || 'localhost'}:${process.env.SAP_PORT || '50000'}`;

// Shared HTTPS agent for SAP proxy (accepts self-signed certs)
const sapAgent = new https.Agent({ rejectUnauthorized: false, keepAlive: true });

// ═══════════════════════════════════════
//  CORS HEADERS
// ═══════════════════════════════════════

function setCors(res) {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, PATCH, DELETE, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Cookie, Prefer, Authorization, B1SESSION');
    res.setHeader('Access-Control-Allow-Credentials', 'true');
    res.setHeader('Access-Control-Max-Age', '86400');
}

// ═══════════════════════════════════════
//  SAP CORS PROXY
// ═══════════════════════════════════════

function proxySap(req, res, sapPath) {
    const target = new URL(`${SAP_BASE}/b1s/v1/${sapPath}`);

    // Collect incoming body
    const bodyChunks = [];
    req.on('data', c => bodyChunks.push(c));
    req.on('end', () => {
        const body = Buffer.concat(bodyChunks);

        const opts = {
            hostname: target.hostname,
            port: target.port,
            path: target.pathname + target.search,
            method: req.method,
            agent: sapAgent,
            headers: {
                'Content-Type': req.headers['content-type'] || 'application/json',
                'Prefer': req.headers['prefer'] || 'odata.maxpagesize=5000',
            },
            timeout: 30000,
        };

        // Forward session cookie if present
        if (req.headers.cookie) {
            opts.headers['Cookie'] = req.headers.cookie;
        }
        // Or B1SESSION header
        if (req.headers.b1session) {
            opts.headers['Cookie'] = `B1SESSION=${req.headers.b1session}`;
        }

        if (body.length > 0) {
            opts.headers['Content-Length'] = body.length;
        }

        const proxy = https.request(opts, proxyRes => {
            setCors(res);
            res.writeHead(proxyRes.statusCode, {
                'Content-Type': proxyRes.headers['content-type'] || 'application/json',
            });

            // Forward Set-Cookie for session
            if (proxyRes.headers['set-cookie']) {
                res.setHeader('Access-Control-Expose-Headers', 'Set-Cookie');
            }

            proxyRes.pipe(res);
        });

        proxy.on('error', err => {
            sync.log('PROXY', `Error: ${err.message}`);
            setCors(res);
            res.writeHead(502, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify({ error: 'SAP connection failed', message: err.message }));
        });

        proxy.on('timeout', () => {
            proxy.destroy();
            setCors(res);
            res.writeHead(504, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify({ error: 'SAP request timeout' }));
        });

        if (body.length > 0) proxy.write(body);
        proxy.end();
    });
}

// ═══════════════════════════════════════
//  API ROUTES
// ═══════════════════════════════════════

function sendJson(res, status, data) {
    setCors(res);
    res.writeHead(status, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify(data));
}

function readBody(req) {
    return new Promise(resolve => {
        const chunks = [];
        req.on('data', c => chunks.push(c));
        req.on('end', () => resolve(Buffer.concat(chunks).toString('utf8')));
    });
}

async function handleApi(req, res, path) {
    // GET /api/status
    if (path === '/api/status' && req.method === 'GET') {
        return sendJson(res, 200, sync.getStatus());
    }

    // GET /api/stock
    if (path.startsWith('/api/stock') && req.method === 'GET') {
        try {
            const url = new URL(req.url, `http://${req.headers.host}`);
            const code = url.searchParams.get('code');
            const stock = await sync.getStock(code || null);
            return sendJson(res, 200, { ok: true, count: stock.length, items: stock });
        } catch (err) {
            return sendJson(res, 500, { ok: false, error: err.message });
        }
    }

    // GET /api/costs
    if (path.startsWith('/api/costs') && req.method === 'GET') {
        try {
            const url = new URL(req.url, `http://${req.headers.host}`);
            const code = url.searchParams.get('code');
            const costs = await sync.getCosts(code || null);
            return sendJson(res, 200, { ok: true, count: costs.length, items: costs });
        } catch (err) {
            return sendJson(res, 500, { ok: false, error: err.message });
        }
    }

    // POST /api/sync or GET /api/sync
    if (path.startsWith('/api/sync')) {
        // Simple token auth
        if (API_TOKEN) {
            const auth = req.headers.authorization || '';
            if (auth !== `Bearer ${API_TOKEN}` && auth !== API_TOKEN) {
                return sendJson(res, 401, { error: 'Invalid API token' });
            }
        }
        try {
            const url = new URL(req.url, `http://${req.headers.host}`);
            const full = url.searchParams.get('full') === 'true';
            const result = await sync.syncNow(full);
            return sendJson(res, result.ok ? 200 : 500, result);
        } catch (err) {
            return sendJson(res, 500, { ok: false, error: err.message });
        }
    }

    sendJson(res, 404, { error: 'Not found' });
}

// ═══════════════════════════════════════
//  HTTP SERVER
// ═══════════════════════════════════════

const server = http.createServer(async (req, res) => {
    const url = new URL(req.url, `http://${req.headers.host}`);
    const path = url.pathname;

    // Handle CORS preflight
    if (req.method === 'OPTIONS') {
        setCors(res);
        res.writeHead(204);
        return res.end();
    }

    // SAP CORS Proxy: /sap/* → SAP B1 Service Layer
    if (path.startsWith('/sap/')) {
        const sapPath = path.substring(5) + url.search; // strip "/sap/"
        return proxySap(req, res, sapPath);
    }

    // API routes
    if (path.startsWith('/api/')) {
        return handleApi(req, res, path);
    }

    // Health check at root
    if (path === '/' || path === '/health') {
        return sendJson(res, 200, {
            name: 'MEDI SAP Sync Server',
            version: '1.0.0',
            status: 'running',
            uptime: Math.round(process.uptime()) + 's',
        });
    }

    sendJson(res, 404, { error: 'Not found' });
});

// ═══════════════════════════════════════
//  STARTUP
// ═══════════════════════════════════════

server.listen(PORT, '0.0.0.0', () => {
    console.log('');
    console.log('  ╔══════════════════════════════════════════╗');
    console.log('  ║   MEDI SAP B1 Sync Server               ║');
    console.log('  ╠══════════════════════════════════════════╣');
    console.log(`  ║  Server:  http://0.0.0.0:${PORT}            ║`);
    console.log(`  ║  SAP B1:  ${SAP_BASE.padEnd(30)}║`);
    console.log('  ╠══════════════════════════════════════════╣');
    console.log('  ║  Routes:                                 ║');
    console.log('  ║    /sap/*       CORS proxy to SAP B1     ║');
    console.log('  ║    /api/status  Server health             ║');
    console.log('  ║    /api/stock   Real-time stock levels    ║');
    console.log('  ║    /api/costs   BOM cost & profitability  ║');
    console.log('  ║    /api/sync    Manual sync trigger       ║');
    console.log('  ╚══════════════════════════════════════════╝');
    console.log('');

    // Start the auto-sync scheduler
    if (process.env.SAP_HOST && process.env.SAP_HOST !== '192.168.1.100') {
        sync.startScheduler();
    } else {
        sync.log('MAIN', 'SAP_HOST not configured, scheduler disabled. Edit .env to enable.');
    }
});

server.on('error', err => {
    if (err.code === 'EADDRINUSE') {
        console.error(`Port ${PORT} is already in use. Change PORT in .env`);
    } else {
        console.error('Server error:', err.message);
    }
    process.exit(1);
});

// Graceful shutdown
process.on('SIGINT', () => {
    console.log('\nShutting down...');
    sync.stopScheduler();
    server.close(() => process.exit(0));
});
