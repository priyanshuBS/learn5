/** @type {import('tailwindcss').Config} */
// Learn5 design system for Tailwind (NativeWind) — "Scholar".
//   A focused blue (brand) for actions and progress, warm amber (gold) for streaks
//   and points, and a soft colour per subject. Cool-white light mode, navy dark mode.
module.exports = {
  content: ['./app/**/*.{js,jsx,ts,tsx}', './src/**/*.{js,jsx,ts,tsx}'],
  presets: [require('nativewind/preset')],
  // "class" mode: on the website, a small script in app/+html.tsx adds the
  // "dark" class to <html> when the computer is in dark mode. Phones follow
  // the system setting automatically. ("media" mode crashes NativeWind's
  // web dev server with "Cannot manually set color scheme".)
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        // Scholar blue: the main colour (buttons, links, progress, the active tab).
        // 50-200 soft tints, 300-400 bright blue for dark mode, 500-700 for light mode.
        brand: {
          50: '#EEF3FF',
          100: '#DCE6FF',
          200: '#BACBFF',
          300: '#93AEFF',
          400: '#6A8BFF',
          500: '#4767F5',
          600: '#2F51E0',
          700: '#2541B8',
          800: '#213792',
          900: '#1F3173',
          950: '#141E45',
        },
        pop: { DEFAULT: '#2F51E0', light: '#6A8BFF', dark: '#2541B8', soft: '#EEF3FF' },
        // Amber: progress, streaks and points (warm, motivating).
        gold: { DEFAULT: '#F59E0B', soft: '#FEF3C7', light: '#FCD34D' },
        // Kept as aliases (older class names).
        leaf: { DEFAULT: '#2F51E0', light: '#6A8BFF', dark: '#2541B8' },
        accent: { 300: '#93AEFF', 400: '#6A8BFF', 500: '#4767F5' },
        volt: { DEFAULT: '#2F51E0', dim: '#2541B8' },
        // Light mode: a soft cool-white page with white cards.
        canvas: '#F6F7FB',
        line: '#E4E7EF',
        // Dark mode: deep navy.
        ink: {
          DEFAULT: '#0B1020',
          soft: '#0D1326',
          card: '#121A2E',
          raised: '#19233B',
          line: '#232E48',
          solid: '#121A2E',
        },
        // Cool slate greys.
        zinc: {
          50: '#F8FAFC',
          100: '#F1F4F9',
          200: '#E4E8F0',
          300: '#CDD4E0',
          400: '#98A2B6',
          500: '#667085',
          600: '#4B5565',
          700: '#364152',
          800: '#202939',
          900: '#121926',
          950: '#0B1020',
        },
      },
      // Geist for everything; Geist Mono for numbers, times and small labels.
      // Each weight is its own font file, so weights are chosen with these
      // classes (via the Txt component), not "font-bold".
      fontFamily: {
        display: ['Geist_700Bold'],
        body: ['Geist_400Regular'],
        'body-medium': ['Geist_500Medium'],
        'body-semibold': ['Geist_600SemiBold'],
        'body-bold': ['Geist_700Bold'],
        'body-heavy': ['Geist_700Bold'],
        mono: ['GeistMono_500Medium'],
        'mono-semibold': ['GeistMono_600SemiBold'],
      },
    },
  },
  plugins: [],
};
