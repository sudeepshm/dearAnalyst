'use client';

import React, { useState, useMemo, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { 
  FileSpreadsheet, 
  X, 
  Check, 
  Search, 
  Sparkles, 
  Calendar, 
  TrendingUp, 
  Layers, 
  Hash, 
  Type, 
  ArrowRight,
  Filter,
  CheckCircle2,
  Table,
  Eye,
  SlidersHorizontal,
  ChevronDown
} from 'lucide-react';

const FINANCIAL_PALETTE = [
  '#1364e2', // Flourish Electric Blue
  '#f54e8b', // Flourish Coral Rose
  '#9852d9', // Flourish Royal Violet
  '#00c4cc', // Flourish Cyan Teal
  '#fca311', // Flourish Solar Amber
  '#10b981', // Flourish Fresh Mint
  '#6366f1', // Flourish Royal Indigo
  '#f97316', // Flourish Tangerine Orange
  '#0ea5e9', // Flourish Sky Blue
  '#ec4899', // Flourish Hot Magenta
];

// Helper to convert 0-indexed column number to Excel column letters (A, B, ..., Z, AA, AB...)
function getExcelColumnLetter(index) {
  if (typeof index !== 'number' || index < 0) return 'A';
  let letter = '';
  let temp = index;
  while (temp >= 0) {
    letter = String.fromCharCode((temp % 26) + 65) + letter;
    temp = Math.floor(temp / 26) - 1;
  }
  return letter;
}

export default function SheetColumnPickerModal({
  isOpen,
  onClose,
  data = [],
  columns = [],
  columnTypes = {},
  sheetNames = [],
  activeSheetName = '',
  onSheetChange,
  chartType = 'combo',
  initialTargetField = 'xField', // 'xField' | 'yField' | 'y2Field' | 'yFields' | 'openField' | 'closeField' | 'lowField' | 'highField'
  fieldValues = {}, // { xField, yField, y2Field, yFields, openField, closeField, lowField, highField }
  onAssignField, // (fieldKey, columnName) => void
  onToggleMetric, // (columnName) => void
  onSelectAllNumericMetrics, // () => void
  onClearAllMetrics, // () => void
  rawSheet = null,
  orientation = 'standard',
  onOrientationChange,
}) {
  const [mounted, setMounted] = useState(false);
  const [targetField, setTargetField] = useState(initialTargetField || 'xField');
  const [searchQuery, setSearchQuery] = useState('');
  const [hoveredCol, setHoveredCol] = useState(null);
  const [selectedColSummary, setSelectedColSummary] = useState(null);
  const [viewOrientation, setViewOrientation] = useState(orientation || 'standard');

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (isOpen) {
      setTargetField(initialTargetField || 'xField');
      setSearchQuery('');
      setHoveredCol(null);
      setSelectedColSummary(null);
    }
  }, [isOpen, initialTargetField]);

  // Handle ESC key to close
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  // Determine active dataset to display based on view orientation with bulletproof fallbacks
  const activeDataset = useMemo(() => {
    if (rawSheet && typeof rawSheet === 'object') {
      if (viewOrientation === 'transposed' && rawSheet.transposed && Array.isArray(rawSheet.transposed.columns)) {
        return rawSheet.transposed;
      }
      if (viewOrientation === 'standard' && rawSheet.standard && Array.isArray(rawSheet.standard.columns)) {
        return rawSheet.standard;
      }
      if (Array.isArray(rawSheet.columns) && Array.isArray(rawSheet.data)) {
        return rawSheet;
      }
    }
    return { data: data || [], columns: columns || [], columnTypes: columnTypes || {} };
  }, [rawSheet, viewOrientation, data, columns, columnTypes]);

  const displayColumns = useMemo(() => {
    const cols = (activeDataset && Array.isArray(activeDataset.columns)) ? activeDataset.columns : columns;
    return Array.isArray(cols) ? cols : [];
  }, [activeDataset, columns]);

  const displayTypes = useMemo(() => {
    const types = (activeDataset && activeDataset.columnTypes) ? activeDataset.columnTypes : columnTypes;
    return (types && typeof types === 'object') ? types : {};
  }, [activeDataset, columnTypes]);

  const displayData = useMemo(() => {
    const d = (activeDataset && Array.isArray(activeDataset.data)) ? activeDataset.data : data;
    return Array.isArray(d) ? d : [];
  }, [activeDataset, data]);

  // Filter columns based on search
  const filteredColumns = useMemo(() => {
    if (!searchQuery.trim()) return displayColumns;
    const q = searchQuery.toLowerCase().trim();
    return displayColumns.filter((c) => String(c).toLowerCase().includes(q));
  }, [displayColumns, searchQuery]);

  // Determine available target fields based on chartType
  const targetFieldTabs = useMemo(() => {
    const fVals = fieldValues || {};
    if (chartType === 'candlestick') {
      return [
        { key: 'xField', label: 'Timeline (Date)', currentVal: fVals.xField, icon: Calendar, color: 'text-blue-400' },
        { key: 'openField', label: 'Open Price', currentVal: fVals.openField, icon: TrendingUp, color: 'text-emerald-400' },
        { key: 'closeField', label: 'Close Price', currentVal: fVals.closeField, icon: TrendingUp, color: 'text-rose-400' },
        { key: 'lowField', label: 'Lowest (Low)', currentVal: fVals.lowField, icon: TrendingUp, color: 'text-amber-400' },
        { key: 'highField', label: 'Highest (High)', currentVal: fVals.highField, icon: TrendingUp, color: 'text-cyan-400' },
      ];
    }

    if (chartType === 'scatter') {
      return [
        { key: 'xField', label: 'X-Axis (Independent)', currentVal: fVals.xField, icon: Hash, color: 'text-blue-400' },
        { key: 'yField', label: 'Y-Axis (Dependent)', currentVal: fVals.yField, icon: Hash, color: 'text-emerald-400' },
      ];
    }

    if (chartType === 'pie') {
      return [
        { key: 'xField', label: 'Timeline / Slices', currentVal: fVals.xField, icon: Calendar, color: 'text-blue-400' },
        { key: 'yField', label: 'Metric Value', currentVal: fVals.yField, icon: Layers, color: 'text-emerald-400' },
        { key: 'yFields', label: 'Components (Multi)', count: (fVals.yFields || []).length, icon: Layers, color: 'text-cyan-400', isMulti: true },
      ];
    }

    // Default for combo, bar, line, waterfall, etc.
    return [
      { key: 'xField', label: 'Timeline (X-Axis)', currentVal: fVals.xField, icon: Calendar, color: 'text-blue-400' },
      { key: 'yFields', label: 'Series Metrics (Y-Axis)', count: (fVals.yFields || []).length, icon: Layers, color: 'text-cyan-400', isMulti: true },
      { key: 'yField', label: 'Left Axis (Y1)', currentVal: fVals.yField, icon: Hash, color: 'text-blue-400' },
      { key: 'y2Field', label: 'Right Axis (Y2)', currentVal: fVals.y2Field, icon: Hash, color: 'text-purple-400' },
    ];
  }, [chartType, fieldValues]);

  const activeTabConfig = targetFieldTabs.find((t) => t.key === targetField) || targetFieldTabs[0] || { label: 'Field' };
  const isMultiSelectMode = activeTabConfig?.isMulti || targetField === 'yFields';

  // Handle column selection
  const handleColumnClick = (colName) => {
    if (!colName) return;

    if (isMultiSelectMode) {
      if (onToggleMetric) {
        onToggleMetric(colName);
      }
    } else {
      if (onAssignField) {
        onAssignField(targetField, colName);
      }
    }

    // Compute column stats for summary
    const values = (displayData || [])
      .map((r) => (r && typeof r === 'object' ? r[colName] : undefined))
      .filter((v) => v !== '' && v !== null && v !== undefined);

    const numVals = values.map((v) => Number(v)).filter((v) => !isNaN(v));
    const minVal = numVals.length > 0 ? Math.min(...numVals) : null;
    const maxVal = numVals.length > 0 ? Math.max(...numVals) : null;

    setSelectedColSummary({
      colName,
      type: displayTypes[colName] || 'string',
      count: values.length,
      sample: values.slice(0, 3).join(', '),
      min: minVal !== null ? minVal.toLocaleString('en-IN') : null,
      max: maxVal !== null ? maxVal.toLocaleString('en-IN') : null,
      assignedTo: targetField,
    });
  };

  if (!isOpen || !mounted) return null;

  const fVals = fieldValues || {};

  const modalContent = (
    <div 
      className="fixed inset-0 z-[9999] flex items-center justify-center p-3 sm:p-6 bg-slate-950/85 backdrop-blur-md animate-in fade-in duration-200"
      onClick={onClose}
    >
      <div 
        className="w-full max-w-6xl max-h-[92vh] flex flex-col bg-[#0b101e] border border-blue-500/40 rounded-2xl shadow-[0_0_60px_rgba(19,100,226,0.35)] overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* 1. Modal Top Ribbon: Brand, Active Sheet, Target Field & Close */}
        <div className="px-5 py-3.5 bg-slate-900/90 border-b border-slate-800 flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400">
              <FileSpreadsheet className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-sm font-bold text-white font-mono tracking-wide uppercase">
                  Parsed XL-Sheet Column Selector
                </h3>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-blue-950 text-blue-300 border border-blue-800 font-semibold">
                  Interactive Grid
                </span>
              </div>
              <p className="text-[11px] font-mono text-slate-400">
                Click any column header or cell in the spreadsheet to map it directly to graph data
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {/* Sheet Tabs Switcher if multi-sheet */}
            {sheetNames.length > 1 && (
              <div className="flex items-center gap-1 bg-slate-950 border border-slate-800 rounded-lg p-1 text-xs font-mono">
                <span className="text-[10px] text-slate-400 px-1">Sheet:</span>
                <select
                  value={activeSheetName}
                  onChange={(e) => onSheetChange && onSheetChange(e.target.value)}
                  className="bg-transparent text-slate-200 focus:outline-none cursor-pointer pr-1"
                >
                  {sheetNames.map((s) => (
                    <option key={s} value={s} className="bg-slate-900 text-slate-100">
                      {s}
                    </option>
                  ))}
                </select>
              </div>
            )}

            {/* Transposed vs Standard View Toggle if financial */}
            {rawSheet && rawSheet.isFinancial && (
              <div className="flex items-center bg-slate-950 border border-slate-800 rounded-lg p-0.5 text-[11px] font-mono">
                <button
                  type="button"
                  onClick={() => setViewOrientation('transposed')}
                  className={`px-2 py-1 rounded transition ${
                    viewOrientation === 'transposed'
                      ? 'bg-blue-600 text-white font-bold'
                      : 'text-slate-400 hover:text-white'
                  }`}
                  title="Columns are metrics (Sales, Profit...), rows are periods"
                >
                  Metrics View
                </button>
                <button
                  type="button"
                  onClick={() => setViewOrientation('standard')}
                  className={`px-2 py-1 rounded transition ${
                    viewOrientation === 'standard'
                      ? 'bg-blue-600 text-white font-bold'
                      : 'text-slate-400 hover:text-white'
                  }`}
                  title="Original raw excel sheet view"
                >
                  Raw Sheet
                </button>
              </div>
            )}

            <button
              type="button"
              onClick={onClose}
              className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition"
              title="Close Spreadsheet (Esc)"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* 2. Target Field Selection Strip (Map which graph dimension you are picking) */}
        <div className="px-5 py-2.5 bg-slate-950/90 border-b border-slate-800/80 flex flex-wrap items-center justify-between gap-2 text-xs font-mono">
          <div className="flex items-center gap-2 overflow-x-auto py-0.5 scrollbar-thin">
            <span className="text-[11px] text-slate-400 font-semibold uppercase flex items-center gap-1 flex-shrink-0">
              <SlidersHorizontal className="w-3.5 h-3.5 text-blue-400" />
              <span>Map To:</span>
            </span>

            {targetFieldTabs.map((tab) => {
              const Icon = tab.icon;
              const isActive = targetField === tab.key;
              const hasValue = tab.isMulti ? (tab.count > 0) : Boolean(tab.currentVal);

              return (
                <button
                  key={tab.key}
                  type="button"
                  onClick={() => setTargetField(tab.key)}
                  className={`px-3 py-1.5 rounded-xl border flex items-center gap-2 whitespace-nowrap transition ${
                    isActive
                      ? 'bg-blue-600/20 border-blue-400 text-white font-bold shadow-md shadow-blue-500/20'
                      : 'bg-slate-900/60 border-slate-800 text-slate-400 hover:text-slate-200 hover:border-slate-700'
                  }`}
                >
                  <Icon className={`w-3.5 h-3.5 ${tab.color}`} />
                  <span>{tab.label}</span>
                  {tab.isMulti ? (
                    <span className={`px-1.5 py-0.2 text-[9px] rounded-full font-bold ${
                      tab.count > 0 ? 'bg-cyan-950 text-cyan-300 border border-cyan-700' : 'bg-slate-800 text-slate-400'
                    }`}>
                      {tab.count} selected
                    </span>
                  ) : tab.currentVal ? (
                    <span className="px-1.5 py-0.2 text-[9px] rounded bg-slate-800 text-blue-300 border border-slate-700 font-semibold truncate max-w-[90px]">
                      {tab.currentVal}
                    </span>
                  ) : (
                    <span className="text-[10px] text-slate-500 italic">unmapped</span>
                  )}
                </button>
              );
            })}
          </div>

          {/* Quick Search in Sheet Columns */}
          <div className="relative min-w-[200px]">
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search sheet columns..."
              className="w-full bg-slate-900 border border-slate-700/80 rounded-lg pl-8 pr-7 py-1 text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:border-blue-400 transition"
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => setSearchQuery('')}
                className="absolute right-2 top-1.5 text-slate-400 hover:text-white"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
        </div>

        {/* 3. Action Guidance Banner */}
        <div className="px-5 py-2 bg-gradient-to-r from-blue-950/40 via-cyan-950/20 to-slate-900/40 border-b border-blue-500/20 flex items-center justify-between text-xs font-mono">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            <span className="text-slate-300">
              Active Target: <strong className="text-blue-300 font-bold">{activeTabConfig?.label}</strong>
            </span>
            <span className="text-slate-500">&bull;</span>
            <span className="text-slate-400">
              {isMultiSelectMode
                ? 'Click columns to toggle them in/out of the plotted series'
                : 'Click any column header below to assign it immediately'}
            </span>
          </div>

          {isMultiSelectMode && (
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={onSelectAllNumericMetrics}
                className="text-[11px] text-cyan-300 hover:text-cyan-200 underline font-semibold"
              >
                Select All Numeric
              </button>
              <span className="text-slate-600">&bull;</span>
              <button
                type="button"
                onClick={onClearAllMetrics}
                className="text-[11px] text-slate-400 hover:text-red-400 underline"
              >
                Clear All
              </button>
            </div>
          )}
        </div>

        {/* 4. Interactive Spreadsheet Table Grid */}
        <div className="flex-1 overflow-auto bg-[#070b14] relative scrollbar-thin max-h-[55vh]">
          {displayColumns.length === 0 ? (
            <div className="p-12 text-center text-slate-400 font-mono space-y-2">
              <FileSpreadsheet className="w-8 h-8 text-slate-600 mx-auto" />
              <p>No spreadsheet columns found in this worksheet.</p>
            </div>
          ) : (
            <table className="w-full text-left border-collapse text-xs font-mono">
              {/* Sticky Table Header */}
              <thead className="sticky top-0 z-20 bg-slate-900 shadow-md">
                {/* Row 1: Excel Coordinate Letters (A, B, C, D...) */}
                <tr className="border-b border-slate-800 text-[10px] text-slate-400 bg-slate-950/90 select-none">
                  <th className="w-12 px-2 py-1 text-center border-r border-slate-800 font-normal">
                    #
                  </th>
                  {filteredColumns.map((col) => (
                    <th
                      key={`coord-${col}`}
                      className="px-3 py-1 text-center border-r border-slate-800 font-mono tracking-wider"
                    >
                      {getExcelColumnLetter(displayColumns.indexOf(col))}
                    </th>
                  ))}
                </tr>

                {/* Row 2: Actual Column Names & Selection Buttons */}
                <tr className="border-b border-slate-750 bg-slate-900/95">
                  <th className="w-12 px-2 py-2.5 text-center text-slate-400 font-mono text-[10px] border-r border-slate-800 sticky left-0 bg-slate-900 z-30">
                    Row
                  </th>
                  {filteredColumns.map((col) => {
                    const type = displayTypes[col] || 'string';
                    const isHovered = hoveredCol === col;

                    // Check if column is currently selected for the active target
                    const isTargetAssigned = !isMultiSelectMode && fVals[targetField] === col;
                    const isMultiSelected = isMultiSelectMode && (fVals.yFields || []).includes(col);
                    const selectedSeriesIndex = (fVals.yFields || []).indexOf(col);

                    // Check if assigned to any other field
                    const otherAssignment = Object.entries(fVals).find(
                      ([k, v]) => k !== targetField && k !== 'yFields' && v === col
                    );

                    const isSelected = isTargetAssigned || isMultiSelected;
                    const seriesColor = isMultiSelected
                      ? FINANCIAL_PALETTE[selectedSeriesIndex % FINANCIAL_PALETTE.length]
                      : '#1364e2';

                    return (
                      <th
                        key={`header-${col}`}
                        onMouseEnter={() => setHoveredCol(col)}
                        onMouseLeave={() => setHoveredCol(null)}
                        onClick={() => handleColumnClick(col)}
                        className={`min-w-[150px] max-w-[240px] px-3 py-2.5 border-r border-slate-800 cursor-pointer select-none transition group relative ${
                          isSelected
                            ? 'bg-blue-950/60 border-t-2 border-t-blue-400 text-white'
                            : isHovered
                            ? 'bg-blue-950/30 text-blue-200'
                            : 'hover:bg-slate-850 text-slate-200'
                        }`}
                        title={`Click to map "${col}" to ${activeTabConfig?.label}`}
                      >
                        <div className="flex flex-col gap-1">
                          {/* Type badge & Assigned indicator */}
                          <div className="flex items-center justify-between gap-1 text-[9px]">
                            <span
                              className={`px-1.5 py-0.2 rounded font-semibold uppercase ${
                                type === 'number'
                                  ? 'bg-emerald-950/80 text-emerald-400 border border-emerald-800/60'
                                  : type === 'date'
                                  ? 'bg-blue-950/80 text-blue-400 border border-blue-800/60'
                                  : 'bg-slate-800 text-slate-400 border border-slate-700'
                              }`}
                            >
                              {type === 'number' ? 'NUM' : type === 'date' ? 'DATE' : 'TXT'}
                            </span>

                            {/* Selected Badges */}
                            {isSelected ? (
                              <span
                                className="px-1.5 py-0.2 rounded-full font-bold flex items-center gap-0.5 text-white shadow-sm"
                                style={{ backgroundColor: seriesColor }}
                              >
                                <Check className="w-2.5 h-2.5 stroke-[3]" />
                                {isMultiSelectMode ? `#${selectedSeriesIndex + 1}` : 'Active'}
                              </span>
                            ) : otherAssignment ? (
                              <span className="px-1.5 py-0.2 rounded bg-slate-800 text-slate-400 border border-slate-700 text-[8px]">
                                {otherAssignment[0]}
                              </span>
                            ) : isHovered ? (
                              <span className="text-blue-300 font-bold text-[9px] animate-pulse">
                                Select ↵
                              </span>
                            ) : null}
                          </div>

                          {/* Column Name */}
                          <div className="font-semibold text-xs truncate flex items-center justify-between">
                            <span className={`truncate ${isSelected ? 'text-white font-bold' : 'group-hover:text-blue-300'}`}>
                              {col}
                            </span>
                          </div>
                        </div>
                      </th>
                    );
                  })}
                </tr>
              </thead>

              {/* Table Body: Data Rows */}
              <tbody className="divide-y divide-slate-850/50">
                {displayData.slice(0, 40).map((row, rIdx) => (
                  <tr key={`row-${rIdx}`} className="hover:bg-slate-900/40 transition">
                    {/* Row Number */}
                    <td className="w-12 px-2 py-1.5 text-center text-slate-400 text-[10px] border-r border-slate-800 sticky left-0 bg-[#090e1a] select-none font-mono">
                      {rIdx + 1}
                    </td>

                    {/* Row Cells */}
                    {filteredColumns.map((col) => {
                      const val = row && typeof row === 'object' ? row[col] : '';
                      const isHovered = hoveredCol === col;
                      const isTargetAssigned = !isMultiSelectMode && fVals[targetField] === col;
                      const isMultiSelected = isMultiSelectMode && (fVals.yFields || []).includes(col);
                      const isColSelected = isTargetAssigned || isMultiSelected;

                      const formattedVal =
                        typeof val === 'number'
                          ? val.toLocaleString('en-IN', { maximumFractionDigits: 2 })
                          : val !== null && val !== undefined
                          ? String(val)
                          : '';

                      return (
                        <td
                          key={`cell-${rIdx}-${col}`}
                          onClick={() => handleColumnClick(col)}
                          onMouseEnter={() => setHoveredCol(col)}
                          onMouseLeave={() => setHoveredCol(null)}
                          className={`px-3 py-1.5 border-r border-slate-850/60 truncate cursor-pointer transition ${
                            isColSelected
                              ? 'bg-blue-950/20 text-slate-100 font-medium'
                              : isHovered
                              ? 'bg-blue-950/10 text-slate-200'
                              : 'text-slate-300'
                          } ${typeof val === 'number' ? 'text-right' : 'text-left'}`}
                        >
                          {formattedVal || <span className="text-slate-600">—</span>}
                        </td>
                      );
                    })}
                  </tr>
                ))}
              </tbody>
            </table>
          )}

          {displayData.length > 40 && (
            <div className="py-2.5 text-center text-[11px] text-slate-400 bg-slate-950/80 border-t border-slate-800 font-mono">
              Showing first 40 of {displayData.length} total rows in worksheet preview
            </div>
          )}
        </div>

        {/* 5. Footer: Column Inspector & Confirmation Actions */}
        <div className="px-5 py-3 bg-slate-900/95 border-t border-slate-800 flex flex-wrap items-center justify-between gap-3 text-xs font-mono">
          {/* Active Field Mapping Status */}
          <div className="flex items-center gap-3">
            <div className="text-slate-400 flex items-center gap-1.5">
              <CheckCircle2 className="w-4 h-4 text-emerald-400" />
              <span>Mapped:</span>
            </div>

            <div className="flex items-center gap-2 flex-wrap">
              {fVals.xField && (
                <span className="px-2 py-0.5 rounded bg-blue-950/80 border border-blue-800 text-blue-300 font-semibold text-[11px]">
                  X: {fVals.xField}
                </span>
              )}
              {chartType === 'candlestick' ? (
                <>
                  {fVals.openField && (
                    <span className="px-2 py-0.5 rounded bg-emerald-950/80 border border-emerald-800 text-emerald-300 text-[11px]">
                      Open: {fVals.openField}
                    </span>
                  )}
                  {fVals.closeField && (
                    <span className="px-2 py-0.5 rounded bg-rose-950/80 border border-rose-800 text-rose-300 text-[11px]">
                      Close: {fVals.closeField}
                    </span>
                  )}
                </>
              ) : (
                (fVals.yFields || []).length > 0 && (
                  <span className="px-2 py-0.5 rounded bg-cyan-950/80 border border-cyan-800 text-cyan-300 font-semibold text-[11px]">
                    Series: {(fVals.yFields || []).slice(0, 3).join(', ')}
                    {(fVals.yFields || []).length > 3 && ` +${(fVals.yFields || []).length - 3} more`}
                  </span>
                )
              )}
            </div>
          </div>

          {/* Close & Confirm Button */}
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl bg-gradient-to-r from-blue-600 to-emerald-600 hover:from-blue-500 hover:to-emerald-500 text-white font-bold transition flex items-center gap-1.5 shadow-md shadow-blue-500/25"
            >
              <Check className="w-4 h-4 stroke-[3]" />
              <span>Done / Apply to Graph</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );

  return createPortal(modalContent, document.body);
}
