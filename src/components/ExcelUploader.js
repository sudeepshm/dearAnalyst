'use client';

import React, { useState, useRef } from 'react';
import { UploadCloud, FileSpreadsheet, CheckCircle2, AlertCircle, Sparkles, ArrowRight, Table } from 'lucide-react';
import * as XLSX from 'xlsx';

export default function ExcelUploader({ onDataLoaded, onCancel }) {
  const [isDragging, setIsDragging] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [parsedData, setParsedData] = useState(null);
  const [activePreviewSheet, setActivePreviewSheet] = useState(null);
  const fileInputRef = useRef(null);

  const processWorkbook = (buffer, fileName) => {
    try {
      const workbook = XLSX.read(buffer, { type: 'buffer', cellDates: true });
      const sheetNames = workbook.SheetNames;
      if (!sheetNames || sheetNames.length === 0) {
        throw new Error('The uploaded file has no sheets.');
      }

      const sheets = {};
      let firstValidSheet = null;

      sheetNames.forEach((name) => {
        const activeSheet = workbook.Sheets[name];
        const jsonData = XLSX.utils.sheet_to_json(activeSheet, { defval: '' });

        if (!jsonData || jsonData.length === 0) {
          sheets[name] = {
            name,
            columns: [],
            columnTypes: {},
            totalRows: 0,
            data: [],
            preview: [],
          };
          return;
        }

        const columns = Object.keys(jsonData[0]);
        const columnTypes = {};

        columns.forEach((col) => {
          const samples = jsonData.slice(0, 25).map((r) => r[col]).filter((v) => v !== '' && v !== null);
          const allNums = samples.length > 0 && samples.every((v) => !isNaN(Number(v)));
          const allDates = samples.length > 0 && samples.every((v) => {
            if (v instanceof Date) return true;
            const p = Date.parse(v);
            return !isNaN(p) && String(v).length >= 4;
          });

          if (allNums) columnTypes[col] = 'number';
          else if (allDates) columnTypes[col] = 'date';
          else columnTypes[col] = 'string';
        });

        sheets[name] = {
          name,
          columns,
          columnTypes,
          totalRows: jsonData.length,
          data: jsonData,
          preview: jsonData.slice(0, 8),
        };

        if (!firstValidSheet) {
          firstValidSheet = name;
        }
      });

      const activeSheetName = firstValidSheet || sheetNames[0];
      const primary = sheets[activeSheetName];

      const result = {
        fileName,
        sheetNames,
        activeSheet: activeSheetName,
        sheets,
        columns: primary?.columns || [],
        columnTypes: primary?.columnTypes || {},
        totalRows: primary?.totalRows || 0,
        data: primary?.data || [],
        preview: primary?.preview || [],
      };

      setParsedData(result);
      setLoading(false);
    } catch (err) {
      setError(err.message || 'Failed to parse spreadsheet file.');
      setLoading(false);
    }
  };

  const handleFileUpload = async (file) => {
    if (!file) return;
    setLoading(true);
    setError(null);

    // Verify extension
    const name = file.name.toLowerCase();
    if (!name.endsWith('.xlsx') && !name.endsWith('.xls') && !name.endsWith('.csv')) {
      setError('Please upload a valid Excel spreadsheet (.xlsx, .xls) or .csv file.');
      setLoading(false);
      return;
    }

    try {
      // First try sending to Next.js API route for backend parsing
      const formData = new FormData();
      formData.append('file', file);
      
      const res = await fetch('/api/parse-excel', {
        method: 'POST',
        body: formData,
      });

      if (res.ok) {
        const result = await res.json();
        setParsedData(result);
        setLoading(false);
        return;
      }

      // If backend fails or in offline static fallback, parse via client-side XLSX
      const arrayBuffer = await file.arrayBuffer();
      processWorkbook(Buffer.from(arrayBuffer), file.name);
    } catch (err) {
      // Fallback to client-side read
      try {
        const arrayBuffer = await file.arrayBuffer();
        processWorkbook(Buffer.from(arrayBuffer), file.name);
      } catch (fallbackErr) {
        setError('Error reading file: ' + fallbackErr.message);
        setLoading(false);
      }
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      handleFileUpload(e.dataTransfer.files[0]);
    }
  };

  const loadSampleDataset = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch('/sample_market_data.csv');
      if (!res.ok) throw new Error('Could not fetch sample dataset');
      const text = await res.text();
      const workbook = XLSX.read(text, { type: 'string' });
      const sheet = workbook.Sheets[workbook.SheetNames[0]];
      const marketData = XLSX.utils.sheet_to_json(sheet, { defval: '' });

      const marketColumns = Object.keys(marketData[0]);
      const marketTypes = {
        Date: 'date',
        Symbol: 'string',
        Open: 'number',
        High: 'number',
        Low: 'number',
        Close: 'number',
        Volume: 'number',
        Change_Pct: 'number',
        Sector: 'string',
        Market_Sentiment: 'string'
      };

      // Second sheet: Sector performance and industry valuations
      const sectorData = [
        { Sector: 'Technology', Market_Cap_Billion: 1240.5, Year_Return_Pct: 28.4, Avg_PE_Ratio: 31.2, Risk_Rating: 'Moderate', Sentiment: 'Bullish' },
        { Sector: 'Healthcare', Market_Cap_Billion: 820.3, Year_Return_Pct: 14.1, Avg_PE_Ratio: 22.8, Risk_Rating: 'Low', Sentiment: 'Neutral' },
        { Sector: 'Clean Energy', Market_Cap_Billion: 460.9, Year_Return_Pct: 34.6, Avg_PE_Ratio: 45.1, Risk_Rating: 'High', Sentiment: 'Bullish' },
        { Sector: 'Financials', Market_Cap_Billion: 950.0, Year_Return_Pct: 18.2, Avg_PE_Ratio: 14.5, Risk_Rating: 'Moderate', Sentiment: 'Bullish' },
        { Sector: 'Consumer Goods', Market_Cap_Billion: 680.2, Year_Return_Pct: 9.7, Avg_PE_Ratio: 19.3, Risk_Rating: 'Low', Sentiment: 'Neutral' },
        { Sector: 'Real Estate', Market_Cap_Billion: 340.1, Year_Return_Pct: -4.3, Avg_PE_Ratio: 16.0, Risk_Rating: 'High', Sentiment: 'Bearish' },
      ];
      const sectorColumns = Object.keys(sectorData[0]);
      const sectorTypes = {
        Sector: 'string',
        Market_Cap_Billion: 'number',
        Year_Return_Pct: 'number',
        Avg_PE_Ratio: 'number',
        Risk_Rating: 'string',
        Sentiment: 'string'
      };

      const sheets = {
        'Market_OHLC': {
          name: 'Market_OHLC',
          columns: marketColumns,
          columnTypes: marketTypes,
          totalRows: marketData.length,
          data: marketData,
          preview: marketData.slice(0, 8),
        },
        'Sector_Performance': {
          name: 'Sector_Performance',
          columns: sectorColumns,
          columnTypes: sectorTypes,
          totalRows: sectorData.length,
          data: sectorData,
          preview: sectorData.slice(0, 8),
        }
      };

      setParsedData({
        fileName: 'sample_market_data.xlsx',
        sheetNames: ['Market_OHLC', 'Sector_Performance'],
        activeSheet: 'Market_OHLC',
        sheets,
        columns: marketColumns,
        columnTypes: marketTypes,
        totalRows: marketData.length,
        data: marketData,
        preview: marketData.slice(0, 8),
      });
      setActivePreviewSheet('Market_OHLC');
      setLoading(false);
    } catch (err) {
      setError('Sample data loader error: ' + err.message);
      setLoading(false);
    }
  };

  return (
    <section id="upload-section" className="w-full max-w-5xl mx-auto px-4 py-12">
      <div className="text-center mb-8">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-mono mb-3">
          Step 1 of 2
        </div>
        <h2 className="text-3xl sm:text-4xl font-bold tracking-tight text-white font-display">
          Upload Spreadsheet Data
        </h2>
        <p className="text-sm sm:text-base text-slate-400 max-w-lg mx-auto mt-2">
          Drop your Excel (.xlsx, .xls) or CSV sheet. dearAnalyst automatically detects numeric coordinates, dates, and candlestick columns.
        </p>
      </div>

      {!parsedData ? (
        <div className="space-y-6">
          {/* Main Drag and Drop Box */}
          <div
            onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
            onDragLeave={() => setIsDragging(false)}
            onDrop={handleDrop}
            onClick={() => fileInputRef.current?.click()}
            className={`relative group cursor-pointer border-2 border-dashed rounded-3xl p-8 sm:p-12 text-center transition-all duration-300 glass-card ${
              isDragging 
                ? 'border-emerald-400 bg-emerald-950/20 scale-[1.01] shadow-2xl shadow-emerald-500/20' 
                : 'border-slate-700 hover:border-emerald-500/60 hover:bg-slate-900/60'
            }`}
          >
            <input
              ref={fileInputRef}
              type="file"
              accept=".xlsx,.xls,.csv"
              className="hidden"
              onChange={(e) => {
                if (e.target.files && e.target.files.length > 0) {
                  handleFileUpload(e.target.files[0]);
                }
              }}
            />

            <div className="flex flex-col items-center justify-center space-y-4">
              <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-emerald-500/20 to-teal-500/20 border border-emerald-500/30 flex items-center justify-center text-emerald-400 group-hover:scale-110 transition-transform">
                <UploadCloud className="w-8 h-8" />
              </div>

              <div>
                <p className="text-base sm:text-lg font-semibold text-slate-100">
                  Click to browse or drag & drop Excel sheet
                </p>
                <p className="text-xs text-slate-400 mt-1">
                  Supports Microsoft Excel (.xlsx, .xls) and Comma-Separated Values (.csv)
                </p>
              </div>

              <div className="flex items-center gap-2 text-xs font-mono text-emerald-400/80 bg-slate-950/60 px-3 py-1.5 rounded-lg border border-slate-800">
                <FileSpreadsheet className="w-4 h-4 text-emerald-400" />
                <span>Auto-detects Date, Open, High, Low, Close & Volume</span>
              </div>
            </div>

            {loading && (
              <div className="absolute inset-0 bg-slate-950/80 backdrop-blur-sm rounded-3xl flex flex-col items-center justify-center gap-3">
                <div className="w-8 h-8 border-3 border-emerald-500 border-t-transparent rounded-full animate-spin" />
                <span className="text-sm font-mono text-emerald-400">Parsing spreadsheet columns & rows...</span>
              </div>
            )}
          </div>

          {error && (
            <div className="flex items-center gap-3 p-4 rounded-xl bg-red-950/40 border border-red-800/50 text-red-300 text-sm">
              <AlertCircle className="w-5 h-5 text-red-400 flex-shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {/* Quick Demo Dataset Option */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 p-4 rounded-2xl glass-card border border-slate-800">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-cyan-500/10 border border-cyan-500/20 flex items-center justify-center text-cyan-400">
                <Sparkles className="w-5 h-5" />
              </div>
              <div>
                <h4 className="text-sm font-semibold text-slate-200">No Excel file on hand?</h4>
                <p className="text-xs text-slate-400">Test immediately with our realistic 60-day stock market dataset.</p>
              </div>
            </div>

            <button
              onClick={loadSampleDataset}
              disabled={loading}
              className="px-4 py-2.5 rounded-xl text-xs font-bold font-mono text-[#00d2ff] bg-slate-900 border border-cyan-500/50 hover:border-cyan-400 hover:shadow-[0_0_20px_rgba(0,210,255,0.25)] transition-all flex items-center gap-2"
            >
              <span>Load Market Dataset</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      ) : (() => {
        const currentSheetName = activePreviewSheet || parsedData.activeSheet || (parsedData.sheetNames && parsedData.sheetNames[0]);
        const currentSheetData = (parsedData.sheets && parsedData.sheets[currentSheetName]) || {
          columns: parsedData.columns || [],
          columnTypes: parsedData.columnTypes || {},
          totalRows: parsedData.totalRows || 0,
          data: parsedData.data || [],
          preview: parsedData.preview || [],
        };

        const handleContinue = () => {
          onDataLoaded({
            ...parsedData,
            activeSheet: currentSheetName,
            columns: currentSheetData.columns,
            columnTypes: currentSheetData.columnTypes,
            totalRows: currentSheetData.totalRows,
            data: currentSheetData.data,
            preview: currentSheetData.preview,
          });
        };

        return (
          /* Data Verification & Preview Card */
          <div className="space-y-6 glass-panel-glow rounded-3xl p-6 sm:p-8 animate-in fade-in zoom-in-95 duration-300">
            <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-800 pb-5">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-2xl bg-emerald-500/20 border border-emerald-500/30 flex items-center justify-center text-[#00ff87]">
                  <CheckCircle2 className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-white flex items-center gap-2">
                    <span>{parsedData.fileName}</span>
                    <span className="text-xs font-mono px-2 py-0.5 rounded bg-emerald-950 text-[#00ff87] border border-emerald-800">
                      Ready
                    </span>
                    {parsedData.sheetNames && parsedData.sheetNames.length > 1 && (
                      <span className="text-xs font-mono px-2 py-0.5 rounded bg-cyan-950 text-[#38bdf8] border border-cyan-800">
                        {parsedData.sheetNames.length} Sheets Available
                      </span>
                    )}
                  </h3>
                  <p className="text-xs text-slate-400">
                    Active Sheet: <strong className="text-[#00ff87]">"{currentSheetName}"</strong> &bull; {currentSheetData.totalRows} rows &bull; {currentSheetData.columns.length} columns detected
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <button
                  onClick={() => {
                    setParsedData(null);
                    setActivePreviewSheet(null);
                  }}
                  className="px-4 py-2 rounded-xl text-xs font-mono text-slate-400 hover:text-white hover:bg-slate-800 border border-slate-700 transition"
                >
                  Change File
                </button>
                <button
                  onClick={handleContinue}
                  className="px-6 py-2.5 rounded-xl text-sm font-bold text-slate-950 bg-gradient-to-r from-[#00ff87] via-[#10b981] to-[#00d2ff] hover:scale-[1.02] shadow-[0_0_25px_rgba(0,255,135,0.35)] hover:shadow-[0_0_40px_rgba(0,255,135,0.55)] transition-all flex items-center gap-2 border border-emerald-300/50"
                >
                  <span>Continue to Story Studio</span>
                  <ArrowRight className="w-4 h-4 text-slate-950" />
                </button>
              </div>
            </div>

            {/* Multi-sheet Tabs Selector if workbook has more than 1 sheet */}
            {parsedData.sheetNames && parsedData.sheetNames.length > 1 && (
              <div className="space-y-2.5 p-4 rounded-2xl bg-slate-900/60 border border-slate-800">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-mono uppercase tracking-wider text-slate-300 font-semibold flex items-center gap-1.5">
                    <FileSpreadsheet className="w-3.5 h-3.5 text-[#00d2ff]" />
                    Available Worksheets ({parsedData.sheetNames.length})
                  </span>
                  <span className="text-[11px] font-mono text-slate-400">
                    Click any sheet to preview &bull; All sheets can be mapped across your slides
                  </span>
                </div>
                <div className="flex flex-wrap gap-2">
                  {parsedData.sheetNames.map((sName) => {
                    const isSelected = sName === currentSheetName;
                    const sheetItem = parsedData.sheets?.[sName];
                    return (
                      <button
                        key={sName}
                        onClick={() => setActivePreviewSheet(sName)}
                        className={`px-3 py-2 rounded-xl text-xs font-mono transition flex items-center gap-2 border ${
                          isSelected
                            ? 'bg-gradient-to-r from-emerald-500/25 to-teal-500/15 text-[#00ff87] border-[#00ff87]/60 shadow-[0_0_15px_rgba(0,255,135,0.2)] scale-[1.02] font-semibold'
                            : 'bg-slate-950/60 text-slate-400 border-slate-800 hover:text-slate-200 hover:border-slate-700'
                        }`}
                      >
                        <span className={`w-2 h-2 rounded-full ${isSelected ? 'bg-[#00ff87]' : 'bg-slate-600'}`} />
                        <strong>{sName}</strong>
                        {sheetItem && (
                          <span className="text-[10px] text-slate-500">
                            ({sheetItem.totalRows} rows)
                          </span>
                        )}
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Detected Columns Chips for the selected sheet */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <h4 className="text-xs font-mono uppercase tracking-wider text-slate-400">
                  Detected Column Fields in <span className="text-emerald-400 font-bold">"{currentSheetName}"</span>:
                </h4>
                <span className="text-xs font-mono text-slate-500">
                  {currentSheetData.columns.length} columns
                </span>
              </div>
              <div className="flex flex-wrap gap-1.5">
                {currentSheetData.columns.map((col) => (
                  <span
                    key={col}
                    className="px-2.5 py-1 rounded-lg text-xs font-mono bg-slate-900 border border-slate-700/80 text-slate-300 flex items-center gap-1.5"
                  >
                    <span className={`w-1.5 h-1.5 rounded-full ${currentSheetData.columnTypes[col] === 'number' ? 'bg-emerald-400' : currentSheetData.columnTypes[col] === 'date' ? 'bg-cyan-400' : 'bg-amber-400'}`} />
                    <strong>{col}</strong>
                    <span className="text-[10px] text-slate-500 uppercase">({currentSheetData.columnTypes[col]})</span>
                  </span>
                ))}
              </div>
            </div>

            {/* Table Preview for the selected sheet */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-mono text-slate-400 flex items-center gap-1.5">
                  <Table className="w-3.5 h-3.5 text-emerald-400" />
                  Raw Data Preview for "{currentSheetName}" (First {currentSheetData.preview.length} Rows)
                </span>
              </div>
              <div className="overflow-x-auto rounded-xl border border-slate-800 bg-slate-950/60 max-h-60">
                <table className="w-full text-left text-xs font-mono">
                  <thead className="bg-slate-900/90 text-slate-300 border-b border-slate-800 sticky top-0">
                    <tr>
                      {currentSheetData.columns.map(c => (
                        <th key={c} className="p-2.5 whitespace-nowrap">{c}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800/60 text-slate-400">
                    {currentSheetData.preview.map((row, rIdx) => (
                      <tr key={rIdx} className="hover:bg-slate-900/40">
                        {currentSheetData.columns.map(c => (
                          <td key={c} className="p-2.5 whitespace-nowrap">{String(row[c] ?? '')}</td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        );
      })()}
    </section>
  );
}
