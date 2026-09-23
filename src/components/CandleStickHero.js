'use client';

import React, { useEffect, useRef, useState } from 'react';
import { ArrowRight, TrendingUp, Sparkles, BarChart3, Upload, ChevronDown, Activity, Shield, Zap } from 'lucide-react';

export default function CandleStickHero({ onStartStory }) {
  const canvasRef = useRef(null);
  const [tickerPrice, setTickerPrice] = useState(4287.63);
  const [tickerChange, setTickerChange] = useState(1.84);
  const [mounted, setMounted] = useState(false);

  useEffect(() => { setMounted(true); }, []);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    let animId;

    const resize = () => {
      canvas.width  = canvas.parentElement.clientWidth;
      canvas.height = canvas.parentElement.clientHeight || 480;
    };
    resize();
    window.addEventListener('resize', resize);

    // Build realistic-looking candlestick series
    const N = 52;
    let base = 4100;
    const candles = Array.from({ length: N }, () => {
      const open  = base + (Math.random() - 0.47) * 22;
      const close = open + (Math.random() - 0.46) * 30;
      const high  = Math.max(open, close) + Math.random() * 14;
      const low   = Math.min(open, close) - Math.random() * 14;
      base = close;
      return { open, close, high, low, vol: Math.random() * 60 + 15 };
    });

    let frame = 0;

    const draw = () => {
      frame++;
      const W = canvas.width, H = canvas.height;
      ctx.clearRect(0, 0, W, H);

      // Live-tick the last candle
      if (frame % 12 === 0) {
        const last = candles[N - 1];
        const delta = (Math.random() - 0.48) * 5;
        last.close = +(last.close + delta).toFixed(2);
        if (last.close > last.high) last.high = last.close;
        if (last.close < last.low)  last.low  = last.close;
        setTickerPrice(p => +(p + delta * 0.05).toFixed(2));
        setTickerChange(p => +(p + delta * 0.01).toFixed(2));
      }

      const prices = candles.flatMap(c => [c.high, c.low]);
      const lo = Math.min(...prices) - 20;
      const hi = Math.max(...prices) + 20;
      const range = hi - lo || 1;

      const getY = v => (H - 70) - ((v - lo) / range) * (H - 140);
      const spacing = W / N;
      const cw = Math.max(5, spacing * 0.6);

      // Vertical price grid lines — very faint blue
      ctx.strokeStyle = 'rgba(37, 99, 235, 0.07)';
      ctx.lineWidth = 1;
      for (let y = 70; y < H - 50; y += 50) {
        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.lineTo(W, y);
        ctx.stroke();
      }

      // EMA ribbon (2 lines) — creates the "pro terminal" look
      const ema = (period) => {
        const k = 2 / (period + 1);
        return candles.reduce((acc, c, i) => {
          if (i === 0) return [c.close];
          return [...acc, c.close * k + acc[i - 1] * (1 - k)];
        }, []);
      };
      const ema9  = ema(9);
      const ema21 = ema(21);

      const drawLine = (vals, color, width, dash = []) => {
        ctx.beginPath();
        ctx.strokeStyle = color;
        ctx.lineWidth = width;
        ctx.setLineDash(dash);
        ctx.shadowColor = color;
        ctx.shadowBlur = width > 1.5 ? 8 : 0;
        vals.forEach((v, i) => {
          const x = i * spacing + spacing / 2;
          const y = getY(v);
          i === 0 ? ctx.moveTo(x, y) : ctx.lineTo(x, y);
        });
        ctx.stroke();
        ctx.setLineDash([]);
        ctx.shadowBlur = 0;
      };

      drawLine(ema21, 'rgba(99, 102, 241, 0.50)', 1.5, [4, 3]);
      drawLine(ema9,  'rgba(34, 211, 238, 0.65)', 2);

      // Volume bars at bottom
      const maxVol = Math.max(...candles.map(c => c.vol));
      candles.forEach((c, i) => {
        const x = i * spacing + spacing / 2;
        const bull = c.close >= c.open;
        const vh = (c.vol / maxVol) * 48;
        ctx.fillStyle = bull
          ? 'rgba(52, 211, 153, 0.15)'
          : 'rgba(244, 63, 94,  0.15)';
        ctx.fillRect(x - cw / 2, H - vh, cw, vh);
      });

      // Candlestick bodies
      candles.forEach((c, i) => {
        const x    = i * spacing + spacing / 2;
        const bull = c.close >= c.open;
        const isLast = i === N - 1;

        const openY  = getY(c.open);
        const closeY = getY(c.close);
        const highY  = getY(c.high);
        const lowY   = getY(c.low);

        const bodyTop = Math.min(openY, closeY);
        const bodyH   = Math.max(Math.abs(closeY - openY), 2);

        const bull_col = '#34d399';
        const bear_col = '#f43f5e';
        const col      = bull ? bull_col : bear_col;

        // Wick
        ctx.strokeStyle = col;
        ctx.lineWidth = 1.2;
        ctx.beginPath();
        ctx.moveTo(x, highY);
        ctx.lineTo(x, lowY);
        ctx.stroke();

        // Body
        if (isLast) {
          ctx.shadowColor = bull ? 'rgba(52,211,153,0.8)' : 'rgba(244,63,94,0.8)';
          ctx.shadowBlur = 18;
        }
        ctx.fillStyle = col;
        ctx.beginPath();
        ctx.roundRect
          ? ctx.roundRect(x - cw / 2, bodyTop, cw, bodyH, 2)
          : ctx.rect(x - cw / 2, bodyTop, cw, bodyH);
        ctx.fill();
        ctx.shadowBlur = 0;
      });

      animId = requestAnimationFrame(draw);
    };

    draw();
    return () => {
      cancelAnimationFrame(animId);
      window.removeEventListener('resize', resize);
    };
  }, []);

  const isUp = tickerChange >= 0;

  return (
    <section className="relative w-full min-h-screen flex flex-col overflow-hidden">

      {/* ── Top nav bar ─────────────────────────────────────── */}
      <header className="relative z-30 w-full px-6 sm:px-10 py-5 flex items-center justify-between">
        {/* Brand */}
        <div className="flex items-center gap-3">
          <div className="relative w-8 h-8 flex-shrink-0">
            <div className="absolute inset-0 rounded-lg bg-gradient-to-br from-blue-500 to-indigo-600 opacity-90" />
            <div className="absolute inset-[1px] rounded-[7px] bg-[#01060f] flex items-center justify-center">
              <TrendingUp className="w-4 h-4 text-blue-400" />
            </div>
          </div>
          <div>
            <div className="brand-font text-[17px] text-white leading-none tracking-tight">
              dear<span className="text-blue-400">Analyst</span>
            </div>
            <div className="font-mono text-[9px] text-[var(--text-muted)] uppercase tracking-widest leading-none mt-0.5">
              Financial Intelligence Studio
            </div>
          </div>
        </div>

        {/* Live ticker chip */}
        <div className="hidden sm:flex items-center gap-3 px-4 py-2 rounded-full glass-card border-[var(--border-subtle)] text-xs font-mono">
          <span className={`w-1.5 h-1.5 rounded-full glow-pulse ${isUp ? 'bg-emerald-400' : 'bg-rose-400'}`} />
          <span className="text-[var(--text-muted)]">S&amp;P 500</span>
          <span className="text-[var(--text-primary)] font-semibold tabular-nums">{tickerPrice.toLocaleString('en-US', { minimumFractionDigits: 2 })}</span>
          <span className={`px-2 py-0.5 rounded-md text-[10px] font-bold ${isUp ? 'bg-emerald-500/15 text-emerald-400' : 'bg-rose-500/15 text-rose-400'}`}>
            {isUp ? '+' : ''}{tickerChange.toFixed(2)}%
          </span>
        </div>
      </header>

      {/* ── Chart canvas (full-bleed background) ────────────── */}
      <div className="absolute inset-0 z-0">
        <canvas ref={canvasRef} className="w-full h-full opacity-50" />
        {/* Bottom fade */}
        <div className="absolute inset-x-0 bottom-0 h-1/3 bg-gradient-to-t from-[#01060f] to-transparent" />
        {/* Side fades */}
        <div className="absolute inset-y-0 left-0 w-20 bg-gradient-to-r from-[#01060f] to-transparent" />
        <div className="absolute inset-y-0 right-0 w-20 bg-gradient-to-l from-[#01060f] to-transparent" />
      </div>

      {/* ── Hero content ────────────────────────────────────── */}
      <div className="relative z-20 flex-1 flex flex-col items-center justify-center px-6 sm:px-12 pt-12 pb-20 text-center">

        {/* Pill badge */}
        <div className="inline-flex items-center gap-2 px-4 py-1.5 mb-8 rounded-full glass-card border border-[var(--border-subtle)] text-xs font-mono text-blue-400">
          <Sparkles className="w-3 h-3" />
          <span>Interactive Financial Data Storytelling</span>
          <span className="w-1 h-1 rounded-full bg-blue-400 opacity-60" />
          <span className="text-[var(--text-muted)]">14 Chart Types</span>
        </div>

        {/* Main headline */}
        <h1 className="brand-font text-[clamp(3rem,9vw,7.5rem)] leading-[0.92] tracking-tight mb-6">
          <span className="block text-gradient-hero">dear</span>
          <span className="block text-gradient-hero">Analyst</span>
        </h1>

        {/* Sub-headline */}
        <p className="max-w-xl mx-auto text-[clamp(0.95rem,2vw,1.1rem)] text-[var(--text-body)] leading-relaxed mb-10 font-light">
          Turn your Excel workbooks and financial statements into{' '}
          <span className="text-[var(--text-primary)] font-medium">board-ready interactive stories</span>{' '}
          — powered by Apache ECharts and a 14-chart professional visualizer.
        </p>

        {/* CTA buttons */}
        <div className="flex flex-col sm:flex-row items-center gap-3 mb-14">
          <button
            onClick={onStartStory}
            className="group relative inline-flex items-center gap-2.5 px-8 py-3.5 rounded-xl font-semibold text-[0.95rem] text-white overflow-hidden"
            style={{
              background: 'linear-gradient(135deg, #1d4ed8 0%, #2563eb 50%, #1e40af 100%)',
              boxShadow: '0 0 0 1px rgba(255,255,255,0.06) inset, 0 1px 0 rgba(255,255,255,0.12) inset, 0 6px 28px -4px rgba(37,99,235,0.65), 0 2px 6px rgba(0,0,0,0.5)',
            }}
          >
            {/* Shimmer sweep */}
            <span className="absolute inset-0 -translate-x-full group-hover:translate-x-full transition-transform duration-700 bg-gradient-to-r from-transparent via-white/10 to-transparent pointer-events-none" />
            <Upload className="w-4 h-4" />
            <span>Start with your data</span>
            <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
          </button>

          <a
            href="#chart-catalogue"
            className="inline-flex items-center gap-2 px-6 py-3.5 rounded-xl text-[0.9rem] font-medium text-[var(--text-body)] hover:text-[var(--text-primary)] glass-card hover:border-[var(--border-accent)] transition-all duration-200"
          >
            <BarChart3 className="w-4 h-4 text-blue-400" />
            <span>Browse 14 chart types</span>
          </a>
        </div>

        {/* Stat badges row */}
        <div className="flex flex-wrap items-center justify-center gap-3 text-xs font-mono">
          {[
            { icon: <Activity className="w-3 h-3" />, label: 'Live ECharts Renderer', color: 'text-blue-400' },
            { icon: <Zap className="w-3 h-3" />, label: 'Multi-Sheet Excel Engine', color: 'text-indigo-400' },
            { icon: <Shield className="w-3 h-3" />, label: 'Client-Side Parsing', color: 'text-cyan-400' },
            { icon: <Sparkles className="w-3 h-3" />, label: 'Export-Ready HTML Story', color: 'text-violet-400' },
          ].map(({ icon, label, color }) => (
            <div key={label} className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full glass-card border-[var(--border-dim)] ${color}`}>
              {icon}
              <span className="text-[var(--text-muted)]">{label}</span>
            </div>
          ))}
        </div>
      </div>

      {/* ── Scroll cue ──────────────────────────────────────── */}
      <div className="relative z-20 flex flex-col items-center pb-8 text-[var(--text-muted)] text-[10px] font-mono gap-2">
        <span className="uppercase tracking-[0.2em]">Explore Chart Catalogue</span>
        <ChevronDown className="w-4 h-4 animate-bounce" />
      </div>
    </section>
  );
}
