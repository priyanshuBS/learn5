/**
 * theme.ts — Learn5 design tokens used from code (icons, gradients, inline styles).
 * Tailwind classes use the same values from tailwind.config.js.
 */
import type { IconName } from '@/components/Icon';

export type { IconName } from '@/components/Icon';

export const colors = {
  /** Green: progress, "open now", the logo's dot. */
  leaf: '#22C55E',
  leafLight: '#4ADE80',
  /** Older name for the logo-dot colour. */
  volt: '#22C55E',
  /** Hot pink: buttons, links, the active tab. */
  brand: '#FF3D7F',
  brandDark: '#E0246A',
  brandSoft: '#FFF0F5',
  brandOnDark: '#FF6FA3',
  /** Darkest text colour, used where code needs "black". */
  black: '#1F1A1D',
  white: '#FFFFFF',
  text: '#1F1A1D',
  textDark: '#EEF7F1',
  muted: '#857079',
  mutedDark: '#93AE9F',
  line: '#F3E3EA',
  inkLine: '#24392E',
  success: '#16A34A',
  danger: '#DC2626',
  warning: '#D97706',
  streak: '#F97316',
  points: '#E2A31A',
  canvas: '#FFF8FA',
  ink: '#0F1A15',
  /** Empty part of progress rings. */
  track: '#F3E6EC',
  trackDark: '#24392E',
} as const;

/** Green for progress bars, rings and accent icons, readable on the current background. */
export function brandTone(dark: boolean): string {
  return dark ? colors.leafLight : colors.leaf;
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
