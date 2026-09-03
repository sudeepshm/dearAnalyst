import './globals.css';

export const metadata = {
  title: 'dearAnalyst — Financial Storytelling & Apache ECharts Studio',
  description: 'Transform spreadsheet datasets into interactive visual financial stories with Apache ECharts and dynamic narrative flows.',
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" className="dark">
      <body className="antialiased bg-market-dark text-slate-100 min-h-screen">
        {children}
      </body>
    </html>
  );
}
