'use client';

import React, { useState, useMemo } from 'react';
import { analyzePeriodsSummary } from '../utils/periodHelpers';
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
  Filter,
  Table
} from 'lucide-react';
import VisualChartCatalogue from '@/components/VisualChartCatalogue';
import FinancialTablePicker from '@/components/FinancialTablePicker';
import SheetColumnPickerModal from '@/components/SheetColumnPickerModal';

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
  tagEstimates = true,
  setTagEstimates,
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
  rawSheet = null,
  allSheets = {},
}) {
  const [activeTab, setActiveTab] = useState('fields'); // 'fields' | 'interact'
  const [isCatalogueOpen, setIsCatalogueOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [isSheetPickerOpen, setIsSheetPickerOpen] = useState(false);
  const [sheetPickerTarget, setSheetPickerTarget] = useState('xField');

  const openSheetPickerFor = (fieldKey) => {
    setSheetPickerTarget(fieldKey);
    setIsSheetPickerOpen(true);
  };

  // Period analysis: count historical actuals vs forward estimates
  const periodSummary = useMemo(() => {
    return analyzePeriodsSummary(availablePeriods);
  }, [availablePeriods]);

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

  const handleAssignField = (fieldKey, columnName) => {
    if (fieldKey === 'xField') {
      if (setXField) setXField(columnName);
    } else if (fieldKey === 'openField') {
      if (setOpenField) setOpenField(columnName);
    } else if (fieldKey === 'closeField') {
      if (setCloseField) setCloseField(columnName);
    } else if (fieldKey === 'lowField') {
      if (setLowField) setLowField(columnName);
    } else if (fieldKey === 'highField') {
      if (setHighField) setHighField(columnName);
    } else if (fieldKey === 'yField') {
      if (setYField) setYField(columnName);
      if (setYFields) setYFields([columnName]);
    } else if (fieldKey === 'y2Field') {
      if (setY2Field) setY2Field(columnName);
    } else if (fieldKey === 'yFields') {
      handleToggleMetric(columnName);
    } else if (fieldKey === 'compositionPeriod') {
      if (setCompositionPeriod) setCompositionPeriod(columnName);
    }
  };

  const handleSelectAllNumericMetrics = () => {
    const numCols = columns.filter((c) => columnTypes[c] === 'number' && c !== xField && !c.startsWith('__EMPTY'));
    if (setYFields) setYFields(numCols);
    if (setYField && numCols[0]) setYField(numCols[0]);
    if (setY2Field) setY2Field(numCols[1] || '');
  };

  const handleClearAllMetrics = () => {
    if (setYFields) setYFields([]);
    if (setYField) setYField('');
    if (setY2Field) setY2Field('');
  };

  const periodPresets = [
    { id: 'all', label: 'All Periods' },
    { id: 'historical', label: 'Historical Only' },
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
    <div className="w-full glass-card rounded-2xl p-5 border border-white/10 flex flex-col space-y-5">
      {/* Tab Switcher: Data Fields vs Add-Interact Feature */}
      <div className="flex items-center p-1 rounded-xl bg-black/60 border border-white/10 text-xs font-mono">
        <button
          onClick={() => setActiveTab('fields')}
          className={`flex-1 py-2 px-3 rounded-lg font-medium transition flex items-center justify-center gap-1.5 ${
            activeTab === 'fields'
              ? 'bg-white/15 text-white border border-white/40 shadow-sm font-semibold'
              : 'text-slate-300 hover:text-white'
          }`}
        >
          <BarChart3 className="w-3.5 h-3.5" />
          <span>Select Graph & Fields</span>
        </button>

        <button
          onClick={() => setActiveTab('interact')}
          className={`flex-1 py-2 px-3 rounded-lg font-medium transition flex items-center justify-center gap-1.5 ${
            activeTab === 'interact'
              ? 'bg-white/15 text-white border border-white/40 shadow-sm font-semibold'
              : 'text-slate-300 hover:text-white'
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
            <div className="p-3.5 rounded-xl bg-[#0a0a0d] border border-white/10 space-y-2">
              <div className="flex items-center justify-between">
                <label className="text-xs font-mono uppercase tracking-wider text-cyan-400 font-semibold flex items-center gap-1.5">
                  <FileSpreadsheet className="w-4 h-4 text-cyan-400" />
                  <span>Source Worksheet</span>
                </label>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-white/10 text-slate-300 border border-white/10">
                  Slide Specific
                </span>
              </div>
              <select
                value={selectedSheet}
                onChange={(e) => onSheetChange && onSheetChange(e.target.value)}
                className="w-full bg-black border border-white/15 rounded-lg px-3 py-2 text-xs font-mono text-white focus:outline-none focus:border-white/40"
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
              <label className="block text-xs font-mono uppercase tracking-wider text-slate-300">
                1. Select Graph Type ({chartOptions.length})
              </label>
              <button
                type="button"
                onClick={() => setIsCatalogueOpen(true)}
                className="text-[11px] font-mono text-white hover:text-cyan-300 flex items-center gap-1 bg-white/10 px-2.5 py-1 rounded-md border border-white/20 transition hover:border-white/40 shadow-sm"
              >
                <Sparkles className="w-3 h-3 text-cyan-400" />
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
                        ? 'border-white/50 bg-white/15 text-white shadow-md font-semibold'
                        : 'border-white/10 bg-[#0a0a0d] text-slate-300 hover:border-white/30 hover:text-white'
                    }`}
                  >
                    <Icon className={`w-4 h-4 flex-shrink-0 ${isSelected ? 'text-cyan-400' : 'text-slate-400'}`} />
                    <span className="truncate">{item.label}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Conditional Field Mapping based on Graph Type */}
          <div className="pt-2 border-t border-slate-800/80 space-y-3">
            <div className="flex items-center justify-between">
              <label className="block text-xs font-mono uppercase tracking-wider text-slate-400">
                2. Map Data Fields
              </label>
              <button
                type="button"
                onClick={() => openSheetPickerFor(chartType === 'candlestick' ? 'openField' : chartType === 'scatter' ? 'xField' : 'yFields')}
                className="text-[11px] font-mono text-emerald-300 hover:text-emerald-200 flex items-center gap-1.5 bg-emerald-950/70 hover:bg-emerald-900 border border-emerald-500/40 hover:border-emerald-400 px-2.5 py-1 rounded-lg transition shadow-sm font-semibold"
                title="Open interactive spreadsheet grid to select columns directly"
              >
                <FileSpreadsheet className="w-3.5 h-3.5 text-emerald-400" />
                <span>Pick from XL-Sheet</span>
              </button>
            </div>

            {/* Interactive XL Sheet Column Picker Hero Banner */}
            <div className="p-3.5 rounded-xl bg-gradient-to-br from-slate-900 via-blue-950/40 to-emerald-950/30 border border-blue-500/25 hover:border-blue-500/50 transition-all duration-300 shadow-md group">
              <div className="flex items-center justify-between gap-3">
                <div className="flex items-center gap-2.5">
                  <div className="relative p-2 rounded-lg bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 flex-shrink-0">
                    <FileSpreadsheet className="w-4 h-4" />
                    <span className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-emerald-400 rounded-full animate-pulse border-2 border-slate-900" />
                  </div>
                  <div>
                    <div className="text-xs font-bold text-white font-mono flex items-center gap-1.5">
                      <span>Spreadsheet Column Picker</span>
                      <span className="text-[9px] px-1.5 py-0.2 rounded bg-blue-950 text-blue-300 border border-blue-800 font-semibold uppercase">
                        Interactive
                      </span>
                    </div>
                    <div className="text-[10px] text-slate-400 font-mono mt-0.5">
                      Click columns in your parsed spreadsheet to assign to graph fields
                    </div>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => openSheetPickerFor(chartType === 'candlestick' ? 'openField' : chartType === 'scatter' ? 'xField' : 'yFields')}
                  className="px-3.5 py-2 rounded-lg bg-gradient-to-r from-blue-600 to-emerald-600 hover:from-blue-500 hover:to-emerald-500 text-white text-xs font-mono font-bold flex items-center gap-1.5 transition-all duration-200 shadow-lg shadow-blue-500/20 hover:shadow-blue-500/40 flex-shrink-0 group-hover:scale-[1.02]"
                >
                  <Table className="w-3.5 h-3.5" />
                  <span>Open Sheet ↗</span>
                </button>
              </div>
            </div>

            {chartType === 'candlestick' ? (
              /* Candlestick requires Date, Open, High, Low, Close */
              <div className="space-y-2.5">
                <div>
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-mono text-slate-400">Timeline / Date Field:</span>
                    <button
                      type="button"
                      onClick={() => openSheetPickerFor('xField')}
                      className="text-[10px] font-mono text-blue-400 hover:text-blue-300 flex items-center gap-1 transition"
                    >
                      <FileSpreadsheet className="w-3 h-3 text-emerald-400" />
                      <span>Select from Sheet</span>
                    </button>
                  </div>
                  <div className="flex items-center gap-1.5 mt-1">
                    <select
                      value={xField}
                      onChange={(e) => setXField(e.target.value)}
                      className="flex-1 bg-slate-900 border border-slate-700 rounded-lg px-3 py-1.5 text-xs text-slate-200 focus:outline-none focus:border-emerald-400 font-mono"
                    >
                      {columns.map((c) => (
                        <option key={c} value={c}>{c} ({columnTypes[c] || 'type'})</option>
                      ))}
                    </select>
                    <button
                      type="button"
                      onClick={() => openSheetPickerFor('xField')}
                      className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-750 border border-slate-700 text-slate-300 hover:text-white transition flex-shrink-0"
                      title="Open sheet to select Timeline column"
                    >
                      <Table className="w-4 h-4 text-blue-400" />
                    </button>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <div className="flex items-center justify-between">
                      <span className="text-[11px] font-mono text-slate-400">Open Price:</span>
                      <button
                        type="button"
                        onClick={() => openSheetPickerFor('openField')}
                        className="text-[9px] font-mono text-emerald-400 hover:underline flex items-center gap-0.5"
                      >
                        <FileSpreadsheet className="w-2.5 h-2.5" />
                        <span>Sheet</span>
                      </button>
                    </div>
                    <div className="flex items-center gap-1 mt-0.5">
                      <select
                        value={openField}
                        onChange={(e) => setOpenField(e.target.value)}
                        className="w-full bg-slate-900 border border-slate-700 rounded-lg px-2.5 py-1.5 text-xs text-slate-200 focus:outline-none focus:border-emerald-400 font-mono"
                      >
                        {columns.map((c) => <option key={c} value={c}>{c}</option>)}
                      </select>
                      <button
                        type="button"
                        onClick={() => openSheetPickerFor('openField')}
                        className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-750 border border-slate-700 text-slate-300 hover:text-white transition flex-shrink-0"
                        title="Open sheet to select Open Price column"
                      >
                        <Table className="w-3.5 h-3.5 text-emerald-400" />
                      </button>
                    </div>
                  </div>

                  <div>
                    <div className="flex items-center justify-between">
                      <span className="text-[11px] font-mono text-slate-400">Close Price:</span>
                      <button
                        type="button"
                        onClick={() => openSheetPickerFor('closeField')}
                        className="text-[9px] font-mono text-rose-400 hover:underline flex items-center gap-0.5"
                      >
                        <FileSpreadsheet className="w-2.5 h-2.5" />
                        <span>Sheet</span>
                      </button>
                    </div>
                    <div className="flex items-center gap-1 mt-0.5">
                      <select
                        value={closeField}
                        onChange={(e) => setCloseField(e.target.value)}
                        className="w-full bg-slate-900 border border-slate-700 rounded-lg px-2.5 py-1.5 text-xs text-slate-200 focus:outline-none focus:border-emerald-400 font-mono"
                      >
                        {columns.map((c) => <option key={c} value={c}>{c}</option>)}
                      </select>
                      <button
                        type="button"
                        onClick={() => openSheetPickerFor('closeField')}
                        className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-750 border border-slate-700 text-slate-300 hover:text-white transition flex-shrink-0"
                        title="Open sheet to select Close Price column"
                      >
                        <Table className="w-3.5 h-3.5 text-rose-400" />
                      </button>
                    </div>
                  </div>

                  <div>
                    <div className="flex items-center justify-between">
                      <span className="text-[11px] font-mono text-slate-400">Lowest (Low):</span>
                      <button
                        type="button"
                        onClick={() => openSheetPickerFor('lowField')}
                        className="text-[9px] font-mono text-amber-400 hover:underline flex items-center gap-0.5"
                      >
                        <FileSpreadsheet className="w-2.5 h-2.5" />
                        <span>Sheet</span>
                      </button>
                    </div>
                    <div className="flex items-center gap-1 mt-0.5">
                      <select
                        value={lowField}
                        onChange={(e) => setLowField(e.target.value)}
                        className="w-full bg-slate-900 border border-slate-700 rounded-lg px-2.5 py-1.5 text-xs text-slate-200 focus:outline-none focus:border-emerald-400 font-mono"
                      >
                        {columns.map((c) => <option key={c} value={c}>{c}</option>)}
                      </select>
                      <button
                        type="button"
                        onClick={() => openSheetPickerFor('lowField')}
                        className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-750 border border-slate-700 text-slate-300 hover:text-white transition flex-shrink-0"
                        title="Open sheet to select Low Price column"
                      >
                        <Table className="w-3.5 h-3.5 text-amber-400" />
                      </button>
                    </div>
                  </div>

                  <div>
                    <div className="flex items-center justify-between">
                      <span className="text-[11px] font-mono text-slate-400">Highest (High):</span>
                      <button
                        type="button"
                        onClick={() => openSheetPickerFor('highField')}
                        className="text-[9px] font-mono text-cyan-400 hover:underline flex items-center gap-0.5"
                      >
                        <FileSpreadsheet className="w-2.5 h-2.5" />
                        <span>Sheet</span>
                      </button>
                    </div>
                    <div className="flex items-center gap-1 mt-0.5">
                      <select
                        value={highField}
                        onChange={(e) => setHighField(e.target.value)}
                        className="w-full bg-slate-900 border border-slate-700 rounded-lg px-2.5 py-1.5 text-xs text-slate-200 focus:outline-none focus:border-emerald-400 font-mono"
                      >
                        {columns.map((c) => <option key={c} value={c}>{c}</option>)}
                      </select>
                      <button
                        type="button"
                        onClick={() => openSheetPickerFor('highField')}
                        className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-750 border border-slate-700 text-slate-300 hover:text-white transition flex-shrink-0"
                        title="Open sheet to select High Price column"
                      >
                        <Table className="w-3.5 h-3.5 text-cyan-400" />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ) : chartType === 'scatter' ? (
              /* Scatter Chart: X-Axis Numerical vs Y-Axis Numerical */
              <div className="space-y-3.5">
                <div className="p-3 rounded-xl bg-slate-900/80 border border-slate-800 space-y-3">
                  <div>
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-xs font-mono text-slate-300 font-semibold">
                        X-Axis (Independent Variable):
                      </span>
                      <button
                        type="button"
                        onClick={() => openSheetPickerFor('xField')}
                        className="text-[10px] font-mono text-blue-400 hover:underline flex items-center gap-1"
                      >
                        <FileSpreadsheet className="w-3 h-3 text-emerald-400" />
                        <span>Pick from Sheet</span>
                      </button>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <select
                        value={xField}
                        onChange={(e) => setXField(e.target.value)}
                        className="flex-1 bg-slate-950 border border-slate-700 rounded-lg px-3 py-1.5 text-xs text-slate-200 font-mono focus:border-emerald-400"
                      >
                        {columns.map((c) => (
                          <option key={c} value={c}>{c} ({columnTypes[c] || 'metric'})</option>
                        ))}
                      </select>
                      <button
                        type="button"
                        onClick={() => openSheetPickerFor('xField')}
                        className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-750 border border-slate-700 text-slate-300 hover:text-white transition flex-shrink-0"
                        title="Open sheet to select X-Axis column"
                      >
                        <Table className="w-4 h-4 text-blue-400" />
                      </button>
                    </div>
                  </div>

                  <div>
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-xs font-mono text-slate-300 font-semibold">
                        Y-Axis (Dependent Variable):
                      </span>
                      <button
                        type="button"
                        onClick={() => openSheetPickerFor('yField')}
                        className="text-[10px] font-mono text-emerald-400 hover:underline flex items-center gap-1"
                      >
                        <FileSpreadsheet className="w-3 h-3 text-emerald-400" />
                        <span>Pick from Sheet</span>
                      </button>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <select
                        value={effectiveYFields[0] || yField}
                        onChange={(e) => {
                          const val = e.target.value;
                          if (setYFields) setYFields([val]);
                          if (setYField) setYField(val);
                        }}
                        className="flex-1 bg-slate-950 border border-slate-700 rounded-lg px-3 py-1.5 text-xs text-slate-200 font-mono focus:border-emerald-400"
                      >
                        {columns.filter((c) => c !== xField).map((c) => (
                          <option key={c} value={c}>{c} ({columnTypes[c] || 'metric'})</option>
                        ))}
                      </select>
                      <button
                        type="button"
                        onClick={() => openSheetPickerFor('yField')}
                        className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-750 border border-slate-700 text-slate-300 hover:text-white transition flex-shrink-0"
                        title="Open sheet to select Y-Axis column"
                      >
                        <Table className="w-4 h-4 text-emerald-400" />
                      </button>
                    </div>
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
                      <PieChart className="w-3.5 h-3.5 text-blue-400" />
                      <span>Pie Slice Mapping Mode:</span>
                    </span>
                    <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-slate-800 text-blue-300 border border-slate-700">
                      {breakdownMode === 'composition' ? 'Quarter Breakdown' : 'Timeline Share'}
                    </span>
                  </div>

                  <div className="grid grid-cols-2 gap-1.5 p-1 rounded-lg bg-slate-950 border border-slate-800 text-xs font-mono">
                    <button
                      type="button"
                      onClick={() => setBreakdownMode && setBreakdownMode('composition')}
                      className={`py-1.5 px-2 rounded-md font-medium transition text-center ${
                        breakdownMode === 'composition'
                          ? 'bg-blue-600/20 text-blue-300 border border-blue-500/40 font-semibold shadow-sm'
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
                          ? 'bg-blue-600/20 text-blue-300 border border-blue-500/40 font-semibold shadow-sm'
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
                        onOpenSheetPicker={() => openSheetPickerFor('yFields')}
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

                      <div className="grid grid-cols-3 sm:grid-cols-6 gap-1 text-[11px] font-mono">
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
                      <div className="flex items-center justify-between">
                        <label className="text-xs font-mono text-slate-300 font-semibold">
                          Select 1 Metric to Distribute across Quarters:
                        </label>
                        <button
                          type="button"
                          onClick={() => openSheetPickerFor('yField')}
                          className="text-[10px] font-mono text-emerald-400 hover:underline flex items-center gap-1"
                        >
                          <FileSpreadsheet className="w-3 h-3" />
                          <span>Pick from Sheet</span>
                        </button>
                      </div>
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
                        onOpenSheetPicker={() => openSheetPickerFor('yField')}
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

                  <div className="grid grid-cols-3 sm:grid-cols-6 gap-1 text-[11px] font-mono">
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

                  {/* Forward Estimate Tagging Toggle */}
                  {periodSummary.hasEstimates && (
                    <div className="flex items-center justify-between pt-2 border-t border-slate-800/80 text-xs font-mono">
                      <label className="flex items-center gap-2 cursor-pointer text-slate-300 hover:text-white select-none">
                        <input
                          type="checkbox"
                          checked={tagEstimates !== false}
                          onChange={(e) => setTagEstimates && setTagEstimates(e.target.checked)}
                          className="w-3.5 h-3.5 rounded border-slate-700 bg-slate-900 text-cyan-500 focus:ring-cyan-500/20"
                        />
                        <span>Tag Forward Estimates with <strong className="text-cyan-400 font-bold">(E)</strong></span>
                      </label>
                      <span className="text-[10px] text-cyan-400 font-medium bg-cyan-950/60 px-2 py-0.5 rounded border border-cyan-800/50">
                        {periodSummary.estimateCount} Est ({periodSummary.estimateLabels.join(', ')})
                      </span>
                    </div>
                  )}

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
                    <Calendar className="w-3.5 h-3.5 text-blue-400" />
                    <span className="text-slate-400">Timeline (X-Axis):</span>
                    <span className="text-slate-100 font-semibold">{xField || 'Period'}</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <button
                      type="button"
                      onClick={() => openSheetPickerFor('xField')}
                      className="px-2 py-0.5 rounded bg-blue-950/80 hover:bg-blue-900 border border-blue-700/60 hover:border-blue-400 text-blue-300 font-mono text-[10px] font-semibold flex items-center gap-1 transition"
                      title="Select Timeline / X-Axis column from parsed spreadsheet"
                    >
                      <FileSpreadsheet className="w-3 h-3 text-emerald-400" />
                      <span>Select X from Sheet</span>
                    </button>
                    {periodSummary.hasEstimates ? (
                      <div className="flex items-center gap-1.5">
                        <span className="text-[10px] text-slate-300 font-medium bg-slate-800 px-2 py-0.5 rounded border border-slate-700">
                          {periodSummary.historicalCount} Historical
                        </span>
                        <span className="text-[10px] text-cyan-300 font-semibold bg-cyan-950/70 px-2 py-0.5 rounded border border-cyan-500/40">
                          {periodSummary.estimateCount} Estimates (E)
                        </span>
                      </div>
                    ) : (
                      <span className="text-[10px] text-blue-400/90 font-medium hidden sm:inline">
                        {availablePeriods.length} Periods Available
                      </span>
                    )}
                  </div>
                </div>

                {/* 3. Active Chart Series Pills */}
                <div className="space-y-1.5">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-mono text-slate-300 font-semibold flex items-center gap-1.5">
                      <Layers className="w-3.5 h-3.5 text-blue-400" />
                      <span>Active Chart Series ({effectiveYFields.length}):</span>
                    </span>
                    <div className="flex items-center gap-1.5">
                      <button
                        type="button"
                        onClick={() => openSheetPickerFor('yFields')}
                        className="px-2 py-0.5 rounded bg-emerald-950/80 hover:bg-emerald-900 border border-emerald-500/50 hover:border-emerald-400 text-emerald-300 font-mono text-[10px] font-semibold flex items-center gap-1 transition shadow-sm"
                        title="Open parsed spreadsheet and click columns to add/remove series"
                      >
                        <FileSpreadsheet className="w-3 h-3 text-emerald-400" />
                        <span>Pick Series from Sheet</span>
                      </button>
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
                    onOpenSheetPicker={() => openSheetPickerFor('yFields')}
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
            <label className="block text-xs font-mono uppercase tracking-wider text-blue-400 font-semibold">
              A. Chart Title & Axis Names
            </label>

            <div>
              <span className="text-[11px] font-mono text-slate-400">Chart Title:</span>
              <input
                type="text"
                value={chartTitle}
                onChange={(e) => setChartTitle(e.target.value)}
                placeholder="e.g. Q3 Market Volatility Index"
                className="w-full mt-0.5 bg-slate-900 border border-slate-700 rounded-lg px-3 py-1.5 text-xs text-slate-200 focus:outline-none focus:border-blue-400"
              />
            </div>

            <div>
              <span className="text-[11px] font-mono text-slate-400">Chart Subtitle:</span>
              <input
                type="text"
                value={chartSubtitle}
                onChange={(e) => setChartSubtitle(e.target.value)}
                placeholder="e.g. Dual-axis comparison with 5-day MA"
                className="w-full mt-0.5 bg-slate-900 border border-slate-700 rounded-lg px-3 py-1.5 text-xs text-slate-200 focus:outline-none focus:border-blue-400"
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
                  className="w-full mt-0.5 bg-slate-900 border border-slate-700 rounded-lg px-2.5 py-1 text-xs text-slate-200 focus:outline-none focus:border-blue-400"
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
                  className="w-full mt-0.5 bg-slate-900 border border-slate-700 rounded-lg px-2.5 py-1 text-xs text-slate-200 focus:outline-none focus:border-blue-400"
                />
              </div>
              {['combo', 'dual-line'].includes(chartType) && (
                <div>
                  <span className="text-[11px] font-mono text-cyan-400">Right Y-Axis:</span>
                  <input
                    type="text"
                    value={y2AxisLabel}
                    onChange={(e) => setY2AxisLabel(e.target.value)}
                    placeholder="e.g. Operating Margin %"
                    className="w-full mt-0.5 bg-slate-900 border border-slate-700 rounded-lg px-2.5 py-1 text-xs text-slate-200 focus:outline-none focus:border-cyan-400"
                  />
                </div>
              )}
            </div>
            <p className="text-[10px] font-mono text-slate-500 pt-0.5">
              Tip: Leave X-Axis blank to keep timeline clean. Custom names render with generous margin below dates.
            </p>
          </div>

          {/* Interactive Feature Toggles: Tooltips, Mousehover, Zoom */}
          <div className="space-y-3 pt-3 border-t border-slate-800">
            <label className="block text-xs font-mono uppercase tracking-wider text-blue-400 font-semibold">
              B. Interactive Tooltip & Hover Options
            </label>

            {/* Tooltip Toggle */}
            <div className="flex items-center justify-between p-2 rounded-xl bg-slate-900/60 border border-slate-800">
              <div className="flex items-center gap-2">
                <Eye className="w-4 h-4 text-blue-400" />
                <span className="text-xs font-mono text-slate-200">Interactive Tooltip</span>
              </div>
              <input
                type="checkbox"
                checked={interactions.enableTooltip}
                onChange={(e) => updateInteraction('enableTooltip', e.target.checked)}
                className="w-4 h-4 rounded text-blue-600 bg-slate-800 border-slate-700 focus:ring-0 cursor-pointer"
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
                className="w-4 h-4 rounded text-blue-600 bg-slate-800 border-slate-700 focus:ring-0 cursor-pointer"
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
                className="w-4 h-4 rounded text-blue-600 bg-slate-800 border-slate-700 focus:ring-0 cursor-pointer"
              />
            </div>

            {/* Grid Lines */}
            <div className="flex items-center justify-between p-2 rounded-xl bg-slate-900/60 border border-slate-800">
              <span className="text-xs font-mono text-slate-300">Show Chart Gridlines</span>
              <input
                type="checkbox"
                checked={interactions.showGridLines}
                onChange={(e) => updateInteraction('showGridLines', e.target.checked)}
                className="w-4 h-4 rounded text-blue-600 bg-slate-800 border-slate-700 focus:ring-0 cursor-pointer"
              />
            </div>

            {/* Area Shading for Lines (Translucent Gradient) */}
            {['multi-line', 'line', 'dual-line'].includes(chartType) && (
              <div className="flex items-center justify-between p-2 rounded-xl bg-slate-900/60 border border-slate-800">
                <div className="flex items-center gap-2">
                  <Layers className="w-4 h-4 text-blue-400" />
                  <span className="text-xs font-mono text-slate-200">Area Shading (Translucent Gradient)</span>
                </div>
                <input
                  type="checkbox"
                  checked={interactions.enableAreaShading || false}
                  onChange={(e) => updateInteraction('enableAreaShading', e.target.checked)}
                  className="w-4 h-4 rounded text-blue-600 bg-slate-800 border-slate-700 focus:ring-0 cursor-pointer"
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
                <div className="w-8 h-8 rounded-lg bg-blue-500/20 border border-blue-500/40 flex items-center justify-center">
                  <Sparkles className="w-4 h-4 text-blue-400" />
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

      {/* Interactive Parsed XL-Sheet Column Picker Modal */}
      <SheetColumnPickerModal
        isOpen={isSheetPickerOpen}
        onClose={() => setIsSheetPickerOpen(false)}
        data={data}
        columns={columns}
        columnTypes={columnTypes}
        sheetNames={sheetNames}
        activeSheetName={selectedSheet}
        onSheetChange={onSheetChange}
        chartType={chartType}
        initialTargetField={sheetPickerTarget}
        fieldValues={{
          xField,
          yField,
          y2Field,
          yFields: effectiveYFields,
          openField,
          closeField,
          lowField,
          highField,
          compositionPeriod,
        }}
        onAssignField={handleAssignField}
        onToggleMetric={handleToggleMetric}
        onSelectAllNumericMetrics={handleSelectAllNumericMetrics}
        onClearAllMetrics={handleClearAllMetrics}
        rawSheet={rawSheet}
        orientation={orientation}
        onOrientationChange={onOrientationChange}
      />
    </div>
  );
}
