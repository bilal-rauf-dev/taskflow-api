/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        background: '#FFFDF5',
        surface: '#FFFFFF',
        foreground: '#1E293B',
        'foreground-muted': '#64748B',
        muted: '#F1F5F9',
        border: '#E2E8F0',
        'border-strong': '#CBD5E1',
        accent: '#8B5CF6',
        'accent-muted': '#F3E8FF',
        secondary: '#F472B6',
        tertiary: '#FBBF24',
        quaternary: '#34D399',
        success: '#10B981',
        warning: '#F59E0B',
        danger: '#F43F5E'
      },
      fontFamily: {
        sans: ['Plus Jakarta Sans', 'ui-sans-serif', 'system-ui', 'sans-serif'],
        heading: ['Outfit', 'ui-sans-serif', 'system-ui', 'sans-serif']
      },
      borderRadius: {
        xs: '8px',
        sm: '8px',
        md: '16px',
        lg: '24px'
      },
      boxShadow: {
        xs: '2px 2px 0 #1E293B',
        sm: '4px 4px 0 #1E293B',
        md: '6px 6px 0 #E2E8F0',
        lg: '8px 8px 0 #F472B6',
        focus: '4px 4px 0 #8B5CF6',
        pop: '4px 4px 0 #1E293B',
        'pop-hover': '6px 6px 0 #1E293B',
        pink: '8px 8px 0 #F472B6'
      }
    }
  },
  plugins: []
};
