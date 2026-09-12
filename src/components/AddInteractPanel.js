'use client';

import React, { useState } from 'react';
import { 
  BarChart3, 
  CandlestickChart, 
  LineChart, 
  PieChart, 
  SlidersHorizontal, 
  MousePointerClick, 
  Eye, 
  Layers, 
  Maximize2, 
  FileSpreadsheet, 
  TrendingUp, 
  Percent, 
  ArrowUpDown, 
  GitCompare, 
  Sparkles, 
  X, 
  BookOpen, 
  RotateCcw,
  Search,
  Check,
  Calendar,
  Filter
} from 'lucide-react';
import VisualChartCatalogue from '@/components/VisualChartCatalogue';
import FinancialTablePicker from '@/components/FinancialTablePicker';

const FINANCIAL_PALETTE = [
  '#10b981', // Emerald
  '#06b6d4', // Cyan
  '#8b5cf6', // Violet
  '#f59e0b', // Amber
  '#ec4899', // Pink
  '#3b82f6', // Blue
  '#14b8a6', // Teal
  '#f97316', // Orange
  '#a855f7', // Purple
  '#6366f1', // Indigo
];

export default function AddInteractPanel({
  sheetNames = [],
  selectedSheet,
  onSheetChange,
  columns = [],
  columnTypes = {},
  data = [],
  orientation = 'standard',
  onOrientationChange,
  isFinancial = false,
  chartType,
  setChartType,
  xField,
  setXField,
  yField,
  setYField,
  y2Field,
  setY2Field,
  yFields = [],
  setYFields,
  seriesConfigs = {},
  onUpdateSeriesConfig,
  periodFilter = { preset: 'all' },
  setPeriodFilter,
  breakdownMode = 'distribution',
  setBreakdownMode,
  compositionPeriod = '',
  setCompositionPeriod,
  availablePeriods = [],
  openField,
  setOpenField,
  closeField,
  setCloseField,
  lowField,
  setLowField,
  highField,
  setHighField,
  chartTitle,
  setChartTitle,
  chartSubtitle,
  setChartSubtitle,
  xAxisLabel,
  setXAxisLabel,
  yAxisLabel,
  setYAxisLabel,
  y2AxisLabel,
  setY2AxisLabel,
  interactions,
  setInteractions,
}) {
  const [activeTab, setActiveTab] = useState('fields'); // 'fields' | 'interact'
  const [isCatalogueOpen, setIsCatalogueOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [isSearchOpen, setIsSearchOpen] = useState(false);

  // Harmonized multi-metric array (with backward compatibility)
  const effectiveYFields = Array.isArray(yFields) && yFields.length > 0
    ? yFields
    : [yField, y2Field].filter(Boolean);

  const availableMetrics = columns.filter(
    (c) => c !== xField && !c.startsWith('__EMPTY')
  );

  const filteredMetrics = availableMetrics.filter((c) =>
    c.toLowerCase().includes(searchQuery.toLowerCase().trim())
  );

  const handleAddMetric = (metric) => {
    if (!metric || effectiveYFields.includes(metric)) return;
    const updated = [...effectiveYFields, metric];
    if (setYFields) setYFields(updated);
    if (setYField && updated[0]) setYField(updated[0]);
    if (setY2Field) setY2Field(updated[1] || '');
  };

  const handleRemoveMetric = (metric) => {
    const updated = effectiveYFields.filter((m) => m !== metric);
    if (setYFields) setYFields(updated);
    if (setYField) setYField(updated[0] || '');
    if (setY2Field) setY2Field(updated[1] || '');
  };

  const handleToggleMetric = (metric) => {
    if (effectiveYFields.includes(metric)) {
      handleRemoveMetric(metric);
    } else {
      handleAddMetric(metric);
    }
  };

  const periodPresets = [
    { id: 'all', label: 'All Quarters' },
    { id: 'last_4', label: 'Last 4' },
    { id: 'last_8', label: 'Last 8' },
    { id: 'last_12', label: 'Last 12' },
    { id: 'custom', label: 'Custom' },
  ];

  const handlePeriodPreset = (presetId) => {
    if (setPeriodFilter) {
      setPeriodFilter({
        ...(periodFilter || {}),
        preset: presetId,
      });
    }
  };

  const handleCustomPeriod = (key, val) => {
    if (setPeriodFilter) {
      setPeriodFilter({
        ...(periodFilter || {}),
        preset: 'custom',
        [key]: val,
      });
    }
  };

  const chartOptions = [
    { id: 'candlestick', label: 'Candlestick (OHLC)', icon: CandlestickChart },
    { id: 'combo', label: 'Combo Bar & Line', icon: Layers },
    { id: 'dual-line', label: 'Dual-Axis Line', icon: LineChart },
    { id: 'multi-line', label: 'Multi-Line Chart', icon: LineChart },
    { id: 'clustered-bar', label: 'Clustered Column', icon: BarChart3 },
    { id: 'horizontal-clustered-bar', label: 'Clustered Bar (Horiz)', icon: BarChart3 },
    { id: 'stacked-bar', label: 'Stacked Column', icon: BarChart3 },
    { id: 'stacked-bar-100', label: '100% Stacked Column', icon: Percent },
    { id: 'stacked-area', label: 'Stacked Area', icon: Layers },
    { id: 'waterfall', label: 'Waterfall Bridge', icon: TrendingUp },
    { id: 'diverging-bar', label: 'Diverging + Line', icon: ArrowUpDown },
    { id: 'line', label: 'Single Line Trend', icon: LineChart },
    { id: 'bar', label: 'Single Bar / Vol', icon: BarChart3 },
    { id: 'area', label: 'Filled Area', icon: Layers },
    { id: 'scatter', label: 'Scatter Plot', icon: MousePointerClick },
    { id: 'pie', label: 'Pie / Donut', icon: PieChart },
  ];

  const updateInteraction = (key, value) => {
    setInteractions((prev) => ({ ...prev, [key]: value }));
  };

  return (
    <div className="w-full glass-card rounded-2xl p-5 border border-slate-800 flex flex-col space-y-5">
      {/* Tab Switcher: Data Fields vs Add-Interact Feature */}
      <div className="flex items-center p-1 rounded-xl bg-slate-900 border border-slate-800 text-xs font-mono">
        <button
          onClick={() => setActiveTab('fields')}
          className={`flex-1 py-2 px-3 rounded-lg font-medium transition flex items-center justify-center gap-1.5 ${
            activeTab === 'fields'
              ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 shadow-sm'
              : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          <BarChart3 className="w-3.5 h-3.5" />
          <span>Select Graph & Fields</span>
        </button>

        <button
          onClick={() => setActiveTab('interact')}
          className={`flex-1 py-2 px-3 rounded-lg font-medium transition flex items-center justify-center gap-1.5 ${
            activeTab === 'interact'
              ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 shadow-sm'
              : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          <SlidersHorizontal className="w-3.5 h-3.5" />
          <span>Add-Interact Feature</span>
        </button>
      </div>

      {activeTab === 'fields' ? (
        <div className="space-y-4 animate-in fade-in duration-200">
          {/* Worksheet Selection Bar */}
          {sheetNames.length > 0 && (
            <div className="p-3.5 rounded-xl bg-slate-900/90 border border-slate-700/80 space-y-2">
              <div className="flex items-center justify-between">
                <label className="text-xs font-mono uppercase tracking-wider text-emerald-400 font-semibold flex items-center gap-1.5">
                  <FileSpreadsheet className="w-4 h-4 text-emerald-400" />
                  <span>Source Worksheet</span>
                </label>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-slate-800 text-slate-400 border border-slate-700">
                  Slide Specific
                </span>
              </div>
              <select
                value={selectedSheet}
                onChange={(e) => onSheetChange && onSheetChange(e.target.value)}
                className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-xs font-mono text-slate-100 focus:outline-none focus:border-emerald-400"
              >
                {sheetNames.map((s) => (
                  <option key={s} value={s}>
                    {s}
                  </option>
                ))}
              </select>
            </div>
          )}

          {/* Chart Type Selector */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="block text-xs font-mono uppercase tracking-wider text-slate-400">
                1. Select Graph Type ({chartOptions.length})
              </label>
              <button
                type="button"
                onClick={() => setIsCatalogueOpen(true)}
                className="text-[11px] font-mono text-emerald-400 hover:text-emerald-300 flex items-center gap-1 bg-emerald-950/40 px-2 py-0.5 rounded-md border border-emerald-500/30 transition hover:border-emerald-400 shadow-sm"
              >
                <Sparkles className="w-3 h-3 text-emerald-400" />
                <span>Browse Catalogue</span>
              </button>
            </div>
            <div className="grid grid-cols-2 gap-2 max-h-64 overflow-y-auto pr-1 scrollbar-thin">
              {chartOptions.map((item) => {
                const Icon = item.icon;
                const isSelected = chartType === item.id;
                return (
                  <button
                    key={item.id}
                    onClick={() => setChartType(item.id)}
                    className={`p-2 rounded-xl border text-xs font-mono flex items-center gap-2 transition text-left ${
                      isSelected
                        ? 'border-emerald-400 bg-emerald-950/40 text-emerald-300 shadow-md shadow-emerald-500/10'
                        : 'border-slate-800 bg-slate-900/50 text-slate-400 hover:border-slate-700 hover:text-slate-200'
                    }`}
                  >
                    <Icon className={`w-4 h-4 flex-shrink-0 ${isSelected ? 'text-emerald-400' : 'text-slate-500'}`} />
                    <span className="truncate">{item.label}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Conditional Field Mapping based on Graph Type */}
          <div className="pt-2 border-t border-slate-800/80 space-y-3">
            <label className="block text-xs font-mono uppercase tracking-wider text-slate-400">
              2. Map Data Fields
            </label>

            {chartType === 'candlestick' ? (
              /* Candlestick requires Date, Open, High, Low, Close */
              <div className="space-y-2.5">
                <div>
                  <span className="text-xs font-mono text-slate-400">Timeline / Date Field:</span>
                  <select
                    value={xField}
                    onChange={(e) => setXField(e.target.value)}
                    className="w-full mt-1 bg-slate-900 border border-slate-700 rounded-lg px-3 py-1.5 text-xs text-slate-200 focus:outline-none focus:border-emerald-400"
                  >
                    {columns.map((c) => (
                      <option key={c} value={c}>{c} ({columnTypes[c] || 'type'})</option>
                    ))}
                  </select>
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <span className="text-[11px] font-mono text-slate-400">Open Price:</span>
                    <select
                      value={openField}
                      onChange={(e) => setOpenField(e.target.value)}
                      className="w-full mt-0.5 bg-slate-900 border border-slate-700 rounded-lg px-2.5 py-1.5 text-xs text-slate-200 focus:outline-none focus:border-emerald-400"
                    >
                      {columns.map((c) => <option key={c} value={c}>{c}</option>)}
                    </select>
                  </div>
                  <div>
                    <span className="text-[11px] font-mono text-slate-400">Close Price:</span>
                    <select
                      value={closeField}
                      onChange={(e) => setCloseField(e.target.value)}
                      className="w-full mt-0.5 bg-slate-900 border border-slate-700 rounded-lg px-2.5 py-1.5 text-xs text-slate-200 focus:outline-none focus:border-emerald-400"
                    >
                      {columns.map((c) => <option key={c} value={c}>{c}</option>)}
                    </select>
                  </div>
                  <div>
                    <span className="text-[11px] font-mono text-slate-400">Lowest (Low):</span>
                    <select
                      value={lowField}
                      onChange={(e) => setLowField(e.target.value)}
                      className="w-full mt-0.5 bg-slate-900 border border-slate-700 rounded-lg px-2.5 py-1.5 text-xs text-slate-200 focus:outline-none focus:border-emerald-400"
                    >
                      {columns.map((c) => <option key={c} value={c}>{c}</option>)}
                    </select>
                  </div>
                  <div>
                    <span className="text-[11px] font-mono text-slate-400">Highest (High):</span>
                    <select
                      value={highField}
                      onChange={(e) => setHighField(e.target.value)}
                      className="w-full mt-0.5 bg-slate-900 border border-slate-700 rounded-lg px-2.5 py-1.5 text-xs text-slate-200 focus:outline-none focus:border-emerald-400"
                    >
                      {columns.map((c) => <option key={c} value={c}>{c}</option>)}
                    </select>
                  </div>
                </div>
              </div>
            ) : chartType === 'scatter' ? (
              /* Scatter Chart: X-Axis Numerical vs Y-Axis Numerical */
              <div className="space-y-3.5">
                <div className="p-3 rounded-xl bg-slate-900/80 border border-slate-800 space-y-3">
                  <div>
                    <span className="text-xs font-mono text-slate-300 font-semibold block mb-1">
                      X-Axis (Independent Variable):
                    </span>
                    <select
                      value={xField}
                      onChange={(e) => setXField(e.target.value)}
                      className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-1.5 text-xs text-slate-200 font-mono focus:border-emerald-400"
                    >
                      {columns.map((c) => (
                        <option key={c} value={c}>{c} ({columnTypes[c] || 'metric'})</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <span className="text-xs font-mono text-slate-300 font-semibold block mb-1">
                      Y-Axis (Dependent Variable):
                    </span>
                    <select
                      value={effectiveYFields[0] || yField}
                      onChange={(e) => {
                        const val = e.target.value;
                        if (setYFields) setYFields([val]);
                        if (setYField) setYField(val);
                      }}
                      className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-1.5 text-xs text-slate-200 font-mono focus:border-emerald-400"
                    >
                      {columns.filter((c) => c !== xField).map((c) => (
                        <option key={c} value={c}>{c} ({columnTypes[c] || 'metric'})</option>
                      ))}
                    </select>
                  </div>
                </div>
              </div>
            ) : chartType === 'pie' ? (
              /* Pie / Donut Chart with Dedicated Quarter Picker & Component Selection */
              <div className="space-y-4">
                {/* Pie Mode Toggle */}
                <div className="p-3 rounded-xl bg-slate-900/90 border border-slate-800 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-mono text-slate-300 font-semibold flex items-center gap-1.5">
                      <PieChart className="w-3.5 h-3.5 text-emerald-400" />
                      <span>Pie Slice Mapping Mode:</span>
                    </span>
                    <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-slate-800 text-emerald-300 border border-slate-700">
                      {breakdownMode === 'composition' ? 'Quarter Breakdown' : 'Timeline Share'}
                    </span>
                  </div>

                  <div className="grid grid-cols-2 gap-1.5 p-1 rounded-lg bg-slate-950 border border-slate-800 text-xs font-mono">
                    <button
                      type="button"
                      onClick={() => setBreakdownMode && setBreakdownMode('composition')}
                      className={`py-1.5 px-2 rounded-md font-medium transition text-center ${
                        breakdownMode === 'composition'
                          ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 font-semibold shadow-sm'
                          : 'text-slate-400 hover:text-slate-200'
                      }`}
                    >
                      1 Quarter (Components)
                    </button>
                    <button
                      type="button"
                      onClick={() => setBreakdownMode && setBreakdownMode('distribution')}
                      className={`py-1.5 px-2 rounded-md font-medium transition text-center ${
                        breakdownMode === 'distribution'
                          ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 font-semibold shadow-sm'
                          : 'text-slate-400 hover:text-slate-200'
                      }`}
                    >
                      Across Quarters (Share)
                    </button>
                  </div>
                </div>

                {breakdownMode === 'composition' ? (
                  <div className="space-y-3">
                    {/* Quarter Selector Pill Strip */}
                    <div className="p-3 rounded-xl bg-slate-900/80 border border-slate-800 space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-mono text-slate-300 font-semibold flex items-center gap-1.5">
                          <Calendar className="w-3.5 h-3.5 text-cyan-400" />
                          <span>Target Quarter for Breakdown:</span>
                        </span>
                        <span className="text-[10px] font-mono text-cyan-300 font-bold">
                          {compositionPeriod || (availablePeriods.length > 0 ? availablePeriods[availablePeriods.length - 1] : '')}
                        </span>
                      </div>

                      <div className="flex gap-1.5 overflow-x-auto pb-1 scrollbar-thin">
                        {availablePeriods.map((p) => {
                          const target = compositionPeriod || availablePeriods[availablePeriods.length - 1];
                          const isSelected = target === p;
                          return (
                            <button
                              key={p}
                              type="button"
                              onClick={() => setCompositionPeriod && setCompositionPeriod(p)}
                              className={`px-3 py-1.5 rounded-lg text-xs font-mono border whitespace-nowrap transition ${
                                isSelected
                                  ? 'bg-cyan-950/80 border-cyan-500 text-cyan-300 font-bold shadow-sm'
                                  : 'bg-slate-950/60 border-slate-800 text-slate-400 hover:text-slate-200 hover:border-slate-700'
                              }`}
                            >
                              {p}
                            </button>
                          );
                        })}
                      </div>
                    </div>

                    {/* Component Row Picker */}
                    <div className="space-y-1.5">
                      <label className="text-xs font-mono text-slate-300 font-semibold flex items-center justify-between">
                        <span>Check Component Rows for Pie Slices:</span>
                        <span className="text-[10px] text-slate-500">e.g. Depreciation, Interest, Tax</span>
                      </label>
                      <FinancialTablePicker
                        metrics={columns}
                        metricTypes={columnTypes}
                        selectedMetrics={effectiveYFields}
                        onSelectMetrics={(newFields) => {
                          if (setYFields) setYFields(newFields);
                          if (setYField) setYField(newFields[0] || '');
                          if (setY2Field) setY2Field(newFields[1] || '');
                        }}
                        seriesConfigs={seriesConfigs}
                        onUpdateSeriesConfig={onUpdateSeriesConfig}
                        recentData={data}
                        recentPeriods={availablePeriods}
                        chartType="pie"
                        isFinancial={isFinancial || orientation === 'transposed'}
                      />
                    </div>
                  </div>
                ) : (
                  /* Timeline Distribution Mode: 1 Metric across Quarters */
                  <div className="space-y-3">
                    {/* Period Range Slicer */}
                    <div className="p-3 rounded-xl bg-slate-900/80 border border-slate-800 space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-mono text-slate-300 font-semibold flex items-center gap-1.5">
                          <Calendar className="w-3.5 h-3.5 text-cyan-400" />
                          <span>Timeline Period Filter:</span>
                        </span>
                        <span className="text-[10px] font-mono text-cyan-400 font-bold">
                          {(periodFilter?.preset || 'all').toUpperCase()}
                        </span>
                      </div>

                      <div className="grid grid-cols-5 gap-1 text-[11px] font-mono">
                        {periodPresets.map((preset) => {
                          const isActive = (periodFilter?.preset || 'all') === preset.id;
                          return (
                            <button
                              key={preset.id}
                              type="button"
                              onClick={() => handlePeriodPreset(preset.id)}
                              className={`py-1.5 px-1 rounded-lg border transition text-center ${
                                isActive
                                  ? 'bg-cyan-950/70 border-cyan-500/60 text-cyan-300 font-bold shadow-sm'
                                  : 'bg-slate-950/50 border-slate-800 text-slate-400 hover:text-slate-200 hover:border-slate-700'
                              }`}
                            >
                              {preset.label}
                            </button>
                          );
                        })}
                      </div>
                    </div>

                    {/* Single Metric Selection */}
                    <div className="space-y-1.5">
                      <label className="text-xs font-mono text-slate-300 font-semibold">
                        Select 1 Metric to Distribute across Quarters:
                      </label>
                      <FinancialTablePicker
                        metrics={columns}
                        metricTypes={columnTypes}
                        selectedMetrics={effectiveYFields.slice(0, 1)}
                        onSelectMetrics={(newFields) => {
                          const single = newFields.slice(-1);
                          if (setYFields) setYFields(single);
                          if (setYField) setYField(single[0] || '');
                        }}
                        seriesConfigs={seriesConfigs}
                        onUpdateSeriesConfig={onUpdateSeriesConfig}
                        recentData={data}
                        recentPeriods={availablePeriods}
                        chartType="pie"
                        isFinancial={isFinancial || orientation === 'transposed'}
                      />
                    </div>
                  </div>
                )}
              </div>
            ) : (
              /* Time-Series & Comparison Charts (Combo, Multi-Line, Clustered Bar, Stacked Bar, Area, etc.) */
              <div className="space-y-4">
                {/* 1. Timeline Period Filter */}
                <div className="p-3 rounded-xl bg-slate-900/80 border border-slate-800 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-mono text-slate-300 font-semibold flex items-center gap-1.5">
                      <Calendar className="w-3.5 h-3.5 text-cyan-400" />
                      <span>Timeline Period Filter:</span>
                    </span>
                    <span className="text-[10px] font-mono text-slate-400">
                      Preset: <strong className="text-cyan-400">{(periodFilter?.preset || 'all').toUpperCase()}</strong>
                    </span>
                  </div>

                  <div className="grid grid-cols-5 gap-1 text-[11px] font-mono">
                    {periodPresets.map((preset) => {
                      const isActive = (periodFilter?.preset || 'all') === preset.id;
                      return (
                        <button
                          key={preset.id}
                          type="button"
                          onClick={() => handlePeriodPreset(preset.id)}
                          className={`py-1.5 px-1 rounded-lg border transition text-center ${
                            isActive
                              ? 'bg-cyan-950/70 border-cyan-500/60 text-cyan-300 font-bold shadow-sm'
                              : 'bg-slate-950/50 border-slate-800 text-slate-400 hover:text-slate-200 hover:border-slate-700'
                          }`}
                        >
                          {preset.label}
                        </button>
                      );
                    })}
                  </div>

                  {periodFilter?.preset === 'custom' && availablePeriods.length > 0 && (
                    <div className="grid grid-cols-2 gap-2 pt-1 border-t border-slate-800/60">
                      <div>
                        <span className="text-[10px] font-mono text-slate-400">From Period:</span>
                        <select
                          value={periodFilter.customStart || availablePeriods[0]}
                          onChange={(e) => handleCustomPeriod('customStart', e.target.value)}
                          className="w-full mt-0.5 bg-slate-950 border border-slate-700 rounded-lg px-2 py-1 text-xs text-slate-200 font-mono"
                        >
                          {availablePeriods.map((p) => (
                            <option key={p} value={p}>{p}</option>
                          ))}
                        </select>
                      </div>
                      <div>
                        <span className="text-[10px] font-mono text-slate-400">To Period:</span>
                        <select
                          value={periodFilter.customEnd || availablePeriods[availablePeriods.length - 1]}
                          onChange={(e) => handleCustomPeriod('customEnd', e.target.value)}
                          className="w-full mt-0.5 bg-slate-950 border border-slate-700 rounded-lg px-2 py-1 text-xs text-slate-200 font-mono"
                        >
                          {availablePeriods.map((p) => (
                            <option key={p} value={p}>{p}</option>
                          ))}
                        </select>
                      </div>
                    </div>
                  )}
                </div>

                {/* 2. Timeline X-Axis Confirmation Banner */}
                <div className="p-2.5 rounded-xl bg-slate-950/80 border border-slate-800/90 flex items-center justify-between text-xs font-mono">
                  <div className="flex items-center gap-2">
                    <Calendar className="w-3.5 h-3.5 text-emerald-400" />
                    <span className="text-slate-400">Timeline (X-Axis):</span>
                    <span className="text-slate-100 font-semibold">{xField || 'Period'}</span>
                  </div>
                  <span className="text-[10px] text-emerald-400/90 font-medium">
                    {availablePeriods.length} Quarters Available
                  </span>
                </div>

                {/* 3. Active Chart Series Pills */}
                <div className="space-y-1.5">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-mono text-slate-300 font-semibold flex items-center gap-1.5">
                      <Layers className="w-3.5 h-3.5 text-emerald-400" />
                      <span>Active Chart Series ({effectiveYFields.length}):</span>
                    </span>
                    {effectiveYFields.length > 0 && (
                      <button
                        type="button"
                        onClick={() => {
                          if (setYFields) setYFields([]);
                          if (setYField) setYField('');
                          if (setY2Field) setY2Field('');
                        }}
                        className="text-[10px] font-mono text-slate-500 hover:text-red-400 transition"
                      >
                        Clear All
                      </button>
                    )}
                  </div>

                  <div className="flex flex-wrap gap-1.5 min-h-[38px] p-2 rounded-xl bg-slate-950/80 border border-slate-800">
                    {effectiveYFields.length === 0 ? (
                      <span className="text-xs font-mono text-slate-500 italic flex items-center py-0.5">
                        Click checkboxes in the financial table below to add series...
                      </span>
                    ) : (
                      effectiveYFields.map((metric, idx) => {
                        const color = FINANCIAL_PALETTE[idx % FINANCIAL_PALETTE.length];
                        const cfg = seriesConfigs[metric] || (chartType === 'combo' && idx > 0 ? { type: 'line', yAxisIndex: 1 } : { type: 'bar', yAxisIndex: 0 });
                        return (
                          <span
                            key={metric}
                            className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-mono bg-slate-900 border border-slate-700/80 text-slate-200 shadow-sm animate-in fade-in"
                          >
                            <span
                              className="w-2 h-2 rounded-full flex-shrink-0"
                              style={{ backgroundColor: color }}
                            />
                            <span className="truncate max-w-[140px] font-medium">{metric}</span>
                            {chartType === 'combo' && (
                              <span className={`px-1.5 py-0.2 rounded text-[9px] font-bold ${
                                cfg.type === 'bar'
                                  ? 'bg-cyan-950 text-cyan-300 border border-cyan-800'
                                  : 'bg-purple-950 text-purple-300 border border-purple-800'
                              }`}>
                                {cfg.type === 'bar' ? 'Bar (L)' : 'Line (R)'}
                              </span>
                            )}
                            <button
                              type="button"
                              onClick={() => handleRemoveMetric(metric)}
                              className="ml-0.5 text-slate-400 hover:text-red-400 rounded-full p-0.5 transition"
                            >
                              <X className="w-3 h-3" />
                            </button>
                          </span>
                        );
                      })
                    )}
                  </div>
                </div>

                {/* 4. Interactive Spreadsheet Statement Table */}
                <div className="space-y-1.5">
                  <label className="text-xs font-mono text-slate-300 font-semibold flex items-center justify-between">
                    <span>Click Rows to Plot from Spreadsheet:</span>
                    <span className="text-[10px] text-slate-500 font-normal">Live preview & 1-click presets</span>
                  </label>
                  <FinancialTablePicker
                    metrics={columns}
                    metricTypes={columnTypes}
                    selectedMetrics={effectiveYFields}
                    onSelectMetrics={(newFields) => {
                      if (setYFields) setYFields(newFields);
                      if (setYField) setYField(newFields[0] || '');
                      if (setY2Field) setY2Field(newFields[1] || '');
                    }}
                    seriesConfigs={seriesConfigs}
                    onUpdateSeriesConfig={onUpdateSeriesConfig}
                    recentData={data}
                    recentPeriods={availablePeriods}
                    chartType={chartType}
                    isFinancial={isFinancial || orientation === 'transposed'}
                  />
                </div>

                {chartType === 'waterfall' && (
                  <p className="text-[11px] text-cyan-400/90 font-mono bg-cyan-950/30 p-2 rounded-lg border border-cyan-800/40">
                    &bull; Waterfall chart will automatically compute the cumulative financial bridge from step deltas.
                  </p>
                )}
              </div>
            )}
          </div>
        </div>
      ) : (
        /* Add-Interact Settings Panel */
        <div className="space-y-4 animate-in fade-in duration-200">
          {/* Titles & Axis Label Customization */}
          <div className="space-y-2.5">
            <label className="block text-xs font-mono uppercase tracking-wider text-emerald-400">
              A. Chart Title & Axis Names
            </label>

            <div>
              <span className="text-[11px] font-mono text-slate-400">Chart Title:</span>
              <input
                type="text"
                value={chartTitle}
                onChange={(e) => setChartTitle(e.target.value)}
                placeholder="e.g. Q3 Market Volatility Index"
                className="w-full mt-0.5 bg-slate-900 border border-slate-700 rounded-lg px-3 py-1.5 text-xs text-slate-200 focus:outline-none focus:border-emerald-400"
              />
            </div>

            <div>
              <span className="text-[11px] font-mono text-slate-400">Chart Subtitle:</span>
              <input
                type="text"
                value={chartSubtitle}
                onChange={(e) => setChartSubtitle(e.target.value)}
                placeholder="e.g. Dual-axis comparison with 5-day MA"
                className="w-full mt-0.5 bg-slate-900 border border-slate-700 rounded-lg px-3 py-1.5 text-xs text-slate-200 focus:outline-none focus:border-emerald-400"
              />
            </div>

            <div className={`grid ${['combo', 'dual-line'].includes(chartType) ? 'grid-cols-3' : 'grid-cols-2'} gap-2 pt-1`}>
              <div>
                <span className="text-[11px] font-mono text-slate-400">
                  {chartType === 'horizontal-clustered-bar' ? 'X-Axis Name (Values):' : 'X-Axis Name:'}
                </span>
                <input
                  type="text"
                  value={xAxisLabel}
                  onChange={(e) => setXAxisLabel(e.target.value)}
                  placeholder={chartType === 'horizontal-clustered-bar' ? 'e.g. Value / USD' : 'e.g. Timeline'}
                  className="w-full mt-0.5 bg-slate-900 border border-slate-700 rounded-lg px-2.5 py-1 text-xs text-slate-200 focus:outline-none focus:border-emerald-400"
                />
              </div>
              <div>
                <span className="text-[11px] font-mono text-slate-400">
                  {['combo', 'dual-line'].includes(chartType)
                    ? 'Left Y-Axis:'
                    : chartType === 'horizontal-clustered-bar'
                    ? 'Y-Axis Name (Categories):'
                    : 'Y-Axis Name:'}
                </span>
                <input
                  type="text"
                  value={yAxisLabel}
                  onChange={(e) => setYAxisLabel(e.target.value)}
                  placeholder={chartType === 'horizontal-clustered-bar' ? 'e.g. Entity / Sector' : 'e.g. Value / USD'}
                  className="w-full mt-0.5 bg-slate-900 border border-slate-700 rounded-lg px-2.5 py-1 text-xs text-slate-200 focus:outline-none focus:border-emerald-400"
                />
              </div>
              {['combo', 'dual-line'].includes(chartType) && (
                <div>
                  <span className="text-[11px] font-mono text-cyan-400">Right Y-Axis:</span>
                  <input
                    type="text"
                    value={y2AxisLabel || ''}
                    onChange={(e) => setY2AxisLabel && setY2AxisLabel(e.target.value)}
                    placeholder="e.g. Rate / %"
                    className="w-full mt-0.5 bg-slate-900 border border-slate-700 rounded-lg px-2.5 py-1 text-xs text-slate-200 focus:outline-none focus:border-cyan-400"
                  />
                </div>
              )}
            </div>
          </div>

          {/* Interactive Feature Toggles: Tooltips, Mousehover, Zoom */}
          <div className="space-y-3 pt-3 border-t border-slate-800">
            <label className="block text-xs font-mono uppercase tracking-wider text-emerald-400">
              B. Interactive Tooltip & Hover Options
            </label>

            {/* Tooltip Toggle */}
            <div className="flex items-center justify-between p-2 rounded-xl bg-slate-900/60 border border-slate-800">
              <div className="flex items-center gap-2">
                <Eye className="w-4 h-4 text-emerald-400" />
                <span className="text-xs font-mono text-slate-200">Interactive Tooltip</span>
              </div>
              <input
                type="checkbox"
                checked={interactions.enableTooltip}
                onChange={(e) => updateInteraction('enableTooltip', e.target.checked)}
                className="w-4 h-4 rounded text-emerald-500 bg-slate-800 border-slate-700 focus:ring-0 cursor-pointer"
              />
            </div>

            {/* Crosshair / Pointer Style */}
            {interactions.enableTooltip && (
              <div className="grid grid-cols-2 gap-2 pl-2">
                <div>
                  <span className="text-[10px] font-mono text-slate-400">Pointer Cursor:</span>
                  <select
                    value={interactions.axisPointerType}
                    onChange={(e) => updateInteraction('axisPointerType', e.target.value)}
                    className="w-full mt-0.5 bg-slate-900 border border-slate-700 rounded-lg px-2 py-1 text-xs text-slate-200"
                  >
                    <option value="cross">Crosshairs (Financial)</option>
                    <option value="line">Vertical Line</option>
                    <option value="shadow">Shadow Bar</option>
                  </select>
                </div>
                <div>
                  <span className="text-[10px] font-mono text-slate-400">Trigger Mode:</span>
                  <select
                    value={interactions.tooltipTrigger}
                    onChange={(e) => updateInteraction('tooltipTrigger', e.target.value)}
                    className="w-full mt-0.5 bg-slate-900 border border-slate-700 rounded-lg px-2 py-1 text-xs text-slate-200"
                  >
                    <option value="axis">Axis (All items)</option>
                    <option value="item">Single Point</option>
                  </select>
                </div>
              </div>
            )}

            {/* Mouse Hover Highlight */}
            <div className="flex items-center justify-between p-2 rounded-xl bg-slate-900/60 border border-slate-800">
              <div className="flex items-center gap-2">
                <MousePointerClick className="w-4 h-4 text-cyan-400" />
                <span className="text-xs font-mono text-slate-200">Mousehover Glow</span>
              </div>
              <input
                type="checkbox"
                checked={interactions.enableMouseHover}
                onChange={(e) => updateInteraction('enableMouseHover', e.target.checked)}
                className="w-4 h-4 rounded text-emerald-500 bg-slate-800 border-slate-700 focus:ring-0 cursor-pointer"
              />
            </div>

            {/* Zoom Slider */}
            <div className="flex items-center justify-between p-2 rounded-xl bg-slate-900/60 border border-slate-800">
              <div className="flex items-center gap-2">
                <Maximize2 className="w-4 h-4 text-purple-400" />
                <span className="text-xs font-mono text-slate-200">DataZoom (Scroll/Slider)</span>
              </div>
              <input
                type="checkbox"
                checked={interactions.enableZoom}
                onChange={(e) => updateInteraction('enableZoom', e.target.checked)}
                className="w-4 h-4 rounded text-emerald-500 bg-slate-800 border-slate-700 focus:ring-0 cursor-pointer"
              />
            </div>

            {/* Grid Lines */}
            <div className="flex items-center justify-between p-2 rounded-xl bg-slate-900/60 border border-slate-800">
              <span className="text-xs font-mono text-slate-300">Show Chart Gridlines</span>
              <input
                type="checkbox"
                checked={interactions.showGridLines}
                onChange={(e) => updateInteraction('showGridLines', e.target.checked)}
                className="w-4 h-4 rounded text-emerald-500 bg-slate-800 border-slate-700 focus:ring-0 cursor-pointer"
              />
            </div>

            {/* Area Shading for Lines (Translucent Gradient) */}
            {['multi-line', 'line', 'dual-line'].includes(chartType) && (
              <div className="flex items-center justify-between p-2 rounded-xl bg-slate-900/60 border border-slate-800">
                <div className="flex items-center gap-2">
                  <Layers className="w-4 h-4 text-emerald-400" />
                  <span className="text-xs font-mono text-slate-200">Area Shading (Translucent Gradient)</span>
                </div>
                <input
                  type="checkbox"
                  checked={interactions.enableAreaShading || false}
                  onChange={(e) => updateInteraction('enableAreaShading', e.target.checked)}
                  className="w-4 h-4 rounded text-emerald-500 bg-slate-800 border-slate-700 focus:ring-0 cursor-pointer"
                />
              </div>
            )}
          </div>
        </div>
      )}

      {/* Visual Catalogue Modal */}
      {isCatalogueOpen && (
        <div className="fixed inset-0 z-50 bg-slate-950/85 backdrop-blur-md flex items-center justify-center p-4 sm:p-6 overflow-y-auto animate-in fade-in duration-200">
          <div className="relative w-full max-w-6xl max-h-[92vh] bg-slate-950 border border-slate-700/80 rounded-3xl p-6 overflow-y-auto shadow-2xl space-y-4">
            <div className="flex items-center justify-between pb-4 border-b border-slate-800">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center">
                  <Sparkles className="w-4 h-4 text-emerald-400" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-white font-display">
                    Data Visualisation Catalogue
                  </h3>
                  <p className="text-xs text-slate-400 font-mono">
                    Select a visualizer for slide "{chartTitle || 'Current Slide'}"
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setIsCatalogueOpen(false)}
                className="p-2 rounded-xl text-slate-400 hover:text-white bg-slate-900 border border-slate-800 hover:border-slate-700 transition"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <VisualChartCatalogue
              onSelectChart={(id) => {
                setChartType(id);
                setIsCatalogueOpen(false);
              }}
            />
          </div>
        </div>
      )}
    </div>
  );
}
