/** @type {import('tailwindcss').Config} */
// Learn5 design system for Tailwind (NativeWind).
//   brand  = Violet (with cyan "accent"): links, active states, glows
//   canvas = light page background, line = light borders
//   ink-*  = the near-black studio look (dark mode is the default)
//   ink-*  = dark-mode page, cards, borders
// Dark mode follows the phone / browser setting automatically ("dark:" classes).
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
        brand: {
          50: '#F5F3FF',
          100: '#EDE9FE',
          200: '#DDD6FE',
          300: '#C4B5FD',
          400: '#A78BFA',
          500: '#8B5CF6',
          600: '#7C3AED',
          700: '#6D28D9',
          800: '#5B21B6',
          900: '#4C1D95',
          950: '#2E1065',
        },
        accent: {
          300: '#67E8F9',
          400: '#22D3EE',
          500: '#06B6D4',
        },
        canvas: '#F5F4FA',
        line: '#E4E2EE',
        ink: {
          DEFAULT: '#050508',
          soft: '#08080D',
          card: '#0E0E15',
          raised: '#15151E',
          line: '#1E1E2A',
        },
      },
      // Fonts (same family as priyanshusingh.co.in):
      //   body    = Inter (text)
      //   display = Bricolage Grotesque (headings, numbers — bold weights)
      //   mono    = JetBrains Mono (small uppercase labels)
      // Each weight is its own font file, so weights are chosen with these classes
      // (via the Txt component), not with "font-bold".
      fontFamily: {
        body: ['Inter_400Regular'],
        'body-medium': ['Inter_500Medium'],
        'body-semibold': ['Inter_600SemiBold'],
        'body-bold': ['BricolageGrotesque_700Bold'],
        'body-heavy': ['BricolageGrotesque_800ExtraBold'],
        mono: ['JetBrainsMono_500Medium'],
      },
    },
  },
  plugins: [],
};
