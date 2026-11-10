/** @type {import('tailwindcss').Config} */
// Learn5 design system for Tailwind (NativeWind) — "Watermelon".
//   brand  = hot pink: buttons, links, the active tab
//   leaf   = green: progress, "open now", the logo's dot
//   canvas / line = blush-white page background and borders
//   ink-*  = dark mode (deep forest-night green): page, cards, raised surfaces, borders
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
        // Watermelon: pink for actions, green for progress and "open now".
        // Pink scale. 50-200: light tints, 300-500: pink on dark, 600-900: pink on light.
        brand: {
          50: '#FFF0F5',
          100: '#FFE1EC',
          200: '#FFC2D8',
          300: '#FF9DBF',
          400: '#FF6FA3',
          500: '#FF4D8D',
          600: '#FF3D7F',
          700: '#E0246A',
          800: '#B81A55',
          900: '#8F1543',
          950: '#4D0A24',
        },
        // Green: progress, "open now" chips, the logo's dot.
        leaf: {
          DEFAULT: '#22C55E',
          light: '#4ADE80',
          dark: '#16A34A',
        },
        // Kept as aliases (older class names).
        accent: {
          300: '#FF9DBF',
          400: '#FF6FA3',
          500: '#FF4D8D',
        },
        volt: {
          DEFAULT: '#22C55E',
          dim: '#16A34A',
        },
        gold: {
          DEFAULT: '#E2A31A',
          soft: '#FBF0D2',
          light: '#F2C14E',
        },
        // Light mode: white with a blush of pink.
        canvas: '#FFF8FA',
        line: '#F3E3EA',
        // Dark mode: deep forest-night green (not black).
        ink: {
          DEFAULT: '#0F1A15',
          soft: '#12201A',
          card: '#16241D',
          raised: '#1C2E25',
          line: '#24392E',
        },
        // Greys: a touch of pink at the light end, a touch of green at the dark end.
        zinc: {
          50: '#FBF7F9',
          100: '#F4EEF1',
          200: '#E9E0E5',
          300: '#D6CBD1',
          400: '#A39AA0',
          500: '#7A7277',
          600: '#5C5559',
          700: '#3F4A44',
          800: '#24392E',
          900: '#16241D',
          950: '#0F1A15',
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
