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

// ---- SCHEDULED TRIGGER (optional: run every hour) ----
// Set up via Apps Script Triggers: refreshFromSAP, Time-driven, Every hour
