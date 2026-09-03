'use client';

import React, { useEffect, useRef, useState } from 'react';
import { ArrowDown, TrendingUp, Sparkles, LineChart, PlayCircle } from 'lucide-react';

export default function CandleStickHero({ onStartStory }) {
  const canvasRef = useRef(null);
  const [tickerPrice, setTickerPrice] = useState(182.45);
  const [tickerChange, setTickerChange] = useState(3.42);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    let animationFrameId;

    // Handle responsive resize
    const handleResize = () => {
      canvas.width = canvas.parentElement.clientWidth;
      canvas.height = canvas.parentElement.clientHeight || 450;
    };
    handleResize();
    window.addEventListener('resize', handleResize);

    // Candlestick simulation parameters
    const candleCount = 45;
    let basePrice = 170;
    const candles = [];

    // Initialize mock candlestick series
    for (let i = 0; i < candleCount; i++) {
      const open = basePrice + (Math.random() - 0.48) * 3;
      const close = open + (Math.random() - 0.47) * 4;
      const high = Math.max(open, close) + Math.random() * 2.5;
      const low = Math.min(open, close) - Math.random() * 2.5;
      candles.push({ open, close, high, low, volume: Math.random() * 50 + 20 });
      basePrice = close;
    }

    let frame = 0;

    // Animation Loop
    const render = () => {
      frame++;
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      const width = canvas.width;
      const height = canvas.height;
      const candleWidth = Math.max(6, (width / candleCount) * 0.65);
      const spacing = width / candleCount;

      // Slowly mutate the last candle to simulate live market pulsation
      if (frame % 15 === 0) {
        const last = candles[candles.length - 1];
        const delta = (Math.random() - 0.48) * 0.8;
        last.close += delta;
        if (last.close > last.high) last.high = last.close;
        if (last.close < last.low) last.low = last.close;
        setTickerPrice(prev => Number((prev + delta).toFixed(2)));
        setTickerChange(prev => Number((prev + delta * 0.5).toFixed(2)));
      }

      // Compute min and max for scaling
      const allPrices = candles.flatMap(c => [c.high, c.low]);
      const minPrice = Math.min(...allPrices) - 5;
      const maxPrice = Math.max(...allPrices) + 5;
      const priceRange = maxPrice - minPrice || 1;

      const getY = (val) => height - 60 - ((val - minPrice) / priceRange) * (height - 120);

      // Draw faint background grid
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.04)';
      ctx.lineWidth = 1;
      for (let y = 60; y < height - 60; y += 40) {
        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.lineTo(width, y);
        ctx.stroke();
      }

      // Draw Moving Average spline
      ctx.beginPath();
      ctx.strokeStyle = 'rgba(6, 182, 212, 0.7)'; // Cyan MA line
      ctx.lineWidth = 2.5;
      ctx.shadowColor = 'rgba(6, 182, 212, 0.5)';
      ctx.shadowBlur = 10;
      candles.forEach((c, idx) => {
        const x = idx * spacing + spacing / 2;
        const avg = (c.open + c.close) / 2;
        const y = getY(avg);
        if (idx === 0) ctx.moveTo(x, y);
        else ctx.lineTo(x, y);
      });
      ctx.stroke();
      ctx.shadowBlur = 0; // Reset shadow

      // Draw Candlesticks with glowing animation
      candles.forEach((c, idx) => {
        const x = idx * spacing + spacing / 2;
        const isBullish = c.close >= c.open;
        const isLatest = idx === candles.length - 1;

        const openY = getY(c.open);
        const closeY = getY(c.close);
        const highY = getY(c.high);
        const lowY = getY(c.low);

        const bodyTop = Math.min(openY, closeY);
        const bodyHeight = Math.max(Math.abs(closeY - openY), 2);

        const primaryColor = isBullish ? '#10b981' : '#ef4444';
        const glowColor = isBullish ? 'rgba(16, 185, 129, 0.45)' : 'rgba(239, 68, 68, 0.45)';

        // Wick
        ctx.strokeStyle = primaryColor;
        ctx.lineWidth = 1.5;
        ctx.beginPath();
        ctx.moveTo(x, highY);
        ctx.lineTo(x, lowY);
        ctx.stroke();

        // Body with glow if latest candle
        if (isLatest) {
          ctx.shadowColor = glowColor;
          ctx.shadowBlur = 15;
        }

        ctx.fillStyle = primaryColor;
        ctx.fillRect(x - candleWidth / 2, bodyTop, candleWidth, bodyHeight);
        ctx.shadowBlur = 0;

        // Draw volume bar at bottom
        const volHeight = (c.volume / 100) * 45;
        ctx.fillStyle = isBullish ? 'rgba(16, 185, 129, 0.22)' : 'rgba(239, 68, 68, 0.22)';
        ctx.fillRect(x - candleWidth / 2, height - volHeight, candleWidth, volHeight);
      });

      animationFrameId = requestAnimationFrame(render);
    };

    render();

    return () => {
      cancelAnimationFrame(animationFrameId);
      window.removeEventListener('resize', handleResize);
    };
  }, []);

  return (
    <section className="relative w-full min-h-[90vh] flex flex-col items-center justify-between px-4 sm:px-8 py-10 overflow-hidden bg-grid-pattern">
      {/* Ambient background glow orbs */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[550px] h-[550px] bg-emerald-500/10 rounded-full blur-[140px] pointer-events-none -z-10" />
      <div className="absolute bottom-10 right-10 w-[400px] h-[400px] bg-cyan-500/10 rounded-full blur-[120px] pointer-events-none -z-10" />

      {/* Top Brand Banner & Ticker */}
      <div className="w-full max-w-6xl mx-auto flex items-center justify-between pt-4 pb-2 z-10">
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-emerald-500 via-teal-400 to-cyan-500 p-0.5 shadow-lg shadow-emerald-500/20">
            <div className="w-full h-full bg-slate-950 rounded-[10px] flex items-center justify-center">
              <TrendingUp className="w-5 h-5 text-emerald-400" />
            </div>
          </div>
          <span className="font-mono text-xs tracking-widest text-slate-400 uppercase font-semibold">
            FINANCIAL INTELLIGENCE STUDIO
          </span>
        </div>

        {/* Real-time Ticker Badge */}
        <div className="flex items-center gap-3 px-3.5 py-1.5 rounded-full bg-slate-900/90 border border-slate-800 text-xs font-mono shadow-inner">
          <span className="flex h-2 w-2 relative">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
          </span>
          <span className="text-slate-400">NASDAQ: <strong className="text-slate-200">ANLYST</strong></span>
          <span className="text-emerald-400 font-bold">${tickerPrice.toFixed(2)}</span>
          <span className={`text-[10px] px-1.5 py-0.2 rounded font-bold ${tickerChange >= 0 ? 'bg-emerald-950 text-emerald-300' : 'bg-red-950 text-red-300'}`}>
            {tickerChange >= 0 ? `+${tickerChange}%` : `${tickerChange}%`}
          </span>
        </div>
      </div>

      {/* Centerpiece: Project Name specific typography & Animated Candlestick Canvas */}
      <div className="relative w-full max-w-6xl mx-auto flex-1 flex flex-col items-center justify-center my-6 z-10">
        {/* Animated Candlestick Background Stage */}
        <div className="absolute inset-0 w-full h-full opacity-65 pointer-events-none rounded-2xl overflow-hidden">
          <canvas ref={canvasRef} className="w-full h-full" />
        </div>

        {/* Foreground Content: Title, Subtitle, and Brand Photo Showcase */}
        <div className="relative text-center px-4 max-w-5xl mx-auto z-20 pointer-events-auto w-full">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs font-mono mb-6 backdrop-blur-md">
            <Sparkles className="w-3.5 h-3.5 text-emerald-400" />
            <span>Interactive Data Storytelling Platform</span>
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
            <span className="text-slate-400">DATA. INSIGHT. IMPACT.</span>
          </div>

          {/* PROJECT NAME "dearAnalyst" WITH EXACT SPECIFIC BRAND TYPOGRAPHY */}
          <h1 className="brand-font text-5xl sm:text-7xl md:text-8xl font-extrabold tracking-tight text-white mb-4 drop-shadow-2xl">
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-white via-slate-100 to-slate-300 font-light">dear</span>
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#00ff87] via-[#10b981] to-[#00d2ff] font-extrabold drop-shadow-[0_0_35px_rgba(0,255,135,0.45)]">Analyst</span>
          </h1>

          <p className="text-base sm:text-lg text-slate-300 max-w-2xl mx-auto font-normal leading-relaxed mb-6 drop-shadow">
            Convert spreadsheets, multi-sheet workbooks, and financial statements into structured, interactive board-ready stories.
            Equipped with 14 visualizers inspired by The Data Visualisation Catalogue.
          </p>

          {/* OFFICIAL BRAND HERO PHOTO SHOWCASE */}
          <div className="relative max-w-4xl mx-auto my-6 rounded-2xl overflow-hidden border-2 border-emerald-500/40 shadow-[0_0_45px_rgba(0,255,135,0.2)] group">
            {/* Ambient neon backglow */}
            <div className="absolute inset-0 bg-gradient-to-tr from-emerald-500/20 via-transparent to-cyan-500/20 opacity-90 pointer-events-none z-10" />
            
            <img
              src="/hero_banner.jpg"
              alt="dearAnalyst - Data. Insight. Impact."
              className="w-full h-auto object-cover transform group-hover:scale-[1.01] transition-transform duration-700 ease-out"
            />

            {/* Interactive Overlay Badges */}
            <div className="absolute bottom-3 left-4 right-4 z-20 flex flex-wrap items-center justify-between gap-2 p-2.5 rounded-xl bg-slate-950/85 backdrop-blur-md border border-slate-800/90 text-xs font-mono shadow-2xl">
              <div className="flex items-center gap-3 text-slate-300">
                <span className="flex items-center gap-1.5 text-[#00ff87] font-bold">
                  <span className="w-2 h-2 rounded-full bg-[#00ff87] animate-pulse" />
                  DATA ANALYSIS
                </span>
                <span className="text-slate-600">&bull;</span>
                <span className="text-[#38bdf8] font-bold">VISUALIZATION</span>
                <span className="text-slate-600">&bull;</span>
                <span className="text-[#c084fc] font-bold">INSIGHTS</span>
                <span className="text-slate-600">&bull;</span>
                <span className="text-[#facc15] font-bold">IMPACT</span>
              </div>
              <div className="text-[11px] text-slate-400 hidden sm:block">
                Apache ECharts &bull; Multi-Sheet Excel Engine
              </div>
            </div>
          </div>

          {/* CALL TO ACTION BUTTONS */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mt-6">
            <button
              onClick={onStartStory}
              className="group relative inline-flex items-center justify-center gap-3 px-8 py-4 rounded-2xl text-base font-bold text-slate-950 bg-gradient-to-r from-[#00ff87] via-[#10b981] to-[#00d2ff] shadow-[0_0_30px_rgba(0,255,135,0.35)] hover:shadow-[0_0_50px_rgba(0,255,135,0.55)] hover:scale-[1.03] active:scale-[0.98] transition-all duration-300 overflow-hidden border border-emerald-300/50"
            >
              {/* Shimmer light sweep */}
              <span className="absolute inset-0 w-1/2 h-full bg-white/25 skew-x-12 -translate-x-full group-hover:translate-x-[300%] transition-transform duration-1000 ease-out pointer-events-none" />
              
              <PlayCircle className="w-5 h-5 text-slate-950 transition-transform group-hover:scale-110" />
              <span className="tracking-wide">Start Story</span>
              <ArrowDown className="w-4 h-4 text-slate-900 group-hover:translate-y-0.5 transition-transform" />
            </button>

            <a
              href="#chart-catalogue"
              className="inline-flex items-center justify-center gap-2 px-6 py-4 rounded-2xl text-sm font-bold text-slate-200 bg-slate-900/90 hover:bg-slate-800/90 border border-slate-700/90 hover:border-emerald-400/80 hover:shadow-[0_0_25px_rgba(16,185,129,0.2)] transition-all duration-200 shadow-lg font-mono"
            >
              <LineChart className="w-4 h-4 text-[#00ff87]" />
              <span>Browse Visual Catalogue (14)</span>
            </a>
          </div>
        </div>
      </div>

      {/* Bottom Scroll Cue */}
      <div className="flex flex-col items-center gap-2 text-slate-500 text-xs font-mono z-10 pt-4">
        <span>EXPLORE VISUAL CATALOGUE OR CLICK START STORY</span>
        <div className="w-5 h-9 rounded-full border-2 border-slate-700 flex items-start justify-center p-1">
          <div className="w-1.5 h-2 bg-emerald-400 rounded-full animate-bounce" />
        </div>
      </div>
    </section>
  );
}
