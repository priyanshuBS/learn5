/**
 * theme.ts — Learn5 design tokens used from code (icons, gradients, inline styles).
 * Tailwind classes use the same values from tailwind.config.js.
 */
import type { IconName } from '@/components/Icon';

export type { IconName } from '@/components/Icon';

export const colors = {
  /** Main colour: slate graphite (light mode). */
  brand: '#23302D',
  brandDark: '#1A2422',
  brandSoft: '#F1F4F3',
  /** Main colour on dark backgrounds (active tab, links): mint. */
  brandOnDark: '#34D399',
  /** Accent: mint (progress, "open now", highlights, the logo's dot). */
  pop: '#10B981',
  popLight: '#34D399',
  popDark: '#059669',
  /** Older names. */
  leaf: '#10B981',
  leafLight: '#34D399',
  volt: '#10B981',
  /** Darkest text colour, used where code needs "black". */
  black: '#16201E',
  white: '#FFFFFF',
  text: '#16201E',
  textDark: '#EDF2F1',
  muted: '#66716F',
  mutedDark: '#99A6A3',
  line: '#E2E6E5',
  inkLine: '#2D3735',
  success: '#16A34A',
  danger: '#DC2626',
  warning: '#D97706',
  streak: '#F97316',
  points: '#E2A31A',
  canvas: '#F6F7F7',
  ink: '#161B1A',
  /** Empty part of progress rings. */
  track: '#E5E9E8',
  trackDark: '#2D3735',
} as const;

/** Mint for progress bars, rings and accent icons, readable on the current background. */
export function brandTone(dark: boolean): string {
  return dark ? colors.popLight : colors.pop;
}

/** Line icons for each category (falls back to the category emoji if missing). */
export const CATEGORY_ICONS: Record<string, IconName> = {
  english: 'english',
  math: 'math',
  reasoning: 'reasoning',
  physics: 'physics',
  chemistry: 'chemistry',
  biology: 'biology',
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
