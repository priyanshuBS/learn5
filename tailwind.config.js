/** @type {import('tailwindcss').Config} */
// Learn5 design system for Tailwind (NativeWind).
//   brand  = forest green: buttons, links, active states, progress
//   gold   = points and achievements
//   canvas / line = cream page background and borders
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
        // Forest green for actions, links and progress (mint in dark mode).
        brand: {
          50: '#EDF5F0',
          100: '#D5E9DD',
          200: '#ADD5BF',
          300: '#86CFA8',
          400: '#5FBF8F',
          500: '#2F8562',
          600: '#1F5C45',
          700: '#194D3A',
          800: '#153F30',
          900: '#113327',
          950: '#0A2019',
        },
        // Kept as an alias of the brand green (older class names).
        accent: {
          300: '#86CFA8',
          400: '#5FBF8F',
          500: '#2F8562',
        },
        // Gold for points and achievements.
        gold: {
          DEFAULT: '#C99A2E',
          soft: '#F6EBCF',
          light: '#E0B44F',
        },
        // Light mode: cream paper background, warm borders.
        canvas: '#F4F1E8',
        line: '#E4DFD1',
        // Dark mode: deep green-black, not pure black.
        ink: {
          DEFAULT: '#0E1512',
          soft: '#111A16',
          card: '#15201B',
          raised: '#1C2923',
          line: '#263530',
        },
        // Greys with a hint of green, so they sit well on cream and green-black.
        zinc: {
          50: '#F6F5EF',
          100: '#EEECE3',
          200: '#E2DFD3',
          300: '#CBC8BA',
          400: '#9AA49D',
          500: '#6B7870',
          600: '#55625A',
          700: '#3E4A43',
          800: '#28332D',
          900: '#18211C',
          950: '#0E1512',
        },
      },
      // Fraunces (a serif) for headings and big numbers; Inter for everything else.
      // Each weight is its own font file, so weights are chosen with these
      // classes (via the Txt component), not "font-bold".
      fontFamily: {
        display: ['Fraunces_600SemiBold'],
        'display-italic': ['Fraunces_600SemiBold_Italic'],
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
