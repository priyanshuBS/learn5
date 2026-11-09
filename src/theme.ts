/**
 * theme.ts — Learn5 design tokens used from code (icons, gradients, inline styles).
 * Tailwind classes use the same values from tailwind.config.js.
 */
import type { IconName } from '@/components/Icon';

export type { IconName } from '@/components/Icon';

export const colors = {
  brand: '#8B5CF6',
  brandDark: '#6D28D9',
  brandSoft: '#F5F3FF',
  brandOnDark: '#C4B5FD',
  white: '#FFFFFF',
  text: '#0B0B12',
  textDark: '#F2F2F5',
  muted: '#6B6B80',
  mutedDark: '#8E8EA3',
  line: '#E4E2EE',
  inkLine: '#1E1E2A',
  success: '#059669',
  danger: '#E11D48',
  warning: '#D97706',
  streak: '#F97316',
  points: '#F59E0B',
  canvas: '#F5F4FA',
  ink: '#050508',
  /** Empty part of progress rings. */
  track: '#ECECF3',
  trackDark: '#1C1C27',
} as const;

/** Deep violet → indigo → teal: the hero slabs (always dark, white text on top). */
export const HERO_GRADIENT = ['#170E33', '#2A1A63', '#0B3A4D'] as const;

/** Kept for older call sites; heroes no longer have a 3D edge. */
export const HERO_LIP = 'transparent';

/** Small gradient for the logo mark and accents. */
export const BRAND_GRADIENT = ['#C4B5FD', '#8B5CF6', '#22D3EE'] as const;

/** Glow orbs behind content (like priyanshusingh.co.in). */
export const GLOW = { violet: '#8B5CF6', cyan: '#22D3EE', lilac: '#C4B5FD' } as const;

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

/** Mixes a hex colour with black: darken('#2563EB', 0.3) is 30% darker. */
export function darken(hex: string, amount: number): string {
  const n = parseInt(hex.slice(1), 16);
  const mix = (c: number) => Math.round(c * (1 - amount));
  const [r, g, b] = [(n >> 16) & 255, (n >> 8) & 255, n & 255].map(mix);
  return `#${((1 << 24) | (r << 16) | (g << 8) | b).toString(16).slice(1)}`;
}

/** A rich gradient made from one colour (used for subject heroes). */
export function gradientFrom(hex: string): readonly [string, string, string] {
  return [darken(hex, 0.72), darken(hex, 0.86), '#07070C'];
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
