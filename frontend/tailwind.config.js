/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        vyuha: {
          bg:       '#03040a',
          surface:  '#080c16',
          elevated: '#0d1220',
          border:   '#0d2040',
          cyan:     '#00d4ff',
          blue:     '#0066ff',
          purple:   '#7c3aed',
          text:     '#e8f4ff',
          muted:    '#4a6080',
        },
      },
      boxShadow: {
        'glow-cyan':   '0 0 20px rgba(0,212,255,0.25), 0 0 40px rgba(0,212,255,0.08)',
        'glow-blue':   '0 0 20px rgba(0,102,255,0.25), 0 0 40px rgba(0,102,255,0.08)',
        'glow-purple': '0 0 20px rgba(124,58,237,0.3), 0 0 40px rgba(124,58,237,0.1)',
        'card':        '0 4px 24px rgba(0,0,0,0.6)',
      },
      keyframes: {
        'neon-pulse': {
          '0%, 100%': { opacity: '1', boxShadow: '0 0 8px rgba(0,212,255,0.6)' },
          '50%':       { opacity: '0.6', boxShadow: '0 0 20px rgba(0,212,255,0.9)' },
        },
        'slide-in': {
          '0%':   { opacity: '0', transform: 'translateY(8px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        'fade-in': {
          '0%':   { opacity: '0' },
          '100%': { opacity: '1' },
        },
      },
      animation: {
        'neon-pulse': 'neon-pulse 2s ease-in-out infinite',
        'slide-in':   'slide-in 0.2s ease-out',
        'fade-in':    'fade-in 0.3s ease-out',
      },
    },
  },
  plugins: [],
}
