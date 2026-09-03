/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        brand: {
          50: '#ecfdf5',
          100: '#d1fae5',
          200: '#a7f3d0',
          500: '#10b981',
          600: '#059669',
          900: '#064e3b',
        },
        market: {
          up: '#10b981',
          down: '#ef4444',
          neutral: '#64748b',
          glow: '#06b6d4',
          dark: '#0a0f1d',
          surface: '#111827',
          card: '#1e293b',
          border: '#334155'
        }
      },
      fontFamily: {
        brand: ['Space Grotesk', 'Syne', 'Inter', 'sans-serif'],
        mono: ['JetBrains Mono', 'Fira Code', 'monospace'],
        display: ['Outfit', 'Montserrat', 'sans-serif']
      },
      animation: {
        'pulse-slow': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'candlestick-glow': 'candleGlow 2s ease-in-out infinite alternate',
        'float': 'float 4s ease-in-out infinite',
      },
      keyframes: {
        candleGlow: {
          '0%': { filter: 'drop-shadow(0 0 5px rgba(16, 185, 129, 0.4))' },
          '100%': { filter: 'drop-shadow(0 0 16px rgba(16, 185, 129, 0.85))' }
        },
        float: {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%': { transform: 'translateY(-6px)' }
        }
      }
    },
  },
  plugins: [],
}
