/** @type {import('tailwindcss').Config} */
// Learn5 design system for Tailwind (NativeWind) — "Monochrome".
//   Pure black and white. The accent is ink: black in light mode, white in dark mode.
//   brand  = ink: buttons, links, the active tab, progress
//   pop    = the same (older class names)
//   canvas / line = light mode page and hairlines
//   ink-*  = dark mode: page, soft (bars), card, raised, line
// Subjects keep their own colour, used only on their 3D icons.
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
        // The "accent" is ink: near-black in light mode (600-900) and near-white
        // in dark mode (300-400, used with the dark: prefix). 50-200 are soft greys.
        brand: {
          50: '#F4F4F5',
          100: '#E9E9EB',
          200: '#D4D4D8',
          300: '#E4E4E7',
          400: '#FAFAFA',
          500: '#71717A',
          600: '#0A0A0A',
          700: '#000000',
          800: '#171717',
          900: '#0A0A0A',
          950: '#000000',
        },
        pop: {
          DEFAULT: '#0A0A0A',
          light: '#FAFAFA',
          dark: '#262626',
          soft: '#F4F4F5',
        },
        // Kept as aliases (older class names).
        leaf: { DEFAULT: '#0A0A0A', light: '#FAFAFA', dark: '#262626' },
        accent: { 300: '#E4E4E7', 400: '#FAFAFA', 500: '#71717A' },
        volt: { DEFAULT: '#0A0A0A', dim: '#262626' },
        gold: { DEFAULT: '#A3A3A3', soft: '#F5F5F5', light: '#D4D4D4' },
        // Light mode: paper white.
        canvas: '#FAFAFA',
        line: '#E5E5E5',
        // Dark mode: true black with charcoal cards.
        ink: {
          DEFAULT: '#000000',
          soft: '#0A0A0A',
          card: '#111111',
          raised: '#1A1A1A',
          line: '#262626',
          solid: '#111111',
        },
        // Pure neutral greys (no colour tint).
        zinc: {
          50: '#FAFAFA',
          100: '#F5F5F5',
          200: '#E5E5E5',
          300: '#D4D4D4',
          400: '#A3A3A3',
          500: '#737373',
          600: '#525252',
          700: '#404040',
          800: '#262626',
          900: '#171717',
          950: '#0A0A0A',
        },
      },
      // Plus Jakarta Sans for everything; Geist Mono for numbers, times and small labels.
      // Each weight is its own font file, so weights are chosen with these
      // classes (via the Txt component), not "font-bold".
      fontFamily: {
        display: ['PlusJakartaSans_800ExtraBold'],
        body: ['PlusJakartaSans_400Regular'],
        'body-medium': ['PlusJakartaSans_500Medium'],
        'body-semibold': ['PlusJakartaSans_600SemiBold'],
        'body-bold': ['PlusJakartaSans_700Bold'],
        'body-heavy': ['PlusJakartaSans_800ExtraBold'],
        mono: ['GeistMono_500Medium'],
        'mono-semibold': ['GeistMono_600SemiBold'],
      },
    },
  },
  plugins: [],
};
