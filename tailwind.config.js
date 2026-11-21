/** @type {import('tailwindcss').Config} */
// Learn5 design system for Tailwind (NativeWind) — "Slate & Teal".
//   Cool slate surfaces (deep navy in dark mode), with ONE accent: teal.
//   brand  = teal: buttons, links, the active tab, progress
//   pop    = the same teal (older class names)
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
        // Teal. 50-200: light tints, 300-400: bright teal for dark mode,
        // 500-700: deeper teal for light mode (white text passes contrast on 600+).
        brand: {
          50: '#EEFBF8',
          100: '#D3F5EE',
          200: '#A6EBDD',
          300: '#6FDCC8',
          400: '#38C6AF',
          500: '#16A594',
          600: '#0E7F74',
          700: '#0D6A62',
          800: '#0F5550',
          900: '#114642',
          950: '#032B28',
        },
        pop: {
          DEFAULT: '#0E7F74',
          light: '#38C6AF',
          dark: '#0D6A62',
          soft: '#EEFBF8',
        },
        // Kept as aliases (older class names).
        leaf: { DEFAULT: '#0E7F74', light: '#38C6AF', dark: '#0D6A62' },
        accent: { 300: '#6FDCC8', 400: '#38C6AF', 500: '#16A594' },
        volt: { DEFAULT: '#0E7F74', dim: '#0D6A62' },
        gold: { DEFAULT: '#F5B70A', soft: '#FEF3C7', light: '#FCD34D' },
        // Light mode: a cool, airy page, white cards, soft slate hairlines.
        canvas: '#F5F7FA',
        line: '#E3E8EF',
        // Dark mode: deep slate-navy, never pure black.
        ink: {
          DEFAULT: '#0A0F1A',
          soft: '#0C1220',
          card: '#111827',
          raised: '#172033',
          line: '#1E293B',
          solid: '#111827',
        },
        // Slate greys (cool, a touch of blue).
        zinc: {
          50: '#F8FAFC',
          100: '#F1F5F9',
          200: '#E2E8F0',
          300: '#CBD5E1',
          400: '#94A3B8',
          500: '#64748B',
          600: '#475569',
          700: '#334155',
          800: '#1E293B',
          900: '#0F172A',
          950: '#0A0F1A',
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
