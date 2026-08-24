/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        background: '#FAFAF8',
        surface: '#FFFFFF',
        foreground: '#14171F',
        'foreground-muted': '#5B6270',
        border: '#E7E6E2',
        'border-strong': '#D8D7D2',
        accent: '#2B4EFF',
        'accent-muted': '#EEF1FF',
        success: '#1F9D6E',
        warning: '#B9832A',
        danger: '#C4433A'
      },
      fontFamily: {
        sans: ['Inter', 'ui-sans-serif', 'system-ui', 'sans-serif'],
        heading: ['Fraunces', 'Georgia', 'serif']
      },
      borderRadius: {
        xs: '4px',
        sm: '8px',
        md: '12px',
        lg: '20px'
      },
      boxShadow: {
        xs: '0 1px 2px rgba(20, 23, 31, 0.04)',
        sm: '0 2px 8px rgba(20, 23, 31, 0.06), 0 1px 2px rgba(20, 23, 31, 0.04)',
        md: '0 8px 24px rgba(20, 23, 31, 0.08), 0 2px 6px rgba(20, 23, 31, 0.04)',
        lg: '0 24px 48px rgba(20, 23, 31, 0.12), 0 8px 16px rgba(20, 23, 31, 0.06)',
        focus: '0 0 0 3px rgba(43, 78, 255, 0.16)'
      }
    }
  },
  plugins: []
};
