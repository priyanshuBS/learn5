/**
 * theme.ts — Learn5 design tokens used from code (icons, gradients, inline styles).
 * Tailwind classes use the same values from tailwind.config.js.
 */
import type { IconName } from '@/components/Icon';

export type { IconName } from '@/components/Icon';

export const colors = {
  /** The main colour: Scholar blue (light mode). */
  brand: '#2F51E0',
  brandDark: '#2541B8',
  brandSoft: '#EEF3FF',
  /** Blue on dark backgrounds (active tab, links). */
  brandOnDark: '#93AEFF',
  /** Blue for progress, "open now" and highlights. */
  pop: '#2F51E0',
  popLight: '#6A8BFF',
  popDark: '#2541B8',
  /** Older names. */
  leaf: '#2F51E0',
  leafLight: '#6A8BFF',
  volt: '#2F51E0',
  /** Darkest text colour, used where code needs "black". */
  black: '#121926',
  white: '#FFFFFF',
  text: '#121926',
  textDark: '#E6EAF5',
  muted: '#667085',
  mutedDark: '#8E99B3',
  line: '#E4E7EF',
  inkLine: '#232E48',
  success: '#12A150',
  danger: '#E5484D',
  warning: '#D97706',
  /** Warm amber for streaks and points. */
  streak: '#F97316',
  points: '#F59E0B',
  canvas: '#F6F7FB',
  ink: '#0B1020',
  /** A solid dark surface (for things that must not be see-through). */
  inkSolid: '#121A2E',
  /** Empty part of progress rings. */
  track: '#E4E8F0',
  trackDark: '#232E48',
} as const;

/** Colours of the stat icons. */
export const ICON3D = { flame: '#F97316', star: '#F59E0B', trophy: '#2F51E0' } as const;

/** Kept for older code. */
export const HERO_GRADIENT = ['#2F51E0', '#2541B8', '#1F3173'] as const;

/**
 * The main colour on the current background: blue stays blue in light mode and
 * becomes a lighter blue in dark mode. Any other colour is returned as it is.
 */
export function inkOn(color: string, dark: boolean): string {
  if (!dark) return color;
  return color === colors.brand || color === colors.brandDark ? colors.brandOnDark : color;
}

/** Blue for progress bars, rings and accent icons, readable on the current background. */
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
  'first-drop': '#2F51E0',
  'streak-7': '#F97316',
  'streak-30': '#F59E0B',
  'correct-100': '#8B5CF6',
  'all-categories': '#12A150',
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

/** A subject colour that reads well on the current background (lighter in dark mode). */
export function categoryTone(hex: string, dark: boolean): string {
  return dark ? lighten(hex, 0.25) : darken(hex, 0.12);
}

/** Adds transparency to a hex colour: withAlpha('#FF0000', 0.2). */
export function withAlpha(hex: string, alpha: number): string {
  return `${hex}${Math.round(alpha * 255)
    .toString(16)
    .padStart(2, '0')}`;
}
