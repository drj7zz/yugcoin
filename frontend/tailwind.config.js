/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{js,jsx,ts,tsx}",
    "./public/index.html",
  ],
  theme: {
    extend: {
      colors: {
        liquidLight: '#e0e5ec',
        liquidDark: '#12151a',
        primary: '#38bdf8',
        primaryHover: '#0ea5e9',
        accent: '#f43f5e',
      },
      animation: {
        'liquid-float': 'float 6s ease-in-out infinite',
      },
      keyframes: {
        float: {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-10px)' },
        }
      },
      backdropBlur: {
        xs: '2px',
        md: '8px',
        lg: '12px',
      }
    },
  },
  plugins: [],
}
