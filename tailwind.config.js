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
          50: '#eff6ff',
          100: '#dbeafe',
          200: '#bfdbfe',
          500: '#1364e2',
          600: '#1d4ed8',
          900: '#1e3a8a',
        },
        flourish: {
          blue: '#1364e2',
          indigo: '#1d4ed8',
          violet: '#9852d9',
          purple: '#7c3aed',
          coral: '#f54e8b',
          cyan: '#00c4cc',
          amber: '#fca311',
          mint: '#10b981',
          dark: '#060913',
          surface: '#0b1122',
          card: '#0c1224',
          border: 'rgba(255, 255, 255, 0.08)'
        },
        market: {
          up: '#10b981',
          down: '#ef4444',
          neutral: '#64748b',
          glow: '#1364e2',
          dark: '#060913',
          surface: '#0b1122',
          card: '#0c1224',
          border: '#1e293b'
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
