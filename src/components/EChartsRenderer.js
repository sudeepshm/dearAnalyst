'use client';

import React, { useEffect, useRef } from 'react';
import * as echarts from 'echarts';
import { filterDataByPeriod, formatPeriodLabel, isEstimatePeriod } from '../utils/periodHelpers';

const FINANCIAL_PALETTE = [
  '#3b82f6', // Electric Blue        — primary metric / revenue
  '#f43f5e', // Vivid Rose           — operating profit / highlight
  '#a78bfa', // Soft Violet          — net profit / PAT
  '#22d3ee', // Electric Cyan        — margin / cash flow
  '#fbbf24', // Solar Amber          — cost structure / ratio
  '#34d399', // Neon Mint            — growth / yield
  '#818cf8', // Indigo Glow          — secondary metric
  '#fb923c', // Neon Orange          — opex / capex
  '#38bdf8', // Ice Blue             — secondary line
  '#e879f9', // Vivid Fuchsia        — highlight outlier
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
        backgroundColor: 'transparent',
        title: {
          text: 'No data — select columns to visualize',
          left: 'center',
          top: 'center',
          textStyle: { color: '#3b5a8a', fontSize: 14, fontFamily: 'JetBrains Mono' },
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
          crossStyle: { color: '#3b82f6', width: 1 },
          shadowStyle: { color: 'rgba(59, 130, 246, 0.10)' },
          lineStyle: { color: '#22d3ee', width: 1.5, type: 'dashed' },
        },
        backgroundColor: 'rgba(5, 5, 8, 0.96)',
        borderColor: 'rgba(255, 255, 255, 0.18)',
        borderWidth: 1,
        padding: [10, 14],
        textStyle: { color: '#ffffff', fontSize: 12, fontFamily: 'JetBrains Mono' },
        formatter: (params) => {
          if (!params) return '';
          const items = Array.isArray(params) ? params : [params];
          if (items.length === 0) return '';
          const axisVal = items[0].axisValueLabel || items[0].name || '';
          const isEst = isEstimatePeriod(axisVal);
          let html = `<div style="font-weight:700;color:#ffffff;margin-bottom:6px;display:flex;align-items:center;gap:6px;">
            <span>${axisVal}</span>
            ${isEst ? '<span style="font-size:10px;padding:1px 6px;border-radius:4px;background:rgba(34,211,238,0.20);color:#38bdf8;border:1px solid rgba(56,189,248,0.40);font-weight:normal;">Estimate (E)</span>' : ''}
          </div>`;
          items.forEach((item) => {
            const val = Array.isArray(item.value) ? item.value[1] ?? item.value[0] : item.value;
            const formattedVal = typeof val === 'number' ? Number(val).toLocaleString(undefined, { maximumFractionDigits: 2 }) : val;
            html += `<div style="display:flex;justify-content:space-between;align-items:center;gap:16px;font-size:11px;margin-top:3px;">
              <span style="display:inline-flex;align-items:center;gap:6px;">
                <span style="width:8px;height:8px;border-radius:50%;background:${item.color};display:inline-block;"></span>
                <span style="color:#cbd5e1;">${item.seriesName || ''}</span>
              </span>
              <strong style="color:#ffffff;font-family:'JetBrains Mono',monospace;">${formattedVal}</strong>
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
        backgroundColor: 'rgba(2, 11, 28, 0.5)',
        borderColor: '#0f2d5c',
        fillerColor: 'rgba(59, 130, 246, 0.18)',
        handleStyle: { color: '#3b82f6', borderColor: '#60a5fa' },
        moveHandleStyle: { color: '#3b82f6' },
        textStyle: { color: '#4d6a90', fontFamily: 'JetBrains Mono' },
        dataBackground: {
          lineStyle: { color: '#1e3a6e', width: 1 },
          areaStyle: { color: 'rgba(59, 130, 246, 0.06)' },
        },
        selectedDataBackground: {
          lineStyle: { color: '#3b82f6' },
          areaStyle: { color: 'rgba(59, 130, 246, 0.15)' },
        },
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
          color: '#34d399',        // Bullish — electric mint
          color0: '#f43f5e',       // Bearish — vivid rose
          borderColor: '#34d399',
          borderColor0: '#f43f5e',
        },
        emphasis: interactions.enableMouseHover ? {
          itemStyle: {
            shadowBlur: 14,
            shadowColor: 'rgba(52, 211, 153, 0.7)',
          },
        } : {},
      });

      // MA line — ice blue
      if (filteredData.length >= 5) {
        const ma5 = [];
        for (let i = 0; i < filteredData.length; i++) {
          if (i < 4) { ma5.push('-'); continue; }
          let sum = 0;
          for (let j = 0; j < 5; j++) sum += Number(filteredData[i - j][closeField]) || 0;
          ma5.push(Number((sum / 5).toFixed(2)));
        }
        series.push({
          name: 'MA (5)',
          type: 'line',
          data: ma5,
          smooth: true,
          showSymbol: false,
          lineStyle: { width: 2, color: '#38bdf8', opacity: 0.85 },
          itemStyle: { color: '#38bdf8' },
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
        areaStyle: {
          color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
            { offset: 0, color: FINANCIAL_PALETTE[0] + '30' },
            { offset: 1, color: FINANCIAL_PALETTE[0] + '05' },
          ]),
        },
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
          itemStyle: { color: '#22d3ee' },
          lineStyle: { width: 3, color: '#22d3ee', type: 'dashed' },
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
      const baseValues = [];
      const stepValues = [];
      let runningTotal = 0;

      primaryData.forEach((val) => {
        if (val >= 0) {
          baseValues.push(Number(runningTotal.toFixed(2)));
          stepValues.push({
            value: Number(val.toFixed(2)),
            itemStyle: { color: '#34d399', borderRadius: [4, 4, 0, 0] },
          });
          runningTotal += val;
        } else {
          runningTotal += val;
          baseValues.push(Number(runningTotal.toFixed(2)));
          stepValues.push({
            value: Number(Math.abs(val).toFixed(2)),
            itemStyle: { color: '#f43f5e', borderRadius: [0, 0, 4, 4] },
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
      const barData = primaryData.map((val) => ({
        value: val,
        itemStyle: {
          color: val >= 0 ? '#34d399' : '#f43f5e',
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
        itemStyle: { color: '#22d3ee' },
        lineStyle: { width: 2.5, color: '#22d3ee' },
      });
    } else if (chartType === 'line') {
      series.push({
        name: yAxisLabel || effectiveYFields[0] || yField,
        type: 'line',
        smooth: true,
        data: primaryData,
        itemStyle: { color: '#22d3ee' },
        lineStyle: { width: 3, color: '#22d3ee' },
        symbolSize: 6,
        areaStyle: {
          color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
            { offset: 0, color: 'rgba(34, 211, 238, 0.25)' },
            { offset: 1, color: 'rgba(34, 211, 238, 0.01)' },
          ]),
        },
        emphasis: interactions.enableMouseHover ? {
          focus: 'series',
          itemStyle: { shadowBlur: 14, shadowColor: 'rgba(34, 211, 238, 0.7)' },
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
        itemStyle: { color: '#a78bfa' },
        lineStyle: { width: 2.5, color: '#a78bfa' },
        areaStyle: {
          color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
            { offset: 0, color: 'rgba(167, 139, 250, 0.55)' },
            { offset: 1, color: 'rgba(167, 139, 250, 0.02)' },
          ]),
        },
      });
    } else if (chartType === 'scatter') {
      series.push({
        name: yAxisLabel || effectiveYFields[0] || yField,
        type: 'scatter',
        symbolSize: 11,
        data: filteredData.map((d) => [Number(d[xField]) || 0, Number(d[effectiveYFields[0] || yField]) || 0]),
        itemStyle: {
          color: '#fbbf24',
          shadowBlur: 8,
          shadowColor: 'rgba(251, 191, 36, 0.5)',
        },
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
          radius: ['38%', '72%'],
          avoidLabelOverlap: true,
          itemStyle: {
            borderRadius: 8,
            borderColor: '#020b18',
            borderWidth: 2,
          },
          color: FINANCIAL_PALETTE,
          label: {
            show: true,
            formatter: '{b}: {c} ({d}%)',
            color: '#7094c0',
            fontSize: 11,
          },
          data: pieData,
        });
      } else {
        const primaryMetric = effectiveYFields[0] || yField;
        const metricVals = getMetricSeriesData(primaryMetric);
        const pieData = xData.map((periodLabel, i) => ({
          name: String(periodLabel),
          value: Number(metricVals[i]) || 0,
        }));

        series.push({
          name: chartTitle || primaryMetric,
          type: 'pie',
          radius: ['38%', '72%'],
          avoidLabelOverlap: true,
          itemStyle: {
            borderRadius: 8,
            borderColor: '#020b18',
            borderWidth: 2,
          },
          color: FINANCIAL_PALETTE,
          label: {
            show: true,
            formatter: '{b}: {d}%',
            color: '#7094c0',
            fontSize: 11,
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
      yAxisConfig = {
        type: 'category',
        data: xData,
        name: yAxisLabel || 'Category',
        nameTextStyle: { color: '#ffffff', fontSize: 11, fontWeight: 600 },
        axisLine: { lineStyle: { color: 'rgba(255, 255, 255, 0.20)' } },
        axisLabel: { color: '#cbd5e1', fontSize: 11 },
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
          nameTextStyle: { color: '#38bdf8', fontSize: 11, fontWeight: 600, padding: [0, 0, 4, 0] },
          axisLine: { show: true, lineStyle: { color: '#38bdf8' } },
          axisLabel: { color: '#cbd5e1', fontSize: 11 },
          splitLine: {
            show: interactions.showGridLines !== false,
            lineStyle: { color: 'rgba(255, 255, 255, 0.08)', type: 'dashed' },
          },
        },
        {
          type: 'value',
          scale: true,
          name: y2AxisLabel || rightNames || y2Field || 'Secondary Metric',
          position: 'right',
          nameTextStyle: { color: '#f43f5e', fontSize: 11, fontWeight: 600, padding: [0, 0, 4, 0] },
          axisLine: { show: true, lineStyle: { color: '#f43f5e' } },
          axisLabel: {
            color: '#cbd5e1',
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
        nameTextStyle: { color: '#ffffff', fontSize: 11, fontWeight: 600 },
        axisLabel: { formatter: '{value}%', color: '#cbd5e1', fontSize: 11 },
        splitLine: {
          show: interactions.showGridLines !== false,
          lineStyle: { color: 'rgba(255, 255, 255, 0.08)', type: 'dashed' },
        },
      };
    } else {
      yAxisConfig = {
        type: 'value',
        scale: true,
        name: yAxisLabel || yField,
        nameTextStyle: { color: '#ffffff', fontSize: 11, fontWeight: 600 },
        axisLine: { lineStyle: { color: 'rgba(255, 255, 255, 0.20)' } },
        axisLabel: { color: '#cbd5e1', fontSize: 11 },
        splitLine: {
          show: interactions.showGridLines !== false,
          lineStyle: { color: 'rgba(255, 255, 255, 0.08)', type: 'dashed' },
        },
      };
    }

    const hasCustomXLabel = Boolean(
      xAxisLabel && !/^(period|fiscal\s*period|date|timeline|timeline\s*\/\s*dimension)$/i.test(xAxisLabel.trim())
    );

    let xAxisConfig;
    if (isCartesian) {
      if (isHorizontalBar) {
        xAxisConfig = {
          type: 'value',
          scale: true,
          name: hasCustomXLabel ? xAxisLabel : (yField || 'Value'),
          nameLocation: 'middle',
          nameGap: 30,
          nameTextStyle: { color: '#ffffff', fontSize: 11, fontWeight: 600 },
          axisLine: { lineStyle: { color: 'rgba(255, 255, 255, 0.20)' } },
          axisLabel: { color: '#cbd5e1', fontSize: 11 },
          splitLine: {
            show: interactions.showGridLines !== false,
            lineStyle: { color: 'rgba(255, 255, 255, 0.07)', type: 'dashed' },
          },
        };
      } else if (isScatter) {
        xAxisConfig = {
          type: 'value',
          scale: true,
          name: hasCustomXLabel ? xAxisLabel : (xField || 'X-Axis'),
          nameLocation: 'middle',
          nameGap: 30,
          nameTextStyle: { color: '#ffffff', fontSize: 11, fontWeight: 600 },
          axisLine: { lineStyle: { color: 'rgba(255, 255, 255, 0.20)' } },
          axisLabel: { color: '#cbd5e1', fontSize: 11 },
          splitLine: {
            show: interactions.showGridLines !== false,
            lineStyle: { color: 'rgba(255, 255, 255, 0.07)', type: 'dashed' },
          },
        };
      } else {
        xAxisConfig = {
          type: 'category',
          data: xData,
          name: hasCustomXLabel ? xAxisLabel : '',
          nameLocation: 'middle',
          nameGap: 36,
          nameTextStyle: { color: '#ffffff', fontSize: 11, fontWeight: 600 },
          axisLine: { lineStyle: { color: 'rgba(255, 255, 255, 0.20)' } },
          axisLabel: {
            color: (val) => (isEstimatePeriod(val) ? '#38bdf8' : '#cbd5e1'),
            fontSize: 11,
          },
          splitLine: {
            show: interactions.showGridLines !== false,
            lineStyle: { color: 'rgba(255, 255, 255, 0.06)', type: 'dashed' },
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
          color: '#ffffff',
          fontSize: 15,
          fontWeight: 700,
          fontFamily: 'Geist, Outfit, sans-serif',
        },
        subtextStyle: { color: '#94a3b8', fontSize: 11, fontFamily: 'JetBrains Mono' },
      },
      tooltip,
      legend: {
        show: interactions.enableLegend !== false,
        top: 6,
        right: 16,
        textStyle: { color: '#f1f5f9', fontSize: 11, fontFamily: 'JetBrains Mono' },
        itemGap: 16,
        icon: 'roundRect',
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
