/**
 * theme.ts — Learn5 design tokens used from code (icons, gradients, inline styles).
 * Tailwind classes use the same values from tailwind.config.js.
 */
import type { IconName } from '@/components/Icon';

export type { IconName } from '@/components/Icon';

export const colors = {
  /** The main colour: indigo (light mode). */
  brand: '#4338CA',
  brandDark: '#3730A3',
  brandSoft: '#EFEEFD',
  /** Indigo on dark backgrounds (active tab, links). */
  brandOnDark: '#A9A4FF',
  /** Indigo for progress, "open now" and highlights. */
  pop: '#4338CA',
  popLight: '#8B85FF',
  popDark: '#3730A3',
  /** Older names. */
  leaf: '#4338CA',
  leafLight: '#8B85FF',
  volt: '#4338CA',
  /** Darkest text colour, used where code needs "black". */
  black: '#171630',
  white: '#FFFFFF',
  text: '#171630',
  textDark: '#ECEBFA',
  muted: '#636280',
  mutedDark: '#9897B8',
  line: '#ECEBF3',
  inkLine: '#24233A',
  success: '#0F8A5F',
  danger: '#E5484D',
  warning: '#D97706',
  /** Gold for streaks and points. */
  streak: '#F59E0B',
  points: '#FBBF24',
  gold: '#FBBF24',
  /** Deep indigo of the hero cards (light / dark mode). */
  hero: '#1E1B4B',
  heroDark: '#272366',
  canvas: '#FBFBFD',
  ink: '#0E0D18',
  /** A solid dark surface (for things that must not be see-through). */
  inkSolid: '#13121F',
  /** Empty part of progress rings. */
  track: '#ECEBF3',
  trackDark: '#24233A',
} as const;

/** Colours of the stat icons. */
export const ICON3D = { flame: '#4338CA', star: '#4338CA', trophy: '#4338CA' } as const;

/** Kept for older code. */
export const HERO_GRADIENT = ['#1E1B4B', '#272366', '#13113A'] as const;

/**
 * The main colour on the current background: indigo stays indigo in light mode and
 * becomes a lighter indigo in dark mode. Any other colour is returned as it is.
 */
export function inkOn(color: string, dark: boolean): string {
  if (!dark) return color;
  return color === colors.brand || color === colors.brandDark ? colors.brandOnDark : color;
}

/** Indigo for progress bars, rings and accent icons, readable on the current background. */
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

/** Colour of each badge's icon tile (when earned). */
export const BADGE_COLORS: Record<string, string> = {
  'first-drop': '#4338CA',
  'streak-7': '#F59E0B',
  'streak-30': '#EAB308',
  'correct-100': '#EC4899',
  'all-categories': '#10B981',
};

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
 * The colour for a subject's small labels. The design keeps ONE accent, so subjects
 * use quiet neutral text (their hex stays in content/categories.json for later use).
 */
export function categoryTone(_hex: string, dark: boolean): string {
  return dark ? '#9897B8' : '#6E6C8C';
}

/** Adds transparency to a hex colour: withAlpha('#FF0000', 0.2). */
export function withAlpha(hex: string, alpha: number): string {
  return `${hex}${Math.round(alpha * 255)
    .toString(16)
    .padStart(2, '0')}`;
}
