/** @type {import('tailwindcss').Config} */
// Learn5 design system for Tailwind (NativeWind) — "Graphite & Mint".
//   brand  = slate graphite, the main colour: buttons, links, the active tab
//   pop    = mint, the accent: progress, "open now", highlights, the logo's dot
//   canvas / line = soft grey-white page background and borders
//   ink-*  = dark mode (deep graphite, not black): page, cards, raised surfaces, borders
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
        // Main colour: slate graphite. Buttons, links, the active tab (light mode).
        // 50-200: light tints, 300-400: light graphite for dark mode, 500-900: graphite for light mode.
        brand: {
          50: '#F1F4F3',
          100: '#E4E9E8',
          200: '#CBD3D1',
          300: '#E7EFED',
          400: '#D5DFDC',
          500: '#4A5A56',
          600: '#23302D',
          700: '#1A2422',
          800: '#141C1A',
          900: '#0F1513',
          950: '#0A0F0E',
        },
        // Accent: mint. Progress, "open now", highlights, the logo's dot.
        pop: {
          DEFAULT: '#10B981',
          light: '#34D399',
          dark: '#059669',
          soft: '#D1FAE5',
        },
        // Kept as aliases (older class names).
        leaf: {
          DEFAULT: '#10B981',
          light: '#34D399',
          dark: '#059669',
        },
        accent: {
          300: '#E7EFED',
          400: '#D5DFDC',
          500: '#4A5A56',
        },
        volt: {
          DEFAULT: '#10B981',
          dim: '#059669',
        },
        gold: {
          DEFAULT: '#E2A31A',
          soft: '#FBF0D2',
          light: '#F2C14E',
        },
        // Light mode: soft grey-white.
        canvas: '#F6F7F7',
        line: '#E2E6E5',
        // Dark mode: deep graphite (not black).
        ink: {
          DEFAULT: '#161B1A',
          soft: '#191F1E',
          card: '#1E2524',
          raised: '#252D2C',
          line: '#2D3735',
        },
        // Cool greys with a hint of green, matching the graphite.
        zinc: {
          50: '#F8F9F9',
          100: '#F0F2F2',
          200: '#E2E6E5',
          300: '#CDD3D2',
          400: '#9AA4A2',
          500: '#6B7573',
          600: '#535C5A',
          700: '#3A4442',
          800: '#2D3735',
          900: '#1E2524',
          950: '#161B1A',
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
