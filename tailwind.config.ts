import type { Config } from 'tailwindcss';
const config: Config = {
  content: ['./src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        brand: { 50:  '#f0f4f8',
          100: '#c8d8e8',
          200: '#a0bdd8',
          300: '#6e9cbd',
          400: '#4a7fa5',
          500: '#2e6490',
          600: '#1e3a5f',
          700: '#162c49',
          800: '#0d1f33',
          900: '#07111e', }
      },
      fontFamily: { sans: ['Inter','sans-serif'] },
      animation: {
        'shimmer': 'shimmer 2s infinite'
      },
      keyframes: {
        shimmer: { '0%,100%': { opacity: '1' }, '50%': { opacity: '0.5' } }
      }
    }
  }
};
export default config;
