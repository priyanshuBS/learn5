/** @type {import('tailwindcss').Config} */
// Learn5 design system for Tailwind (NativeWind).
//   brand  = calm blue: buttons, links, active states, progress
//   canvas / line = light page background and borders
//   ink-*  = dark-mode page, cards, raised surfaces and borders
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
        // One calm blue for actions, links and progress.
        brand: {
          50: '#EEF3FF',
          100: '#DDE7FF',
          200: '#BFD1FE',
          300: '#93B1FB',
          400: '#6A91F6',
          500: '#4473EE',
          600: '#2E5BDA',
          700: '#2448B5',
          800: '#213D8F',
          900: '#1F3570',
          950: '#162245',
        },
        // Kept as an alias of the brand blue (older class names).
        accent: {
          300: '#93B1FB',
          400: '#6A91F6',
          500: '#4473EE',
        },
        // Light mode: warm paper background, soft borders.
        canvas: '#F7F7F5',
        line: '#E6E5E1',
        // Dark mode: soft charcoal, not pure black.
        ink: {
          DEFAULT: '#111113',
          soft: '#151517',
          card: '#19191C',
          raised: '#212125',
          line: '#2A2A2F',
        },
      },
      // One typeface, Inter, in four weights. Each weight is its own font file,
      // so weights are chosen with these classes (via the Txt component), not "font-bold".
      fontFamily: {
        body: ['Inter_400Regular'],
        'body-medium': ['Inter_500Medium'],
        'body-semibold': ['Inter_600SemiBold'],
        'body-bold': ['Inter_700Bold'],
        'body-heavy': ['Inter_700Bold'],
        mono: ['Inter_500Medium'],
      },
    },
  },
  plugins: [],
};
