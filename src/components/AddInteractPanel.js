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
  BookOpen
} from 'lucide-react';
import VisualChartCatalogue from '@/components/VisualChartCatalogue';

export default function AddInteractPanel({
  sheetNames = [],
  selectedSheet,
  onSheetChange,
  columns = [],
  columnTypes = {},
  chartType,
  setChartType,
  xField,
  setXField,
  yField,
  setYField,
  y2Field,
  setY2Field,
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

  const chartOptions = [
    { id: 'candlestick', label: 'Candlestick (OHLC)', icon: CandlestickChart },
    { id: 'combo', label: 'Combo Bar & Line', icon: Layers },
    { id: 'dual-line', label: 'Dual-Axis Line', icon: LineChart },
    { id: 'clustered-bar', label: 'Clustered Column', icon: BarChart3 },
    { id: 'stacked-bar', label: 'Stacked Column', icon: BarChart3 },
    { id: 'stacked-bar-100', label: '100% Stacked Bar', icon: Percent },
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
            ) : (
              /* Standard & Advanced Graph Field Mapping */
              <div className="space-y-3">
                <div>
                  <span className="text-xs font-mono text-slate-400">X-Axis (Category / Date / Dimension):</span>
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

                <div>
                  <span className="text-xs font-mono text-slate-400">
                    {chartType === 'combo' && 'Primary Metric (Bar, Left Axis):'}
                    {chartType === 'dual-line' && 'Primary Line Metric (Left Axis):'}
                    {chartType === 'clustered-bar' && 'Primary Bar Metric:'}
                    {chartType === 'stacked-bar' && 'Base Bar Metric:'}
                    {chartType === 'stacked-bar-100' && 'Component A Metric:'}
                    {chartType === 'stacked-area' && 'Base Area Metric:'}
                    {chartType === 'waterfall' && 'Step Changes / Values:'}
                    {chartType === 'diverging-bar' && 'Diverging Bar Metric:'}
                    {!['combo', 'dual-line', 'clustered-bar', 'stacked-bar', 'stacked-bar-100', 'stacked-area', 'waterfall', 'diverging-bar'].includes(chartType) && 'Y-Axis (Value / Metric):'}
                  </span>
                  <select
                    value={yField}
                    onChange={(e) => setYField(e.target.value)}
                    className="w-full mt-1 bg-slate-900 border border-slate-700 rounded-lg px-3 py-1.5 text-xs text-slate-200 focus:outline-none focus:border-emerald-400"
                  >
                    {columns.map((c) => (
                      <option key={c} value={c}>{c} ({columnTypes[c] || 'type'})</option>
                    ))}
                  </select>
                </div>

                {/* Secondary Metric for Combo, Dual-Axis & Stacked Charts */}
                {['combo', 'dual-line', 'clustered-bar', 'stacked-bar', 'stacked-bar-100', 'stacked-area', 'diverging-bar'].includes(chartType) && (
                  <div>
                    <span className="text-xs font-mono text-cyan-400 font-semibold">
                      {chartType === 'combo' && 'Secondary Metric (Line, Right Axis):'}
                      {chartType === 'dual-line' && 'Line 2 Metric (Right Axis):'}
                      {chartType === 'clustered-bar' && 'Comparison Bar Metric:'}
                      {chartType === 'stacked-bar' && 'Stacked Bar Metric:'}
                      {chartType === 'stacked-bar-100' && 'Component B Metric:'}
                      {chartType === 'stacked-area' && 'Stacked Area Metric:'}
                      {chartType === 'diverging-bar' && 'Overlay Trend Line Metric:'}
                    </span>
                    <select
                      value={y2Field || ''}
                      onChange={(e) => setY2Field && setY2Field(e.target.value)}
                      className="w-full mt-1 bg-slate-900 border border-slate-700 rounded-lg px-3 py-1.5 text-xs text-slate-200 focus:outline-none focus:border-cyan-400"
                    >
                      <option value="">-- None / Select Secondary Metric --</option>
                      {columns.map((c) => (
                        <option key={c} value={c}>{c} ({columnTypes[c] || 'type'})</option>
                      ))}
                    </select>
                  </div>
                )}

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
                <span className="text-[11px] font-mono text-slate-400">X-Axis Name:</span>
                <input
                  type="text"
                  value={xAxisLabel}
                  onChange={(e) => setXAxisLabel(e.target.value)}
                  placeholder="e.g. Timeline"
                  className="w-full mt-0.5 bg-slate-900 border border-slate-700 rounded-lg px-2.5 py-1 text-xs text-slate-200 focus:outline-none focus:border-emerald-400"
                />
              </div>
              <div>
                <span className="text-[11px] font-mono text-slate-400">
                  {['combo', 'dual-line'].includes(chartType) ? 'Left Y-Axis:' : 'Y-Axis Name:'}
                </span>
                <input
                  type="text"
                  value={yAxisLabel}
                  onChange={(e) => setYAxisLabel(e.target.value)}
                  placeholder="e.g. Value / USD"
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
