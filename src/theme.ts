/**
 * theme.ts — Learn5 design tokens used from code (icons, gradients, inline styles).
 * Tailwind classes use the same values from tailwind.config.js.
 */
import type { IconName } from '@/components/Icon';

export type { IconName } from '@/components/Icon';

export const colors = {
  /** Main colour: green. */
  brand: '#16A34A',
  brandDark: '#15803D',
  brandSoft: '#ECFDF3',
  brandOnDark: '#4ADE80',
  /** Complementary colour: pink ("open now", highlights, the logo's dot). */
  pop: '#FF3D7F',
  popLight: '#FF6FA3',
  /** Older names. */
  leaf: '#16A34A',
  leafLight: '#4ADE80',
  volt: '#FF3D7F',
  /** Darkest text colour, used where code needs "black". */
  black: '#14201A',
  white: '#FFFFFF',
  text: '#14201A',
  textDark: '#EEF7F1',
  muted: '#6B8276',
  mutedDark: '#93AE9F',
  line: '#E2EEE6',
  inkLine: '#24392E',
  success: '#16A34A',
  danger: '#DC2626',
  warning: '#D97706',
  streak: '#F97316',
  points: '#E2A31A',
  canvas: '#F6FBF8',
  ink: '#0F1A15',
  /** Empty part of progress rings. */
  track: '#E4F0E8',
  trackDark: '#24392E',
} as const;

/** The green that reads well on the current background (progress, rings, accent icons). */
export function brandTone(dark: boolean): string {
  return dark ? colors.brandOnDark : colors.brand;
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
