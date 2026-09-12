import * as XLSX from 'xlsx';

/**
 * Clean cell / header string and format ISO dates or timestamps into clean fiscal labels.
 * e.g. "2017-03-30T18:29:50.000Z" -> "Mar-17"
 */
export function cleanHeaderLabel(val) {
  if (val === null || val === undefined) return '';

  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

  if (val instanceof Date) {
    if (!isNaN(val.getTime())) {
      const m = months[val.getUTCMonth()];
      const y = String(val.getUTCFullYear()).slice(-2);
      return `${m}-${y}`;
    }
  }

  let str = String(val).trim();
  if (!str) return '';

  // Match ISO date string or Date.toString() (e.g. "Thu Mar 30 2017 23:59:50 GMT+0530")
  if (/^\d{4}-\d{2}-\d{2}(T|\s)/i.test(str) || str.includes('GMT') || /^[A-Za-z]{3}\s+[A-Za-z]{3}\s+\d{1,2}\s+\d{4}/.test(str)) {
    const d = new Date(str);
    if (!isNaN(d.getTime())) {
      const m = months[d.getUTCMonth()];
      const y = String(d.getUTCFullYear()).slice(-2);
      return `${m}-${y}`;
    }
  }

  // Match standard YYYY-MM-DD
  if (/^\d{4}-\d{2}-\d{2}$/.test(str)) {
    const parts = str.split('-');
    const d = new Date(Number(parts[0]), Number(parts[1]) - 1, Number(parts[2]));
    if (!isNaN(d.getTime())) {
      return `${months[d.getMonth()]}-${String(d.getFullYear()).slice(-2)}`;
    }
  }

  return str;
}

/**
 * Detect Screener / Financial Statement header row offset.
 * Scans the first 10 rows to locate the actual header row containing Narration/Particulars
 * or multiple period date columns.
 */
export function detectHeaderRowIndex(rows) {
  if (!rows || rows.length === 0) return 0;

  for (let i = 0; i < Math.min(rows.length, 10); i++) {
    const row = rows[i];
    if (!Array.isArray(row) || row.length === 0) continue;

    const rowStrings = row.map((cell) => String(cell || '').trim());

    // Check if row contains accounting descriptor keywords
    const hasDescriptor = rowStrings.some((cell) =>
      /^(narration|particulars|particular|metric|line\s*item|items|account|indicator|component|segment|ratio|dimension)/i.test(cell)
    );

    // Check if row has multiple fiscal dates / period headers
    const periodCount = rowStrings.filter((cell) =>
      /^[A-Za-z]{3}[-\s']*\d{2,4}$/i.test(cell) ||
      /^\d{4}[-\s']*[A-Za-z]{3}$/i.test(cell) ||
      /^(Q[1-4]|FY\d{2,4}|\d{4})$/i.test(cell) ||
      /^\d{4}-\d{2}-\d{2}/.test(cell)
    ).length;

    if (hasDescriptor || periodCount >= 2) {
      return i;
    }
  }

  return 0;
}

/**
 * Robustly parses a worksheet with header row detection and label sanitization.
 */
export function parseSheetWithHeaderDetection(sheet) {
  const rows = XLSX.utils.sheet_to_json(sheet, { header: 1, defval: '' });
  if (!rows || rows.length === 0) {
    return { rawData: [], columns: [], columnTypes: {}, headerRowIndex: 0 };
  }

  const headerIdx = detectHeaderRowIndex(rows);
  const rawHeaders = rows[headerIdx] || [];

  // Clean and deduplicate header labels
  const cleanedHeaders = [];
  const colCounts = {};
  rawHeaders.forEach((h, idx) => {
    let clean = cleanHeaderLabel(h);
    if (!clean || clean.startsWith('__EMPTY')) {
      clean = idx === 0 ? 'Narration' : `Column_${idx + 1}`;
    }
    if (!colCounts[clean]) {
      colCounts[clean] = 1;
      cleanedHeaders.push(clean);
    } else {
      colCounts[clean]++;
      cleanedHeaders.push(`${clean}_${colCounts[clean]}`);
    }
  });

  // Extract subsequent data rows
  const rawData = [];
  for (let r = headerIdx + 1; r < rows.length; r++) {
    const rowArr = rows[r];
    if (!rowArr || rowArr.length === 0) continue;
    const hasValue = rowArr.some((val) => val !== '' && val !== null && val !== undefined);
    if (!hasValue) continue;

    const rowObj = {};
    cleanedHeaders.forEach((colName, cIdx) => {
      let cellVal = rowArr[cIdx] !== undefined ? rowArr[cIdx] : '';
      if (typeof cellVal === 'string') {
        const trimmed = cellVal.trim();
        // Clean numeric strings with commas e.g. "1,250.50"
        if (/^-?[\d,]+(\.\d+)?$/.test(trimmed) && trimmed !== '') {
          const parsed = Number(trimmed.replace(/,/g, ''));
          if (!isNaN(parsed)) cellVal = parsed;
        }
      }
      rowObj[colName] = cellVal;
    });
    rawData.push(rowObj);
  }

  // Determine column types
  const columnTypes = {};
  cleanedHeaders.forEach((col) => {
    const sampleVals = rawData.slice(0, 25).map((r) => r[col]).filter((v) => v !== '' && v !== null && v !== undefined);
    const isAllNumbers = sampleVals.length > 0 && sampleVals.every((v) => {
      const num = typeof v === 'number' ? v : Number(String(v).replace(/,/g, ''));
      return !isNaN(num);
    });
    const isLikelyDate = sampleVals.length > 0 && sampleVals.every((v) => {
      if (v instanceof Date) return true;
      const parsed = Date.parse(v);
      return !isNaN(parsed) && String(v).length >= 4;
    });

    if (isAllNumbers) {
      columnTypes[col] = 'number';
    } else if (isLikelyDate) {
      columnTypes[col] = 'date';
    } else {
      columnTypes[col] = 'string';
    }
  });

  return { rawData, columns: cleanedHeaders, columnTypes, headerRowIndex: headerIdx };
}

/**
 * Pivots a financial table (rows = accounting items, columns = dates)
 * into a tidy dataset (rows = dates, columns = items)
 * Includes duplicate line item counter appending to prevent key collisions.
 */
export function pivotFinancialDataset(rawData, columns, columnTypes) {
  if (!rawData || rawData.length === 0 || !columns || columns.length < 2) {
    return { isFinancial: false, data: rawData || [], columns: columns || [], columnTypes: columnTypes || {} };
  }

  // Find descriptor column (e.g., Narration, Particulars, or first column)
  const stringCols = columns.filter((c) => columnTypes[c] === 'string');
  const descriptorCol =
    stringCols.find((c) => /narration|particular|metric|item|account|indicator|name|category/i.test(c)) ||
    stringCols[0] ||
    columns[0];

  const allPeriodCols = columns.filter((c) => c !== descriptorCol && !c.startsWith('__EMPTY'));

  // Screener.in & financial models place scenario projections and trailing summaries at the far right
  const SCENARIO_REGEX = /^(trailing|ttm|best\s*case|worst\s*case|normal\s*case|base\s*case|bear\s*case|bull\s*case|forecast|projection|cagr|variance)/i;
  const chronologicalPeriodCols = allPeriodCols.filter((c) => !SCENARIO_REGEX.test(c.trim()));
  const scenarioPeriodCols = allPeriodCols.filter((c) => SCENARIO_REGEX.test(c.trim()));

  // Prioritize genuine chronological periods for timeline visualization
  const periodCols = chronologicalPeriodCols.length > 0 ? chronologicalPeriodCols : allPeriodCols;

  // Test if period columns indicate a financial time series
  const isFinancial =
    allPeriodCols.length >= 2 &&
    allPeriodCols.some(
      (c) =>
        /^[A-Za-z]{3}[-\s']*\d{2,4}$/i.test(c) ||
        /^(Q[1-4]|FY\d{2,4}|\d{4})/i.test(c) ||
        /^\d{4}-\d{2}-\d{2}/.test(c) ||
        columnTypes[c] === 'number' ||
        columnTypes[c] === 'date'
    );

  // Edge Case 3: Duplicate Line Items (e.g. "Total" under Liabilities and Assets)
  const labelCounts = {};
  const deduplicatedRowLabels = [];
  const validRows = [];

  rawData.forEach((row) => {
    const rawLabel = String(row[descriptorCol] || '').trim();
    if (!rawLabel) return;

    if (!labelCounts[rawLabel]) {
      labelCounts[rawLabel] = 1;
      deduplicatedRowLabels.push(rawLabel);
    } else {
      labelCounts[rawLabel]++;
      deduplicatedRowLabels.push(`${rawLabel} (${labelCounts[rawLabel]})`);
    }
    validRows.push(row);
  });

  if (validRows.length === 0 || periodCols.length === 0) {
    return { isFinancial, data: rawData, columns, columnTypes };
  }

  // Build pivoted rows: each chronological period becomes a row
  const pivotedData = periodCols.map((periodKey) => {
    const cleanPeriod = cleanHeaderLabel(periodKey);
    const rowObj = { Period: cleanPeriod };

    validRows.forEach((row, rIdx) => {
      const metricName = deduplicatedRowLabels[rIdx];
      let val = row[periodKey];
      if (typeof val === 'string') {
        val = val.replace(/,/g, '').trim();
      }
      const numVal = Number(val);
      rowObj[metricName] = !isNaN(numVal) && val !== '' ? numVal : val;
    });

    return rowObj;
  });

  const pivotedColumns = ['Period', ...deduplicatedRowLabels];
  const pivotedColumnTypes = { Period: 'string' };
  deduplicatedRowLabels.forEach((metric) => {
    pivotedColumnTypes[metric] = 'number';
  });

  return {
    isFinancial,
    data: pivotedData,
    columns: pivotedColumns,
    columnTypes: pivotedColumnTypes,
    periodColumns: periodCols,
    allPeriodColumns: allPeriodCols,
    scenarioColumns: scenarioPeriodCols,
    descriptorColumn: descriptorCol,
    validRows,
    deduplicatedRowLabels,
  };
}
