import type { Config } from 'tailwindcss';
const config: Config = {
  content: ['./src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        brand: { 50:'#f5f3ff', 100:'#ede9fe', 500:'#7c3aed', 600:'#6d28d9', 900:'#4c1d95' }
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
