/** @type {import('tailwindcss').Config} */
// Learn5 design system for Tailwind (NativeWind).
//   brand  = Indigo: buttons, links, active states
//   canvas = light page background, line = light borders
//   ink-*  = dark-mode page, cards, borders
// Dark mode follows the phone / browser setting automatically ("dark:" classes).
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
        brand: {
          50: '#EEF2FF',
          100: '#E0E7FF',
          200: '#C7D2FE',
          300: '#A5B4FC',
          400: '#818CF8',
          500: '#6366F1',
          600: '#4F46E5',
          700: '#4338CA',
          800: '#3730A3',
          900: '#312E81',
          950: '#1E1B4B',
        },
        canvas: '#F7F7FA',
        line: '#E8E8EE',
        ink: {
          DEFAULT: '#09090B',
          soft: '#0E0E12',
          card: '#131318',
          raised: '#1A1A21',
          line: '#26262E',
        },
      },
      // Inter: each weight is its own font file, so weights are chosen with
      // these classes (via the Txt component), not with "font-bold".
      fontFamily: {
        inter: ['Inter_400Regular'],
        'inter-medium': ['Inter_500Medium'],
        'inter-semibold': ['Inter_600SemiBold'],
        'inter-bold': ['Inter_700Bold'],
        'inter-heavy': ['Inter_800ExtraBold'],
      },
    },
  },
  plugins: [],
};
