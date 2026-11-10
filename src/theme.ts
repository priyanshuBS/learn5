/**
 * theme.ts — Learn5 design tokens used from code (icons, gradients, inline styles).
 * Tailwind classes use the same values from tailwind.config.js.
 */
import type { IconName } from '@/components/Icon';

export type { IconName } from '@/components/Icon';

export const colors = {
  brand: '#1F5C45',
  brandDark: '#194D3A',
  brandSoft: '#EDF5F0',
  brandOnDark: '#5FBF8F',
  white: '#FFFFFF',
  cream: '#F4F1E8',
  text: '#13231C',
  textDark: '#E7EEE9',
  muted: '#5C6B62',
  mutedDark: '#93A399',
  line: '#E4DFD1',
  inkLine: '#263530',
  success: '#15803D',
  danger: '#C2410C',
  warning: '#B7791F',
  streak: '#E0662B',
  points: '#C99A2E',
  canvas: '#F4F1E8',
  ink: '#0E1512',
  /** Empty part of progress rings. */
  track: '#E8E3D5',
  trackDark: '#263530',
} as const;

/** The brand green that reads well on the current background. */
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
