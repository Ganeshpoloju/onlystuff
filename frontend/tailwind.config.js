/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx,ts,tsx}'],
  theme: {
    extend: {
      colors: {
        brand: {
          50:  '#fff5f0',
          100: '#ffe8d9',
          200: '#ffc9a8',
          300: '#ffa577',
          400: '#ff7d46',
          500: '#FF6B35',
          600: '#e85420',
          700: '#c43e15',
          800: '#9e3011',
          900: '#7a2510',
        },
        orange: {
          400: '#F7931E',
          500: '#e8830f',
        },
      },
      fontFamily: {
        sans: ['Inter', 'Segoe UI', 'Arial', 'sans-serif'],
      },
      borderRadius: {
        xl: '12px',
        '2xl': '16px',
      },
    },
  },
  plugins: [],
};
