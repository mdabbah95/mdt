# MEDI SAP Sync Server — Setup Guide

## Quick Start (on the computer with SAP access)

### 1. Copy Files
Copy the entire `server-setup` folder to your machine, e.g.:
```
C:\Users\mdabbah\Desktop\medi-sync\
```

### 2. Copy Server Code
Copy these files from the original server (`C:\Users\adly.sh\Desktop\dash\server\`):
- `sap-sync.js`
- `server.js`

Into the `server-setup` folder.

### 3. Install & Run
Double-click `setup.bat` or run:
```
cd C:\Users\mdabbah\Desktop\medi-sync
npm install
node server.js
```

### 4. Trigger Full Sync
Open browser: `http://localhost:8080/api/sync` (POST)
Or in CMD:
```
curl -X POST http://localhost:8080/api/sync?full=true
```

## Fix: Add Expenses to Apps Script Push

In `sap-sync.js`, find the `postToAppsScript({` call (around line 260) and add `expenses: monthlyExpenses,` like this:

```js
const result = await postToAppsScript({
    action: full ? 'sync' : 'update',
    sales: { ... },
    stock: items.map(...),
    costs: costs.map(...),
    expenses: monthlyExpenses,  // ← ADD THIS LINE
    cutoffDate: startDate.toISOString().split('T')[0],
});
```

## Update Apps Script in Google Sheets

1. Open Google Sheets → Extensions → Apps Script
2. Replace ALL code with contents of `apps-script-v8.js`
3. Deploy → Manage deployments → Update existing deployment
4. Or: Deploy → New deployment → Web App → Execute as Me, Access Anyone
