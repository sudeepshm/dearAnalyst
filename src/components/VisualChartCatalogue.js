'use client';

import React, { useState, useMemo } from 'react';
import {
  CandlestickChart,
  LineChart,
  BarChart3,
  Layers,
  MousePointerClick,
  PieChart,
  TrendingUp,
  Percent,
  ArrowUpDown,
  Search,
  Sparkles,
  ArrowRight,
  Filter,
  CheckCircle2,
  SlidersHorizontal,
} from 'lucide-react';

export const CATALOGUE_CHARTS = [
  {
    id: 'candlestick',
    title: 'Candlestick (OHLC)',
    category: 'trends',
    categoryLabel: 'Trends & Volatility',
    icon: CandlestickChart,
    description: 'The definitive financial visualizer showing Open, High, Low, and Close price action with automatic 5-day moving average overlay.',
    bestFor: 'Stock prices, crypto assets, FX pairs, market volatility',
    dataReq: '1 Date + 4 Numeric Fields (Open, High, Low, Close)',
    accentColor: '#10b981',
  },
  {
    id: 'combo',
    title: 'Combo Bar & Line (Dual-Axis)',
    category: 'comparisons',
    categoryLabel: 'Comparisons & Dual-Axis',
    icon: Layers,
    description: 'Combines discrete bar columns on the Left Y-Axis with a smooth continuous line curve on the Right Y-Axis with independent scales.',
    bestFor: 'Revenue ($) vs Margin (%), Volume vs Price, Sales vs Growth Rate',
    dataReq: '1 Dimension + 2 Numeric Metrics (Primary & Secondary)',
    accentColor: '#06b6d4',
  },
  {
    id: 'dual-line',
    title: 'Dual-Axis Line Chart',
    category: 'comparisons',
    categoryLabel: 'Comparisons & Dual-Axis',
    icon: LineChart,
    description: 'Plots two distinct time-series trends simultaneously on independent left and right scales with custom dashed styling.',
    bestFor: 'Asset Price vs Benchmark Index, Inflation Rate vs Federal Funds Rate',
    dataReq: '1 Timeline + 2 Numeric Metrics',
    accentColor: '#10b981',
  },
  {
    id: 'clustered-bar',
    title: 'Clustered Column Chart',
    category: 'comparisons',
    categoryLabel: 'Comparisons & Dual-Axis',
    icon: BarChart3,
    description: 'Places comparison bars side-by-side per category with automatic spacing and dual-series legend.',
    bestFor: 'Actual vs Target, 2024 vs 2025 Revenue, Departmental spend breakdown',
    dataReq: '1 Category + 2 Comparative Metrics',
    accentColor: '#8b5cf6',
  },
  {
    id: 'horizontal-clustered-bar',
    title: 'Clustered Bar Chart (Horizontal)',
    category: 'comparisons',
    categoryLabel: 'Comparisons & Dual-Axis',
    icon: BarChart3,
    description: 'Horizontal grouped bars with categories on the vertical Y-Axis and numerical values along the horizontal X-Axis.',
    bestFor: 'Entity rankings, product comparisons, department spend with long category names',
    dataReq: '1 Category/Entity (Y-Axis) + Numerical Values (X-Axis)',
    accentColor: '#38bdf8',
  },
  {
    id: 'multi-line',
    title: 'Multi-Line Chart',
    category: 'trends',
    categoryLabel: 'Trends & Volatility',
    icon: LineChart,
    description: 'Plots multiple continuous line series on a shared numerical Y-axis scale to compare trends and trajectories over time.',
    bestFor: 'Multi-asset performance, revenue streams over time, cohort trajectories',
    dataReq: '1 Time Period / Date (X-Axis) + Multiple Numerical Series (Y-Axis)',
    accentColor: '#06b6d4',
  },
  {
    id: 'stacked-bar',
    title: 'Stacked Column Chart',
    category: 'part-to-whole',
    categoryLabel: 'Part-to-Whole & Stacked',
    icon: BarChart3,
    description: 'Segments vertical bars into sub-components so analysts can inspect both category totals and segment contributions.',
    bestFor: 'Total Revenue split by Geography or Product Line, OPEX by division',
    dataReq: '1 Dimension + 2 or more Stacked Metrics',
    accentColor: '#10b981',
  },
  {
    id: 'stacked-bar-100',
    title: '100% Stacked Column Chart',
    category: 'part-to-whole',
    categoryLabel: 'Part-to-Whole & Stacked',
    icon: Percent,
    description: 'Normalizes all stacked columns to a 100% proportion scale to emphasize relative percentage distribution regardless of absolute volume.',
    bestFor: 'Relative budget allocation %, customer demographic splits, margin mix',
    dataReq: '1 Dimension + 2 Proportional Metrics (Sum scaled to 100%)',
    accentColor: '#f59e0b',
  },
  {
    id: 'stacked-area',
    title: 'Stacked Area Chart',
    category: 'part-to-whole',
    categoryLabel: 'Part-to-Whole & Stacked',
    icon: Layers,
    description: 'Continuous layered color gradients that demonstrate cumulative growth and changing category composition over a timeline.',
    bestFor: 'Cumulative revenue streams, total web traffic by source, energy mix',
    dataReq: '1 Timeline + 2 or more Stacked Metrics',
    accentColor: '#8b5cf6',
  },
  {
    id: 'waterfall',
    title: 'Waterfall / Bridge Chart',
    category: 'flow',
    categoryLabel: 'Financial Bridge & Flow',
    icon: TrendingUp,
    description: 'Standard corporate finance bridge chart calculating sequential gains (green) and losses (red) using floating step bars.',
    bestFor: 'EBITDA to Net Income bridge, quarterly profit & loss variance, cash burn',
    dataReq: '1 Step Category + 1 Value Delta column',
    accentColor: '#10b981',
  },
  {
    id: 'diverging-bar',
    title: 'Diverging Bar + Line Overlay',
    category: 'comparisons',
    categoryLabel: 'Comparisons & Dual-Axis',
    icon: ArrowUpDown,
    description: 'Bi-directional bars centered at a zero baseline (green for positive gains, red for drawdowns) topped with a moving trend spline.',
    bestFor: 'Net profit/loss by product, year-over-year growth variance, trade balance',
    dataReq: '1 Category + 1 Signed Metric (+/-) + 1 Trend Metric',
    accentColor: '#ef4444',
  },
  {
    id: 'line',
    title: 'Single Line Trend',
    category: 'trends',
    categoryLabel: 'Trends & Volatility',
    icon: LineChart,
    description: 'Crisp, smoothed Bezier curve time-series visualization equipped with interactive crosshairs and mousewheel zoom.',
    bestFor: 'Historical prices, daily active users, temperature, continuous metrics',
    dataReq: '1 X-Axis (Date/Sequence) + 1 Y-Axis Metric',
    accentColor: '#06b6d4',
  },
  {
    id: 'bar',
    title: 'Single Bar / Volume',
    category: 'comparisons',
    categoryLabel: 'Comparisons & Dual-Axis',
    icon: BarChart3,
    description: 'Modern vertical columns styled with an emerald-to-translucent gradient and rounded top caps for ranking discrete categories.',
    bestFor: 'Trading volume, sales by territory, leaderboard rankings',
    dataReq: '1 Category/Date + 1 Volume/Metric column',
    accentColor: '#10b981',
  },
  {
    id: 'area',
    title: 'Filled Area Gradient',
    category: 'trends',
    categoryLabel: 'Trends & Volatility',
    icon: Layers,
    description: 'Combines trend curve with a rich translucent vertical gradient beneath the spline, emphasizing volume magnitude.',
    bestFor: 'Cumulative revenue, asset pool balances, server bandwidth usage',
    dataReq: '1 Sequence/Date + 1 Value Metric',
    accentColor: '#8b5cf6',
  },
  {
    id: 'scatter',
    title: 'Scatter Plot',
    category: 'flow',
    categoryLabel: 'Financial Bridge & Flow',
    icon: MousePointerClick,
    description: 'Two-dimensional Cartesian coordinate points designed to detect clusters, correlation coefficients, and statistical outliers.',
    bestFor: 'Risk vs Return analysis, Price vs Quality, PE ratio vs EPS growth',
    dataReq: 'Independent Numerical Variable (X) + Dependent Numerical Variable (Y)',
    accentColor: '#f59e0b',
  },
  {
    id: 'pie',
    title: 'Pie / Donut Visualizer',
    category: 'part-to-whole',
    categoryLabel: 'Part-to-Whole & Stacked',
    icon: PieChart,
    description: 'Radial donut visualizer with hollow center and distinct hover sectors for high-level category allocation.',
    bestFor: 'Asset portfolio allocation, sector market share, operating expenditure mix',
    dataReq: '1 Categorical Label + 1 Numeric Proportion',
    accentColor: '#ec4899',
  },
];

const CATEGORIES = [
  { id: 'all', label: 'All Visualizers', icon: Sparkles },
  { id: 'comparisons', label: 'Comparisons & Dual-Axis', icon: SlidersHorizontal },
  { id: 'trends', label: 'Trends & Volatility', icon: TrendingUp },
  { id: 'part-to-whole', label: 'Part-to-Whole & Stacked', icon: Percent },
  { id: 'flow', label: 'Financial Bridge & Flow', icon: Filter },
];

export default function VisualChartCatalogue({ onSelectChart, onStartStory }) {
  const [activeCategory, setActiveCategory] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');

  const filteredCharts = useMemo(() => {
    return CATALOGUE_CHARTS.filter((chart) => {
      const matchesCategory = activeCategory === 'all' || chart.category === activeCategory;
      const matchesSearch =
        chart.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        chart.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
        chart.bestFor.toLowerCase().includes(searchQuery.toLowerCase()) ||
        chart.categoryLabel.toLowerCase().includes(searchQuery.toLowerCase());
      return matchesCategory && matchesSearch;
    });
  }, [activeCategory, searchQuery]);

  return (
    <section id="chart-catalogue" className="w-full py-16 px-4 sm:px-8 max-w-7xl mx-auto z-10">
      {/* Section Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-10 pb-6 border-b border-slate-800/80">
        <div className="space-y-3 max-w-2xl">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs font-mono">
            <Sparkles className="w-3.5 h-3.5 text-emerald-400" />
            <span>Interactive Visual Catalogue</span>
          </div>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight font-display">
            The Analyst's Data Visualization Catalogue
          </h2>
          <p className="text-sm sm:text-base text-slate-400 leading-relaxed">
            Inspired by datavizcatalogue.com. Select the right analytical representation for your financial datasets,
            variance models, and multi-sheet workbooks.
          </p>
        </div>

        {/* Search Input */}
        <div className="relative w-full md:w-80">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search 14 chart types..."
            className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-slate-900/90 border border-slate-700/80 text-xs font-mono text-slate-200 placeholder-slate-500 focus:outline-none focus:border-emerald-400 focus:ring-1 focus:ring-emerald-400 shadow-inner"
          />
        </div>
      </div>

      {/* Category Pills Filter */}
      <div className="flex items-center gap-2 overflow-x-auto pb-4 mb-8 scrollbar-thin">
        {CATEGORIES.map((cat) => {
          const Icon = cat.icon;
          const isActive = activeCategory === cat.id;
          return (
            <button
              key={cat.id}
              onClick={() => setActiveCategory(cat.id)}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-mono whitespace-nowrap transition-all duration-200 border ${
                isActive
                  ? 'bg-gradient-to-r from-emerald-500/25 to-teal-500/15 text-[#00ff87] border-[#00ff87]/60 shadow-[0_0_20px_rgba(0,255,135,0.22)] scale-105 font-bold'
                  : 'bg-slate-900/70 text-slate-400 border-slate-800/90 hover:border-slate-700 hover:text-slate-200 hover:bg-slate-900'
              }`}
            >
              <Icon className={`w-3.5 h-3.5 ${isActive ? 'text-[#00ff87]' : 'text-slate-500'}`} />
              <span>{cat.label}</span>
              <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold ${isActive ? 'bg-[#00ff87]/20 text-[#00ff87] border border-[#00ff87]/40' : 'bg-slate-800 text-slate-500'}`}>
                {cat.id === 'all'
                  ? CATALOGUE_CHARTS.length
                  : CATALOGUE_CHARTS.filter((c) => c.category === cat.id).length}
              </span>
            </button>
          );
        })}
      </div>

      {/* Grid of Catalogue Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {filteredCharts.map((chart) => {
          const Icon = chart.icon;
          return (
            <div
              key={chart.id}
              className="group relative rounded-2xl bg-gradient-to-b from-[#0e172a]/95 via-[#0b1220]/90 to-[#060913]/95 border border-slate-800/90 hover:border-[#00ff87]/60 p-5 flex flex-col justify-between transition-all duration-300 hover:-translate-y-1 hover:shadow-[0_12px_35px_-5px_rgba(0,255,135,0.18)] overflow-hidden"
            >
              {/* Top ambient glow on hover */}
              <div
                className="absolute -top-20 -right-20 w-36 h-36 rounded-full blur-3xl opacity-0 group-hover:opacity-40 transition-opacity duration-500 pointer-events-none"
                style={{ backgroundColor: chart.accentColor }}
              />

              <div className="space-y-3">
                {/* Header: Icon + Category Badge */}
                <div className="flex items-center justify-between">
                  <div
                    className="w-10 h-10 rounded-xl flex items-center justify-center border shadow-sm"
                    style={{
                      backgroundColor: `${chart.accentColor}18`,
                      borderColor: `${chart.accentColor}45`,
                    }}
                  >
                    <Icon className="w-5 h-5" style={{ color: chart.accentColor }} />
                  </div>
                  <span className="text-[11px] font-mono px-2.5 py-1 rounded-full bg-slate-800/80 text-slate-300 border border-slate-700/60">
                    {chart.categoryLabel}
                  </span>
                </div>

                {/* Title */}
                <div>
                  <h3 className="text-base font-bold text-white group-hover:text-[#00ff87] transition-colors font-display">
                    {chart.title}
                  </h3>
                  <p className="text-xs text-slate-400 mt-1.5 leading-relaxed line-clamp-3">
                    {chart.description}
                  </p>
                </div>

                {/* Best For Tag */}
                <div className="pt-2 border-t border-slate-800/60 text-xs font-mono space-y-1.5">
                  <div className="flex items-start gap-1.5 text-slate-300">
                    <CheckCircle2 className="w-3.5 h-3.5 text-[#00ff87] flex-shrink-0 mt-0.5" />
                    <span className="text-[11px] leading-tight">
                      <strong className="text-[#00ff87]">Best for:</strong> {chart.bestFor}
                    </span>
                  </div>

                  <div className="text-[10px] text-slate-500 bg-slate-950/60 px-2.5 py-1 rounded-md border border-slate-800/70 truncate">
                    Data: {chart.dataReq}
                  </div>
                </div>
              </div>

              {/* Action Button */}
              <div className="pt-4 mt-4 border-t border-slate-800/60 flex items-center justify-between">
                <button
                  onClick={() => {
                    if (onSelectChart) {
                      onSelectChart(chart.id);
                    } else if (onStartStory) {
                      onStartStory(chart.id);
                    }
                  }}
                  className="w-full inline-flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl bg-slate-800/80 group-hover:bg-gradient-to-r group-hover:from-[#00ff87] group-hover:via-[#10b981] group-hover:to-[#00d2ff] text-slate-200 group-hover:text-slate-950 text-xs font-mono font-bold transition-all duration-300 border border-slate-700/60 group-hover:border-emerald-300 shadow-sm group-hover:shadow-[0_0_25px_rgba(0,255,135,0.35)]"
                >
                  <span>Use in Presentation</span>
                  <ArrowRight className="w-3.5 h-3.5 transition-transform group-hover:translate-x-1" />
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {filteredCharts.length === 0 && (
        <div className="text-center py-16 text-slate-400 font-mono text-xs">
          No visualizer found matching "{searchQuery}". Try searching for "waterfall", "dual-axis", or "candlestick".
        </div>
      )}
    </section>
  );
}
