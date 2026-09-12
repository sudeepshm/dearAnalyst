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

  const getSlideDefaultsForSheet = (sheetName) => {
    const s = sheets[sheetName] || dataset;
    const isFin = s?.isFinancial || s?.defaultOrientation === 'transposed';
    const orient = isFin ? 'transposed' : 'standard';
    const oriented = (orient === 'transposed' && s?.transposed) ? s.transposed : (s?.standard || s || {});
    const cols = oriented.columns || [];
    const types = oriented.columnTypes || {};

    if (orient === 'transposed') {
      const numCols = cols.filter((c) => c !== 'Period');
      const primaryMetric = numCols[0] || cols[1] || 'Metric 1';
      const secondaryMetric = numCols[1] || cols[2] || '';
      const chartTitle = secondaryMetric
        ? `${primaryMetric} & ${secondaryMetric} Trend (${sheetName})`
        : `${primaryMetric} Trend (${sheetName})`;
      const chartSubtitle = secondaryMetric
        ? `Comparing ${primaryMetric} (Left Axis) and ${secondaryMetric} (Right Axis) across fiscal periods`
        : `Financial statement metric view across timeline periods`;

      return {
        sheetName,
        orientation: 'transposed',
        chartType: 'combo',
        xField: 'Period',
        yField: primaryMetric,
        y2Field: secondaryMetric,
        yFields: [primaryMetric, secondaryMetric].filter(Boolean),
        periodFilter: { preset: 'all', customStart: '', customEnd: '' },
        breakdownMode: 'distribution',
        compositionPeriod: '',
        chartTitle,
        chartSubtitle,
        xAxisLabel: 'Fiscal Period',
        yAxisLabel: primaryMetric,
        y2AxisLabel: secondaryMetric,
      };
    } else {
      const dateCol = cols.find((c) => types[c] === 'date') || cols[0] || 'Date';
      const numCols = cols.filter((c) => types[c] === 'number');
      return {
        sheetName,
        orientation: 'standard',
        chartType: 'candlestick',
        xField: dateCol,
        yField: numCols[0] || cols[1] || 'Close',
        y2Field: numCols[1] || cols[2] || 'Volume',
        yFields: [numCols[0] || cols[1] || 'Close', numCols[1] || cols[2] || 'Volume'].filter(Boolean),
        periodFilter: { preset: 'all', customStart: '', customEnd: '' },
        breakdownMode: 'distribution',
        compositionPeriod: '',
        openField: cols.find((c) => /open/i.test(c)) || numCols[0] || cols[0] || 'Open',
        closeField: cols.find((c) => /close/i.test(c)) || numCols[1] || cols[1] || 'Close',
        lowField: cols.find((c) => /low/i.test(c)) || numCols[2] || cols[2] || 'Low',
        highField: cols.find((c) => /high/i.test(c)) || numCols[3] || cols[3] || 'High',
        chartTitle: `${sheetName} Market Performance`,
        chartSubtitle: `Detailed chart breakdown on sheet: "${sheetName}"`,
        xAxisLabel: 'Timeline / Dimension',
        yAxisLabel: 'Value / Left Axis',
        y2AxisLabel: 'Right Axis',
      };
    }
  };

  // Initial multi-page story state with default sensible financial charts
  const [slides, setSlides] = useState(() => {
    const s1Def = getSlideDefaultsForSheet(defaultSheetName);
    const s2Name = sheetNames[1] || defaultSheetName;
    const s2Def = getSlideDefaultsForSheet(s2Name);

    return [
      {
        id: 'slide-1',
        pageTitle: 'Page 1: Performance & Metric Analysis',
        chartType: initialChartType || s1Def.chartType,
        ...s1Def,
        narrativeText: `### Financial Overview & Trajectory\n- Review metrics across reported periods.\n- Crosshair tooltips show exact period values and trends.\n- Use the Data Orientation toggle above to switch between Financial (Rows=Metrics) and Standard views.`,
        interactions: {
          enableTooltip: true,
          tooltipTrigger: 'axis',
          axisPointerType: 'cross',
          enableZoom: true,
          enableMouseHover: true,
          enableLegend: true,
          showGridLines: true,
          enableAreaShading: false,
        },
      },
      {
        id: 'slide-2',
        pageTitle: 'Page 2: Comparative Analysis & Bridge',
        chartType: 'combo',
        ...s2Def,
        narrativeText: `### Dual-Axis Breakdown\n- Primary metric displayed on Left Axis with secondary comparison on Right Axis.\n- Consistent fiscal period alignment ensures no dimensional mismatches.`,
        interactions: {
          enableTooltip: true,
          tooltipTrigger: 'axis',
          axisPointerType: 'cross',
          enableZoom: true,
          enableMouseHover: true,
          enableLegend: true,
          showGridLines: true,
          enableAreaShading: false,
        },
      },
    ];
  });

  const currentSlide = slides[activeSlideIndex] || slides[0];
  const currentSlideSheetName = currentSlide.sheetName || defaultSheetName;
  const rawSheet = sheets[currentSlideSheetName] || sheets[sheetNames[0]] || {
    columns: dataset.columns || [],
    columnTypes: dataset.columnTypes || {},
    totalRows: dataset.totalRows || 0,
    data: dataset.data || [],
  };

  const slideOrientation = currentSlide.orientation || rawSheet.defaultOrientation || (rawSheet.isFinancial ? 'transposed' : 'standard');
  const activeOrientedData = (slideOrientation === 'transposed' && rawSheet.transposed)
    ? rawSheet.transposed
    : (rawSheet.standard || rawSheet);

  const updateCurrentSlide = (patch) => {
    setSlides((prev) => {
      const copy = [...prev];
      copy[activeSlideIndex] = { ...copy[activeSlideIndex], ...patch };
      return copy;
    });
  };

  const handleOrientationChange = (newOrientation) => {
    const s = sheets[currentSlideSheetName] || dataset;
    const oriented = (newOrientation === 'transposed' && s.transposed) ? s.transposed : (s.standard || s);
    const cols = oriented.columns || [];
    const types = oriented.columnTypes || {};

    let newX, newY, newY2;
    if (newOrientation === 'transposed') {
      const numCols = cols.filter((c) => c !== 'Period');
      newX = 'Period';
      newY = numCols[0] || cols[1] || '';
      newY2 = numCols[1] || cols[2] || '';
    } else {
      const numCols = cols.filter((c) => types[c] === 'number');
      newX = cols.find((c) => types[c] === 'date') || cols[0] || '';
      newY = numCols[0] || cols[1] || '';
      newY2 = numCols[1] || cols[2] || '';
    }

    updateCurrentSlide({
      orientation: newOrientation,
      xField: newX,
      yField: newY,
      y2Field: newY2,
      yFields: [newY, newY2].filter(Boolean),
    });
  };

  const handleSlideSheetChange = (newSheetName) => {
    const defaults = getSlideDefaultsForSheet(newSheetName);
    updateCurrentSlide(defaults);
  };

  const handleAddNewSlide = () => {
    const newSlideNumber = slides.length + 1;
    const slideSheet = currentSlide?.sheetName || defaultSheetName;
    const defaults = getSlideDefaultsForSheet(slideSheet);

    const newSlide = {
      id: `slide-${Date.now()}`,
      pageTitle: `Page ${newSlideNumber}: Analysis Deck`,
      ...defaults,
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
                const sSheet = sheets[sSheetName] || dataset;
                const sOrient = s.orientation || sSheet.defaultOrientation || (sSheet.isFinancial ? 'transposed' : 'standard');
                const oriented = (sOrient === 'transposed' && sSheet.transposed) ? sSheet.transposed : (sSheet.standard || sSheet);
                return {
                  ...s,
                  sheetName: sSheetName,
                  orientation: sOrient,
                  data: oriented.data || [],
                  columns: oriented.columns || [],
                  columnTypes: oriented.columnTypes || {},
                  yFields: s.yFields || [s.yField, s.y2Field].filter(Boolean),
                  periodFilter: s.periodFilter || { preset: 'all' },
                  breakdownMode: s.breakdownMode || 'distribution',
                  compositionPeriod: s.compositionPeriod || '',
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
            columns={activeOrientedData.columns}
            columnTypes={activeOrientedData.columnTypes}
            orientation={slideOrientation}
            onOrientationChange={handleOrientationChange}
            isFinancial={rawSheet.isFinancial || false}
            chartType={currentSlide.chartType}
            setChartType={(val) => updateCurrentSlide({ chartType: val })}
            xField={currentSlide.xField || (slideOrientation === 'transposed' ? 'Period' : activeOrientedData.columns[0])}
            setXField={(val) => updateCurrentSlide({ xField: val })}
            yField={currentSlide.yField || activeOrientedData.columns[1]}
            setYField={(val) => updateCurrentSlide({ yField: val })}
            y2Field={currentSlide.y2Field}
            setY2Field={(val) => updateCurrentSlide({ y2Field: val })}
            yFields={currentSlide.yFields || [currentSlide.yField, currentSlide.y2Field].filter(Boolean)}
            setYFields={(val) => updateCurrentSlide({ yFields: val })}
            periodFilter={currentSlide.periodFilter || { preset: 'all' }}
            setPeriodFilter={(val) => updateCurrentSlide({ periodFilter: val })}
            breakdownMode={currentSlide.breakdownMode || 'distribution'}
            setBreakdownMode={(val) => updateCurrentSlide({ breakdownMode: val })}
            compositionPeriod={currentSlide.compositionPeriod || ''}
            setCompositionPeriod={(val) => updateCurrentSlide({ compositionPeriod: val })}
            availablePeriods={(activeOrientedData.data || []).map((d) => String(d[currentSlide.xField || (slideOrientation === 'transposed' ? 'Period' : activeOrientedData.columns[0])] ?? '')).filter(Boolean)}
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
                data={activeOrientedData.data}
                columns={activeOrientedData.columns}
                columnTypes={activeOrientedData.columnTypes}
                xField={currentSlide.xField || (slideOrientation === 'transposed' ? 'Period' : activeOrientedData.columns[0])}
                yField={currentSlide.yField || activeOrientedData.columns[1]}
                y2Field={currentSlide.y2Field}
                yFields={currentSlide.yFields || [currentSlide.yField, currentSlide.y2Field].filter(Boolean)}
                periodFilter={currentSlide.periodFilter || { preset: 'all' }}
                breakdownMode={currentSlide.breakdownMode || 'distribution'}
                compositionPeriod={currentSlide.compositionPeriod || ''}
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
