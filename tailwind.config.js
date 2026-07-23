/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      fontFamily: {
        sans: ['"Plus Jakarta Sans"', 'sans-serif'],
        mono: ['"IBM Plex Mono"', 'monospace'],
      },
      colors: {
        cacao: {
          900: '#241812',
          800: '#3B2A1F',
          700: '#4A2C1E',
          600: '#6B3F2A',
          500: '#8C5A3D',
        },
        cream: {
          50: '#FFFFFF',
          100: '#FAF7F2',
          200: '#F3EBDF',
          300: '#EDE3D6',
        },
        gold: {
          400: '#D9B96B',
          500: '#C9A24B',
          600: '#AD8637',
        },
        rose: {
          500: '#C1442D',
          50: '#FBEAE6',
        },
        ok: {
          500: '#3F7D53',
          50: '#E9F4EC',
        },
      },
      borderRadius: {
        xl: '14px',
      },
    },
  },
  plugins: [],
}
