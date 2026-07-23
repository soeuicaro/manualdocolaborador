/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        // Paleta oficial 4JURIS (Rebranding)
        brand: {
          DEFAULT: '#0032D2', // 4JURIS Blue
          50: '#F2F5FE',
          100: '#E7ECFD',
          200: '#C9D5FB',
          300: '#9DB0FF',
          400: '#4d6bec',
          500: '#0032D2',
          600: '#0029ac',
          700: '#001f83',
          800: '#001a6b',
          900: '#001456',
        },
        ink: {
          DEFAULT: '#122029', // Midnight Blue
          soft: '#1c2f3a',
          2: '#3d4b56',
        },
        winter: '#E9ECEC',   // Winter White
        platinum: '#C0C4C7', // Platinum
        surface: {
          DEFAULT: '#FFFFFF',
          2: '#FBFCFE',
          3: '#F4F6F9',
        },
        line: { DEFAULT: '#E4E8ED', strong: '#D3D9DF' },
        muted: { DEFAULT: '#6a7681', 2: '#97a0a9' },
        success: { DEFAULT: '#0f9d6b', soft: '#e3f6ee' },
        warning: { DEFAULT: '#c98a12', soft: '#fbf1dc' },
        danger: { DEFAULT: '#d8433b', soft: '#fbe6e5' },
        gold: { DEFAULT: '#c98a12', soft: '#fbf1dc' },
      },
      fontFamily: {
        sans: ['Sora', 'ui-sans-serif', 'system-ui', 'sans-serif'],
      },
      borderRadius: {
        xl: '14px',
        '2xl': '18px',
        '3xl': '24px',
      },
      boxShadow: {
        xs: '0 1px 2px rgba(18,32,41,.05)',
        sm: '0 1px 2px rgba(18,32,41,.05), 0 4px 12px rgba(18,32,41,.05)',
        md: '0 2px 6px rgba(18,32,41,.06), 0 14px 34px rgba(18,32,41,.09)',
        lg: '0 10px 30px rgba(18,32,41,.10), 0 30px 60px rgba(18,32,41,.14)',
        brand: '0 4px 16px rgba(0,50,210,.30)',
        glow: '0 0 0 1px rgba(0,50,210,.4), 0 0 24px rgba(0,50,210,.35)',
      },
      keyframes: {
        'fade-in': { from: { opacity: '0' }, to: { opacity: '1' } },
        'slide-up': { from: { opacity: '0', transform: 'translateY(14px)' }, to: { opacity: '1', transform: 'none' } },
        'scale-in': { from: { opacity: '0', transform: 'scale(.97)' }, to: { opacity: '1', transform: 'none' } },
        shimmer: { '100%': { transform: 'translateX(100%)' } },
        'pop': { '0%': { transform: 'scale(.8)', opacity: '0' }, '60%': { transform: 'scale(1.05)' }, '100%': { transform: 'scale(1)', opacity: '1' } },
      },
      animation: {
        'fade-in': 'fade-in .3s ease',
        'slide-up': 'slide-up .35s cubic-bezier(.2,.8,.3,1)',
        'scale-in': 'scale-in .22s cubic-bezier(.2,.8,.3,1)',
        pop: 'pop .4s cubic-bezier(.2,.8,.3,1)',
      },
    },
  },
  plugins: [],
}
