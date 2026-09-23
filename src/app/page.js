'use client';

import React, { useState, useEffect } from 'react';
import CandleStickHero from '@/components/CandleStickHero';
import ExcelUploader from '@/components/ExcelUploader';
import StorySlideStudio from '@/components/StorySlideStudio';
import DownloadStoryModal from '@/components/DownloadStoryModal';
import VisualChartCatalogue from '@/components/VisualChartCatalogue';
import { TrendingUp, BarChart3, FileSpreadsheet } from 'lucide-react';

export default function Home() {
  const [mounted, setMounted]                       = useState(false);
  const [currentStep, setCurrentStep]               = useState('hero');
  const [dataset, setDataset]                       = useState(null);
  const [preferredChartType, setPreferredChartType] = useState('candlestick');
  const [isDownloadModalOpen, setIsDownloadModalOpen] = useState(false);
  const [exportStoryPayload, setExportStoryPayload] = useState(null);

  useEffect(() => { setMounted(true); }, []);

  const handleStartStory = (chartId = 'candlestick') => {
    if (chartId && typeof chartId === 'string') setPreferredChartType(chartId);
    setCurrentStep('upload');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleDataLoaded = (parsedDataset) => {
    setDataset(parsedDataset);
    setCurrentStep('studio');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleOpenDownload = (storyPayload) => {
    setExportStoryPayload(storyPayload);
    setIsDownloadModalOpen(true);
  };

  const handleResetData = () => {
    setDataset(null);
    setCurrentStep('upload');
  };

  if (!mounted) {
    return (
      <main className="min-h-screen flex flex-col items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="w-10 h-10 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
          <span className="font-mono text-xs text-[var(--text-muted)] tracking-wider">Initializing studio...</span>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen flex flex-col text-[var(--text-body)]">

      {/* ─── HERO ─────────────────────────────────────────────── */}
      {currentStep === 'hero' && (
        <>
          <CandleStickHero onStartStory={() => handleStartStory()} />
          <VisualChartCatalogue onStartStory={handleStartStory} />

          {/* Footer */}
          <footer className="w-full border-t border-[var(--border-dim)] glass-panel py-10 px-6 sm:px-10 mt-12">
            <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-6">
              {/* Brand */}
              <div className="flex items-center gap-3">
                <div className="relative w-7 h-7 flex-shrink-0">
                  <div className="absolute inset-0 rounded-md bg-gradient-to-br from-blue-500 to-indigo-600" />
                  <div className="absolute inset-[1px] rounded-[5px] bg-black flex items-center justify-center">
                    <TrendingUp className="w-3.5 h-3.5 text-blue-400" />
                  </div>
                </div>
                <div>
                  <div className="brand-font text-[15px] text-white leading-none">
                    dear<span className="text-blue-400">Analyst</span>
                  </div>
                  <div className="font-mono text-[9px] text-slate-400 uppercase tracking-widest mt-0.5">
                    DATA · INSIGHT · IMPACT
                  </div>
                </div>
              </div>

              {/* Links */}
              <div className="flex items-center gap-6 text-[11px] font-mono text-slate-300">
                <a href="#chart-catalogue" className="hover:text-white transition-colors">Visual Catalogue</a>
                <span className="text-white/20">·</span>
                <button onClick={() => handleStartStory()} className="hover:text-white transition-colors">Upload Workbook</button>
                <span className="text-white/20">·</span>
                <span className="text-slate-400">Apache ECharts 5.5</span>
              </div>

              <div className="text-[10px] font-mono text-slate-400">
                © 2026 dearAnalyst · Built for financial intelligence
              </div>
            </div>
          </footer>
        </>
      )}

      {/* ─── UPLOAD ───────────────────────────────────────────── */}
      {currentStep === 'upload' && (
        <div className="min-h-screen flex flex-col">
          {/* Mini header */}
          <div className="w-full px-6 sm:px-10 py-4 border-b border-[var(--border-dim)] glass-panel flex items-center justify-between">
            <button
              onClick={() => setCurrentStep('hero')}
              className="flex items-center gap-2 text-[11px] font-mono text-slate-300 hover:text-white transition-colors"
            >
              <span>←</span> Back to Home
            </button>
            <div className="flex items-center gap-2.5">
              <FileSpreadsheet className="w-4 h-4 text-cyan-400" />
              <span className="brand-font text-[15px] text-white">dear<span className="text-blue-400">Analyst</span></span>
            </div>
            <div className="text-[11px] font-mono text-slate-400">
              Step 1 of 2
            </div>
          </div>
          <ExcelUploader
            onDataLoaded={handleDataLoaded}
            onCancel={() => setCurrentStep('hero')}
          />
        </div>
      )}

      {/* ─── STUDIO ───────────────────────────────────────────── */}
      {currentStep === 'studio' && dataset && (
        <StorySlideStudio
          dataset={dataset}
          initialChartType={preferredChartType}
          onDownloadStory={handleOpenDownload}
          onResetData={handleResetData}
        />
      )}

      {/* ─── DOWNLOAD MODAL ───────────────────────────────────── */}
      <DownloadStoryModal
        isOpen={isDownloadModalOpen}
        onClose={() => setIsDownloadModalOpen(false)}
        storyData={exportStoryPayload}
      />
    </main>
  );
}
