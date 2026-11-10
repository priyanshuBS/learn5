/** @type {import('tailwindcss').Config} */
// Learn5 design system for Tailwind (NativeWind).
//   brand  = raspberry rose: buttons, links, active states, progress
//   volt   = gold: the logo's dot
//   canvas / line = blush-white page background and borders
//   ink-*  = dark-mode (plum-charcoal) page, cards, raised surfaces and borders
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
        // Gold: the dot in the logo, points and achievements.
        volt: {
          DEFAULT: '#FFC24B',
          dim: '#F5B12E',
        },
        // Raspberry rose: buttons, links, active states, progress.
        // 50-200: light tints, 300-400: rose for dark mode, 500-900: rose for light mode.
        brand: {
          50: '#FFF1F3',
          100: '#FFE4E8',
          200: '#FECDD6',
          300: '#FDA4B8',
          400: '#FB6F92',
          500: '#F43F6B',
          600: '#E11D48',
          700: '#BE123C',
          800: '#9F1239',
          900: '#881337',
          950: '#4C0519',
        },
        // Kept as an alias of the brand scale (older class names).
        accent: {
          300: '#FDA4B8',
          400: '#FB6F92',
          500: '#F43F6B',
        },
        gold: {
          DEFAULT: '#E2A31A',
          soft: '#FBF0D2',
          light: '#F2C14E',
        },
        // Light mode: soft blush-white page, warm borders.
        canvas: '#FFF7F8',
        line: '#F1E4E7',
        // Dark mode: deep plum-charcoal (not black).
        ink: {
          DEFAULT: '#1A1216',
          soft: '#1E1519',
          card: '#24191E',
          raised: '#2E2127',
          line: '#3A2A31',
        },
        // Greys with a hint of rose, so they sit well on blush and plum.
        zinc: {
          50: '#FBF8F9',
          100: '#F5EFF1',
          200: '#EADFE3',
          300: '#D9CACF',
          400: '#A8969D',
          500: '#7A6970',
          600: '#5E4F55',
          700: '#47393F',
          800: '#31262B',
          900: '#21181C',
          950: '#1A1216',
        },
      },
      // Space Grotesk for headings and big numbers; Inter for everything else.
      // Each weight is its own font file, so weights are chosen with these
      // classes (via the Txt component), not "font-bold".
      fontFamily: {
        display: ['SpaceGrotesk_700Bold'],
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
