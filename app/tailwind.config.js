/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        brand: {
          ink: '#111827',
          text: '#333333',
          bg: '#F9FAFB',
          // 轻微点缀（低饱和），用于“soft_color”
          primary: '#2E4A8E',
          accent: '#1A6B5A',
          warning: '#B05500',
          danger: '#991B1B',
        },
      },
    },
  },
  plugins: [],
}

