'use client';

import React, { useEffect, useRef } from 'react';
import * as echarts from 'echarts';
import { filterDataByPeriod, formatPeriodLabel, isEstimatePeriod } from '../utils/periodHelpers';

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

export default function EChartsRenderer({
  chartType = 'candlestick',
  data = [],
  columns = [],
  columnTypes = {},
  rowHeadingColumn = '',
  primaryMetricType = 'column',
  secondaryMetricType = 'column',
  xField = 'Date',
  yField = 'Close',
  y2Field = '',
  yFields = [],
  seriesConfigs = {},
  periodFilter = { preset: 'all' },
  tagEstimates = true,
  breakdownMode = 'distribution',
  compositionPeriod = '',
  openField = 'Open',
  closeField = 'Close',
  lowField = 'Low',
  highField = 'High',
  chartTitle = '',
  chartSubtitle = '',
  xAxisLabel = '',
  yAxisLabel = '',
  y2AxisLabel = '',
  interactions = {
    enableTooltip: true,
    tooltipTrigger: 'axis',
    axisPointerType: 'cross',
    enableZoom: true,
    enableMouseHover: true,
    enableLegend: true,
    showGridLines: true,
    enableAreaShading: false,
  },
  className = '',
}) {
  const containerRef = useRef(null);
  const chartInstanceRef = useRef(null);

  useEffect(() => {
    if (!containerRef.current) return;

    // Initialize chart instance with dark theme
    if (!chartInstanceRef.current) {
      chartInstanceRef.current = echarts.init(containerRef.current, 'dark');
    }

    const chart = chartInstanceRef.current;
    chart.clear();

    if (!data || data.length === 0) {
      chart.setOption({
        title: {
          text: 'No data selected for visualization',
          left: 'center',
          top: 'center',
          textStyle: { color: '#64748b', fontSize: 14, fontFamily: 'Space Grotesk' },
        },
      });
      return;
    }

    const effectiveRowKey = rowHeadingColumn || (columns && columns.find((c) => columnTypes[c] === 'string')) || (columns && columns[0]) || '';
    const isRowMode = primaryMetricType === 'row' || secondaryMetricType === 'row' || xField === '__periods__';

    // 1. Apply Period / Date Timeline Slicing to dataset
    let filteredData = filterDataByPeriod(data, xField, periodFilter);

    // 2. Establish Effective Multi-Metric Array (seamless backward compatibility)
    let effectiveYFields = Array.isArray(yFields) && yFields.length > 0
      ? [...yFields]
      : [yField, y2Field].filter(Boolean);

    if (effectiveYFields.length === 0 && columns.length > 1) {
      const fallbackMetric = columns.find((c) => c !== xField && c !== effectiveRowKey) || columns[1];
      effectiveYFields = [fallbackMetric];
    }

    // 3. Extract X-Axis Data Points (with estimate tagging if enabled)
    const xData = filteredData.map((d) => {
      const raw = String(d[xField] ?? '');
      return tagEstimates !== false ? formatPeriodLabel(raw, true) : raw;
    });

    // Helper to extract series values for any given metric name
    const getMetricSeriesData = (metricKey) => {
      if (isRowMode && primaryMetricType === 'row') {
        const pRow = filteredData.find(
          (r) => String(r[effectiveRowKey]).trim().toLowerCase() === String(metricKey).trim().toLowerCase()
        ) || {};
        return filteredData.map((d) => Number(pRow[d[xField]]) || 0);
      }
      return filteredData.map((d) => Number(d[metricKey]) || 0);
    };

    const primaryData = getMetricSeriesData(effectiveYFields[0] || yField);
    const secondaryData = effectiveYFields[1] ? getMetricSeriesData(effectiveYFields[1]) : [];

    // Tooltip configuration
    let tooltip = { trigger: 'item' };
    if (interactions.enableTooltip) {
      tooltip = {
        trigger: chartType === 'scatter' ? 'item' : (interactions.tooltipTrigger || 'axis'),
        axisPointer: {
          type: interactions.axisPointerType || 'cross',
          crossStyle: { color: '#1364e2', width: 1 },
          shadowStyle: { color: 'rgba(19, 100, 226, 0.08)' },
          lineStyle: { color: '#00c4cc', width: 1.5 },
        },
        backgroundColor: 'rgba(12, 18, 36, 0.95)',
        borderColor: 'rgba(19, 100, 226, 0.6)',
        borderWidth: 1,
        padding: [10, 14],
        textStyle: { color: '#f8fafc', fontSize: 12, fontFamily: 'JetBrains Mono' },
        formatter: (params) => {
          if (!params) return '';
          const items = Array.isArray(params) ? params : [params];
          if (items.length === 0) return '';
          const axisVal = items[0].axisValueLabel || items[0].name || '';
          const isEst = isEstimatePeriod(axisVal);
          let html = `<div style="font-weight:600;margin-bottom:6px;display:flex;align-items:center;gap:6px;">
            <span>${axisVal}</span>
            ${isEst ? '<span style="font-size:10px;padding:1px 6px;border-radius:4px;background:rgba(0,196,204,0.18);color:#00c4cc;border:1px solid rgba(0,196,204,0.35);font-weight:normal;">Forward Estimate (E)</span>' : ''}
          </div>`;
          items.forEach((item) => {
            const val = Array.isArray(item.value) ? item.value[1] ?? item.value[0] : item.value;
            const formattedVal = typeof val === 'number' ? Number(val).toLocaleString(undefined, { maximumFractionDigits: 2 }) : val;
            html += `<div style="display:flex;justify-content:space-between;align-items:center;gap:16px;font-size:11px;margin-top:3px;">
              <span style="display:inline-flex;align-items:center;gap:6px;">
                <span style="width:8px;height:8px;border-radius:50%;background:${item.color};display:inline-block;"></span>
                <span style="color:#94a3b8;">${item.seriesName || ''}</span>
              </span>
              <strong style="color:#fff;font-family:'JetBrains Mono',monospace;">${formattedVal}</strong>
            </div>`;
          });
          return html;
        },
      };
    }

    // DataZoom (Mousehover zoom / bottom slider)
    const dataZoom = [];
    if (interactions.enableZoom) {
      dataZoom.push({
        type: 'slider',
        show: true,
        start: 0,
        end: 100,
        height: 22,
        bottom: 8,
        borderColor: '#1e293b',
        fillerColor: 'rgba(19, 100, 226, 0.15)',
        handleStyle: { color: '#1364e2' },
        textStyle: { color: '#94a3b8' },
      });
      dataZoom.push({
        type: 'inside',
        start: 0,
        end: 100,
      });
    }

    // Series generator supporting dynamic multi-metric arrays
    let series = [];
    const isCandle = chartType === 'candlestick';

    if (isCandle) {
      // Apache ECharts Candlestick expects array order: [open, close, lowest, highest]
      const candleData = filteredData.map((d) => [
        Number(d[openField]) || 0,
        Number(d[closeField]) || 0,
        Number(d[lowField]) || 0,
        Number(d[highField]) || 0,
      ]);

      series.push({
        name: chartTitle || 'Price Action',
        type: 'candlestick',
        data: candleData,
        itemStyle: {
          color: '#10b981',       // Bullish candle fill
          color0: '#ef4444',      // Bearish candle fill
          borderColor: '#10b981', // Bullish candle border
          borderColor0: '#ef4444' // Bearish candle border
        },
        emphasis: interactions.enableMouseHover ? {
          itemStyle: {
            shadowBlur: 10,
            shadowColor: 'rgba(16, 185, 129, 0.8)',
          },
        } : {},
      });

      // Add a 5-period moving average if enough data
      if (filteredData.length >= 5) {
        const ma5 = [];
        for (let i = 0; i < filteredData.length; i++) {
          if (i < 4) {
            ma5.push('-');
            continue;
          }
          let sum = 0;
          for (let j = 0; j < 5; j++) {
            sum += Number(filteredData[i - j][closeField]) || 0;
          }
          ma5.push(Number((sum / 5).toFixed(2)));
        }

        series.push({
          name: 'MA (5)',
          type: 'line',
          data: ma5,
          smooth: true,
          showSymbol: false,
          lineStyle: { width: 2, color: '#06b6d4', opacity: 0.8 },
        });
      }
    } else if (chartType === 'combo') {
      // Dynamic Multi-Bar & Line Combo: Each series can be independently configured as Bar (Left Axis) or Line (Right Axis)
      effectiveYFields.forEach((metric, idx) => {
        const color = FINANCIAL_PALETTE[idx % FINANCIAL_PALETTE.length];
        const config = seriesConfigs[metric] || (idx === 0 ? { type: 'bar', yAxisIndex: 0 } : { type: 'line', yAxisIndex: 1 });
        const sType = config.type || (idx === 0 ? 'bar' : 'line');
        const yAxisIdx = config.yAxisIndex !== undefined ? config.yAxisIndex : (sType === 'bar' ? 0 : 1);

        if (sType === 'bar') {
          series.push({
            name: metric,
            type: 'bar',
            yAxisIndex: yAxisIdx,
            data: getMetricSeriesData(metric),
            itemStyle: {
              color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
                { offset: 0, color },
                { offset: 1, color: color + '33' },
              ]),
              borderRadius: [4, 4, 0, 0],
            },
          });
        } else {
          series.push({
            name: metric,
            type: 'line',
            yAxisIndex: yAxisIdx,
            smooth: true,
            data: getMetricSeriesData(metric),
            itemStyle: { color },
            lineStyle: { width: 3, color },
            symbolSize: 6,
          });
        }
      });

      if (effectiveYFields.length === 1 && y2Field) {
        series.push({
          name: y2AxisLabel || y2Field,
          type: 'line',
          yAxisIndex: 1,
          smooth: true,
          data: secondaryData,
          itemStyle: { color: '#06b6d4' },
          lineStyle: { width: 3, color: '#06b6d4' },
          symbolSize: 6,
        });
      }
    } else if (chartType === 'dual-line') {
      // Dual-Axis Line: Metric 1 (Left Y-Axis) & Subsequent Metrics (Right Y-Axis)
      const leftMetric = effectiveYFields[0] || yField;
      series.push({
        name: yAxisLabel || leftMetric,
        type: 'line',
        yAxisIndex: 0,
        smooth: true,
        data: getMetricSeriesData(leftMetric),
        itemStyle: { color: FINANCIAL_PALETTE[0] },
        lineStyle: { width: 3, color: FINANCIAL_PALETTE[0] },
        symbolSize: 6,
      });

      const rightMetrics = effectiveYFields.slice(1);
      if (rightMetrics.length > 0) {
        rightMetrics.forEach((metric, idx) => {
          const color = FINANCIAL_PALETTE[(idx + 1) % FINANCIAL_PALETTE.length];
          series.push({
            name: metric,
            type: 'line',
            yAxisIndex: 1,
            smooth: true,
            data: getMetricSeriesData(metric),
            itemStyle: { color },
            lineStyle: { width: 3, color, type: 'dashed' },
            symbolSize: 6,
          });
        });
      } else if (y2Field) {
        series.push({
          name: y2AxisLabel || y2Field,
          type: 'line',
          yAxisIndex: 1,
          smooth: true,
          data: secondaryData,
          itemStyle: { color: '#06b6d4' },
          lineStyle: { width: 3, color: '#06b6d4', type: 'dashed' },
          symbolSize: 6,
        });
      }
    } else if (chartType === 'clustered-bar') {
      // Clustered Column: N bars side-by-side (Solves 3-bar Cash Flow!)
      effectiveYFields.forEach((metric, idx) => {
        const color = FINANCIAL_PALETTE[idx % FINANCIAL_PALETTE.length];
        series.push({
          name: metric,
          type: 'bar',
          barGap: '20%',
          data: getMetricSeriesData(metric),
          itemStyle: {
            color,
            borderRadius: [4, 4, 0, 0],
          },
        });
      });
    } else if (chartType === 'horizontal-clustered-bar') {
      // Horizontal Clustered Bar: N horizontal bars for each category
      effectiveYFields.forEach((metric, idx) => {
        const color = FINANCIAL_PALETTE[idx % FINANCIAL_PALETTE.length];
        series.push({
          name: metric,
          type: 'bar',
          barGap: '20%',
          data: getMetricSeriesData(metric),
          itemStyle: {
            color,
            borderRadius: [0, 4, 4, 0],
          },
        });
      });
    } else if (chartType === 'multi-line') {
      // Multi-Line Chart: N lines on shared scale + optional translucent area shading (Solves PBT vs Net Profit!)
      effectiveYFields.forEach((metric, idx) => {
        const color = FINANCIAL_PALETTE[idx % FINANCIAL_PALETTE.length];
        series.push({
          name: metric,
          type: 'line',
          smooth: true,
          data: getMetricSeriesData(metric),
          itemStyle: { color },
          lineStyle: { width: 3, color },
          symbolSize: 6,
          areaStyle: interactions.enableAreaShading ? {
            color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
              { offset: 0, color: color + '33' }, // ~20% opacity
              { offset: 1, color: color + '05' }, // ~2% opacity
            ]),
          } : undefined,
        });
      });
    } else if (chartType === 'stacked-bar') {
      // Stacked Column: N metrics stacked vertically
      effectiveYFields.forEach((metric, idx) => {
        const color = FINANCIAL_PALETTE[idx % FINANCIAL_PALETTE.length];
        series.push({
          name: metric,
          type: 'bar',
          stack: 'total',
          data: getMetricSeriesData(metric),
          itemStyle: {
            color,
            borderRadius: idx === effectiveYFields.length - 1 ? [4, 4, 0, 0] : [0, 0, 0, 0],
          },
        });
      });
    } else if (chartType === 'stacked-bar-100') {
      // 100% Stacked Bar: Proportional distribution across N metrics
      const allSeriesData = effectiveYFields.map((f) => getMetricSeriesData(f));
      const pointCount = xData.length;
      const normalizedData = effectiveYFields.map(() => []);

      for (let p = 0; p < pointCount; p++) {
        let sum = 0;
        for (let f = 0; f < effectiveYFields.length; f++) {
          sum += Math.abs(allSeriesData[f][p] || 0);
        }
        const safeSum = sum || 1;
        for (let f = 0; f < effectiveYFields.length; f++) {
          const val = Math.abs(allSeriesData[f][p] || 0);
          normalizedData[f].push(Number(((val / safeSum) * 100).toFixed(1)));
        }
      }

      effectiveYFields.forEach((metric, idx) => {
        const color = FINANCIAL_PALETTE[idx % FINANCIAL_PALETTE.length];
        series.push({
          name: metric,
          type: 'bar',
          stack: 'total',
          data: normalizedData[idx],
          itemStyle: {
            color,
            borderRadius: idx === effectiveYFields.length - 1 ? [4, 4, 0, 0] : [0, 0, 0, 0],
          },
        });
      });
    } else if (chartType === 'stacked-area') {
      // Stacked Area: Multi-layer composition across N metrics
      effectiveYFields.forEach((metric, idx) => {
        const color = FINANCIAL_PALETTE[idx % FINANCIAL_PALETTE.length];
        series.push({
          name: metric,
          type: 'line',
          stack: 'Total',
          smooth: true,
          data: getMetricSeriesData(metric),
          itemStyle: { color },
          lineStyle: { width: 2, color },
          areaStyle: {
            color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
              { offset: 0, color: color + '99' },
              { offset: 1, color: color + '0d' },
            ]),
          },
        });
      });
    } else if (chartType === 'waterfall') {
      // Financial Waterfall / Bridge Chart
      const baseValues = [];
      const stepValues = [];
      let runningTotal = 0;

      primaryData.forEach((val) => {
        if (val >= 0) {
          baseValues.push(Number(runningTotal.toFixed(2)));
          stepValues.push({
            value: Number(val.toFixed(2)),
            itemStyle: { color: '#10b981', borderRadius: [4, 4, 0, 0] },
          });
          runningTotal += val;
        } else {
          runningTotal += val;
          baseValues.push(Number(runningTotal.toFixed(2)));
          stepValues.push({
            value: Number(Math.abs(val).toFixed(2)),
            itemStyle: { color: '#ef4444', borderRadius: [0, 0, 4, 4] },
          });
        }
      });

      series.push({
        name: 'Helper Base',
        type: 'bar',
        stack: 'waterfall',
        silent: true,
        itemStyle: { borderColor: 'transparent', color: 'transparent' },
        data: baseValues,
      });

      series.push({
        name: yAxisLabel || effectiveYFields[0] || yField,
        type: 'bar',
        stack: 'waterfall',
        data: stepValues,
      });
    } else if (chartType === 'diverging-bar') {
      // Diverging Bar (+/- from 0) + Overlaid Trend Line
      const barData = primaryData.map((val) => ({
        value: val,
        itemStyle: {
          color: val >= 0 ? '#10b981' : '#ef4444',
          borderRadius: val >= 0 ? [4, 4, 0, 0] : [0, 0, 4, 4],
        },
      }));

      series.push({
        name: yAxisLabel || effectiveYFields[0] || yField,
        type: 'bar',
        data: barData,
      });

      const lineMetric = effectiveYFields[1] || y2Field || effectiveYFields[0] || yField;
      series.push({
        name: y2AxisLabel || lineMetric,
        type: 'line',
        smooth: true,
        data: secondaryData.length > 0 ? secondaryData : primaryData,
        itemStyle: { color: '#06b6d4' },
        lineStyle: { width: 2.5, color: '#06b6d4' },
      });
    } else if (chartType === 'line') {
      series.push({
        name: yAxisLabel || effectiveYFields[0] || yField,
        type: 'line',
        smooth: true,
        data: primaryData,
        itemStyle: { color: '#06b6d4' },
        lineStyle: { width: 3 },
        symbolSize: 6,
        emphasis: interactions.enableMouseHover ? {
          focus: 'series',
          itemStyle: { shadowBlur: 12, shadowColor: '#06b6d4' },
        } : {},
      });
    } else if (chartType === 'bar') {
      series.push({
        name: yAxisLabel || effectiveYFields[0] || yField,
        type: 'bar',
        data: primaryData,
        itemStyle: {
          color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
            { offset: 0, color: '#1364e2' },
            { offset: 1, color: 'rgba(19, 100, 226, 0.15)' },
          ]),
          borderRadius: [5, 5, 0, 0],
        },
        emphasis: interactions.enableMouseHover ? {
          focus: 'series',
          itemStyle: { color: '#2563eb' },
        } : {},
      });
    } else if (chartType === 'area') {
      series.push({
        name: yAxisLabel || effectiveYFields[0] || yField,
        type: 'line',
        smooth: true,
        data: primaryData,
        itemStyle: { color: '#8b5cf6' },
        lineStyle: { width: 2.5, color: '#8b5cf6' },
        areaStyle: {
          color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
            { offset: 0, color: 'rgba(139, 92, 246, 0.55)' },
            { offset: 1, color: 'rgba(139, 92, 246, 0.02)' },
          ]),
        },
      });
    } else if (chartType === 'scatter') {
      series.push({
        name: yAxisLabel || effectiveYFields[0] || yField,
        type: 'scatter',
        symbolSize: 10,
        data: filteredData.map((d) => [Number(d[xField]) || 0, Number(d[effectiveYFields[0] || yField]) || 0]),
        itemStyle: { color: '#f59e0b' },
      });
    } else if (chartType === 'pie') {
      if (breakdownMode === 'composition') {
        // Mode B: Period Composition (e.g. Depreciation, Interest, Tax for a selected period)
        const targetPeriod = compositionPeriod || (xData.length > 0 ? xData[xData.length - 1] : '');
        const periodRow = filteredData.find((d) => String(d[xField] ?? '') === String(targetPeriod)) || filteredData[filteredData.length - 1] || {};

        const pieData = effectiveYFields.map((field) => ({
          name: field,
          value: Number(periodRow[field]) || 0,
        }));

        series.push({
          name: chartTitle || targetPeriod || 'Composition',
          type: 'pie',
          radius: ['35%', '70%'],
          avoidLabelOverlap: true,
          itemStyle: {
            borderRadius: 8,
            borderColor: '#111827',
            borderWidth: 2,
          },
          color: FINANCIAL_PALETTE,
          label: {
            show: true,
            formatter: '{b}: {c} ({d}%)',
            color: '#94a3b8',
          },
          data: pieData,
        });
      } else {
        // Mode A: Timeline Distribution (e.g. OPM % across all periods)
        const primaryMetric = effectiveYFields[0] || yField;
        const metricVals = getMetricSeriesData(primaryMetric);
        const pieData = xData.map((periodLabel, i) => ({
          name: String(periodLabel),
          value: Number(metricVals[i]) || 0,
        }));

        series.push({
          name: chartTitle || primaryMetric,
          type: 'pie',
          radius: ['35%', '70%'],
          avoidLabelOverlap: true,
          itemStyle: {
            borderRadius: 8,
            borderColor: '#111827',
            borderWidth: 2,
          },
          color: FINANCIAL_PALETTE,
          label: {
            show: true,
            formatter: '{b}: {d}%',
            color: '#94a3b8',
          },
          data: pieData,
        });
      }
    }

    const isCartesian = chartType !== 'pie';
    const isDualAxis = ['combo', 'dual-line'].includes(chartType) || series.some((s) => s.yAxisIndex === 1);
    const isHorizontalBar = chartType === 'horizontal-clustered-bar';
    const isScatter = chartType === 'scatter';

    let yAxisConfig;
    if (isHorizontalBar) {
      // Horizontal Clustered Bar: Y-Axis is Categories / Entities
      yAxisConfig = {
        type: 'category',
        data: xData,
        name: yAxisLabel || 'Category',
        nameTextStyle: { color: '#64748b', fontSize: 11 },
        axisLine: { lineStyle: { color: '#334155' } },
        axisLabel: { color: '#94a3b8', fontSize: 11 },
        splitLine: { show: false },
      };
    } else if (isDualAxis) {
      const rightSeries = series.filter((s) => s.yAxisIndex === 1);
      const rightNames = rightSeries.map((s) => s.name).join(' / ');
      const isPercentageAxis = rightSeries.some((s) => /%|margin|ratio|rate/i.test(s.name));

      yAxisConfig = [
        {
          type: 'value',
          scale: true,
          name: yAxisLabel || (series.find((s) => s.yAxisIndex === 0)?.name) || yField || 'Primary',
          position: 'left',
          nameTextStyle: { color: '#1364e2', fontSize: 11, padding: [0, 0, 4, 0] },
          axisLine: { show: true, lineStyle: { color: '#1364e2' } },
          axisLabel: { color: '#94a3b8', fontSize: 11 },
          splitLine: {
            show: interactions.showGridLines !== false,
            lineStyle: { color: 'rgba(255, 255, 255, 0.05)' },
          },
        },
        {
          type: 'value',
          scale: true,
          name: y2AxisLabel || rightNames || y2Field || 'Secondary Metric',
          position: 'right',
          nameTextStyle: { color: '#f54e8b', fontSize: 11, padding: [0, 0, 4, 0] },
          axisLine: { show: true, lineStyle: { color: '#f54e8b' } },
          axisLabel: {
            color: '#94a3b8',
            fontSize: 11,
            formatter: isPercentageAxis ? '{value}%' : '{value}',
          },
          splitLine: { show: false },
        },
      ];
    } else if (chartType === 'stacked-bar-100') {
      yAxisConfig = {
        type: 'value',
        min: 0,
        max: 100,
        name: '% of Total',
        axisLabel: { formatter: '{value}%', color: '#94a3b8', fontSize: 11 },
        splitLine: {
          show: interactions.showGridLines !== false,
          lineStyle: { color: 'rgba(255, 255, 255, 0.05)' },
        },
      };
    } else {
      yAxisConfig = {
        type: 'value',
        scale: true,
        name: yAxisLabel || yField,
        nameTextStyle: { color: '#64748b', fontSize: 11 },
        axisLine: { lineStyle: { color: '#334155' } },
        axisLabel: { color: '#94a3b8', fontSize: 11 },
        splitLine: {
          show: interactions.showGridLines !== false,
          lineStyle: { color: 'rgba(255, 255, 255, 0.05)' },
        },
      };
    }

    const hasCustomXLabel = Boolean(
      xAxisLabel && !/^(period|fiscal\s*period|date|timeline|timeline\s*\/\s*dimension)$/i.test(xAxisLabel.trim())
    );

    let xAxisConfig;
    if (isCartesian) {
      if (isHorizontalBar) {
        // Horizontal Clustered Bar: X-Axis is Numerical Values
        xAxisConfig = {
          type: 'value',
          scale: true,
          name: hasCustomXLabel ? xAxisLabel : (yField || 'Value'),
          nameLocation: 'middle',
          nameGap: 30,
          nameTextStyle: { color: '#94a3b8', fontSize: 11, fontWeight: 500 },
          axisLine: { lineStyle: { color: '#334155' } },
          axisLabel: { color: '#94a3b8', fontSize: 11 },
          splitLine: {
            show: interactions.showGridLines !== false,
            lineStyle: { color: 'rgba(255, 255, 255, 0.04)' },
          },
        };
      } else if (isScatter) {
        // Scatter Plot: X-Axis is Independent Numerical Variable
        xAxisConfig = {
          type: 'value',
          scale: true,
          name: hasCustomXLabel ? xAxisLabel : (xField || 'X-Axis'),
          nameLocation: 'middle',
          nameGap: 30,
          nameTextStyle: { color: '#94a3b8', fontSize: 11, fontWeight: 500 },
          axisLine: { lineStyle: { color: '#334155' } },
          axisLabel: { color: '#94a3b8', fontSize: 11 },
          splitLine: {
            show: interactions.showGridLines !== false,
            lineStyle: { color: 'rgba(255, 255, 255, 0.04)' },
          },
        };
      } else {
        xAxisConfig = {
          type: 'category',
          data: xData,
          name: hasCustomXLabel ? xAxisLabel : '',
          nameLocation: 'middle',
          nameGap: 36,
          nameTextStyle: { color: '#94a3b8', fontSize: 11, fontWeight: 500 },
          axisLine: { lineStyle: { color: '#334155' } },
          axisLabel: {
            color: (val) => (isEstimatePeriod(val) ? '#00c4cc' : '#94a3b8'),
            fontSize: 11,
          },
          splitLine: {
            show: interactions.showGridLines !== false,
            lineStyle: { color: 'rgba(255, 255, 255, 0.04)' },
          },
        };
      }
    }

    const option = {
      backgroundColor: 'transparent',
      title: {
        text: chartTitle,
        subtext: chartSubtitle,
        left: 'left',
        top: 0,
        textStyle: {
          color: '#f1f5f9',
          fontSize: 16,
          fontWeight: 600,
          fontFamily: 'Outfit, Space Grotesk',
        },
        subtextStyle: { color: '#94a3b8', fontSize: 11 },
      },
      tooltip,
      legend: {
        show: interactions.enableLegend !== false,
        top: 6,
        right: 16,
        textStyle: { color: '#94a3b8', fontSize: 12, fontFamily: 'Space Grotesk' },
        itemGap: 16,
      },
      grid: isCartesian
        ? {
            left: '4%',
            right: isDualAxis ? '6%' : '4%',
            top: chartTitle ? 72 : 45,
            bottom: interactions.enableZoom ? 54 : hasCustomXLabel ? 58 : 36,
            containLabel: true,
          }
        : undefined,
      xAxis: isCartesian ? xAxisConfig : undefined,
      yAxis: isCartesian ? yAxisConfig : undefined,
      dataZoom: isCartesian ? dataZoom : [],
      series,
    };

    chart.setOption(option);

    const handleResize = () => {
      chart.resize();
    };
    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('resize', handleResize);
    };
  }, [
    chartType,
    data,
    columns,
    columnTypes,
    rowHeadingColumn,
    primaryMetricType,
    secondaryMetricType,
    xField,
    yField,
    y2Field,
    yFields,
    periodFilter,
    tagEstimates,
    breakdownMode,
    compositionPeriod,
    openField,
    closeField,
    lowField,
    highField,
    chartTitle,
    chartSubtitle,
    xAxisLabel,
    yAxisLabel,
    y2AxisLabel,
    interactions,
  ]);

  return (
    <div
      ref={containerRef}
      className={`w-full h-full min-h-[380px] ${className}`}
    />
  );
}
