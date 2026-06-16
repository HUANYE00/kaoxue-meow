/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        brand: {
          ink: '#111827',
          text: '#1F1A14',
          bg: '#FAF6F0',
          primary: '#F5B82E',
          accent: '#1A6B5A',
          warning: '#B05500',
          danger: '#991B1B',
        },
      },
      fontFamily: {
        serif: [
          'ui-serif',
          'Georgia',
          'Cambria',
          'Times New Roman',
          'Times',
          'serif',
        ],
      },
    },
  },
  plugins: [],
}

