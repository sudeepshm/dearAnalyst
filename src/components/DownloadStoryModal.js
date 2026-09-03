'use client';

import React, { useState } from 'react';
import { X, Download, FileCode, Check, Printer, FileSpreadsheet, Eye } from 'lucide-react';
import { generateStandaloneHtml } from '@/utils/htmlReportGenerator';

export default function DownloadStoryModal({
  isOpen,
  onClose,
  storyData,
}) {
  const [downloading, setDownloading] = useState(false);
  const [copied, setCopied] = useState(false);

  if (!isOpen || !storyData) return null;

  const { storyTitle, slides } = storyData;

  const handleDownloadHtml = async () => {
    setDownloading(true);
    try {
      // First attempt via Next.js backend export route
      const res = await fetch('/api/export-story', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          storyTitle,
          slides,
          exportType: 'html',
        }),
      });

      let htmlBlob;
      if (res.ok) {
        htmlBlob = await res.blob();
      } else {
        // Fallback to client-side generator
        const htmlString = generateStandaloneHtml({
          title: storyTitle || 'dearAnalyst Story',
          slides,
        });
        htmlBlob = new Blob([htmlString], { type: 'text/html;charset=utf-8' });
      }

      const url = URL.createObjectURL(htmlBlob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${(storyTitle || 'dearAnalyst_Story').replace(/\s+/g, '_')}.html`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch (err) {
      console.error('Download error:', err);
      // Client-side fallback
      const htmlString = generateStandaloneHtml({
        title: storyTitle || 'dearAnalyst Story',
        slides,
      });
      const blob = new Blob([htmlString], { type: 'text/html;charset=utf-8' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${(storyTitle || 'dearAnalyst_Story').replace(/\s+/g, '_')}.html`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } finally {
      setDownloading(false);
    }
  };

  const handleDownloadJson = () => {
    const exportObject = {
      project: 'dearAnalyst',
      version: '1.0.0',
      exportedAt: new Date().toISOString(),
      storyTitle,
      totalPages: slides.length,
      slides,
    };

    const blob = new Blob([JSON.stringify(exportObject, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${(storyTitle || 'dearAnalyst_Story').replace(/\s+/g, '_')}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const handleOpenLivePreview = () => {
    const htmlString = generateStandaloneHtml({
      title: storyTitle || 'dearAnalyst Story',
      slides,
    });
    const blob = new Blob([htmlString], { type: 'text/html;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    window.open(url, '_blank');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-200">
      <div className="relative w-full max-w-2xl glass-panel-glow rounded-3xl p-6 sm:p-8 border border-emerald-500/30 text-slate-100 shadow-2xl">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-5 right-5 p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Modal Header */}
        <div className="flex items-center gap-3 mb-6">
          <div className="w-12 h-12 rounded-2xl bg-emerald-500/20 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
            <Download className="w-6 h-6" />
          </div>
          <div>
            <h3 className="text-xl font-bold font-display text-white">
              Export Complete Story
            </h3>
            <p className="text-xs text-slate-400">
              Download your full multi-page visual narrative irrespective of current page.
            </p>
          </div>
        </div>

        {/* Story Summary Card */}
        <div className="p-4 rounded-2xl bg-slate-900/90 border border-slate-800 mb-6 space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-mono text-slate-400 uppercase">Story Title:</span>
            <span className="text-sm font-bold text-emerald-400">{storyTitle}</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-xs font-mono text-slate-400 uppercase">Total Pages / Slides:</span>
            <span className="text-xs font-mono font-bold px-2 py-0.5 rounded bg-slate-800 text-slate-200 border border-slate-700">
              {slides.length} Pages
            </span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-xs font-mono text-slate-400 uppercase">Visualization Engine:</span>
            <span className="text-xs font-mono text-cyan-400">Apache ECharts 5.5 (Interactive)</span>
          </div>
        </div>

        {/* Export Options Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
          {/* Option 1: Standalone HTML Presentation */}
          <div
            onClick={handleDownloadHtml}
            className="group cursor-pointer p-4 rounded-2xl bg-slate-900/60 hover:bg-emerald-950/20 border border-slate-800 hover:border-emerald-500/40 transition-all duration-200 flex flex-col justify-between space-y-3"
          >
            <div className="flex items-center justify-between">
              <div className="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400 group-hover:scale-110 transition-transform">
                <FileCode className="w-5 h-5" />
              </div>
              <span className="text-[10px] font-mono font-semibold px-2 py-0.5 rounded bg-emerald-950 text-emerald-300 border border-emerald-800">
                RECOMMENDED
              </span>
            </div>
            <div>
              <h4 className="text-sm font-bold text-white group-hover:text-emerald-300 transition">
                Interactive HTML Report
              </h4>
              <p className="text-xs text-slate-400 mt-0.5">
                Single self-contained file with full ECharts animations, slide controls, and tooltips. Works anywhere.
              </p>
            </div>
            <button
              disabled={downloading}
              className="w-full py-2 rounded-xl text-xs font-mono font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 group-hover:bg-emerald-500 group-hover:text-slate-950 transition flex items-center justify-center gap-1.5"
            >
              <Download className="w-3.5 h-3.5" />
              <span>{downloading ? 'Bundling...' : 'Download .HTML'}</span>
            </button>
          </div>

          {/* Option 2: JSON Data & Config */}
          <div
            onClick={handleDownloadJson}
            className="group cursor-pointer p-4 rounded-2xl bg-slate-900/60 hover:bg-cyan-950/20 border border-slate-800 hover:border-cyan-500/40 transition-all duration-200 flex flex-col justify-between space-y-3"
          >
            <div className="flex items-center justify-between">
              <div className="w-10 h-10 rounded-xl bg-cyan-500/10 border border-cyan-500/20 flex items-center justify-center text-cyan-400 group-hover:scale-110 transition-transform">
                <FileSpreadsheet className="w-5 h-5" />
              </div>
              <span className="text-[10px] font-mono font-semibold px-2 py-0.5 rounded bg-cyan-950 text-cyan-300 border border-cyan-800">
                PORTABLE
              </span>
            </div>
            <div>
              <h4 className="text-sm font-bold text-white group-hover:text-cyan-300 transition">
                Story JSON Payload
              </h4>
              <p className="text-xs text-slate-400 mt-0.5">
                Raw configuration, data records, narrative markdown, and charts schemas for re-importing.
              </p>
            </div>
            <button
              className="w-full py-2 rounded-xl text-xs font-mono font-bold bg-cyan-500/20 text-cyan-300 border border-cyan-500/30 group-hover:bg-cyan-500 group-hover:text-slate-950 transition flex items-center justify-center gap-1.5"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Download .JSON</span>
            </button>
          </div>
        </div>

        {/* Auxiliary Actions: Live Web Preview & Print */}
        <div className="flex flex-wrap items-center justify-between gap-3 pt-3 border-t border-slate-800 text-xs font-mono">
          <button
            onClick={handleOpenLivePreview}
            className="text-emerald-400 hover:text-emerald-300 flex items-center gap-1.5 transition"
          >
            <Eye className="w-3.5 h-3.5" />
            <span>Open Standalone Preview in New Tab</span>
          </button>

          <button
            onClick={() => window.print()}
            className="text-slate-400 hover:text-slate-200 flex items-center gap-1.5 transition"
          >
            <Printer className="w-3.5 h-3.5" />
            <span>Print / Save as PDF</span>
          </button>
        </div>
      </div>
    </div>
  );
}
