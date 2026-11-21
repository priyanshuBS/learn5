/**
 * theme.ts — Learn5 design tokens used from code (icons, gradients, inline styles).
 * Tailwind classes use the same values from tailwind.config.js.
 */
import type { IconName } from '@/components/Icon';

export type { IconName } from '@/components/Icon';

export const colors = {
  /** The one accent: ink. Black in light mode... */
  brand: '#0A0A0A',
  brandDark: '#000000',
  brandSoft: '#F4F4F5',
  /** ...and white in dark mode (active tab, links). */
  brandOnDark: '#FAFAFA',
  /** Ink for progress, "open now" and highlights. */
  pop: '#0A0A0A',
  popLight: '#FAFAFA',
  popDark: '#262626',
  /** Older names. */
  leaf: '#0A0A0A',
  leafLight: '#FAFAFA',
  volt: '#0A0A0A',
  /** Darkest text colour, used where code needs "black". */
  black: '#0A0A0A',
  white: '#FFFFFF',
  text: '#0A0A0A',
  textDark: '#FAFAFA',
  muted: '#6B6B6B',
  mutedDark: '#A1A1A1',
  line: '#E5E5E5',
  inkLine: '#262626',
  /** Right / wrong / late stay readable as green, red and amber (quiz feedback only). */
  success: '#16A34A',
  danger: '#E5484D',
  warning: '#737373',
  /** Streak and points: a neutral grey that reads on black and on white. */
  streak: '#8A8A8A',
  points: '#8A8A8A',
  canvas: '#FAFAFA',
  ink: '#000000',
  /** A solid dark surface (for things that must not be see-through). */
  inkSolid: '#111111',
  /** Empty part of progress rings. */
  track: '#E5E5E5',
  trackDark: '#262626',
} as const;

/** Colours of the 3D stat icons (Icon3D draws them in black/white anyway). */
export const ICON3D = { flame: '#0A0A0A', star: '#0A0A0A', trophy: '#0A0A0A' } as const;

/** The hero gradient on Home: charcoal to black (white text on top, in both themes). */
export const HERO_GRADIENT = ['#2A2A2A', '#141414', '#000000'] as const;

/**
 * The ink colour on the current background: black stays black in light mode and
 * becomes white in dark mode. Any other colour is returned as it is.
 */
export function inkOn(color: string, dark: boolean): string {
  if (!dark) return color;
  return color === colors.brand || color === colors.black || color === colors.brandDark
    ? colors.brandOnDark
    : color;
}

/** Ink for progress bars, rings and accent icons, readable on the current background. */
export function brandTone(dark: boolean): string {
  return dark ? colors.popLight : colors.pop;
}

/** Line icons for each category (falls back to the category emoji if missing). */
export const CATEGORY_ICONS: Record<string, IconName> = {
  math: 'math',
  reasoning: 'reasoning',
  english: 'english',
  'computer-science': 'computer-science',
};

/** Line icons for each badge. */
export const BADGE_ICONS: Record<string, IconName> = {
  'first-drop': 'target',
  'streak-7': 'flame',
  'streak-30': 'crown',
  'correct-100': 'medal',
  'all-categories': 'palette',
};

/** Colour of each badge's 3D icon (unused: the theme is black and white). */
export const BADGE_COLORS: Record<string, string> = {};

/** Icon for each drop slot: morning, afternoon, evening. */
export const SLOT_ICONS: IconName[] = ['sunrise', 'sun', 'moon'];

/** Mixes a hex colour with white: lighten('#2563EB', 0.3) is 30% lighter. */
export function lighten(hex: string, amount: number): string {
  const n = parseInt(hex.slice(1), 16);
  const mix = (c: number) => Math.round(c + (255 - c) * amount);
  const [r, g, b] = [(n >> 16) & 255, (n >> 8) & 255, n & 255].map(mix);
  return `#${((1 << 24) | (r << 16) | (g << 8) | b).toString(16).slice(1)}`;
}

/** Mixes a hex colour with black: darken('#2563EB', 0.3) is 30% darker. */
export function darken(hex: string, amount: number): string {
  const n = parseInt(hex.slice(1), 16);
  const mix = (c: number) => Math.round(c * (1 - amount));
  const [r, g, b] = [(n >> 16) & 255, (n >> 8) & 255, n & 255].map(mix);
  return `#${((1 << 24) | (r << 16) | (g << 8) | b).toString(16).slice(1)}`;
}

/**
 * The colour for a subject's text and chips. The theme is black and white, so every
 * subject uses ink (the hex is kept in content/categories.json but not shown).
 */
export function categoryTone(_hex: string, dark: boolean): string {
  return dark ? '#E5E5E5' : '#262626';
}

/** Adds transparency to a hex colour: withAlpha('#FF0000', 0.2). */
export function withAlpha(hex: string, alpha: number): string {
  return `${hex}${Math.round(alpha * 255)
    .toString(16)
    .padStart(2, '0')}`;
}
