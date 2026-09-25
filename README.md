# dearAnalyst — Financial Storytelling & Apache ECharts Studio

**dearAnalyst** is a modern financial data visualization and narrative storytelling platform built with **Next.js 14 App Router** and **Apache ECharts 5.5**. It empowers financial analysts, researchers, and data scientists to transform complex spreadsheet workbooks (.xlsx, .xls, .csv) into interactive, multi-sheet, board-ready presentations with animated candlestick charts, real-time crosshairs, dual axes, and narrative commentary.

---

##  Key Architecture & Features

1. **High-Tech Hero Showcase & Brand Identity**
   - Canvas-rendered real-time candlestick price action with glowing wicks, 5-period moving average spline, and live volume bars.
   - High-definition official brand showcase banner (`/public/hero_banner.jpg`) with cyber-emerald and obsidian neon aesthetics.
   - Four color-coordinated brand pillars: **Data Analysis**, **Visualization**, **Insights**, and **Impact**.

2. **Multi-Sheet Workbook Ingestion Engine (Excel / CSV)**
   - Drag-and-drop file upload zone supporting multi-sheet `.xlsx`, `.xls`, and `.csv`.
   - Next.js backend API route (`/api/parse-excel`) powered by SheetJS (`xlsx`) parses all sheets, extracts schemas, infers column types (`date`, `number`, `string`), and provides interactive sheet preview tabs.
   - Each slide can bind to a different sheet from the same workbook (e.g. Page 1 on `Market_OHLC`, Page 2 on `Sector_Performance`).
   - One-click **Load Market Dataset** button featuring a realistic multi-sheet dataset.

3. **The Analyst's Data Visualization Catalogue (14 Visualizers)**
   - Visual reference gallery inspired by **datavizcatalogue.com**, categorizing charts by analytical function:
     - **Comparisons & Dual-Axis**: Combo Bar & Line (Dual-Axis), Dual-Axis Line, Clustered Column, Diverging Bar + Line, Single Bar.
     - **Trends & Volatility**: Candlestick (OHLC), Single Line Trend, Filled Area.
     - **Part-to-Whole & Stacked**: 100% Stacked Bar, Stacked Column, Stacked Area / Multi-Line, Pie / Donut.
     - **Financial Bridge & Flow**: Waterfall Bridge Chart, Scatter Plot Matrix.
   - Searchable by name, analytical purpose, and input data requirements.
   - Direct modal integration inside Story Studio via the **Browse Catalogue** button.

4. **Multi-Page Story Studio with Dual-Axis Field Mapping**
   - Multi-slide narrative workflow: Page 1, Page 2, Page 3...
   - Create, duplicate, and delete story pages with auto-synced state.
   - Dual-axis mapping: configure Left Y-Axis for primary volume/metrics and Right Y-Axis for secondary percentages/returns.

5. **Universal Story Download (Offline Standalone HTML / JSON)**
   - A global **Download Story** option accessible anytime from the top toolbar.
   - **Interactive Standalone HTML Report**: Self-contained single-file bundle embedding Apache ECharts. Can be opened offline in any browser without needing Node.js or a backend server.
   - **Story JSON**: Portable JSON payload containing all slide configurations, field mappings, and narrative markdown.

---

## Getting Started

### Prerequisites
- Node.js 18.x or higher
- npm 9.x or higher

### Installation & Development
```bash
# 1. Unzip the project
unzip dearAnalyst.zip
cd dearAnalyst

# 2. Install dependencies
npm install

# 3. Start the Next.js development server
npm run dev

# 4. Open in browser
# Navigate to http://localhost:3000
```

### Production Build
```bash
npm run build
npm start
```

### Instant Zero-Install Preview
If you want to test the full application immediately without installing Node.js:
- Open `standalone-preview/index.html` directly in Google Chrome, Safari, Edge, or Firefox.

---

## Project Directory Structure

```
dearAnalyst/
├── README.md                      # Documentation & instructions
├── package.json                   # Next.js, ECharts, Tailwind & XLSX dependencies
├── next.config.js                 # Next.js bundler configuration
├── tailwind.config.js             # Tailwind theme & color tokens
├── postcss.config.js              # PostCSS plugins
├── public/
│   ├── sample_market_data.xlsx    # Sample 60-day OHLC stock market dataset
│   └── sample_market_data.csv     # CSV representation
├── standalone-preview/
│   └── index.html                 # Complete, self-contained single-file application
└── src/
    ├── app/
    │   ├── api/
    │   │   ├── parse-excel/
    │   │   │   └── route.js       # Backend API for parsing Excel spreadsheets
    │   │   └── export-story/
    │   │       └── route.js       # Backend API for bundling interactive HTML stories
    │   ├── globals.css            # Styles, brand fonts, glassmorphism, animations
    │   ├── layout.js              # Next.js Root Layout
    │   └── page.js                # Core app orchestration
    ├── components/
    │   ├── CandleStickHero.js     # Animated candlestick canvas hero & "Start Story" button
    │   ├── ExcelUploader.js       # Excel upload dropzone & dataset preview
    │   ├── AddInteractPanel.js    # Graph selection, field mapping & Add-Interact controls
    │   ├── EChartsRenderer.js     # Reactive Apache ECharts component
    │   ├── StorySlideStudio.js    # Multi-page studio, side narrative box & Save/Next
    │   └── DownloadStoryModal.js  # Global story export modal (HTML/JSON/PDF)
    └── utils/
        └── htmlReportGenerator.js # Standalone HTML story builder
```

---

##  License
MIT License. Built for financial analysts, data storytellers, and developers.
