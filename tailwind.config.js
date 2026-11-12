/** @type {import('tailwindcss').Config} */
// Learn5 design system for Tailwind (NativeWind) — "Midnight Ember".
//   brand  = electric orange, the main colour: buttons, links, the active tab
//   pop    = the same orange family, for progress, "open now" and highlights
//   canvas / line = cool off-white page background and borders
//   ink-*  = dark mode (deep space + glass): page, cards, raised surfaces, borders
// Each subject brings its own vivid colour (content/categories.json).
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
        // Main colour: electric orange.
        // 50-200: light tints, 300-400: bright orange for dark mode, 500-900: deeper orange for light mode.
        brand: {
          50: '#FFF4ED',
          100: '#FFE4D3',
          200: '#FFC6A3',
          300: '#FF8F52',
          400: '#FF7A35',
          500: '#F76A1C',
          600: '#EA580C',
          700: '#C2410C',
          800: '#9A3412',
          900: '#7C2D12',
          950: '#431407',
        },
        // Accent: the bright end of the orange (progress, "open now", highlights).
        pop: {
          DEFAULT: '#F97316',
          light: '#FF8F52',
          dark: '#EA580C',
          soft: '#FFEDD5',
        },
        // Kept as aliases (older class names).
        leaf: {
          DEFAULT: '#F97316',
          light: '#FF8F52',
          dark: '#EA580C',
        },
        accent: {
          300: '#FF8F52',
          400: '#FF7A35',
          500: '#F76A1C',
        },
        volt: {
          DEFAULT: '#F97316',
          dim: '#EA580C',
        },
        gold: {
          DEFAULT: '#F5B70A',
          soft: '#FEF3C7',
          light: '#FCD34D',
        },
        // Light mode: cool off-white.
        canvas: '#F4F4F7',
        line: '#E4E4EB',
        // Dark mode: deep space (not pure black). Cards, raised parts and lines are
        // see-through "glass", so the glowing background shows through.
        ink: {
          DEFAULT: '#06070D',
          soft: 'rgba(12,13,22,0.72)',
          card: 'rgba(255,255,255,0.045)',
          raised: 'rgba(255,255,255,0.075)',
          line: 'rgba(255,255,255,0.09)',
          solid: '#10121B',
        },
        // Cool neutral greys.
        zinc: {
          50: '#F8F8FA',
          100: '#EFEFF3',
          200: '#E4E4EB',
          300: '#CFD0D9',
          400: '#9A9CAA',
          500: '#6B6D7B',
          600: '#525462',
          700: '#3A3C48',
          800: '#272A35',
          900: '#16171F',
          950: '#0C0D12',
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
