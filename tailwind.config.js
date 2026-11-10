/** @type {import('tailwindcss').Config} */
// Learn5 design system for Tailwind (NativeWind).
//   brand  = green, the main colour: buttons, links, the active tab, progress
//   pop    = pink, the complementary colour: "open now", highlights, the logo's dot
//   canvas / line = mint-white page background and borders
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
        // Main colour: green. Buttons, links, the active tab, progress.
        // 50-200: light tints, 300-400: green on dark, 500-900: green on light.
        brand: {
          50: '#ECFDF3',
          100: '#D1FADF',
          200: '#A6F4C5',
          300: '#6CE9A6',
          400: '#4ADE80',
          500: '#22C55E',
          600: '#16A34A',
          700: '#15803D',
          800: '#166534',
          900: '#14532D',
          950: '#052E16',
        },
        // Complementary colour: pink. "Open now" chips, highlights, the logo's dot.
        pop: {
          DEFAULT: '#FF3D7F',
          light: '#FF6FA3',
          dark: '#E0246A',
          soft: '#FFE1EC',
        },
        // Kept as aliases (older class names).
        leaf: {
          DEFAULT: '#16A34A',
          light: '#4ADE80',
          dark: '#15803D',
        },
        accent: {
          300: '#6CE9A6',
          400: '#4ADE80',
          500: '#22C55E',
        },
        volt: {
          DEFAULT: '#FF3D7F',
          dim: '#E0246A',
        },
        gold: {
          DEFAULT: '#E2A31A',
          soft: '#FBF0D2',
          light: '#F2C14E',
        },
        // Light mode: white with a hint of mint.
        canvas: '#F6FBF8',
        line: '#E2EEE6',
        // Dark mode: deep forest-night green (not black).
        ink: {
          DEFAULT: '#0F1A15',
          soft: '#12201A',
          card: '#16241D',
          raised: '#1C2E25',
          line: '#24392E',
        },
        // Greys with a hint of green.
        zinc: {
          50: '#F7FAF8',
          100: '#EEF4F0',
          200: '#E0EAE4',
          300: '#CAD8D0',
          400: '#9AAAA1',
          500: '#6E7F75',
          600: '#55635B',
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
