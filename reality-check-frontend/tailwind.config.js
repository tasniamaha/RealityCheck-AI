/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,jsx,ts,tsx}"],
  theme: {
    extend: {
      colors: {
        neon: {
          blue: "#00f0ff",
          purple: "#c026d3",
          pink: "#ff00aa",
        },
      },
      backdropBlur: {
        xs: '2px',
      }
    },
  },
  plugins: [],
}