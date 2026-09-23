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
        // Brand palette
        brand: {
          50:  '#eff6ff',
          100: '#dbeafe',
          400: '#60a5fa',
          500: '#3b82f6',
          600: '#2563eb',
          700: '#1d4ed8',
          900: '#1e3a8a',
        },
        // App surfaces
        surface: {
          base:    '#01060f',
          raised:  '#03101f',
          overlay: '#040e1e',
          card:    '#060e20',
        },
        // Chart palette
        chart: {
          blue:    '#3b82f6',
          rose:    '#f43f5e',
          violet:  '#a78bfa',
          cyan:    '#22d3ee',
          amber:   '#fbbf24',
          mint:    '#34d399',
          indigo:  '#818cf8',
          orange:  '#fb923c',
          sky:     '#38bdf8',
          fuchsia: '#e879f9',
        },
        // Market colours
        market: {
          up:      '#34d399',
          down:    '#f43f5e',
          neutral: '#4d6a90',
          glow:    '#2563eb',
          dark:    '#01060f',
          surface: '#03101f',
        },
      },
      fontFamily: {
        sans:    ['Geist', 'DM Sans', 'Space Grotesk', '-apple-system', 'system-ui', 'sans-serif'],
        display: ['Geist', 'DM Sans', 'sans-serif'],
        brand:   ['Geist', 'sans-serif'],
        mono:    ['Geist Mono', 'JetBrains Mono', 'Fira Code', 'monospace'],
      },
      letterSpacing: {
        tightest: '-0.045em',
        tighter:  '-0.03em',
        tight:    '-0.015em',
      },
      animation: {
        'pulse-slow':        'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'candle-glow':       'candleGlow 2s ease-in-out infinite alternate',
        'float':             'float 4s ease-in-out infinite',
        'slide-up':          'slideUp 0.30s cubic-bezier(0.16, 1, 0.3, 1) both',
        'fade-in':           'fadeIn 0.4s ease both',
        'scan-line':         'scanLine 4s ease-in-out infinite',
        'glow-pulse':        'glowPulse 2s ease-in-out infinite',
        'border-glow':       'borderGlow 3s ease-in-out infinite',
      },
      keyframes: {
        candleGlow: {
          '0%':   { filter: 'drop-shadow(0 0 5px rgba(52, 211, 153, 0.4))' },
          '100%': { filter: 'drop-shadow(0 0 18px rgba(52, 211, 153, 0.9))' },
        },
        float: {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%':      { transform: 'translateY(-6px)' },
        },
        slideUp: {
          from: { opacity: '0', transform: 'translateY(16px)' },
          to:   { opacity: '1', transform: 'translateY(0)' },
        },
        fadeIn: {
          from: { opacity: '0' },
          to:   { opacity: '1' },
        },
        scanLine: {
          '0%':   { transform: 'translateX(-100%)' },
          '100%': { transform: 'translateX(100%)' },
        },
        glowPulse: {
          '0%, 100%': { boxShadow: '0 0 4px 1px rgba(37, 99, 235, 0.5)' },
          '50%':      { boxShadow: '0 0 12px 4px rgba(37, 99, 235, 0.85)' },
        },
        borderGlow: {
          '0%':   { borderColor: 'rgba(37, 99, 235, 0.20)' },
          '50%':  { borderColor: 'rgba(59, 130, 246, 0.55)' },
          '100%': { borderColor: 'rgba(37, 99, 235, 0.20)' },
        },
      },
      boxShadow: {
        'glow-blue':   '0 0 28px -4px rgba(37, 99, 235, 0.60)',
        'glow-cyan':   '0 0 28px -4px rgba(34, 211, 238, 0.50)',
        'glow-violet': '0 0 28px -4px rgba(167, 139, 250, 0.50)',
        'inner-glow':  'inset 0 1px 0 rgba(120, 180, 255, 0.08)',
        'card':        '0 8px 32px -8px rgba(0, 0, 0, 0.75)',
        'panel':       '0 20px 60px -12px rgba(0, 0, 0, 0.80)',
      },
      backdropBlur: {
        '2xs': '4px',
        xs:    '8px',
      },
    },
  },
  plugins: [],
};
