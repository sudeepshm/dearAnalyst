'use client';

import React, { useEffect, useRef } from 'react';
import * as echarts from 'echarts';

export default function EChartsRenderer({
  chartType = 'candlestick',
  data = [],
  xField = 'Date',
  yField = 'Close',
  y2Field = '',
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

    const xData = data.map((d) => d[xField] ?? '');

    // Tooltip configuration
    let tooltip = { trigger: 'item' };
    if (interactions.enableTooltip) {
      tooltip = {
        trigger: interactions.tooltipTrigger || 'axis',
        axisPointer: {
          type: interactions.axisPointerType || 'cross',
          crossStyle: { color: '#10b981', width: 1 },
          shadowStyle: { color: 'rgba(16, 185, 129, 0.08)' },
          lineStyle: { color: '#06b6d4', width: 1.5 },
        },
        backgroundColor: 'rgba(15, 23, 42, 0.95)',
        borderColor: '#10b981',
        borderWidth: 1,
        padding: [10, 14],
        textStyle: { color: '#f8fafc', fontSize: 12, fontFamily: 'JetBrains Mono' },
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
        borderColor: '#334155',
        fillerColor: 'rgba(16, 185, 129, 0.15)',
        handleStyle: { color: '#10b981' },
        textStyle: { color: '#94a3b8' },
      });
      dataZoom.push({
        type: 'inside',
        start: 0,
        end: 100,
      });
    }

    // Series generator
    let series = [];
    const isCandle = chartType === 'candlestick';

    if (isCandle) {
      // Apache ECharts Candlestick expects array order: [open, close, lowest, highest]
      const candleData = data.map((d) => [
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
      if (data.length >= 5) {
        const ma5 = [];
        for (let i = 0; i < data.length; i++) {
          if (i < 4) {
            ma5.push('-');
            continue;
          }
          let sum = 0;
          for (let j = 0; j < 5; j++) {
            sum += Number(data[i - j][closeField]) || 0;
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
      // Dual-Axis Combo: Bar (Left Y-Axis) & Line (Right Y-Axis)
      const primaryData = data.map((d) => Number(d[yField]) || 0);
      series.push({
        name: yAxisLabel || yField,
        type: 'bar',
        yAxisIndex: 0,
        data: primaryData,
        itemStyle: {
          color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
            { offset: 0, color: '#10b981' },
            { offset: 1, color: 'rgba(16, 185, 129, 0.2)' },
          ]),
          borderRadius: [4, 4, 0, 0],
        },
      });

      const secondaryMetric = y2Field || (data[0]?.Volume !== undefined ? 'Volume' : yField);
      const secondaryData = data.map((d) => Number(d[secondaryMetric]) || 0);
      series.push({
        name: y2AxisLabel || secondaryMetric,
        type: 'line',
        yAxisIndex: 1,
        smooth: true,
        data: secondaryData,
        itemStyle: { color: '#06b6d4' },
        lineStyle: { width: 3, color: '#06b6d4' },
        symbolSize: 6,
      });
    } else if (chartType === 'dual-line') {
      // Dual-Axis Line: Line 1 (Left Y-Axis) & Line 2 (Right Y-Axis)
      series.push({
        name: yAxisLabel || yField,
        type: 'line',
        yAxisIndex: 0,
        smooth: true,
        data: data.map((d) => Number(d[yField]) || 0),
        itemStyle: { color: '#10b981' },
        lineStyle: { width: 3, color: '#10b981' },
        symbolSize: 6,
      });

      const secondaryMetric = y2Field || yField;
      series.push({
        name: y2AxisLabel || secondaryMetric,
        type: 'line',
        yAxisIndex: 1,
        smooth: true,
        data: data.map((d) => Number(d[secondaryMetric]) || 0),
        itemStyle: { color: '#06b6d4' },
        lineStyle: { width: 3, color: '#06b6d4', type: 'dashed' },
        symbolSize: 6,
      });
    } else if (chartType === 'clustered-bar') {
      // Clustered Column: Primary Bar & Comparison Bar side-by-side
      series.push({
        name: yAxisLabel || yField,
        type: 'bar',
        barGap: '20%',
        data: data.map((d) => Number(d[yField]) || 0),
        itemStyle: {
          color: '#10b981',
          borderRadius: [4, 4, 0, 0],
        },
      });

      if (y2Field) {
        series.push({
          name: y2AxisLabel || y2Field,
          type: 'bar',
          data: data.map((d) => Number(d[y2Field]) || 0),
          itemStyle: {
            color: '#8b5cf6',
            borderRadius: [4, 4, 0, 0],
          },
        });
      }
    } else if (chartType === 'stacked-bar') {
      // Stacked Column: Cumulative vertical bars
      series.push({
        name: yAxisLabel || yField,
        type: 'bar',
        stack: 'total',
        data: data.map((d) => Number(d[yField]) || 0),
        itemStyle: { color: '#10b981' },
      });

      if (y2Field) {
        series.push({
          name: y2AxisLabel || y2Field,
          type: 'bar',
          stack: 'total',
          data: data.map((d) => Number(d[y2Field]) || 0),
          itemStyle: {
            color: '#06b6d4',
            borderRadius: [4, 4, 0, 0],
          },
        });
      }
    } else if (chartType === 'stacked-bar-100') {
      // 100% Stacked Bar: Proportional distribution
      const pData1 = [];
      const pData2 = [];
      data.forEach((d) => {
        const v1 = Math.abs(Number(d[yField]) || 0);
        const v2 = Math.abs(Number(d[y2Field || yField]) || (v1 * 0.4));
        const total = (v1 + v2) || 1;
        pData1.push(Number(((v1 / total) * 100).toFixed(1)));
        pData2.push(Number(((v2 / total) * 100).toFixed(1)));
      });

      series.push({
        name: yAxisLabel || yField,
        type: 'bar',
        stack: 'total',
        data: pData1,
        itemStyle: { color: '#10b981' },
      });

      series.push({
        name: y2AxisLabel || y2Field || 'Proportion B',
        type: 'bar',
        stack: 'total',
        data: pData2,
        itemStyle: { color: '#f59e0b', borderRadius: [4, 4, 0, 0] },
      });
    } else if (chartType === 'stacked-area') {
      // Stacked Area: Multi-layer composition
      series.push({
        name: yAxisLabel || yField,
        type: 'line',
        stack: 'Total',
        smooth: true,
        data: data.map((d) => Number(d[yField]) || 0),
        itemStyle: { color: '#10b981' },
        lineStyle: { width: 2, color: '#10b981' },
        areaStyle: {
          color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
            { offset: 0, color: 'rgba(16, 185, 129, 0.6)' },
            { offset: 1, color: 'rgba(16, 185, 129, 0.05)' },
          ]),
        },
      });

      if (y2Field) {
        series.push({
          name: y2AxisLabel || y2Field,
          type: 'line',
          stack: 'Total',
          smooth: true,
          data: data.map((d) => Number(d[y2Field]) || 0),
          itemStyle: { color: '#8b5cf6' },
          lineStyle: { width: 2, color: '#8b5cf6' },
          areaStyle: {
            color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
              { offset: 0, color: 'rgba(139, 92, 246, 0.6)' },
              { offset: 1, color: 'rgba(139, 92, 246, 0.05)' },
            ]),
          },
        });
      }
    } else if (chartType === 'waterfall') {
      // Financial Waterfall / Bridge Chart
      const baseValues = [];
      const stepValues = [];
      let runningTotal = 0;

      data.forEach((d) => {
        const val = Number(d[yField]) || 0;
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
        name: yAxisLabel || yField,
        type: 'bar',
        stack: 'waterfall',
        data: stepValues,
      });
    } else if (chartType === 'diverging-bar') {
      // Diverging Bar (+/- from 0) + Overlaid Trend Line
      const barData = data.map((d) => {
        const val = Number(d[yField]) || 0;
        return {
          value: val,
          itemStyle: {
            color: val >= 0 ? '#10b981' : '#ef4444',
            borderRadius: val >= 0 ? [4, 4, 0, 0] : [0, 0, 4, 4],
          },
        };
      });

      series.push({
        name: yAxisLabel || yField,
        type: 'bar',
        data: barData,
      });

      const lineMetric = y2Field || yField;
      series.push({
        name: y2AxisLabel || lineMetric,
        type: 'line',
        smooth: true,
        data: data.map((d) => Number(d[lineMetric]) || 0),
        itemStyle: { color: '#06b6d4' },
        lineStyle: { width: 2.5, color: '#06b6d4' },
      });
    } else if (chartType === 'line') {
      series.push({
        name: yAxisLabel || yField,
        type: 'line',
        smooth: true,
        data: data.map((d) => Number(d[yField]) || 0),
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
        name: yAxisLabel || yField,
        type: 'bar',
        data: data.map((d) => Number(d[yField]) || 0),
        itemStyle: {
          color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
            { offset: 0, color: '#10b981' },
            { offset: 1, color: 'rgba(16, 185, 129, 0.15)' },
          ]),
          borderRadius: [5, 5, 0, 0],
        },
        emphasis: interactions.enableMouseHover ? {
          focus: 'series',
          itemStyle: { color: '#34d399' },
        } : {},
      });
    } else if (chartType === 'area') {
      series.push({
        name: yAxisLabel || yField,
        type: 'line',
        smooth: true,
        data: data.map((d) => Number(d[yField]) || 0),
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
        name: yAxisLabel || yField,
        type: 'scatter',
        symbolSize: 10,
        data: data.map((d) => [d[xField], Number(d[yField]) || 0]),
        itemStyle: { color: '#f59e0b' },
      });
    } else if (chartType === 'pie') {
      series.push({
        name: chartTitle || yField,
        type: 'pie',
        radius: ['35%', '70%'],
        avoidLabelOverlap: true,
        itemStyle: {
          borderRadius: 8,
          borderColor: '#111827',
          borderWidth: 2,
        },
        label: { show: true, color: '#94a3b8' },
        data: data.slice(0, 8).map((d) => ({
          name: String(d[xField] || 'Item'),
          value: Number(d[yField]) || 1,
        })),
      });
    }

    const isCartesian = chartType !== 'pie';
    const isDualAxis = ['combo', 'dual-line'].includes(chartType);

    const yAxisConfig = isDualAxis
      ? [
          {
            type: 'value',
            scale: true,
            name: yAxisLabel || yField,
            position: 'left',
            axisLine: { show: true, lineStyle: { color: '#10b981' } },
            axisLabel: { color: '#94a3b8', fontSize: 11 },
            splitLine: {
              show: interactions.showGridLines !== false,
              lineStyle: { color: 'rgba(255, 255, 255, 0.05)' },
            },
          },
          {
            type: 'value',
            scale: true,
            name: y2AxisLabel || y2Field || 'Secondary Metric',
            position: 'right',
            axisLine: { show: true, lineStyle: { color: '#06b6d4' } },
            axisLabel: { color: '#94a3b8', fontSize: 11 },
            splitLine: { show: false },
          },
        ]
      : chartType === 'stacked-bar-100'
      ? {
          type: 'value',
          min: 0,
          max: 100,
          name: '% of Total',
          axisLabel: { formatter: '{value}%', color: '#94a3b8', fontSize: 11 },
          splitLine: {
            show: interactions.showGridLines !== false,
            lineStyle: { color: 'rgba(255, 255, 255, 0.05)' },
          },
        }
      : {
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
        top: chartTitle ? 30 : 5,
        right: 10,
        textStyle: { color: '#94a3b8', fontSize: 11 },
      },
      grid: isCartesian
        ? {
            left: '4%',
            right: isDualAxis ? '6%' : '4%',
            top: chartTitle ? 65 : 40,
            bottom: interactions.enableZoom ? 45 : 30,
            containLabel: true,
          }
        : undefined,
      xAxis: isCartesian
        ? {
            type: 'category',
            data: xData,
            name: xAxisLabel || xField,
            nameLocation: 'middle',
            nameGap: 24,
            nameTextStyle: { color: '#64748b', fontSize: 11, fontWeight: 500 },
            axisLine: { lineStyle: { color: '#334155' } },
            axisLabel: { color: '#94a3b8', fontSize: 11 },
            splitLine: {
              show: interactions.showGridLines !== false,
              lineStyle: { color: 'rgba(255, 255, 255, 0.04)' },
            },
          }
        : undefined,
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
    xField,
    yField,
    y2Field,
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
