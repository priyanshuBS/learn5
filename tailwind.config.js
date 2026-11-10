/** @type {import('tailwindcss').Config} */
// Learn5 design system for Tailwind (NativeWind).
//   brand  = neutral greys: the UI is black and white
//   volt   = lime, only as a tiny signal (logo dot)
//   gold   = points and achievements
//   canvas / line = off-white page background and borders
//   ink-*  = dark-mode (black) page, cards, raised surfaces and borders
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
        // Lime: used only as a tiny signal (the logo's dot). Black text goes on it.
        volt: {
          DEFAULT: '#C8F135',
          dim: '#B6DE1F',
        },
        // "brand" is a neutral scale: the UI is black and white, and colour comes
        // from the subjects and from meaning (green = correct, orange = streak, gold = points).
        // 50-200: light tints, 300-400: light text on black, 500-900: dark text on white.
        brand: {
          50: '#F4F4F2',
          100: '#E9E9E6',
          200: '#D4D4D0',
          300: '#E5E5E2',
          400: '#D4D4D0',
          500: '#737371',
          600: '#262626',
          700: '#171717',
          800: '#0A0A0A',
          900: '#0A0A0A',
          950: '#0A0A0A',
        },
        // Kept as an alias of the brand scale (older class names).
        accent: {
          300: '#E5E5E2',
          400: '#D4D4D0',
          500: '#737371',
        },
        // Gold for points and achievements.
        gold: {
          DEFAULT: '#E2A31A',
          soft: '#FBF0D2',
          light: '#F2C14E',
        },
        // Light mode: soft off-white page, crisp borders.
        canvas: '#F2F2EE',
        line: '#E3E3DE',
        // Dark mode: true black with graphite cards.
        ink: {
          DEFAULT: '#0A0A0A',
          soft: '#0E0E0E',
          card: '#141414',
          raised: '#1C1C1C',
          line: '#262626',
        },
        // Plain neutral greys (no colour tint).
        zinc: {
          50: '#FAFAFA',
          100: '#F4F4F2',
          200: '#E5E5E2',
          300: '#D4D4D0',
          400: '#A3A3A0',
          500: '#737371',
          600: '#525250',
          700: '#404040',
          800: '#262626',
          900: '#171717',
          950: '#0A0A0A',
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
