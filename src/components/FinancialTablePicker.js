'use client';

import React, { useState, useMemo } from 'react';
import { 
  Check, 
  Search, 
  X, 
  Sparkles, 
  Filter, 
  TrendingUp, 
  Layers, 
  DollarSign, 
  BarChart2, 
  ChevronDown,
  ArrowUpDown,
  RotateCcw
} from 'lucide-react';

const FINANCIAL_PALETTE = [
  '#1364e2', // Flourish Electric Blue (Primary / Sales)
  '#f54e8b', // Flourish Coral Rose (Operating Profit / Highlight)
  '#9852d9', // Flourish Royal Violet (Net Profit / PAT)
  '#00c4cc', // Flourish Cyan Teal (Margins / Cash Flow)
  '#fca311', // Flourish Solar Amber (Cost Structure / Ratio)
  '#10b981', // Flourish Fresh Mint (Growth / Yield)
  '#6366f1', // Flourish Royal Indigo
  '#f97316', // Flourish Tangerine Orange
  '#0ea5e9', // Flourish Sky Blue
  '#ec4899', // Flourish Hot Magenta
];

// Smart presets for common financial charts
const PRESET_DEFINITIONS = [
  {
    id: 'rev_margin',
    label: 'Revenue & Margins',
    icon: TrendingUp,
    badge: 'Dual Axis',
    matches: [
      /^(sales|revenue|turnover|net sales)/i,
      /^(operating profit|ebitda|operating income)/i,
      /^(opm|ebitda %|operating margin|margin %)/i,
    ],
    defaultRoles: {
      0: { type: 'bar', yAxisIndex: 0 },
      1: { type: 'bar', yAxisIndex: 0 },
      2: { type: 'line', yAxisIndex: 1 },
    }
  },
  {
    id: 'profit_flow',
    label: 'Profitability Flow',
    icon: DollarSign,
    badge: '3-Step Bridge',
    matches: [
      /^(operating profit|ebitda)/i,
      /^(profit before tax|pbt)/i,
      /^(net profit|pat|profit after tax)/i,
    ],
  },
  {
    id: 'cost_structure',
    label: 'Expense Breakdown',
    icon: Layers,
    badge: 'Stackable',
    matches: [
      /^(material|raw material|cost of goods)/i,
      /^(employee|manpower|salaries)/i,
      /^(other expenses|other expense)/i,
    ],
  },
  {
    id: 'cash_flow',
    label: 'Cash Flow Matrix',
    icon: BarChart2,
    badge: 'CFO/CFI/CFF',
    matches: [
      /^(operating activity|cfo|cash from operating)/i,
      /^(investing activity|cfi|cash from investing)/i,
      /^(financing activity|cff|cash from financing)/i,
    ],
  },
];

export default function FinancialTablePicker({
  metrics = [],
  metricTypes = {},
  selectedMetrics = [],
  onSelectMetrics,
  seriesConfigs = {},
  onUpdateSeriesConfig,
  recentData = [], // Array of pivoted row objects: [{ Period: 'Mar-24', Sales: 700, ... }]
  recentPeriods = [], // ['Dec-23', 'Mar-24', 'Jun-24']
  chartType = 'combo',
  isFinancial = true,
}) {
  const [searchQuery, setSearchQuery] = useState('');
  const [showSelectedOnly, setShowSelectedOnly] = useState(false);
  const [expandedView, setExpandedView] = useState(false);

  // Available metrics without 'Period' and empty keys
  const validMetrics = useMemo(() => {
    return metrics.filter((m) => m !== 'Period' && !m.startsWith('__EMPTY') && m.trim() !== '');
  }, [metrics]);

  // Map metric values for recent periods
  const recentValuesByMetric = useMemo(() => {
    const map = {};
    const periodsToSample = recentPeriods.slice(-3); // Last 3 periods

    validMetrics.forEach((m) => {
      map[m] = periodsToSample.map((p) => {
        const row = recentData.find((d) => String(d.Period || '').trim() === String(p).trim());
        const val = row ? row[m] : undefined;
        return val !== undefined && val !== null ? val : '-';
      });
    });
    return map;
  }, [validMetrics, recentPeriods, recentData]);

  // Filtered metrics based on search query and showSelectedOnly
  const displayedMetrics = useMemo(() => {
    let list = validMetrics;
    if (showSelectedOnly) {
      list = list.filter((m) => selectedMetrics.includes(m));
    }
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      list = list.filter((m) => m.toLowerCase().includes(q));
    }
    return list;
  }, [validMetrics, selectedMetrics, searchQuery, showSelectedOnly]);

  const handleToggleMetric = (metric) => {
    if (selectedMetrics.includes(metric)) {
      onSelectMetrics(selectedMetrics.filter((m) => m !== metric));
    } else {
      onSelectMetrics([...selectedMetrics, metric]);
    }
  };

  const handleSelectAllFiltered = () => {
    const newItems = displayedMetrics.filter((m) => !selectedMetrics.includes(m));
    onSelectMetrics([...selectedMetrics, ...newItems]);
  };

  const handleClearAll = () => {
    onSelectMetrics([]);
  };

  // 1-Click Preset Handler
  const handleApplyPreset = (preset) => {
    const matched = [];
    preset.matches.forEach((regex) => {
      const found = validMetrics.find((m) => regex.test(m.trim()));
      if (found && !matched.includes(found)) {
        matched.push(found);
      }
    });

    if (matched.length > 0) {
      onSelectMetrics(matched);

      // If preset has default seriesConfigs (e.g. Bar for Sales, Line for OPM %)
      if (preset.defaultRoles && onUpdateSeriesConfig) {
        matched.forEach((metric, idx) => {
          if (preset.defaultRoles[idx]) {
            onUpdateSeriesConfig(metric, preset.defaultRoles[idx]);
          }
        });
      }
    }
  };

  const samplePeriods = recentPeriods.slice(-3);

  return (
    <div className="space-y-3 font-mono text-xs">
      {/* 1. Finance YouTuber 1-Click Presets Bar */}
      <div className="space-y-1.5">
        <div className="flex items-center justify-between">
          <label className="text-[11px] font-semibold uppercase tracking-wider text-blue-400 flex items-center gap-1.5 font-mono">
            <Sparkles className="w-3.5 h-3.5 text-blue-400" />
            <span>1-Click Financial Views</span>
          </label>
          <span className="text-[10px] text-slate-400">Quick Presets</span>
        </div>

        <div className="grid grid-cols-2 gap-1.5">
          {PRESET_DEFINITIONS.map((p) => {
            const Icon = p.icon;
            return (
              <button
                key={p.id}
                type="button"
                onClick={() => handleApplyPreset(p)}
                className="p-2 rounded-xl bg-slate-900/90 border border-slate-800 hover:border-blue-500/50 hover:bg-slate-850 text-left transition flex items-center justify-between group shadow-sm"
              >
                <div className="flex items-center gap-2 truncate">
                  <div className="p-1 rounded-md bg-blue-950/70 border border-blue-800/50 text-blue-400 group-hover:scale-105 transition">
                    <Icon className="w-3.5 h-3.5" />
                  </div>
                  <div className="truncate">
                    <div className="font-semibold text-slate-200 truncate group-hover:text-blue-300">
                      {p.label}
                    </div>
                    <div className="text-[10px] text-slate-400 truncate">
                      {p.badge}
                    </div>
                  </div>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* 2. Search & Filter Bar */}
      <div className="flex items-center gap-2">
        <div className="relative flex-1">
          <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-2.5" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search metric (e.g. Sales, Tax, Net Profit)..."
            className="w-full bg-slate-950 border border-slate-700/80 rounded-lg pl-8 pr-7 py-1.5 text-xs text-slate-100 placeholder-slate-400 focus:outline-none focus:border-blue-400 transition"
          />
          {searchQuery && (
            <button
              type="button"
              onClick={() => setSearchQuery('')}
              className="absolute right-2 top-2 text-slate-400 hover:text-white"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>

        <button
          type="button"
          onClick={() => setShowSelectedOnly(!showSelectedOnly)}
          className={`px-2.5 py-1.5 rounded-lg border flex items-center gap-1 text-[11px] transition ${
            showSelectedOnly
              ? 'bg-blue-950/80 border-blue-500 text-blue-300 font-semibold shadow-sm'
              : 'bg-slate-900 border-slate-750 text-slate-300 hover:border-slate-600'
          }`}
          title="Show only selected series"
        >
          <Filter className="w-3 h-3" />
          <span>Selected ({selectedMetrics.length})</span>
        </button>
      </div>

      {/* 3. Interactive Spreadsheet Statement Table */}
      <div className="border border-slate-800 rounded-xl overflow-hidden bg-slate-950/90 shadow-inner">
        {/* Table Column Headers */}
        <div className="grid grid-cols-12 bg-slate-900/90 px-3 py-2 border-b border-slate-800 text-[10px] font-semibold text-slate-300 uppercase tracking-wider items-center">
          <div className="col-span-6 flex items-center gap-2">
            <span>Particulars / Line Item</span>
            <span className="text-[9px] text-slate-400 lowercase font-normal">({displayedMetrics.length})</span>
          </div>
          <div className="col-span-4 flex items-center justify-end gap-2 text-right pr-2">
            {samplePeriods.map((p) => (
              <span key={p} className="truncate max-w-[50px] text-slate-300" title={p}>
                {p}
              </span>
            ))}
          </div>
          <div className="col-span-2 text-right">
            <span>Role</span>
          </div>
        </div>

        {/* Scrollable Metric Rows */}
        <div className={`overflow-y-auto divide-y divide-slate-850/60 scrollbar-thin ${expandedView ? 'max-h-96' : 'max-h-60'}`}>
          {displayedMetrics.length === 0 ? (
            <div className="p-6 text-center text-slate-400 space-y-1">
              <p>No financial metrics match "{searchQuery}"</p>
              <button
                type="button"
                onClick={() => setSearchQuery('')}
                className="text-emerald-400 underline hover:text-emerald-300 text-[11px]"
              >
                Clear Search Filter
              </button>
            </div>
          ) : (
            displayedMetrics.map((metric) => {
              const isSelected = selectedMetrics.includes(metric);
              const selectedIdx = selectedMetrics.indexOf(metric);
              const seriesColor = isSelected ? FINANCIAL_PALETTE[selectedIdx % FINANCIAL_PALETTE.length] : null;
              const values = recentValuesByMetric[metric] || [];
              const config = seriesConfigs[metric] || {
                type: chartType === 'combo' && selectedIdx > 0 ? 'line' : 'bar',
                yAxisIndex: chartType === 'combo' && selectedIdx > 0 ? 1 : 0,
              };

              return (
                <div
                  key={metric}
                  onClick={() => handleToggleMetric(metric)}
                  className={`grid grid-cols-12 px-3 py-2 items-center cursor-pointer select-none transition ${
                    isSelected
                      ? 'bg-blue-950/25 text-slate-100 hover:bg-blue-950/40 border-l-2 border-l-blue-500'
                      : 'hover:bg-slate-900/60 text-slate-300'
                  }`}
                >
                  {/* Checkbox & Metric Name */}
                  <div className="col-span-6 flex items-center gap-2 truncate pr-1">
                    <div
                      className={`w-4 h-4 rounded border flex items-center justify-center flex-shrink-0 transition ${
                        isSelected
                          ? 'border-blue-400 bg-blue-600 text-white shadow-sm'
                          : 'border-slate-700 bg-slate-900 hover:border-slate-500'
                      }`}
                    >
                      {isSelected && <Check className="w-3 h-3 stroke-[3]" />}
                    </div>

                    {isSelected && (
                      <span
                        className="w-2 h-2 rounded-full flex-shrink-0"
                        style={{ backgroundColor: seriesColor }}
                      />
                    )}

                    <span className={`truncate ${isSelected ? 'font-semibold text-blue-200' : 'text-slate-200'}`}>
                      {metric}
                    </span>
                  </div>

                  {/* Sample Values from Recent Periods */}
                  <div className="col-span-4 flex items-center justify-end gap-2 text-right pr-2 text-[10px] text-slate-400 font-mono">
                    {values.map((v, i) => (
                      <span
                        key={i}
                        className={`truncate max-w-[50px] ${
                          isSelected ? 'text-slate-200 font-medium' : 'text-slate-400'
                        }`}
                      >
                        {typeof v === 'number'
                          ? v.toLocaleString('en-IN', { maximumFractionDigits: 1 })
                          : v}
                      </span>
                    ))}
                  </div>

                  {/* Role / Axis Toggle (when in combo/dual mode or selected) */}
                  <div
                    className="col-span-2 flex justify-end"
                    onClick={(e) => e.stopPropagation()}
                  >
                    {isSelected ? (
                      chartType === 'combo' ? (
                        <div className="flex items-center gap-1">
                          <button
                            type="button"
                            onClick={() => {
                              if (onUpdateSeriesConfig) {
                                const nextType = config.type === 'bar' ? 'line' : 'bar';
                                const nextAxis = nextType === 'line' ? 1 : 0;
                                onUpdateSeriesConfig(metric, { type: nextType, yAxisIndex: nextAxis });
                              }
                            }}
                            className={`px-1.5 py-0.5 rounded text-[9px] font-bold border transition ${
                              config.type === 'bar'
                                ? 'bg-cyan-950/70 border-cyan-700 text-cyan-300'
                                : 'bg-purple-950/70 border-purple-700 text-purple-300'
                            }`}
                            title={`Click to switch between Bar (Left Axis) and Line (Right Axis)`}
                          >
                            {config.type === 'bar' ? 'Bar (L)' : 'Line (R)'}
                          </button>
                        </div>
                      ) : (
                        <span
                          className="px-1.5 py-0.5 rounded text-[9px] font-medium border border-blue-800/60 bg-blue-950/80 text-blue-300"
                        >
                          #{selectedIdx + 1}
                        </span>
                      )
                    ) : (
                      <span className="text-[10px] text-slate-600">—</span>
                    )}
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Table Bottom Action Bar */}
        <div className="px-3 py-1.5 bg-slate-900/80 border-t border-slate-800 flex items-center justify-between text-[11px] text-slate-400">
          <div className="flex items-center gap-2">
            <span>
              <strong className="text-blue-400">{selectedMetrics.length}</strong> metrics plotted
            </span>
            {selectedMetrics.length > 0 && (
              <button
                type="button"
                onClick={handleClearAll}
                className="text-slate-500 hover:text-red-400 transition"
              >
                Clear
              </button>
            )}
          </div>

          <button
            type="button"
            onClick={() => setExpandedView(!expandedView)}
            className="text-slate-400 hover:text-slate-200 transition"
          >
            {expandedView ? 'Collapse ▲' : 'Expand Table ▼'}
          </button>
        </div>
      </div>
    </div>
  );
}
