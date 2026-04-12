/**
 * MEDI SAP Sync — Apps Script v8
 *
 * Changes from v7:
 * - Added expenses handling (doGet ?type=expenses, doPost writes ExpenseData)
 * - Added TotalCost + OverheadPerUnit columns to CostData
 * - Fixed writeCosts to include all 9 columns dashboard expects
 */

const SPREADSHEET_ID = '1IL5tujMfG22j5mAVkkdGae_czUu4Ec0ZQnUeiqrNfzU';
const SHEET_GID = 710074688;

function doGet(e) {
  try {
    var type = (e && e.parameter && e.parameter.type) || 'sales';
    var ss = SpreadsheetApp.openById(SPREADSHEET_ID);
    var sheet;
    if (type === 'meta') {
      var meta = ss.getSheetByName('SyncMeta');
      if (!meta) return textOut('No sync meta');
      var lastSync = meta.getRange('B1').getValue();
      var rows = meta.getRange('B2').getValue();
      return textOut('LastSync=' + lastSync + ',Rows=' + rows);
    }
    if (type === 'costs') {
      sheet = ss.getSheetByName('CostData');
      if (!sheet) return textOut('No cost data');
    } else if (type === 'stock') {
      sheet = ss.getSheetByName('StockData');
      if (!sheet) return textOut('No stock data');
    } else if (type === 'expenses') {
      // Return expenses JSON from ExpenseData sheet
      sheet = ss.getSheetByName('ExpenseData');
      if (!sheet) return textOut('{}');
      var val = sheet.getRange('A1').getValue();
      return textOut(val || '{}');
    } else {
      sheet = getMainSheet();
    }
    var data = sheet.getDataRange().getValues();
    if (!data || data.length === 0) return textOut('No data');
    var lines = [];
    for (var r = 0; r < data.length; r++) {
      var row = [];
      for (var c = 0; c < data[r].length; c++) {
        var val = data[r][c];
        if (val instanceof Date) {
          var d = val.getDate(), m = val.getMonth() + 1, y = val.getFullYear();
          val = (d<10?'0':'') + d + '/' + (m<10?'0':'') + m + '/' + (y%100<10?'0':'') + (y%100);
        }
        var s = String(val == null ? '' : val);
        if (s.indexOf(',') > -1 || s.indexOf('"') > -1 || s.indexOf('\n') > -1) s = '"' + s.replace(/"/g, '""') + '"';
        row.push(s);
      }
      lines.push(row.join(','));
    }
    return textOut(lines.join('\n'));
  } catch (err) { return textOut('Error: ' + err.message); }
}

function doPost(e) {
  try {
    var p = JSON.parse(e.postData.contents);
    if (p.action === 'sync') return handleFullSync(p);
    if (p.action === 'update') return handleQuickUpdate(p);
    return jsonOut({ok: false, error: 'Unknown action'});
  } catch (err) { return jsonOut({ok: false, error: err.message}); }
}

function handleFullSync(p) {
  var ss = SpreadsheetApp.openById(SPREADSHEET_ID);
  var written = 0;
  if (p.sales && p.sales.rows && p.sales.rows.length > 0) {
    var sheet = getMainSheet();
    sheet.clear();
    var maxR = sheet.getMaxRows();
    var maxC = sheet.getMaxColumns();
    if (maxC > 8) sheet.deleteColumns(9, maxC - 8);
    if (maxR > 2) sheet.deleteRows(3, maxR - 2);
    var h = p.sales.headers || ['ItemCode','ItemName','CardName','DocDate','InvQty','NetWeight','Price','LineTotal'];
    sheet.getRange(1, 1, 1, h.length).setValues([h]).setFontWeight('bold');
    var rows = p.sales.rows;
    var needed = rows.length + 1;
    var curR = sheet.getMaxRows();
    if (curR < needed) sheet.insertRowsAfter(curR, needed - curR);
    for (var i = 0; i < rows.length; i += 5000) {
      var batch = rows.slice(i, i + 5000);
      sheet.getRange(i + 2, 1, batch.length, h.length).setValues(batch);
    }
    written = rows.length;
    sheet.setFrozenRows(1);
  }
  writeStock(ss, p.stock);
  writeCosts(ss, p.costs);
  writeExpenses(ss, p.expenses);
  saveMeta(ss, written, 'full');
  return jsonOut({ok: true, mode: 'full', salesWritten: written});
}

function handleQuickUpdate(p) {
  var ss = SpreadsheetApp.openById(SPREADSHEET_ID);
  var written = 0;
  if (p.sales && p.sales.rows && p.sales.rows.length > 0 && p.cutoffDate) {
    var sheet = getMainSheet();
    var data = sheet.getDataRange().getValues();
    var dateCol = 3;
    var cutoff = p.cutoffDate;
    var keepRows = [data[0]];
    for (var r = 1; r < data.length; r++) {
      var d = data[r][dateCol];
      var ds = '';
      if (d instanceof Date) {
        ds = d.getFullYear() + '-' + String(d.getMonth()+1).padStart(2,'0') + '-' + String(d.getDate()).padStart(2,'0');
      } else { ds = String(d); }
      if (ds < cutoff) keepRows.push(data[r]);
    }
    var newRows = p.sales.rows;
    var total = keepRows.length + newRows.length;
    sheet.clear();
    var maxR = sheet.getMaxRows();
    var maxC = sheet.getMaxColumns();
    if (maxC > 8) sheet.deleteColumns(9, maxC - 8);
    if (maxR > total + 1) sheet.deleteRows(total + 2, maxR - total - 1);
    if (maxR < total + 1) sheet.insertRowsAfter(sheet.getMaxRows(), total + 1 - sheet.getMaxRows());
    var h = p.sales.headers || keepRows[0];
    sheet.getRange(1, 1, 1, h.length).setValues([h]).setFontWeight('bold');
    if (keepRows.length > 1) {
      var old = keepRows.slice(1);
      for (var i = 0; i < old.length; i += 5000) {
        var batch = old.slice(i, i + 5000);
        sheet.getRange(i + 2, 1, batch.length, h.length).setValues(batch);
      }
    }
    var offset = keepRows.length;
    for (var j = 0; j < newRows.length; j += 5000) {
      var nb = newRows.slice(j, j + 5000);
      sheet.getRange(offset + j + 1, 1, nb.length, h.length).setValues(nb);
    }
    written = newRows.length;
    sheet.setFrozenRows(1);
  }
  writeStock(ss, p.stock);
  writeCosts(ss, p.costs);
  writeExpenses(ss, p.expenses);
  saveMeta(ss, written, 'quick');
  return jsonOut({ok: true, mode: 'quick', salesWritten: written});
}

function writeCosts(ss, costs) {
  if (!costs || costs.length === 0) return;
  var sheet = getOrCreate(ss, 'CostData');
  sheet.clear();
  // v8: Added OverheadPerUnit and TotalCost columns for dashboard compatibility
  var h = ['ParentCode','CostPerUnit','BatchCost','BatchQty','WasteCost','WastePercent','OverheadPerUnit','TotalCost','Components'];
  sheet.getRange(1, 1, 1, h.length).setValues([h]).setFontWeight('bold');
  // Transform rows: old format has 7 cols, new format needs 9
  var rows = [];
  for (var i = 0; i < costs.length; i++) {
    var c = costs[i];
    if (c.length === 7) {
      // Old format: [parentCode, costPerUnit, batchCost, batchQty, wasteCost, wastePercent, components]
      // Insert OverheadPerUnit=0 and TotalCost=costPerUnit
      rows.push([c[0], c[1], c[2], c[3], c[4], c[5], 0, c[1], c[6]]);
    } else if (c.length >= 9) {
      rows.push(c);
    } else {
      // Pad with defaults
      while (c.length < 9) c.push(c.length === 7 ? c[1] : 0);
      rows.push(c);
    }
  }
  for (var i = 0; i < rows.length; i += 5000) {
    var batch = rows.slice(i, i + 5000);
    sheet.getRange(i + 2, 1, batch.length, h.length).setValues(batch);
  }
  sheet.setFrozenRows(1);
}

function writeExpenses(ss, expenses) {
  if (!expenses || typeof expenses !== 'object') return;
  // expenses can be: JSON object {YYYY-MM: {total, accounts}} or stringified
  var sheet = getOrCreate(ss, 'ExpenseData');
  sheet.clear();
  var json = typeof expenses === 'string' ? expenses : JSON.stringify(expenses);
  if (json === '{}' || json === '[]' || !json) return;
  sheet.getRange('A1').setValue(json);
}

function writeStock(ss, stock) {
  if (!stock || stock.length === 0) return;
  var sheet = getOrCreate(ss, 'StockData');
  sheet.clear();
  var h = ['ItemCode','ItemName','QuantityOnStock'];
  sheet.getRange(1, 1, 1, h.length).setValues([h]).setFontWeight('bold');
  for (var i = 0; i < stock.length; i += 5000) {
    var batch = stock.slice(i, i + 5000);
    sheet.getRange(i + 2, 1, batch.length, h.length).setValues(batch);
  }
  sheet.setFrozenRows(1);
}

function saveMeta(ss, written, mode) {
  var meta = getOrCreate(ss, 'SyncMeta');
  meta.getRange('A1').setValue('Last Sync');
  meta.getRange('B1').setValue(new Date().toISOString());
  meta.getRange('A2').setValue('Rows');
  meta.getRange('B2').setValue(written);
  meta.getRange('A3').setValue('Mode');
  meta.getRange('B3').setValue(mode);
}

function getMainSheet() {
  var ss = SpreadsheetApp.openById(SPREADSHEET_ID);
  var sheets = ss.getSheets();
  for (var i = 0; i < sheets.length; i++) {
    if (sheets[i].getSheetId() == SHEET_GID) return sheets[i];
  }
  return sheets[0];
}

function getOrCreate(ss, n) {
  var s = ss.getSheetByName(n);
  if (!s) s = ss.insertSheet(n);
  return s;
}

function textOut(t) { return ContentService.createTextOutput(t).setMimeType(ContentService.MimeType.TEXT); }
function jsonOut(d) { return ContentService.createTextOutput(JSON.stringify(d)).setMimeType(ContentService.MimeType.JSON); }
