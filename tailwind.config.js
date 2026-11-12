/** @type {import('tailwindcss').Config} */
// Learn5 design system for Tailwind (NativeWind) — "Studio Mono & Indigo".
//   Near-black and white, with ONE accent: indigo.
//   brand  = indigo: buttons, links, the active tab, progress
//   pop    = the same indigo (older class names)
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
        // Indigo. 50-200: light tints, 300-400: bright indigo for dark mode,
        // 500-700: deeper indigo for light mode.
        brand: {
          50: '#F1F2FF',
          100: '#E4E6FF',
          200: '#CBCFFF',
          300: '#9AA2FF',
          400: '#7C85FF',
          500: '#6E78FF',
          600: '#4F5BFF',
          700: '#3B45E0',
          800: '#2F37B3',
          900: '#262C8C',
          950: '#171A52',
        },
        pop: {
          DEFAULT: '#4F5BFF',
          light: '#7C85FF',
          dark: '#3B45E0',
          soft: '#F1F2FF',
        },
        // Kept as aliases (older class names).
        leaf: { DEFAULT: '#4F5BFF', light: '#7C85FF', dark: '#3B45E0' },
        accent: { 300: '#9AA2FF', 400: '#7C85FF', 500: '#6E78FF' },
        volt: { DEFAULT: '#4F5BFF', dim: '#3B45E0' },
        gold: { DEFAULT: '#F5B70A', soft: '#FEF3C7', light: '#FCD34D' },
        // Light mode: a clean near-white page, white cards, soft hairlines.
        canvas: '#FAFAFB',
        line: '#ECECF0',
        // Dark mode: studio black, not pure black.
        ink: {
          DEFAULT: '#0B0B0D',
          soft: '#0F0F12',
          card: '#131316',
          raised: '#1A1A1F',
          line: '#222228',
          solid: '#131316',
        },
        // Neutral greys with the faintest cool bias.
        zinc: {
          50: '#F8F8FA',
          100: '#F1F1F4',
          200: '#E6E6EB',
          300: '#D2D2DA',
          400: '#9C9CA8',
          500: '#6E6E7A',
          600: '#55555F',
          700: '#3B3B43',
          800: '#26262C',
          900: '#16161A',
          950: '#0B0B0D',
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
