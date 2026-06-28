/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        primary: '#6366f1',
        darkbg: '#0a0a0a',
        'warm-canvas': '#FCFBF9',
        'warm-surface': '#F7F5F0',
        'warm-terracotta': '#C2410C',
        'warm-amber': '#D97706',
        'warm-ink': '#292524',
        'warm-muted': '#57534E'
      },
      fontFamily: {
        sans: ['Inter', 'ui-sans-serif', 'system-ui']
      },
      borderRadius: {
        'soft-card': '1rem',
        'soft-panel': '1.5rem',
        'soft-control': '0.75rem'
      },
      boxShadow: {
        soft: '0 10px 25px -10px rgba(2, 6, 23, 0.25)',
        'warm-sm': '0 2px 8px -2px rgba(41, 37, 36, 0.05)',
        'warm-md': '0 8px 24px -4px rgba(41, 37, 36, 0.08)',
        'warm-lg': '0 16px 40px -6px rgba(41, 37, 36, 0.12)'
      }
    }
  },
  plugins: []
};
