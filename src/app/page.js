'use client';

import React, { useState, useEffect } from 'react';
import CandleStickHero from '@/components/CandleStickHero';
import ExcelUploader from '@/components/ExcelUploader';
import StorySlideStudio from '@/components/StorySlideStudio';
import DownloadStoryModal from '@/components/DownloadStoryModal';
import VisualChartCatalogue from '@/components/VisualChartCatalogue';
import { Sparkles, BarChart3, Layers, FileSpreadsheet } from 'lucide-react';

export default function Home() {
  const [mounted, setMounted] = useState(false);
  const [currentStep, setCurrentStep] = useState('hero'); // 'hero' | 'upload' | 'studio'
  const [dataset, setDataset] = useState(null);
  const [preferredChartType, setPreferredChartType] = useState('candlestick');
  const [isDownloadModalOpen, setIsDownloadModalOpen] = useState(false);
  const [exportStoryPayload, setExportStoryPayload] = useState(null);

  useEffect(() => {
    setMounted(true);
  }, []);

  const handleStartStory = (chartId = 'candlestick') => {
    if (chartId && typeof chartId === 'string') {
      setPreferredChartType(chartId);
    }
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
      <main className="min-h-screen flex flex-col items-center justify-center bg-[#050811] text-slate-100">
        <div className="w-10 h-10 border-2 border-emerald-400 border-t-transparent rounded-full animate-spin" />
      </main>
    );
  }

  return (
    <main className="min-h-screen flex flex-col bg-market-dark text-slate-100 selection:bg-emerald-500 selection:text-black">
      {/* 1. Landing Hero with animated Candlestick Graph & Brand Banner */}
      {currentStep === 'hero' && (
        <>
          <CandleStickHero onStartStory={() => handleStartStory()} />
          <VisualChartCatalogue onStartStory={handleStartStory} />
          
          {/* Main Page Rich Brand Footer */}
          <footer className="w-full border-t border-slate-800/80 bg-slate-950/80 backdrop-blur-md py-10 px-4 sm:px-8 mt-12">
            <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-6">
              <div className="flex flex-col items-center md:items-start gap-1">
                <div className="brand-font text-2xl font-extrabold flex items-center gap-1.5">
                  <span className="text-white">dear</span>
                  <span className="text-emerald-400">Analyst</span>
                </div>
                <span className="text-xs font-mono text-slate-400 tracking-widest uppercase">
                  DATA. INSIGHT. IMPACT.
                </span>
              </div>

              <div className="flex items-center gap-6 text-xs font-mono text-slate-400">
                <a href="#chart-catalogue" className="hover:text-emerald-400 transition">
                  Visual Catalogue
                </a>
                <span>&bull;</span>
                <button onClick={() => handleStartStory()} className="hover:text-emerald-400 transition">
                  Upload Workbook
                </button>
                <span>&bull;</span>
                <span className="text-slate-600">Apache ECharts 5.5</span>
              </div>

              <div className="text-xs font-mono text-slate-500">
                &copy; 2026 dearAnalyst. Built for financial intelligence.
              </div>
            </div>
          </footer>
        </>
      )}

      {/* 2. Excel Upload Section */}
      {currentStep === 'upload' && (
        <div className="py-6">
          <div className="max-w-6xl mx-auto px-4 mb-4 flex items-center justify-between">
            <button
              onClick={() => setCurrentStep('hero')}
              className="text-xs font-mono text-slate-400 hover:text-emerald-400 flex items-center gap-1.5 transition"
            >
              &larr; Return to Home & Visual Catalogue
            </button>
            <div className="brand-font text-lg font-bold text-white flex items-center gap-1.5">
              <span className="text-slate-400">dear</span>
              <span className="text-emerald-400">Analyst</span>
            </div>
          </div>
          <ExcelUploader
            onDataLoaded={handleDataLoaded}
            onCancel={() => setCurrentStep('hero')}
          />
        </div>
      )}

      {/* 3. Multi-Page Story & Visualization Studio */}
      {currentStep === 'studio' && dataset && (
        <StorySlideStudio
          dataset={dataset}
          initialChartType={preferredChartType}
          onDownloadStory={handleOpenDownload}
          onResetData={handleResetData}
        />
      )}

      {/* 4. Global Download Story Modal (Callable anytime irrespective of pages) */}
      <DownloadStoryModal
        isOpen={isDownloadModalOpen}
        onClose={() => setIsDownloadModalOpen(false)}
        storyData={exportStoryPayload}
      />
    </main>
  );
}
