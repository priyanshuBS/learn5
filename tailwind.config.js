/** @type {import('tailwindcss').Config} */
// Learn5 design system for Tailwind (NativeWind) — "Deep Indigo".
//   A rich indigo (brand) for actions and progress, gold for streaks, points and the
//   main call to action on deep indigo hero cards, and a soft colour per subject.
//   Lavender-white light mode, deep ink-violet dark mode.
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
        // Deep Indigo: the main colour (buttons, links, progress, the active tab).
        // 50-200 soft tints, 300-400 bright indigo for dark mode, 500-700 for light mode,
        // 900 = the deep indigo of hero cards.
        brand: {
          50: '#EFEEFD',
          100: '#E2E0FC',
          200: '#C8C4FA',
          300: '#A9A4FF',
          400: '#8B85FF',
          500: '#5B52E6',
          600: '#4338CA',
          700: '#3730A3',
          800: '#2E2A85',
          900: '#1E1B4B',
          950: '#13113A',
        },
        pop: { DEFAULT: '#4338CA', light: '#8B85FF', dark: '#3730A3', soft: '#EFEEFD' },
        // Gold: streaks, points and the main call to action on dark cards.
        gold: { DEFAULT: '#FBBF24', soft: '#FEF3C7', light: '#FCD34D', dark: '#B7791F' },
        // Kept as aliases (older class names).
        leaf: { DEFAULT: '#4338CA', light: '#8B85FF', dark: '#3730A3' },
        accent: { 300: '#A9A4FF', 400: '#8B85FF', 500: '#5B52E6' },
        volt: { DEFAULT: '#4338CA', dim: '#3730A3' },
        // Light mode: a soft lavender-white page with white cards.
        canvas: '#F6F6FB',
        line: '#E5E4F0',
        // Dark mode: deep ink-violet.
        ink: {
          DEFAULT: '#0D0C1D',
          soft: '#100F23',
          card: '#15142B',
          raised: '#1D1C38',
          line: '#26244A',
          solid: '#15142B',
        },
        // Greys with a soft indigo tint.
        zinc: {
          50: '#F8F8FC',
          100: '#F1F1F8',
          200: '#E5E4F0',
          300: '#CFCEE0',
          400: '#9F9DBA',
          500: '#6E6C8C',
          600: '#514F6E',
          700: '#3B3A55',
          800: '#24223F',
          900: '#171630',
          950: '#0D0C1D',
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
