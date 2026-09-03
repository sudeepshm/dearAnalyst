'use client';

import React, { useState } from 'react';
import { 
  Plus, 
  Trash2, 
  Copy, 
  ArrowRight, 
  Download, 
  FileText, 
  Sparkles, 
  Layers, 
  Save, 
  ExternalLink,
  ChevronRight,
  ChevronLeft
} from 'lucide-react';
import AddInteractPanel from './AddInteractPanel';
import EChartsRenderer from './EChartsRenderer';

export default function StorySlideStudio({
  dataset,
  initialChartType = 'candlestick',
  onDownloadStory,
  onResetData,
}) {
  const [storyTitle, setStoryTitle] = useState('Tech Index Market Narrative 2026');
  const [activeSlideIndex, setActiveSlideIndex] = useState(0);

  // Normalize sheets map from dataset
  const sheets = dataset.sheets || {
    [dataset.activeSheet || 'Sheet1']: {
      name: dataset.activeSheet || 'Sheet1',
      columns: dataset.columns || [],
      columnTypes: dataset.columnTypes || {},
      totalRows: dataset.totalRows || 0,
      data: dataset.data || [],
      preview: dataset.preview || [],
    }
  };
  const sheetNames = dataset.sheetNames && dataset.sheetNames.length > 0
    ? dataset.sheetNames
    : Object.keys(sheets);
  const defaultSheetName = dataset.activeSheet || sheetNames[0];

  // Initial multi-page story state with default sensible financial charts
  const [slides, setSlides] = useState([
    {
      id: 'slide-1',
      sheetName: defaultSheetName,
      pageTitle: 'Page 1: Price Action & Candlestick Volatility',
      chartTitle: 'Asset Daily Price Action (OHLC)',
      chartSubtitle: `Candlestick breakdown (${defaultSheetName})`,
      chartType: initialChartType || 'candlestick',
      xField: 'Date',
      yField: 'Close',
      y2Field: 'Volume',
      openField: 'Open',
      closeField: 'Close',
      lowField: 'Low',
      highField: 'High',
      xAxisLabel: 'Trading Session',
      yAxisLabel: 'Stock Price ($ USD)',
      y2AxisLabel: 'Volume',
      narrativeText: `### Market Momentum Summary\n- Noticeable consolidation observed in the first 20 trading sessions.\n- Bullish breakout supported by heavy trading volume around session 35.\n- Crosshair tooltips indicate strong buyer support near the $195-$200 psychological barrier.\n\n*Recommendation:* Maintain overweight allocation while trailing stop-losses at the 5-day MA.`,
      interactions: {
        enableTooltip: true,
        tooltipTrigger: 'axis',
        axisPointerType: 'cross',
        enableZoom: true,
        enableMouseHover: true,
        enableLegend: true,
        showGridLines: true,
      },
    },
    {
      id: 'slide-2',
      sheetName: sheetNames[1] || defaultSheetName,
      pageTitle: 'Page 2: Dual-Axis Valuation & Performance',
      chartTitle: 'Sector Market Cap vs Year Return (%)',
      chartSubtitle: `Combo Bar & Line on sheet: "${sheetNames[1] || defaultSheetName}"`,
      chartType: 'combo',
      xField: sheets[sheetNames[1]]?.columns?.[0] || 'Sector',
      yField: sheets[sheetNames[1]]?.columns?.find(c => sheets[sheetNames[1]]?.columnTypes?.[c] === 'number') || 'Market_Cap_Billion',
      y2Field: sheets[sheetNames[1]]?.columns?.filter(c => sheets[sheetNames[1]]?.columnTypes?.[c] === 'number')?.[1] || 'Year_Return_Pct',
      openField: 'Open',
      closeField: 'Close',
      lowField: 'Low',
      highField: 'High',
      xAxisLabel: 'Sector',
      yAxisLabel: 'Market Cap ($B)',
      y2AxisLabel: 'Return (%)',
      narrativeText: `### Dual-Axis Combo Breakdown\n- Bars depict total sector capitalization (Left Axis).\n- Overlaid cyan line displays annualized performance percentage (Right Axis).\n- Technology and Clean Energy exhibit the strongest momentum with high growth multiples.`,
      interactions: {
        enableTooltip: true,
        tooltipTrigger: 'axis',
        axisPointerType: 'cross',
        enableZoom: true,
        enableMouseHover: true,
        enableLegend: true,
        showGridLines: true,
      },
    },
  ]);

  const currentSlide = slides[activeSlideIndex] || slides[0];
  const currentSlideSheetName = currentSlide.sheetName || defaultSheetName;
  const activeSheetData = sheets[currentSlideSheetName] || sheets[sheetNames[0]] || {
    columns: dataset.columns || [],
    columnTypes: dataset.columnTypes || {},
    totalRows: dataset.totalRows || 0,
    data: dataset.data || [],
  };

  const updateCurrentSlide = (patch) => {
    setSlides((prev) => {
      const copy = [...prev];
      copy[activeSlideIndex] = { ...copy[activeSlideIndex], ...patch };
      return copy;
    });
  };

  const handleSlideSheetChange = (newSheetName) => {
    const nextSheet = sheets[newSheetName];
    if (!nextSheet) return;
    const nextCols = nextSheet.columns || [];
    const nextTypes = nextSheet.columnTypes || {};

    const dateCol = nextCols.find((c) => nextTypes[c] === 'date') || nextCols[0] || '';
    const numCols = nextCols.filter((c) => nextTypes[c] === 'number');
    const yCol = numCols[0] || nextCols[1] || nextCols[0] || '';
    const y2Col = numCols[1] || nextCols[2] || '';

    const openCol = nextCols.find((c) => /open/i.test(c)) || numCols[0] || nextCols[0] || '';
    const closeCol = nextCols.find((c) => /close/i.test(c)) || numCols[1] || nextCols[1] || '';
    const lowCol = nextCols.find((c) => /low/i.test(c)) || numCols[2] || nextCols[2] || '';
    const highCol = nextCols.find((c) => /high/i.test(c)) || numCols[3] || nextCols[3] || '';

    updateCurrentSlide({
      sheetName: newSheetName,
      xField: dateCol,
      yField: yCol,
      y2Field: y2Col,
      openField: openCol,
      closeField: closeCol,
      lowField: lowCol,
      highField: highCol,
      chartSubtitle: `Visualizing data from sheet: "${newSheetName}"`,
    });
  };

  const handleAddNewSlide = () => {
    const newSlideNumber = slides.length + 1;
    const slideSheet = currentSlide?.sheetName || defaultSheetName;
    const targetSheet = sheets[slideSheet] || Object.values(sheets)[0];
    const targetCols = targetSheet?.columns || [];
    const targetTypes = targetSheet?.columnTypes || {};

    const dateCol = targetCols.find((c) => targetTypes[c] === 'date') || targetCols[0] || 'Date';
    const numCols = targetCols.filter((c) => targetTypes[c] === 'number');
    const numCol = numCols[0] || targetCols[1] || 'Metric';
    const num2Col = numCols[1] || '';

    const newSlide = {
      id: `slide-${Date.now()}`,
      sheetName: slideSheet,
      pageTitle: `Page ${newSlideNumber}: Analysis`,
      chartTitle: `Visual Analysis (Page ${newSlideNumber})`,
      chartSubtitle: `Visualizing data from sheet: "${slideSheet}"`,
      chartType: 'combo',
      xField: dateCol,
      yField: numCol,
      y2Field: num2Col,
      openField: targetCols.find((c) => /open/i.test(c)) || 'Open',
      closeField: targetCols.find((c) => /close/i.test(c)) || 'Close',
      lowField: targetCols.find((c) => /low/i.test(c)) || 'Low',
      highField: targetCols.find((c) => /high/i.test(c)) || 'High',
      xAxisLabel: 'Period',
      yAxisLabel: 'Metric 1',
      y2AxisLabel: 'Metric 2',
      narrativeText: `### Key Observations for Page ${newSlideNumber}\n- Add your analytical insights, drivers, and recommendations here.\n- Cross-reference with the Apache ECharts visualization below.`,
      interactions: {
        enableTooltip: true,
        tooltipTrigger: 'axis',
        axisPointerType: 'cross',
        enableZoom: true,
        enableMouseHover: true,
        enableLegend: true,
        showGridLines: true,
      },
    };
    setSlides((prev) => [...prev, newSlide]);
    setActiveSlideIndex(slides.length);
  };

  const handleDuplicateSlide = (index) => {
    const target = slides[index];
    const duplicated = {
      ...JSON.parse(JSON.stringify(target)),
      id: `slide-${Date.now()}`,
      pageTitle: `${target.pageTitle} (Copy)`,
    };
    setSlides((prev) => [...prev.slice(0, index + 1), duplicated, ...prev.slice(index + 1)]);
    setActiveSlideIndex(index + 1);
  };

  const handleDeleteSlide = (index) => {
    if (slides.length <= 1) {
      alert('Your story must have at least one page.');
      return;
    }
    const filtered = slides.filter((_, idx) => idx !== index);
    setSlides(filtered);
    setActiveSlideIndex(Math.max(0, index - 1));
  };

  const handleSaveAndNextPage = () => {
    if (activeSlideIndex < slides.length - 1) {
      setActiveSlideIndex(activeSlideIndex + 1);
    } else {
      // If on the last page, add a fresh page and move to it!
      handleAddNewSlide();
    }
  };

  return (
    <div className="w-full max-w-7xl mx-auto px-4 py-6 flex flex-col space-y-6">
      {/* Top Global Action Bar: Title, Page Tabs, Download Story Button */}
      <div className="glass-panel rounded-2xl p-4 sm:p-5 flex flex-wrap items-center justify-between gap-4 border border-slate-800 shadow-xl">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-emerald-500 to-teal-400 p-0.5 shadow-md shadow-emerald-500/20 flex-shrink-0">
            <div className="w-full h-full bg-slate-950 rounded-[10px] flex items-center justify-center font-bold text-emerald-400">
              dA
            </div>
          </div>
          <div>
            <div className="flex items-center gap-2">
              <input
                type="text"
                value={storyTitle}
                onChange={(e) => setStoryTitle(e.target.value)}
                className="text-base sm:text-lg font-bold text-white bg-transparent border-b border-transparent hover:border-slate-700 focus:border-emerald-400 focus:outline-none transition px-1"
                placeholder="Story Title"
              />
            </div>
            <p className="text-xs font-mono text-slate-400">
              Active File: <strong className="text-emerald-400">{dataset.fileName}</strong> {sheetNames.length > 1 ? `(${sheetNames.length} sheets • Active on Page ${activeSlideIndex + 1}: "${currentSlideSheetName}")` : `(${activeSheetData.totalRows} records)`}
            </p>
          </div>
        </div>

        {/* Global Toolbar: Switch file, Add Page, and "Download Story" (Available anytime irrespective of pages!) */}
        <div className="flex items-center gap-2 sm:gap-3">
          <button
            onClick={onResetData}
            className="px-3 py-1.5 rounded-xl text-xs font-mono text-slate-400 hover:text-white hover:bg-slate-800 border border-slate-800 transition"
          >
            Switch Excel
          </button>

          <button
            onClick={handleAddNewSlide}
            className="px-3.5 py-1.5 rounded-xl text-xs font-mono text-emerald-400 bg-emerald-950/40 hover:bg-emerald-900/40 border border-emerald-700/50 transition flex items-center gap-1.5"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Add New Page</span>
          </button>

          {/* CRITICAL FEATURE: DOWNLOAD STORY OPTION IRRESPECTIVE OF PAGES */}
          <button
            onClick={() => {
              const exportSlides = slides.map((s) => {
                const sSheetName = s.sheetName || defaultSheetName;
                const sData = sheets[sSheetName]?.data || dataset.data || [];
                return {
                  ...s,
                  sheetName: sSheetName,
                  data: sData,
                };
              });
              onDownloadStory({ storyTitle, slides: exportSlides, sheets });
            }}
            className="px-4 py-2 rounded-xl text-xs sm:text-sm font-bold text-slate-950 bg-gradient-to-r from-[#00ff87] via-[#10b981] to-[#00d2ff] hover:scale-[1.03] shadow-[0_0_25px_rgba(0,255,135,0.35)] hover:shadow-[0_0_40px_rgba(0,255,135,0.55)] transition-all duration-300 flex items-center gap-2 border border-emerald-300/50"
          >
            <Download className="w-4 h-4 text-slate-950" />
            <span>Download Story</span>
          </button>
        </div>
      </div>

      {/* Slide Navigation Carousel / Tabs */}
      <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-thin">
        {slides.map((slide, idx) => {
          const isActive = idx === activeSlideIndex;
          const slideSheet = slide.sheetName || defaultSheetName;
          return (
            <div
              key={slide.id}
              onClick={() => setActiveSlideIndex(idx)}
              className={`group flex-shrink-0 cursor-pointer px-4 py-2.5 rounded-xl border text-xs font-mono flex items-center gap-3 transition-all duration-200 ${
                isActive
                  ? 'bg-gradient-to-r from-emerald-950/80 to-slate-900/90 border-[#00ff87]/60 text-[#00ff87] shadow-[0_0_20px_rgba(0,255,135,0.18)] scale-[1.02] font-semibold'
                  : 'bg-slate-900/60 border-slate-800 text-slate-400 hover:border-slate-700 hover:text-slate-200'
              }`}
            >
              <div className="flex items-center gap-1.5">
                <span className={`w-2 h-2 rounded-full ${isActive ? 'bg-[#00ff87] shadow-[0_0_8px_#00ff87]' : 'bg-slate-600'}`} />
                <span className="font-semibold">Page {idx + 1}</span>
              </div>
              <div className="flex items-center gap-1.5 text-[11px] text-slate-400">
                <span className={isActive ? 'text-slate-200' : 'text-slate-400'}>{slide.chartType.toUpperCase()}</span>
                {sheetNames.length > 1 && (
                  <span className="text-[10px] text-cyan-400 font-mono px-1.5 py-0.2 rounded bg-cyan-950/60 border border-cyan-800/60 truncate max-w-[100px]">
                    {slideSheet}
                  </span>
                )}
              </div>

              {/* Duplicate & Delete Mini Actions */}
              <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                <button
                  onClick={(e) => { e.stopPropagation(); handleDuplicateSlide(idx); }}
                  title="Duplicate Page"
                  className="p-1 hover:text-emerald-400 rounded hover:bg-slate-800"
                >
                  <Copy className="w-3 h-3" />
                </button>
                {slides.length > 1 && (
                  <button
                    onClick={(e) => { e.stopPropagation(); handleDeleteSlide(idx); }}
                    title="Delete Page"
                    className="p-1 hover:text-red-400 rounded hover:bg-slate-800"
                  >
                    <Trash2 className="w-3 h-3" />
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Workspace Grid: Left Configuration + Center Visualization + Right/Side Narrative Text Box */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left Column: Select Graph & Add-Interact Options (4 columns) */}
        <div className="lg:col-span-4 space-y-4">
          <AddInteractPanel
            sheetNames={sheetNames}
            selectedSheet={currentSlideSheetName}
            onSheetChange={handleSlideSheetChange}
            columns={activeSheetData.columns}
            columnTypes={activeSheetData.columnTypes}
            chartType={currentSlide.chartType}
            setChartType={(val) => updateCurrentSlide({ chartType: val })}
            xField={currentSlide.xField}
            setXField={(val) => updateCurrentSlide({ xField: val })}
            yField={currentSlide.yField}
            setYField={(val) => updateCurrentSlide({ yField: val })}
            y2Field={currentSlide.y2Field}
            setY2Field={(val) => updateCurrentSlide({ y2Field: val })}
            openField={currentSlide.openField}
            setOpenField={(val) => updateCurrentSlide({ openField: val })}
            closeField={currentSlide.closeField}
            setCloseField={(val) => updateCurrentSlide({ closeField: val })}
            lowField={currentSlide.lowField}
            setLowField={(val) => updateCurrentSlide({ lowField: val })}
            highField={currentSlide.highField}
            setHighField={(val) => updateCurrentSlide({ highField: val })}
            chartTitle={currentSlide.chartTitle}
            setChartTitle={(val) => updateCurrentSlide({ chartTitle: val })}
            chartSubtitle={currentSlide.chartSubtitle}
            setChartSubtitle={(val) => updateCurrentSlide({ chartSubtitle: val })}
            xAxisLabel={currentSlide.xAxisLabel}
            setXAxisLabel={(val) => updateCurrentSlide({ xAxisLabel: val })}
            yAxisLabel={currentSlide.yAxisLabel}
            setYAxisLabel={(val) => updateCurrentSlide({ yAxisLabel: val })}
            y2AxisLabel={currentSlide.y2AxisLabel}
            setY2AxisLabel={(val) => updateCurrentSlide({ y2AxisLabel: val })}
            interactions={currentSlide.interactions}
            setInteractions={(val) => updateCurrentSlide({ interactions: typeof val === 'function' ? val(currentSlide.interactions) : val })}
          />

          {/* Quick Page Info */}
          <div className="p-3.5 rounded-xl bg-slate-900/50 border border-slate-800/80 text-xs font-mono text-slate-400 flex items-center justify-between">
            <span>Viewing: <strong className="text-emerald-400">Page {activeSlideIndex + 1} of {slides.length}</strong></span>
            <div className="flex items-center gap-1">
              <button
                disabled={activeSlideIndex === 0}
                onClick={() => setActiveSlideIndex(activeSlideIndex - 1)}
                className="p-1 rounded hover:bg-slate-800 disabled:opacity-30"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <button
                disabled={activeSlideIndex === slides.length - 1}
                onClick={() => setActiveSlideIndex(activeSlideIndex + 1)}
                className="p-1 rounded hover:bg-slate-800 disabled:opacity-30"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>

        {/* Right Columns (8 columns): Split into Visualizer on Top/Center and Narrative Text Box on Side/Bottom */}
        <div className="lg:col-span-8 space-y-6">
          {/* Visualizer: Apache ECharts Canvas Box */}
          <div className="glass-panel-glow rounded-2xl p-5 border border-slate-800 flex flex-col space-y-3">
            <div className="flex items-center justify-between border-b border-slate-800/80 pb-3">
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse" />
                <h3 className="text-sm font-bold text-slate-100 font-display uppercase tracking-wider">
                  Live Visualizer — {currentSlide.chartType.toUpperCase()}
                </h3>
              </div>
              <div className="flex items-center gap-2 text-xs font-mono text-slate-400">
                <span>Interactions:</span>
                <span className="text-emerald-400 font-semibold">
                  {currentSlide.interactions.enableTooltip ? 'Tooltips ON' : 'Tooltips OFF'}
                </span>
                <span>&bull;</span>
                <span className="text-cyan-400 font-semibold">
                  {currentSlide.interactions.enableZoom ? 'Zoom ON' : 'Zoom OFF'}
                </span>
              </div>
            </div>

            {/* Apache ECharts Container */}
            <div className="w-full h-[400px] rounded-xl bg-slate-950/70 p-2">
              <EChartsRenderer
                chartType={currentSlide.chartType}
                data={activeSheetData.data}
                xField={currentSlide.xField}
                yField={currentSlide.yField}
                y2Field={currentSlide.y2Field}
                openField={currentSlide.openField}
                closeField={currentSlide.closeField}
                lowField={currentSlide.lowField}
                highField={currentSlide.highField}
                chartTitle={currentSlide.chartTitle}
                chartSubtitle={currentSlide.chartSubtitle}
                xAxisLabel={currentSlide.xAxisLabel}
                yAxisLabel={currentSlide.yAxisLabel}
                y2AxisLabel={currentSlide.y2AxisLabel}
                interactions={currentSlide.interactions}
              />
            </div>
          </div>

          {/* Narrative / Commentary Text Box ("in side there will be a text box we can add any text") */}
          <div className="glass-card rounded-2xl p-5 border border-slate-800 space-y-3 border-l-4 border-l-emerald-400">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-sm font-semibold text-emerald-300">
                <FileText className="w-4 h-4" />
                <span>Analyst Story Narrative (Page {activeSlideIndex + 1})</span>
              </div>
              <span className="text-xs font-mono text-slate-400">
                Markdown / Plain Text Supported
              </span>
            </div>

            <textarea
              rows={4}
              value={currentSlide.narrativeText}
              onChange={(e) => updateCurrentSlide({ narrativeText: e.target.value })}
              placeholder="Add your narrative, commentary, key findings, takeaways, or bullet points for this specific page..."
              className="w-full bg-slate-950/80 border border-slate-700/80 rounded-xl p-3.5 text-xs sm:text-sm font-sans text-slate-200 leading-relaxed focus:outline-none focus:border-emerald-400 resize-y"
            />

            {/* Save & Next Page Button ("then save and next page in next page also same things") */}
            <div className="flex flex-wrap items-center justify-between gap-3 pt-2">
              <div className="text-xs font-mono text-slate-400 flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-emerald-400" />
                <span>All changes auto-saved to current page state</span>
              </div>

              <div className="flex items-center gap-3">
                <button
                  onClick={handleSaveAndNextPage}
                  className="px-5 py-2.5 rounded-xl text-xs sm:text-sm font-bold text-slate-950 bg-gradient-to-r from-emerald-400 to-teal-300 hover:scale-[1.02] shadow-md shadow-emerald-500/20 transition flex items-center gap-2"
                >
                  <Save className="w-4 h-4" />
                  <span>Save & Next Page</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
