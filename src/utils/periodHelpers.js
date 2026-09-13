/**
 * Helper utilities for financial periods and forward estimates.
 * Handles detection of historical actuals vs forward estimate/projection periods (e.g. Mar-25, Mar-26, FY25E).
 */

const MONTH_NAME_MAP = {
  jan: 0, feb: 1, mar: 2, apr: 3, may: 4, jun: 5,
  jul: 6, aug: 7, sep: 8, oct: 9, nov: 10, dec: 11,
  january: 0, february: 1, march: 2, april: 3, may: 4, june: 5,
  july: 6, august: 7, september: 8, october: 9, november: 10, december: 11,
};

/**
 * Converts a raw date or period label (e.g. 'Mar-17', 'Mar 2024', Date, '2024-03-31')
 * into a clean, professional Quarter name.
 * Supported format modes:
 * - 'quarter_fy' (Default): e.g. 'Q4 FY17', 'Q1 FY24', 'Q4 FY24'
 * - 'quarter_short': e.g. 'Q4\'17', 'Q1\'24', 'Q4\'24'
 * - 'quarter_only': e.g. 'Q4', 'Q1', 'Q2', 'Q3'
 * - 'fy_only': e.g. 'FY17', 'FY24'
 * - 'quarter_cy': e.g. 'Q1 2017', 'Q2 2024' (Calendar year)
 * - 'month_year': e.g. 'Mar-17', 'Jun-24' (Original month-year)
 */
export function formatPeriodToQuarter(val, format = 'quarter_fy') {
  if (val === null || val === undefined) return '';

  let str = '';
  let monthIdx = null;
  let year = null;
  let isEstimate = false;

  if (val instanceof Date) {
    if (isNaN(val.getTime())) return '';
    monthIdx = val.getUTCMonth();
    year = val.getUTCFullYear();
  } else {
    str = String(val).trim();
    if (!str) return '';

    // Check estimate tags
    if (/\((e|est|p|proj)\)/i.test(str) || /[eEpP]$/.test(str)) {
      isEstimate = true;
    }

    // If already has quarter indicator (e.g. Q1 FY24, Q4'24, Q4-2024, Q4 24)
    if (/^Q[1-4]/i.test(str)) {
      const qm = str.match(/^Q([1-4])(?:\s*(?:FY|'|-|\s)?\s*(\d{2,4}))?/i);
      if (qm) {
        const qNum = qm[1];
        let yr = qm[2] ? parseInt(qm[2], 10) : null;
        if (yr !== null && yr < 100) yr = yr < 70 ? 2000 + yr : 1900 + yr;
        const yr2 = yr !== null ? String(yr).slice(-2) : '';

        if (format === 'quarter_only') return 'Q' + qNum + (isEstimate ? ' (E)' : '');
        if (format === 'fy_only' && yr2) return 'FY' + yr2 + (isEstimate ? ' (E)' : '');
        if (format === 'quarter_short' && yr2) return 'Q' + qNum + '\'' + yr2 + (isEstimate ? ' (E)' : '');
        if (format === 'quarter_fy' && yr2) return 'Q' + qNum + ' FY' + yr2 + (isEstimate ? ' (E)' : '');
      }
      return str;
    }

    // Match ISO dates or timestamps e.g. 2017-03-31T... or 2017-03-31
    if (/^\d{4}-\d{2}-\d{2}/.test(str) || str.includes('GMT') || /^[A-Za-z]{3}\s+[A-Za-z]{3}\s+\d{1,2}\s+\d{4}/.test(str)) {
      const d = new Date(str);
      if (!isNaN(d.getTime())) {
        monthIdx = d.getUTCMonth();
        year = d.getUTCFullYear();
      }
    }

    // Match DD-MM-YYYY or DD/MM/YYYY
    if (monthIdx === null) {
      const dmy = str.match(/^(\d{1,2})[-/](\d{1,2})[-/](\d{4})$/);
      if (dmy) {
        monthIdx = parseInt(dmy[2], 10) - 1;
        year = parseInt(dmy[3], 10);
      }
    }

    // Match month abbreviation or name + year e.g. Mar-17, Mar 2017, Mar'17, Mar 17, March 2024
    if (monthIdx === null) {
      const mMatch = str.match(/\b(Jan(?:uary)?|Feb(?:ruary)?|Mar(?:ch)?|Apr(?:il)?|May|Jun(?:e)?|Jul(?:y)?|Aug(?:ust)?|Sep(?:tember)?|Oct(?:ober)?|Nov(?:ember)?|Dec(?:ember)?)[-'\s]?(\d{2,4})([eEpP])?\b/i);
      if (mMatch) {
        const mKey = mMatch[1].toLowerCase();
        monthIdx = MONTH_NAME_MAP[mKey] !== undefined ? MONTH_NAME_MAP[mKey] : MONTH_NAME_MAP[mKey.slice(0, 3)];
        let yr = parseInt(mMatch[2], 10);
        if (yr < 100) yr = yr < 70 ? 2000 + yr : 1900 + yr;
        year = yr;
        if (mMatch[3]) isEstimate = true;
      }
    }
  }

  if (monthIdx === null || year === null || isNaN(monthIdx) || isNaN(year)) {
    return str || '';
  }

  // Month-Year format request
  if (format === 'month_year') {
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    const res = months[monthIdx] + '-' + String(year).slice(-2);
    return isEstimate ? res + ' (E)' : res;
  }

  // Calendar Year Quarter request (Jan-Mar = Q1, Apr-Jun = Q2, etc.)
  if (format === 'quarter_cy') {
    const calQ = Math.floor(monthIdx / 3) + 1;
    const res = 'Q' + calQ + ' ' + year;
    return isEstimate ? res + ' (E)' : res;
  }

  // Indian Corporate Fiscal Year Convention (Screener.in / BSE / NSE):
  // Apr-Jun: Q1 FY(year+1)
  // Jul-Sep: Q2 FY(year+1)
  // Oct-Dec: Q3 FY(year+1)
  // Jan-Mar: Q4 FY(year)
  let qNum, fyYear;
  if (monthIdx >= 3) {
    qNum = Math.floor((monthIdx - 3) / 3) + 1;
    fyYear = year + 1;
  } else {
    qNum = 4;
    fyYear = year;
  }

  const yr2 = String(fyYear).slice(-2);
  let baseLabel = '';

  if (format === 'quarter_short') {
    baseLabel = 'Q' + qNum + '\'' + yr2;
  } else if (format === 'quarter_only') {
    baseLabel = 'Q' + qNum;
  } else if (format === 'fy_only') {
    baseLabel = 'FY' + yr2;
  } else {
    // Default: 'quarter_fy' (e.g. Q4 FY17, Q1 FY24)
    baseLabel = 'Q' + qNum + ' FY' + yr2;
  }

  return isEstimate && !baseLabel.includes('(E)') ? baseLabel + ' (E)' : baseLabel;
}

/**
 * Extracts a 4-digit year from a period string (e.g., 'Mar-24' -> 2024, 'FY25' -> 2025, 'Q4 FY25' -> 2025).
 */
export function extractYear(str) {
  if (!str) return null;
  const s = String(str).trim();

  // Explicit 4-digit year (e.g., 2024, FY2025, Q4 FY2025)
  const m4 = s.match(/\b(19\d{2}|20\d{2})\b/);
  if (m4) return parseInt(m4[1], 10);

  // 2-digit year preceded by month, FY, or Q (e.g., Mar-25, Mar'25, FY25, Q4 FY25, Q4'25, Jun-24)
  const m2 = s.match(/(?:[A-Za-z]{3}|FY|Q[1-4])[-'\s]?(?:FY)?[-'\s]?(\d{2})\b/i);
  if (m2) {
    const yr2 = parseInt(m2[1], 10);
    return yr2 < 70 ? 2000 + yr2 : 1900 + yr2;
  }

  return null;
}

/**
 * Checks whether a given period label represents a forward estimate / forecast period.
 * Default completed historical year cutoff is 2024 (audited FY24).
 * FY25 (Mar-25 / Q4 FY25), FY26 (Mar-26 / Q4 FY26), and beyond are forward estimates in corporate analysis.
 */
export function isEstimatePeriod(periodStr, historicalCutoffYear = 2024) {
  if (!periodStr) return false;
  const s = String(periodStr).trim();

  // 1. Explicit estimate / projection tokens
  if (/\b(est|proj|projection|forecast|guidance)\b/i.test(s)) return true;
  if (/\((e|p|f|est|proj)\)/i.test(s)) return true;
  if (/\b(?:\w*?\d{2,4})[eEpP]\b/.test(s)) return true;

  // 2. Future fiscal year detection
  const year = extractYear(s);
  if (year !== null && year > historicalCutoffYear) {
    return true;
  }

  return false;
}

/**
 * Formats period label for clean presentation.
 * Transforms month-year patterns (e.g. Mar-17, Mar-24) into professional Quarter names (e.g. Q4 FY17, Q4 FY24).
 * If tagEstimates is true and period is an estimate, appends " (E)" if not already tagged.
 */
export function formatPeriodLabel(periodStr, tagEstimates = true, periodFormat = 'quarter_fy') {
  if (!periodStr) return '';
  const s = String(periodStr).trim();

  const qStr = formatPeriodToQuarter(s, periodFormat);
  const isEst = isEstimatePeriod(qStr) || isEstimatePeriod(s);

  if (!tagEstimates) return qStr;

  if (isEst) {
    if (/\((e|est|p|proj)\)/i.test(qStr)) return qStr;
    if (/[eEpP]$/.test(qStr)) return `${qStr.slice(0, -1)} (E)`;
    return `${qStr} (E)`;
  }

  return qStr;
}

/**
 * Slices and filters dataset according to the active periodFilter.
 */
export function filterDataByPeriod(data, xField, periodFilter) {
  if (!Array.isArray(data) || data.length === 0) return [];
  if (!periodFilter || !periodFilter.preset || periodFilter.preset === 'all') {
    return data;
  }

  const { preset, customStart, customEnd } = periodFilter;

  if (preset === 'historical') {
    const historicalOnly = data.filter((d) => !isEstimatePeriod(d[xField]));
    // Fallback: if no historical rows were found, don't return an empty chart
    return historicalOnly.length > 0 ? historicalOnly : data;
  }

  if (preset === 'last_4') return data.slice(-4);
  if (preset === 'last_8') return data.slice(-8);
  if (preset === 'last_12') return data.slice(-12);
  if (preset === 'last_20') return data.slice(-20);

  if (preset === 'custom') {
    const s = customStart !== undefined && customStart !== ''
      ? data.findIndex((d) => String(d[xField] ?? '') === String(customStart))
      : 0;
    const e = customEnd !== undefined && customEnd !== ''
      ? data.findIndex((d) => String(d[xField] ?? '') === String(customEnd))
      : data.length - 1;

    const startIdx = s >= 0 ? s : 0;
    const endIdx = e >= 0 ? e : data.length - 1;
    if (startIdx <= endIdx) {
      return data.slice(startIdx, endIdx + 1);
    }
  }

  return data;
}

/**
 * Summarizes periods into historical vs estimate counts and breakdown.
 */
export function analyzePeriodsSummary(periods = []) {
  let historicalCount = 0;
  let estimateCount = 0;
  const estimateLabels = [];

  periods.forEach((p) => {
    if (isEstimatePeriod(p)) {
      estimateCount++;
      estimateLabels.push(String(p));
    } else {
      historicalCount++;
    }
  });

  return {
    total: periods.length,
    historicalCount,
    estimateCount,
    hasEstimates: estimateCount > 0,
    estimateLabels,
  };
}
