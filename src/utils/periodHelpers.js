/**
 * Helper utilities for financial periods and forward estimates.
 * Handles detection of historical actuals vs forward estimate/projection periods (e.g. Mar-25, Mar-26, FY25E).
 */

/**
 * Extracts a 4-digit year from a period string (e.g., 'Mar-24' -> 2024, 'FY25' -> 2025, '2023' -> 2023).
 */
export function extractYear(str) {
  if (!str) return null;
  const s = String(str).trim();

  // Explicit 4-digit year (e.g., 2024, FY2025)
  const m4 = s.match(/\b(19\d{2}|20\d{2})\b/);
  if (m4) return parseInt(m4[1], 10);

  // 2-digit year preceded by month or FY (e.g., Mar-25, Mar'25, FY25, Jun-24)
  const m2 = s.match(/(?:[A-Za-z]{3}|FY)[-'\s]?(\d{2})\b/i);
  if (m2) {
    const yr2 = parseInt(m2[1], 10);
    return yr2 < 70 ? 2000 + yr2 : 1900 + yr2;
  }

  return null;
}

/**
 * Checks whether a given period label represents a forward estimate / forecast period.
 * Default completed historical year cutoff is 2024 (audited FY24).
 * FY25 (Mar-25), FY26 (Mar-26), and beyond are forward estimates in corporate analysis.
 */
export function isEstimatePeriod(periodStr, historicalCutoffYear = 2024) {
  if (!periodStr) return false;
  const s = String(periodStr).trim();

  // 1. Explicit estimate / projection tokens
  if (/\b(est|proj|projection|forecast|guidance)\b/i.test(s)) return true;
  if (/\((e|p|f|est|proj)\)/i.test(s)) return true;
  if (/[A-Za-z0-9]+[eEpP]\b/.test(s)) return true;

  // 2. Future fiscal year detection
  const year = extractYear(s);
  if (year !== null && year > historicalCutoffYear) {
    return true;
  }

  return false;
}

/**
 * Formats period label for clean presentation.
 * If tagEstimates is true and period is an estimate, appends " (E)" if not already tagged.
 */
export function formatPeriodLabel(periodStr, tagEstimates = true) {
  if (!periodStr) return '';
  const s = String(periodStr).trim();
  if (!tagEstimates) return s;

  if (isEstimatePeriod(s)) {
    if (/\((e|est|p|proj)\)/i.test(s)) return s;
    if (/[eEpP]$/.test(s)) return `${s.slice(0, -1)} (E)`;
    return `${s} (E)`;
  }

  return s;
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
