/**
 * Generates an interactive, standalone HTML file that displays the dearAnalyst story.
 * Can be opened in any web browser without running a server.
 */
export function generateStandaloneHtml({ title, slides, globalSettings = {} }) {
  const serializedSlides = JSON.stringify(slides);
  const serializedSettings = JSON.stringify(globalSettings);

  return `<!DOCTYPE html>
<html lang="en" class="dark">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${escapeHtml(title)} — dearAnalyst Story</title>
  <!-- Google Fonts -->
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=JetBrains+Mono:wght@400;600&family=Outfit:wght@400;600;700;800&family=Space+Grotesk:wght@400;500;600;700&display=swap" rel="stylesheet">
  <!-- Tailwind CDN -->
  <script src="https://cdn.tailwindcss.com"></script>
  <!-- Apache ECharts CDN -->
  <script src="https://cdn.jsdelivr.net/npm/echarts@5.5.0/dist/echarts.min.js"></script>
  <script>
    tailwind.config = {
      darkMode: 'class',
      theme: {
        extend: {
          colors: {
            brand: { 500: '#10b981', 600: '#059669' },
            market: { up: '#10b981', down: '#ef4444', dark: '#080c14', card: '#111827', border: '#334155' }
          },
          fontFamily: {
            brand: ['Space Grotesk', 'sans-serif'],
            display: ['Outfit', 'sans-serif'],
            mono: ['JetBrains Mono', 'monospace']
          }
        }
      }
    }
  </script>
  <style>
    body {
      background: radial-gradient(circle at 50% 0%, #0f1d36 0%, #080c14 75%);
      color: #f1f5f9;
      font-family: 'Space Grotesk', sans-serif;
      min-height: 100vh;
    }
    .brand-glow {
      text-shadow: 0 0 20px rgba(16, 185, 129, 0.4);
    }
    .glass-card {
      background: rgba(17, 24, 39, 0.85);
      backdrop-filter: blur(12px);
      border: 1px solid rgba(255, 255, 255, 0.08);
    }
    .narrative-box {
      white-space: pre-wrap;
      line-height: 1.7;
    }
  </style>
</head>
<body class="p-4 md:p-8 flex flex-col min-h-screen">
  <!-- Top Navigation Bar -->
  <header class="max-w-7xl w-full mx-auto mb-6 flex flex-wrap items-center justify-between gap-4 glass-card p-4 rounded-2xl">
    <div class="flex items-center gap-3">
      <div class="w-10 h-10 rounded-xl bg-gradient-to-tr from-emerald-500 to-cyan-500 flex items-center justify-center font-bold text-black text-xl">
        dA
      </div>
      <div>
        <h1 class="text-xl font-bold tracking-tight text-emerald-400 font-display flex items-center gap-2">
          <span>dearAnalyst</span>
          <span class="text-xs font-mono font-normal px-2 py-0.5 rounded bg-emerald-950 text-emerald-300 border border-emerald-800">Story Mode</span>
        </h1>
        <p id="story-main-title" class="text-sm text-slate-400">${escapeHtml(title)}</p>
      </div>
    </div>

    <!-- Slide Control & Pagination -->
    <div class="flex items-center gap-2">
      <button id="prev-btn" onclick="prevSlide()" class="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 transition flex items-center gap-1 text-sm">
        &#8592; Previous
      </button>
      <div class="px-4 py-1.5 rounded-lg bg-slate-900 border border-slate-800 text-sm font-mono text-emerald-400">
        Page <span id="current-slide-num">1</span> of <span id="total-slides-num">1</span>
      </div>
      <button id="next-btn" onclick="nextSlide()" class="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 transition flex items-center gap-1 text-sm">
        Next &#8594;
      </button>
      <button onclick="window.print()" class="ml-2 px-3 py-1.5 rounded-lg bg-emerald-600/20 hover:bg-emerald-600/30 text-emerald-400 border border-emerald-500/40 transition text-sm">
        Print / PDF
      </button>
    </div>
  </header>

  <!-- Slide Indicators Dots -->
  <div id="slide-dots" class="max-w-7xl w-full mx-auto mb-4 flex items-center justify-center gap-2"></div>

  <!-- Main Slide Workspace -->
  <main class="max-w-7xl w-full mx-auto flex-1 grid grid-cols-1 lg:grid-cols-12 gap-6">
    <!-- Visualizer / Chart Canvas (7 cols on large screens) -->
    <div class="lg:col-span-8 flex flex-col glass-card rounded-2xl p-5 overflow-hidden">
      <div class="flex items-center justify-between mb-3 border-b border-slate-800 pb-3">
        <div>
          <h2 id="slide-chart-title" class="text-lg font-bold text-slate-100 font-display">Chart Title</h2>
          <p id="slide-chart-subtitle" class="text-xs text-slate-400">Subtitle</p>
        </div>
        <div id="chart-badge" class="px-2.5 py-1 rounded text-xs font-mono bg-emerald-950 text-emerald-400 border border-emerald-800">
          CANDLESTICK
        </div>
      </div>
      
      <!-- Chart DOM -->
      <div id="echart-container" class="w-full flex-1 min-h-[420px] rounded-xl bg-slate-950/50"></div>
    </div>

    <!-- Narrative Commentary Box (4 cols on large screens) -->
    <div class="lg:col-span-4 flex flex-col glass-card rounded-2xl p-5 border-l-4 border-l-emerald-500">
      <div class="flex items-center justify-between mb-3 border-b border-slate-800 pb-3">
        <h3 class="text-base font-semibold text-emerald-400 flex items-center gap-2">
          <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"></path></svg>
          Analyst Narrative
        </h3>
        <span class="text-xs font-mono text-slate-500">Slide Insights</span>
      </div>

      <div class="flex-1 overflow-y-auto pr-2">
        <div id="slide-narrative-content" class="narrative-box text-sm text-slate-300 font-light leading-relaxed">
          Narrative text goes here...
        </div>
      </div>

      <!-- Key Metrics summary card -->
      <div id="slide-metrics-box" class="mt-4 p-3 rounded-xl bg-slate-900/80 border border-slate-800 text-xs font-mono space-y-1">
        <div class="text-slate-400 font-semibold mb-1">INTERACTIVE FEATURES ENABLED:</div>
        <div id="interactive-features-list" class="text-emerald-400 flex flex-wrap gap-1"></div>
      </div>
    </div>
  </main>

  <footer class="max-w-7xl w-full mx-auto mt-6 text-center text-xs text-slate-500">
    Generated with <span class="text-emerald-400 font-semibold">dearAnalyst</span> — Financial Visual Storytelling Studio
  </footer>

  <script>
    const slides = ${serializedSlides};
    const globalSettings = ${serializedSettings};
    let currentIndex = 0;
    let chartInstance = null;

    function init() {
      document.getElementById('total-slides-num').innerText = slides.length;
      renderDots();
      loadSlide(0);
      window.addEventListener('resize', () => {
        if (chartInstance) chartInstance.resize();
      });
    }

    function renderDots() {
      const container = document.getElementById('slide-dots');
      container.innerHTML = '';
      slides.forEach((_, idx) => {
        const dot = document.createElement('button');
        dot.className = \`w-3 h-3 rounded-full transition \${idx === currentIndex ? 'bg-emerald-400 ring-2 ring-emerald-500/50 scale-110' : 'bg-slate-700 hover:bg-slate-600'}\`;
        dot.title = \`Slide \${idx + 1}\`;
        dot.onclick = () => loadSlide(idx);
        container.appendChild(dot);
      });
    }

    function prevSlide() {
      if (currentIndex > 0) loadSlide(currentIndex - 1);
    }

    function nextSlide() {
      if (currentIndex < slides.length - 1) loadSlide(currentIndex + 1);
    }

    function loadSlide(index) {
      if (!slides || index < 0 || index >= slides.length) return;
      currentIndex = index;
      const slide = slides[index];

      // Update UI numbers
      document.getElementById('current-slide-num').innerText = index + 1;
      document.getElementById('slide-chart-title').innerText = slide.chartTitle || \`Slide \${index + 1} Visualization\`;
      document.getElementById('slide-chart-subtitle').innerText = slide.chartSubtitle || (slide.xAxisLabel ? \`X: \${slide.xAxisLabel} | Y: \${slide.yAxisLabel || ''}\` : 'Configured with Apache ECharts');
      const sheetLabel = slide.sheetName ? \`\${slide.sheetName} • \` : '';
      document.getElementById('chart-badge').innerText = (sheetLabel + (slide.chartType || 'candlestick')).toUpperCase();
      document.getElementById('slide-narrative-content').innerText = slide.narrativeText || 'No commentary recorded for this page.';

      // Feature tags
      const featList = document.getElementById('interactive-features-list');
      featList.innerHTML = '';
      const feats = [];
      if (slide.interactions?.enableTooltip) feats.push('Tooltips (' + (slide.interactions.tooltipTrigger || 'axis') + ')');
      if (slide.interactions?.enableZoom) feats.push('DataZoom Slider');
      if (slide.interactions?.enableMouseHover) feats.push('Hover Crosshair');
      if (slide.interactions?.enableLegend) feats.push('Dynamic Legend');
      if (feats.length === 0) feats.push('Standard Interactivity');

      feats.forEach(f => {
        const span = document.createElement('span');
        span.className = 'px-2 py-0.5 rounded bg-slate-800 text-slate-300 border border-slate-700';
        span.innerText = f;
        featList.appendChild(span);
      });

      renderDots();
      renderSlideChart(slide);
    }

    function renderSlideChart(slide) {
      const container = document.getElementById('echart-container');
      if (!chartInstance) {
        chartInstance = echarts.init(container, 'dark');
      } else {
        chartInstance.clear();
      }

      // Build ECharts option from slide specs
      const option = buildEChartsOption(slide);
      chartInstance.setOption(option);
      chartInstance.resize();
    }

    function buildEChartsOption(slide) {
      const chartType = slide.chartType || 'candlestick';
      const data = slide.data || [];
      const interactions = slide.interactions || {};

      const xField = slide.xField || 'Date';
      const yField = slide.yField || 'Close';
      const openField = slide.openField || 'Open';
      const closeField = slide.closeField || 'Close';
      const lowField = slide.lowField || 'Low';
      const highField = slide.highField || 'High';

      const xData = data.map(d => d[xField] || '');
      
      let tooltip = { trigger: 'item' };
      if (interactions.enableTooltip !== false) {
        tooltip = {
          trigger: interactions.tooltipTrigger || 'axis',
          axisPointer: {
            type: interactions.axisPointerType || 'cross',
            crossStyle: { color: '#10b981' },
            shadowStyle: { color: 'rgba(16, 185, 129, 0.1)' }
          },
          backgroundColor: 'rgba(17, 24, 39, 0.92)',
          borderColor: '#10b981',
          borderWidth: 1,
          textStyle: { color: '#f8fafc', fontSize: 12 }
        };
      }

      const dataZoom = [];
      if (interactions.enableZoom) {
        dataZoom.push({ type: 'slider', start: 0, end: 100, borderColor: '#334155' });
        dataZoom.push({ type: 'inside', start: 0, end: 100 });
      }

      let series = [];
      const y2Field = slide.y2Field || '';
      const isDualAxis = ['combo', 'dual-line'].includes(chartType);
      const isHorizontalBar = chartType === 'horizontal-clustered-bar';
      const isScatter = chartType === 'scatter';

      let yAxisConfig = isHorizontalBar
        ? {
            type: 'category',
            data: xData,
            name: slide.yAxisLabel || 'Category',
            axisLine: { lineStyle: { color: '#475569' } },
            axisLabel: { color: '#94a3b8' },
            splitLine: { show: false }
          }
        : isDualAxis
        ? [
            {
              name: slide.yAxisLabel || yField,
              type: 'value',
              scale: true,
              position: 'left',
              axisLine: { show: true, lineStyle: { color: '#10b981' } },
              splitLine: { lineStyle: { color: 'rgba(255,255,255,0.06)' } },
              axisLabel: { color: '#94a3b8' }
            },
            {
              name: slide.y2AxisLabel || y2Field || 'Secondary Metric',
              type: 'value',
              scale: true,
              position: 'right',
              axisLine: { show: true, lineStyle: { color: '#06b6d4' } },
              splitLine: { show: false },
              axisLabel: { color: '#94a3b8' }
            }
          ]
        : chartType === 'stacked-bar-100'
        ? {
            type: 'value',
            min: 0,
            max: 100,
            name: '% of Total',
            axisLabel: { formatter: '{value}%', color: '#94a3b8' },
            splitLine: { lineStyle: { color: 'rgba(255,255,255,0.06)' } }
          }
        : {
            name: slide.yAxisLabel || yField,
            type: 'value',
            scale: true,
            splitLine: { lineStyle: { color: 'rgba(255,255,255,0.06)' } },
            axisLabel: { color: '#94a3b8' }
          };

      if (chartType === 'candlestick') {
        const candleData = data.map(d => [
          Number(d[openField]),
          Number(d[closeField]),
          Number(d[lowField]),
          Number(d[highField])
        ]);

        series.push({
          name: slide.chartTitle || 'Candlestick',
          type: 'candlestick',
          data: candleData,
          itemStyle: {
            color: '#10b981',
            color0: '#ef4444',
            borderColor: '#10b981',
            borderColor0: '#ef4444'
          }
        });
      } else if (chartType === 'combo') {
        series.push({
          name: slide.yAxisLabel || yField,
          type: 'bar',
          yAxisIndex: 0,
          data: data.map(d => Number(d[yField]) || 0),
          itemStyle: {
            color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
              { offset: 0, color: '#10b981' },
              { offset: 1, color: 'rgba(16, 185, 129, 0.2)' }
            ]),
            borderRadius: [4, 4, 0, 0]
          }
        });

        const secMetric = y2Field || (data[0]?.Volume !== undefined ? 'Volume' : yField);
        series.push({
          name: slide.y2AxisLabel || secMetric,
          type: 'line',
          yAxisIndex: 1,
          smooth: true,
          data: data.map(d => Number(d[secMetric]) || 0),
          itemStyle: { color: '#06b6d4' },
          lineStyle: { width: 3, color: '#06b6d4' }
        });
      } else if (chartType === 'dual-line') {
        series.push({
          name: slide.yAxisLabel || yField,
          type: 'line',
          yAxisIndex: 0,
          smooth: true,
          data: data.map(d => Number(d[yField]) || 0),
          itemStyle: { color: '#10b981' },
          lineStyle: { width: 3, color: '#10b981' }
        });

        const secMetric = y2Field || yField;
        series.push({
          name: slide.y2AxisLabel || secMetric,
          type: 'line',
          yAxisIndex: 1,
          smooth: true,
          data: data.map(d => Number(d[secMetric]) || 0),
          itemStyle: { color: '#06b6d4' },
          lineStyle: { width: 3, color: '#06b6d4', type: 'dashed' }
        });
      } else if (chartType === 'clustered-bar') {
        series.push({
          name: slide.yAxisLabel || yField,
          type: 'bar',
          barGap: '20%',
          data: data.map(d => Number(d[yField]) || 0),
          itemStyle: { color: '#10b981', borderRadius: [4, 4, 0, 0] }
        });

        if (y2Field) {
          series.push({
            name: slide.y2AxisLabel || y2Field,
            type: 'bar',
            data: data.map(d => Number(d[y2Field]) || 0),
            itemStyle: { color: '#8b5cf6', borderRadius: [4, 4, 0, 0] }
          });
        }
      } else if (chartType === 'horizontal-clustered-bar') {
        series.push({
          name: slide.xAxisLabel || yField,
          type: 'bar',
          barGap: '20%',
          data: data.map(d => Number(d[yField]) || 0),
          itemStyle: { color: '#38bdf8', borderRadius: [0, 4, 4, 0] }
        });

        if (y2Field) {
          series.push({
            name: slide.y2AxisLabel || y2Field,
            type: 'bar',
            data: data.map(d => Number(d[y2Field]) || 0),
            itemStyle: { color: '#8b5cf6', borderRadius: [0, 4, 4, 0] }
          });
        }
      } else if (chartType === 'multi-line') {
        series.push({
          name: slide.yAxisLabel || yField,
          type: 'line',
          smooth: true,
          data: data.map(d => Number(d[yField]) || 0),
          itemStyle: { color: '#10b981' },
          lineStyle: { width: 3, color: '#10b981' }
        });

        if (y2Field) {
          series.push({
            name: slide.y2AxisLabel || y2Field,
            type: 'line',
            smooth: true,
            data: data.map(d => Number(d[y2Field]) || 0),
            itemStyle: { color: '#06b6d4' },
            lineStyle: { width: 3, color: '#06b6d4' }
          });
        }
      } else if (chartType === 'stacked-bar') {
        series.push({
          name: slide.yAxisLabel || yField,
          type: 'bar',
          stack: 'total',
          data: data.map(d => Number(d[yField]) || 0),
          itemStyle: { color: '#10b981' }
        });

        if (y2Field) {
          series.push({
            name: slide.y2AxisLabel || y2Field,
            type: 'bar',
            stack: 'total',
            data: data.map(d => Number(d[y2Field]) || 0),
            itemStyle: { color: '#06b6d4', borderRadius: [4, 4, 0, 0] }
          });
        }
      } else if (chartType === 'stacked-bar-100') {
        const p1 = [];
        const p2 = [];
        data.forEach(d => {
          const v1 = Math.abs(Number(d[yField]) || 0);
          const v2 = Math.abs(Number(d[y2Field || yField]) || (v1 * 0.4));
          const tot = (v1 + v2) || 1;
          p1.push(Number(((v1 / tot) * 100).toFixed(1)));
          p2.push(Number(((v2 / tot) * 100).toFixed(1)));
        });

        series.push({
          name: slide.yAxisLabel || yField,
          type: 'bar',
          stack: 'total',
          data: p1,
          itemStyle: { color: '#10b981' }
        });

        series.push({
          name: slide.y2AxisLabel || y2Field || 'Proportion B',
          type: 'bar',
          stack: 'total',
          data: p2,
          itemStyle: { color: '#f59e0b', borderRadius: [4, 4, 0, 0] }
        });
      } else if (chartType === 'stacked-area') {
        series.push({
          name: slide.yAxisLabel || yField,
          type: 'line',
          stack: 'Total',
          smooth: true,
          data: data.map(d => Number(d[yField]) || 0),
          itemStyle: { color: '#10b981' },
          areaStyle: {
            color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
              { offset: 0, color: 'rgba(16, 185, 129, 0.6)' },
              { offset: 1, color: 'rgba(16, 185, 129, 0.05)' }
            ])
          }
        });

        if (y2Field) {
          series.push({
            name: slide.y2AxisLabel || y2Field,
            type: 'line',
            stack: 'Total',
            smooth: true,
            data: data.map(d => Number(d[y2Field]) || 0),
            itemStyle: { color: '#8b5cf6' },
            areaStyle: {
              color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
                { offset: 0, color: 'rgba(139, 92, 246, 0.6)' },
                { offset: 1, color: 'rgba(139, 92, 246, 0.05)' }
              ])
            }
          });
        }
      } else if (chartType === 'waterfall') {
        const baseVals = [];
        const stepVals = [];
        let rTotal = 0;

        data.forEach(d => {
          const val = Number(d[yField]) || 0;
          if (val >= 0) {
            baseVals.push(Number(rTotal.toFixed(2)));
            stepVals.push({
              value: Number(val.toFixed(2)),
              itemStyle: { color: '#10b981', borderRadius: [4, 4, 0, 0] }
            });
            rTotal += val;
          } else {
            rTotal += val;
            baseVals.push(Number(rTotal.toFixed(2)));
            stepVals.push({
              value: Number(Math.abs(val).toFixed(2)),
              itemStyle: { color: '#ef4444', borderRadius: [0, 0, 4, 4] }
            });
          }
        });

        series.push({
          name: 'Base',
          type: 'bar',
          stack: 'waterfall',
          silent: true,
          itemStyle: { borderColor: 'transparent', color: 'transparent' },
          data: baseVals
        });

        series.push({
          name: slide.yAxisLabel || yField,
          type: 'bar',
          stack: 'waterfall',
          data: stepVals
        });
      } else if (chartType === 'diverging-bar') {
        const barData = data.map(d => {
          const val = Number(d[yField]) || 0;
          return {
            value: val,
            itemStyle: {
              color: val >= 0 ? '#10b981' : '#ef4444',
              borderRadius: val >= 0 ? [4, 4, 0, 0] : [0, 0, 4, 4]
            }
          };
        });

        series.push({
          name: slide.yAxisLabel || yField,
          type: 'bar',
          data: barData
        });

        const lineM = y2Field || yField;
        series.push({
          name: slide.y2AxisLabel || lineM,
          type: 'line',
          smooth: true,
          data: data.map(d => Number(d[lineM]) || 0),
          itemStyle: { color: '#06b6d4' },
          lineStyle: { width: 2.5, color: '#06b6d4' }
        });
      } else if (chartType === 'line') {
        series.push({
          name: slide.yAxisLabel || yField,
          type: 'line',
          smooth: true,
          data: data.map(d => Number(d[yField]) || 0),
          itemStyle: { color: '#06b6d4' },
          lineStyle: { width: 3 }
        });
      } else if (chartType === 'bar') {
        series.push({
          name: slide.yAxisLabel || yField,
          type: 'bar',
          data: data.map(d => Number(d[yField]) || 0),
          itemStyle: {
            color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
              { offset: 0, color: '#10b981' },
              { offset: 1, color: 'rgba(16, 185, 129, 0.1)' }
            ]),
            borderRadius: [4, 4, 0, 0]
          }
        });
      } else if (chartType === 'area') {
        series.push({
          name: slide.yAxisLabel || yField,
          type: 'line',
          smooth: true,
          data: data.map(d => Number(d[yField]) || 0),
          itemStyle: { color: '#8b5cf6' },
          areaStyle: {
            color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
              { offset: 0, color: 'rgba(139, 92, 246, 0.5)' },
              { offset: 1, color: 'rgba(139, 92, 246, 0.02)' }
            ])
          }
        });
      } else if (chartType === 'scatter') {
        series.push({
          name: slide.yAxisLabel || yField,
          type: 'scatter',
          symbolSize: 10,
          data: data.map(d => [Number(d[xField]) || 0, Number(d[yField]) || 0]),
          itemStyle: { color: '#f59e0b' }
        });
      } else if (chartType === 'pie') {
        series.push({
          name: slide.chartTitle || 'Distribution',
          type: 'pie',
          radius: ['40%', '70%'],
          data: data.slice(0, 8).map(d => ({
            name: String(d[xField] || 'Item'),
            value: Number(d[yField]) || 1
          })),
          emphasis: {
            itemStyle: { shadowBlur: 10, shadowOffsetX: 0, shadowColor: 'rgba(0, 0, 0, 0.5)' }
          }
        });
      }

      return {
        backgroundColor: 'transparent',
        title: {
          show: false
        },
        tooltip: tooltip,
        legend: {
          show: interactions.enableLegend !== false,
          textStyle: { color: '#94a3b8' },
          top: 10
        },
        grid: {
          left: '6%',
          right: '5%',
          bottom: interactions.enableZoom ? '15%' : '10%',
          top: '12%',
          containLabel: true
        },
        xAxis: chartType === 'pie' ? undefined : (
          isHorizontalBar ? {
            type: 'value',
            scale: true,
            name: slide.xAxisLabel || yField,
            axisLine: { lineStyle: { color: '#475569' } },
            axisLabel: { color: '#94a3b8' },
            splitLine: { lineStyle: { color: 'rgba(255,255,255,0.06)' } }
          } : isScatter ? {
            type: 'value',
            scale: true,
            name: slide.xAxisLabel || xField,
            axisLine: { lineStyle: { color: '#475569' } },
            axisLabel: { color: '#94a3b8' },
            splitLine: { lineStyle: { color: 'rgba(255,255,255,0.06)' } }
          } : {
            type: 'category',
            data: xData,
            name: slide.xAxisLabel || xField,
            axisLine: { lineStyle: { color: '#475569' } },
            axisLabel: { color: '#94a3b8' }
          }
        ),
        yAxis: chartType === 'pie' ? undefined : yAxisConfig,
        dataZoom: chartType === 'pie' ? [] : dataZoom,
        series: series
      };
    }

    window.onload = init;
  </script>
</body>
</html>`;
}

function escapeHtml(string) {
  if (!string) return '';
  return String(string)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}
