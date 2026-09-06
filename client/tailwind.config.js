/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        field: {
          50: '#eef4f1',
          100: '#d7e6de',
          200: '#aecabb',
          400: '#3d7a5f',
          600: '#1f4b3f',
          700: '#183a31',
          900: '#0f2721',
        },
        harvest: {
          50: '#fbf3e4',
          100: '#f3e0b8',
          400: '#d19a35',
          500: '#c98a2c',
          600: '#a86f1f',
        },
        sky: {
          50: '#eaf1f4',
          100: '#c7dae1',
          400: '#3c7d95',
          500: '#2b5f75',
          600: '#204a5c',
        },
        soil: {
          50: '#f6f5f2',
          100: '#e8e4dc',
          400: '#6b6156',
          600: '#453e37',
          800: '#2a2420',
        },
        rust: {
          500: '#b23a3a',
          600: '#94302f',
        },
      },
      fontFamily: {
        display: ['"Fraunces"', 'serif'],
        body: ['"IBM Plex Sans"', 'sans-serif'],
        mono: ['"IBM Plex Mono"', 'monospace'],
      },
      borderRadius: {
        card: '10px',
        pill: '999px',
      },
    },
  },
  plugins: [],
};
