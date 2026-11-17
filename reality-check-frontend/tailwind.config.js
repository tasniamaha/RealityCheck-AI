/** @type {import('tailwindcss').Config} */

// Light-table theme.
// The pages were written for a dark neon look (text-white, bg-black, slate-900,
// cyan/purple accents). Instead of rewriting every class, the colour tokens are
// remapped here: the slate scale is flipped, white/black swap roles, and every
// accent family points at the one brand violet taken from the logo.

const ink      = '#17131F';
const lightbox = '#ECEBF1';   // page background, the lit glass
const print    = '#FFFFFF';   // surfaces lying on it

const brand = {
  50: '#F6EEFB', 100: '#EBDCF6', 200: '#D7B9EC',
  300: '#5C1E8C', 400: '#7A2AB8', 500: '#7A2AB8', 600: '#5C1E8C', 700: '#471669',
  800: '#EBDCF6', 900: '#F6EEFB', 950: '#F6EEFB',
};
const fake = {
  50: '#FCEDEA', 100: '#F8D8D2', 200: '#F0B1A7',
  300: '#8F1C12', 400: '#B9281B', 500: '#C42B1D', 600: '#9F2116', 700: '#7C1A11',
  800: '#F8D8D2', 900: '#FCEDEA', 950: '#FCEDEA',
};
const real = {
  50: '#E8F4EC', 100: '#CFE8D8', 200: '#9FD1B2',
  300: '#125532', 400: '#196F42', 500: '#1C7A48', 600: '#14603A', 700: '#0F4A2C',
  800: '#CFE8D8', 900: '#E8F4EC', 950: '#E8F4EC',
};
const unsure = {
  50: '#FBF2DC', 100: '#F6E4B8', 200: '#EBC870',
  300: '#6B4700', 400: '#8A5C00', 500: '#A87000', 600: '#8A5C00', 700: '#6B4700',
  800: '#F6E4B8', 900: '#FBF2DC', 950: '#FBF2DC',
};
const neutral = {
  50: '#100D16', 100: ink, 200: '#27222F', 300: '#3B3644', 400: '#575262',
  500: '#777283', 600: '#A19DAB', 700: '#CDCAD5', 800: '#E2E0E8', 900: '#F4F3F7', 950: print,
};

export default {
  content: ['./index.html', './src/**/*.{js,jsx,ts,tsx}'],
  theme: {
    extend: {
      colors: {
        ink, lightbox, print,
        rule: neutral[700],
        brand,
        white: ink,
        black: lightbox,
        slate: neutral, gray: neutral, zinc: neutral,
        cyan: brand, sky: brand, blue: brand, indigo: brand,
        violet: brand, purple: brand, fuchsia: brand, pink: brand,
        red: fake, rose: fake,
        emerald: real, green: real, teal: real,
        amber: unsure, yellow: unsure, orange: unsure,
        neon: { blue: brand[500], purple: brand[500], pink: brand[500] },
      },
      fontFamily: {
        sans: ['"Archivo Variable"', 'Archivo', '"Helvetica Neue"', 'Arial', 'sans-serif'],
        mono: ['"Archivo Variable"', 'Archivo', '"Helvetica Neue"', 'Arial', 'sans-serif'],
      },
      borderRadius: {
        sm: '2px', DEFAULT: '3px', md: '3px', lg: '4px', xl: '4px', '2xl': '6px', '3xl': '8px',
      },
      letterSpacing: { wide: '0.01em', wider: '0.03em', widest: '0.06em' },
      backdropBlur: { xs: '2px' },
    },
  },
  plugins: [],
};
