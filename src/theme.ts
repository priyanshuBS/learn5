/**
 * theme.ts — Learn5 design tokens used from code (icons, gradients, inline styles).
 * Tailwind classes use the same values from tailwind.config.js.
 */
import type { IconName } from '@/components/Icon';

export type { IconName } from '@/components/Icon';

export const colors = {
  brand: '#4F46E5',
  brandDark: '#4338CA',
  brandSoft: '#EEF2FF',
  brandOnDark: '#A5B4FC',
  white: '#FFFFFF',
  text: '#0F172A',
  textDark: '#F4F4F5',
  muted: '#64748B',
  mutedDark: '#94A3B8',
  line: '#E8E8EE',
  inkLine: '#26262E',
  success: '#059669',
  danger: '#E11D48',
  warning: '#D97706',
  streak: '#F97316',
  points: '#F59E0B',
  canvas: '#F7F7FA',
  ink: '#09090B',
  /** Empty part of progress rings. */
  track: '#EDEDF2',
  trackDark: '#24242B',
} as const;

/** Deep indigo gradient for hero cards. */
export const HERO_GRADIENT = ['#1E1B4B', '#312E81', '#4F46E5'] as const;

/** Small gradient for the logo mark and accents. */
export const BRAND_GRADIENT = ['#6366F1', '#4F46E5', '#4338CA'] as const;

/** Line icons for each category (falls back to the category emoji if missing). */
export const CATEGORY_ICONS: Record<string, IconName> = {
  english: 'english',
  math: 'math',
  reasoning: 'reasoning',
  physics: 'physics',
  chemistry: 'chemistry',
  biology: 'biology',
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

/** A category colour that reads well on the current background (lighter in dark mode). */
export function categoryTone(hex: string, dark: boolean): string {
  return dark ? lighten(hex, 0.35) : hex;
}

/** Adds transparency to a hex colour: withAlpha('#FF0000', 0.2). */
export function withAlpha(hex: string, alpha: number): string {
  return `${hex}${Math.round(alpha * 255)
    .toString(16)
    .padStart(2, '0')}`;
}
