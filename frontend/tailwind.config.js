/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        coffee: {
          50: '#f9f4ef',
          100: '#f0e4d6',
          200: '#e0c7ab',
          300: '#cda87b',
          400: '#b9865a',
          500: '#a06b42',
          600: '#835436',
          700: '#67412e',
          800: '#4a2f24',
          900: '#2e1c16',
          950: '#1a0f0b',
        },
        cream: {
          50: '#fffdf9',
          100: '#fdf6ec',
          200: '#f8ecd8',
        },
        gold: {
          400: '#d4a656',
          500: '#c1913f',
          600: '#a5762e',
        },
      },
      fontFamily: {
        serif: ['"Playfair Display"', 'Georgia', 'serif'],
        sans: ['"Inter"', 'system-ui', 'sans-serif'],
      },
      boxShadow: {
        card: '0 8px 30px rgba(46, 28, 22, 0.08)',
      },
    },
  },
  plugins: [],
}

