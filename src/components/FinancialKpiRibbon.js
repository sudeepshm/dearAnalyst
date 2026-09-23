'use client';

import React, { useMemo } from 'react';
import { TrendingUp, TrendingDown, DollarSign, Percent, Activity, BarChart3 } from 'lucide-react';

export default function FinancialKpiRibbon({
  data = [],
  xField = 'Period',
  columns = [],
  columnTypes = {},
  className = '',
}) {
  const kpiMetrics = useMemo(() => {
    if (!data || data.length === 0 || !columns || columns.length === 0) return [];

    const available = columns.filter((c) => c !== xField && !c.startsWith('__EMPTY'));

    // Smart financial regex matchers
    const metricMatchers = [
      {
        id: 'sales',
        label: 'Revenue / Sales',
        icon: BarChart3,
        regex: /^(sales|revenue|turnover|net sales|operating revenue)/i,
        unit: 'Cr',
      },
      {
        id: 'ebitda',
        label: 'Operating Profit',
        icon: Activity,
        regex: /^(operating profit|ebitda|operating income)/i,
        unit: 'Cr',
      },
      {
        id: 'opm',
        label: 'Operating Margin',
        icon: Percent,
        regex: /^(opm|operating margin|ebitda %|margin %)/i,
        isPercentage: true,
      },
      {
        id: 'pat',
        label: 'Net Profit (PAT)',
        icon: DollarSign,
        regex: /^(net profit|pat|profit after tax)/i,
        unit: 'Cr',
      },
    ];

    const matched = [];
    metricMatchers.forEach((m) => {
      const found = available.find((c) => m.regex.test(c.trim()));
      if (found && !matched.some((item) => item.key === found)) {
        matched.push({
          key: found,
          label: m.label,
          icon: m.icon,
          isPercentage: m.isPercentage || /%/i.test(found),
          unit: m.unit || '',
        });
      }
    });

    // Fallback if sheet has different metric names: pick top numeric metrics
    if (matched.length < 4) {
      available.forEach((col) => {
        if (matched.length < 4 && !matched.some((item) => item.key === col)) {
          const isNum = columnTypes[col] === 'number' || data.some((d) => typeof d[col] === 'number');
          if (isNum) {
            matched.push({
              key: col,
              label: col,
              icon: /%/i.test(col) ? Percent : Activity,
              isPercentage: /%/i.test(col),
              unit: '',
            });
          }
        }
      });
    }

    // Extract values & compute growth
    const lastRow = data[data.length - 1] || {};
    const prevRow = data[data.length - 2] || {};
    const periodLabel = String(lastRow[xField] ?? 'Latest');

    return matched.map((item) => {
      const currentVal = Number(lastRow[item.key]);
      const prevVal = Number(prevRow[item.key]);

      let deltaPercent = null;
      if (!isNaN(currentVal) && !isNaN(prevVal) && prevVal !== 0) {
        if (item.isPercentage) {
          deltaPercent = currentVal - prevVal; // bps / percentage points difference
        } else {
          deltaPercent = ((currentVal - prevVal) / Math.abs(prevVal)) * 100;
        }
      }

      return {
        ...item,
        currentVal: !isNaN(currentVal) ? currentVal : lastRow[item.key],
        deltaPercent: deltaPercent !== null ? deltaPercent : null,
        periodLabel,
      };
    });
  }, [data, xField, columns, columnTypes]);

  if (kpiMetrics.length === 0) return null;

  return (
    <div className={`grid grid-cols-2 md:grid-cols-4 gap-3 ${className}`}>
      {kpiMetrics.map((kpi, idx) => {
        const Icon = kpi.icon;
        const hasDelta = kpi.deltaPercent !== null;
        const isPositive = hasDelta && kpi.deltaPercent >= 0;
        const deltaFormatted = hasDelta
          ? kpi.isPercentage
            ? `${isPositive ? '+' : ''}${kpi.deltaPercent.toFixed(1)}% pts`
            : `${isPositive ? '+' : ''}${kpi.deltaPercent.toFixed(1)}%`
          : null;

        const valFormatted =
          typeof kpi.currentVal === 'number'
            ? kpi.isPercentage
              ? `${kpi.currentVal.toFixed(1)}%`
              : `₹${kpi.currentVal.toLocaleString('en-IN', { maximumFractionDigits: 1 })} ${kpi.unit}`.trim()
            : String(kpi.currentVal ?? '-');

        const flourishAccents = [
          { border: 'hover:border-blue-500/60', iconColor: 'text-blue-400', iconBg: 'bg-blue-950/60 border-blue-800/40' },
          { border: 'hover:border-pink-500/60', iconColor: 'text-pink-400', iconBg: 'bg-pink-950/60 border-pink-800/40' },
          { border: 'hover:border-cyan-500/60', iconColor: 'text-cyan-400', iconBg: 'bg-cyan-950/60 border-cyan-800/40' },
          { border: 'hover:border-purple-500/60', iconColor: 'text-purple-400', iconBg: 'bg-purple-950/60 border-purple-800/40' },
        ];
        const accent = flourishAccents[idx % flourishAccents.length];

        return (
          <div
            key={kpi.key || idx}
            className={`glass-card rounded-xl p-3 border border-slate-800/90 ${accent.border} transition flex flex-col justify-between group bg-slate-900/60 shadow-sm`}
          >
            <div className="flex items-center justify-between gap-1 mb-1">
              <span className="text-[10px] font-mono font-medium text-slate-400 uppercase tracking-wider truncate">
                {kpi.label}
              </span>
              <div className={`p-1 rounded-md border ${accent.iconBg} ${accent.iconColor} group-hover:scale-110 transition`}>
                <Icon className="w-3 h-3" />
              </div>
            </div>

            <div className="flex items-baseline justify-between gap-2 mt-1">
              <div className="text-base sm:text-lg font-bold font-mono text-slate-100 tracking-tight">
                {valFormatted}
              </div>

              {hasDelta && (
                <div
                  className={`inline-flex items-center gap-0.5 text-[10px] font-mono px-1.5 py-0.5 rounded-full border ${
                    isPositive
                      ? 'bg-emerald-950/70 border-emerald-700/60 text-emerald-300'
                      : 'bg-red-950/70 border-red-700/60 text-red-300'
                  }`}
                >
                  {isPositive ? (
                    <TrendingUp className="w-2.5 h-2.5 stroke-[2.5]" />
                  ) : (
                    <TrendingDown className="w-2.5 h-2.5 stroke-[2.5]" />
                  )}
                  <span>{deltaFormatted}</span>
                </div>
              )}
            </div>

            <div className="text-[9px] font-mono text-slate-500 mt-1 flex items-center justify-between">
              <span>{kpi.periodLabel}</span>
              <span className="text-[8px] text-slate-600">QoQ / Reported</span>
            </div>
          </div>
        );
      })}
    </div>
  );
}
