/**
 * theme.ts — Learn5 design tokens used from code (icons, gradients, inline styles).
 * Tailwind classes use the same values from tailwind.config.js.
 */
import type { IconName } from '@/components/Icon';

export type { IconName } from '@/components/Icon';

export const colors = {
  /** Main colour: electric orange (light mode). */
  brand: '#EA580C',
  brandDark: '#C2410C',
  brandSoft: '#FFF4ED',
  /** Main colour on dark backgrounds (active tab, links): bright orange. */
  brandOnDark: '#FF8F52',
  /** Accent (progress, "open now", highlights, the logo's dot). */
  pop: '#F97316',
  popLight: '#FF8F52',
  popDark: '#EA580C',
  /** Older names. */
  leaf: '#F97316',
  leafLight: '#FF8F52',
  volt: '#F97316',
  /** Darkest text colour, used where code needs "black". */
  black: '#0E0F14',
  white: '#FFFFFF',
  text: '#0E0F14',
  textDark: '#F3F4F8',
  muted: '#6B6D7B',
  mutedDark: '#9A9CAA',
  line: '#E4E4EB',
  inkLine: '#272A35',
  success: '#16A34A',
  danger: '#DC2626',
  warning: '#D97706',
  streak: '#FF6A1A',
  points: '#F5B70A',
  canvas: '#F4F4F7',
  ink: '#0C0D12',
  /** Empty part of progress rings. */
  track: '#E8E8EE',
  trackDark: '#272A35',
} as const;

/** The signature gradient: hot orange into amber (hero card, logo, primary highlights). */
export const BRAND_GRADIENT = ['#FF4D1C', '#FF7A1A', '#FFB020'] as const;

/** A two-stop gradient from a subject colour, for icon tiles and accents. */
export function categoryGradient(hex: string): readonly [string, string] {
  return [lighten(hex, 0.18), darken(hex, 0.18)] as const;
}

/** Orange for progress bars, rings and accent icons, readable on the current background. */
export function brandTone(dark: boolean): string {
  return dark ? colors.popLight : colors.pop;
}

/** Line icons for each category (falls back to the category emoji if missing). */
export const CATEGORY_ICONS: Record<string, IconName> = {
  english: 'english',
  reasoning: 'reasoning',
  puzzles: 'puzzles',
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

/** A category colour that reads well on the current background (lighter in dark mode). */
export function categoryTone(hex: string, dark: boolean): string {
  return dark ? lighten(hex, 0.25) : darken(hex, 0.12);
}

/** Adds transparency to a hex colour: withAlpha('#FF0000', 0.2). */
export function withAlpha(hex: string, alpha: number): string {
  return `${hex}${Math.round(alpha * 255)
    .toString(16)
    .padStart(2, '0')}`;
}
