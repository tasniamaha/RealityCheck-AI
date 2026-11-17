/** @type {import('tailwindcss').Config} */
const times = ['"Times New Roman"', 'Times', 'serif'];

export default {
  content: ['./index.html', './src/**/*.{js,jsx,ts,tsx}'],
  theme: {
    extend: {
      fontFamily: { sans: times, serif: times, mono: times },
      colors: {
        neon: { blue: '#00f0ff', purple: '#c026d3', pink: '#ff00aa' },
      },
    },
  },
  plugins: [],
}
