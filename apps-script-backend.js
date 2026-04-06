// ============================================================
// GOOGLE APPS SCRIPT — Deploy as Web App
// Paste this into your Google Sheet's Apps Script editor
// (Extensions > Apps Script) then Deploy > New Deployment > Web App
// Execute as: Me | Access: Anyone
// ============================================================

// ---- CONFIG ----
const SHEET_NAME = 'SalesData';       // Sheet tab name with SAP data
const SAP_JDBC_URL = 'jdbc:sqlserver://YOUR_SAP_SERVER:30015';  // SAP HANA or SQL Server
const SAP_USER     = 'YOUR_SAP_USER';
const SAP_PASS     = 'YOUR_SAP_PASS';
const SAP_QUERY    = `
  SELECT
    T0."DocDate"   AS "Date",
    T1."ItemCode"  AS "ProductCode",
    T1."Dscription" AS "Product",
    T0."CardName"  AS "Customer",
    T1."Quantity"   AS "Quantity",
    T1."LineTotal"  AS "SalesILS"
  FROM OINV T0
  INNER JOIN INV1 T1 ON T0."DocEntry" = T1."DocEntry"
  WHERE T0."DocDate" >= '2024-01-01'
  ORDER BY T0."DocDate" DESC
`;

// ---- WEB APP ENTRY POINTS ----

function doGet(e) {
  var action = (e && e.parameter && e.parameter.action) || 'getData';

  var result;
  if (action === 'refresh') {
    result = refreshFromSAP();
  } else {
    result = getSheetData();
  }

  return ContentService
    .createTextOutput(JSON.stringify(result))
    .setMimeType(ContentService.MimeType.JSON);
}

function doPost(e) {
  // Also support POST for QA form submissions (existing functionality)
  try {
    var body = JSON.parse(e.postData.contents);
    var ss = SpreadsheetApp.getActiveSpreadsheet();
    var logSheet = ss.getSheetByName('QA_Log') || ss.insertSheet('QA_Log');
    logSheet.appendRow([
      new Date().toLocaleString('he-IL'),
      body.formTitle || '',
      JSON.stringify(body.data || {}),
      (body.alerts || []).join(' | ')
    ]);
    return ContentService
      .createTextOutput(JSON.stringify({ status: 'ok' }))
      .setMimeType(ContentService.MimeType.JSON);
  } catch (err) {
    return ContentService
      .createTextOutput(JSON.stringify({ status: 'error', message: err.message }))
      .setMimeType(ContentService.MimeType.JSON);
  }
}

// ---- GET SHEET DATA ----
function getSheetData() {
  try {
    var ss = SpreadsheetApp.getActiveSpreadsheet();
    var sheet = ss.getSheetByName(SHEET_NAME);
    if (!sheet) {
      return { status: 'error', message: 'Sheet "' + SHEET_NAME + '" not found' };
    }

    var data = sheet.getDataRange().getValues();
    if (data.length < 2) {
      return { status: 'ok', headers: [], rows: [], lastSync: '' };
    }

    var headers = data[0];
    var rows = data.slice(1).map(function(row) {
      var obj = {};
      headers.forEach(function(h, i) {
        // Handle date objects
        if (row[i] instanceof Date) {
          obj[h] = Utilities.formatDate(row[i], Session.getScriptTimeZone(), 'yyyy-MM-dd');
        } else {
          obj[h] = row[i];
        }
      });
      return obj;
    });

    // Read last sync timestamp from Properties
    var lastSync = PropertiesService.getScriptProperties().getProperty('lastSAPSync') || 'Never';

    return {
      status: 'ok',
      headers: headers,
      rows: rows,
      totalRows: rows.length,
      lastSync: lastSync
    };

  } catch (err) {
    return { status: 'error', message: err.message };
  }
}

// ---- REFRESH FROM SAP VIA JDBC ----
function refreshFromSAP() {
  try {
    var conn = Jdbc.getConnection(SAP_JDBC_URL, SAP_USER, SAP_PASS);
    var stmt = conn.createStatement();
    var rs = stmt.executeQuery(SAP_QUERY);
    var meta = rs.getMetaData();
    var colCount = meta.getColumnCount();

    // Build headers
    var headers = [];
    for (var c = 1; c <= colCount; c++) {
      headers.push(meta.getColumnLabel(c));
    }

    // Build rows
    var rows = [];
    while (rs.next()) {
      var row = [];
      for (var c = 1; c <= colCount; c++) {
        row.push(rs.getString(c));
      }
      rows.push(row);
    }

    rs.close();
    stmt.close();
    conn.close();

    // Write to Sheet
    var ss = SpreadsheetApp.getActiveSpreadsheet();
    var sheet = ss.getSheetByName(SHEET_NAME);
    if (!sheet) {
      sheet = ss.insertSheet(SHEET_NAME);
    }

    sheet.clearContents();
    sheet.appendRow(headers);
    if (rows.length > 0) {
      sheet.getRange(2, 1, rows.length, colCount).setValues(rows);
    }

    // Save sync timestamp
    var syncTime = new Date().toLocaleString('he-IL');
    PropertiesService.getScriptProperties().setProperty('lastSAPSync', syncTime);

    return {
      status: 'ok',
      message: 'SAP refresh complete',
      rowCount: rows.length,
      lastSync: syncTime
    };

  } catch (err) {
    return { status: 'error', message: 'SAP refresh failed: ' + err.message };
  }
}

// ---- REFRESH COST DATA FROM SAP BOM ----
function refreshCosts() {
  try {
    var conn = Jdbc.getConnection(SAP_JDBC_URL, SAP_USER, SAP_PASS);
    var stmt = conn.createStatement();

    // SAP B1 BOM (Bill of Materials) query — gets cost per product
    var costQuery = `
      SELECT
        T0."Father"       AS "ParentCode",
        T2."ItemName"     AS "ParentName",
        T2."AvgPrice"     AS "CostPerUnit",
        SUM(T0."Quantity" * T1."AvgPrice") AS "BatchCost",
        T0."Qauntity"     AS "BatchQty",
        T2."AvgPrice"     AS "TotalCost"
      FROM ITT1 T0
      INNER JOIN OITM T1 ON T0."Code" = T1."ItemCode"
      INNER JOIN OITM T2 ON T0."Father" = T2."ItemCode"
      WHERE T2."SellItem" = 'Y'
      GROUP BY T0."Father", T2."ItemName", T2."AvgPrice", T0."Qauntity"
      ORDER BY T0."Father"
    `;

    var rs = stmt.executeQuery(costQuery);
    var rows = [];
    while (rs.next()) {
      rows.push([
        rs.getString('ParentCode'),
        rs.getDouble('CostPerUnit'),
        rs.getDouble('BatchCost'),
        rs.getDouble('BatchQty') || 1,
        0, // WasteCost
        0, // WastePercent
        0, // OverheadPerUnit
        rs.getDouble('TotalCost'),
        '[]' // Components
      ]);
    }
    rs.close(); stmt.close(); conn.close();

    // Write to CostData sheet
    var ss = SpreadsheetApp.getActiveSpreadsheet();
    var sheet = ss.getSheetByName('CostData');
    if (!sheet) sheet = ss.insertSheet('CostData');
    sheet.clearContents();
    sheet.appendRow(['ParentCode','CostPerUnit','BatchCost','BatchQty','WasteCost','WastePercent','OverheadPerUnit','TotalCost','Components']);
    if (rows.length > 0) {
      sheet.getRange(2, 1, rows.length, 9).setValues(rows);
    }

    var syncTime = new Date().toLocaleString('he-IL');
    PropertiesService.getScriptProperties().setProperty('lastCostSync', syncTime);
    return { status: 'ok', message: 'Cost data refreshed', rowCount: rows.length };
  } catch (err) {
    return { status: 'error', message: 'Cost refresh failed: ' + err.message };
  }
}

// ---- REFRESH EXPENSES FROM SAP GL ----
function refreshExpenses() {
  try {
    var conn = Jdbc.getConnection(SAP_JDBC_URL, SAP_USER, SAP_PASS);
    var stmt = conn.createStatement();

    // SAP B1 GL Journal Entries — expense accounts (8xxx)
    var expQuery = `
      SELECT
        LEFT(CAST(T0."RefDate" AS VARCHAR), 7) AS "Month",
        SUM(T0."Debit" - T0."Credit") AS "Total"
      FROM JDT1 T0
      WHERE T0."Account" LIKE '8%'
        AND T0."RefDate" >= '2024-01-01'
      GROUP BY LEFT(CAST(T0."RefDate" AS VARCHAR), 7)
      ORDER BY "Month"
    `;

    var rs = stmt.executeQuery(expQuery);
    var expenses = {};
    while (rs.next()) {
      var month = rs.getString('Month');
      expenses[month] = { total: rs.getDouble('Total') };
    }
    rs.close(); stmt.close(); conn.close();

    // Write expenses.json content to a sheet for the dashboard to read
    var ss = SpreadsheetApp.getActiveSpreadsheet();
    var sheet = ss.getSheetByName('ExpenseData');
    if (!sheet) sheet = ss.insertSheet('ExpenseData');
    sheet.clearContents();
    sheet.getRange(1,1).setValue(JSON.stringify(expenses));

    return { status: 'ok', message: 'Expenses refreshed', months: Object.keys(expenses).length };
  } catch (err) {
    return { status: 'error', message: 'Expense refresh failed: ' + err.message };
  }
}

// ---- ENHANCED doGet — support type parameter ----
function doGetEnhanced(e) {
  var type = (e && e.parameter && e.parameter.type) || '';
  var action = (e && e.parameter && e.parameter.action) || '';
  var callback = (e && e.parameter && e.parameter.callback) || '';

  var result;
  if (type === 'costs') {
    // Return CostData sheet as CSV
    result = getSheetCSV('CostData');
  } else if (type === 'stock') {
    result = getSheetCSV('StockData');
  } else if (type === 'expenses') {
    result = getExpensesJSON();
  } else if (action === 'refresh') {
    result = refreshFromSAP();
  } else if (action === 'refreshCosts') {
    refreshCosts();
    result = getSheetCSV('CostData');
  } else if (action === 'refreshExpenses') {
    refreshExpenses();
    result = getExpensesJSON();
  } else {
    // Default: return SalesData as CSV
    result = getSheetCSV(SHEET_NAME);
  }

  // Support JSONP callback for Safari
  if (callback) {
    return ContentService
      .createTextOutput(callback + '(' + JSON.stringify(result) + ')')
      .setMimeType(ContentService.MimeType.JAVASCRIPT);
  }

  return ContentService
    .createTextOutput(result)
    .setMimeType(ContentService.MimeType.TEXT);
}

function getSheetCSV(sheetName) {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var sheet = ss.getSheetByName(sheetName);
  if (!sheet) return '';
  var data = sheet.getDataRange().getValues();
  return data.map(function(row) {
    return row.map(function(cell) {
      if (cell instanceof Date) {
        return Utilities.formatDate(cell, Session.getScriptTimeZone(), 'yyyy-MM-dd');
      }
      var s = String(cell);
      if (s.indexOf(',') >= 0 || s.indexOf('"') >= 0 || s.indexOf('\n') >= 0) {
        return '"' + s.replace(/"/g, '""') + '"';
      }
      return s;
    }).join(',');
  }).join('\n');
}

function getExpensesJSON() {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var sheet = ss.getSheetByName('ExpenseData');
  if (!sheet) return '{}';
  return sheet.getRange(1,1).getValue() || '{}';
}

// ---- SCHEDULED TRIGGER (optional: run every hour) ----
// Set up via Apps Script Triggers: refreshFromSAP, Time-driven, Every hour
// Also add: refreshCosts, Time-driven, Every day
