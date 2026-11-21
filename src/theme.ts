/**
 * theme.ts — Learn5 design tokens used from code (icons, gradients, inline styles).
 * Tailwind classes use the same values from tailwind.config.js.
 */
import type { IconName } from '@/components/Icon';

export type { IconName } from '@/components/Icon';

export const colors = {
  /** The one accent: teal (light mode). */
  brand: '#0E7F74',
  brandDark: '#0D6A62',
  brandSoft: '#EEFBF8',
  /** Teal on dark backgrounds (active tab, links). */
  brandOnDark: '#6FDCC8',
  /** Teal for progress, "open now" and highlights. */
  pop: '#0E7F74',
  popLight: '#38C6AF',
  popDark: '#0D6A62',
  /** Older names. */
  leaf: '#0E7F74',
  leafLight: '#38C6AF',
  volt: '#0E7F74',
  /** Darkest text colour, used where code needs "black". */
  black: '#0F172A',
  white: '#FFFFFF',
  text: '#0F172A',
  textDark: '#E8EDF5',
  muted: '#5B6578',
  mutedDark: '#8B96AB',
  line: '#E3E8EF',
  inkLine: '#1E293B',
  success: '#16A34A',
  danger: '#E5484D',
  warning: '#D97706',
  streak: '#FF7A2E',
  points: '#F5B70A',
  canvas: '#F5F7FA',
  ink: '#0A0F1A',
  /** A solid dark surface (for things that must not be see-through). */
  inkSolid: '#111827',
  /** Empty part of progress rings. */
  track: '#E3E8EF',
  trackDark: '#1E293B',
} as const;

/** Colours of the 3D stat icons. */
export const ICON3D = { flame: '#FF7A2E', star: '#F5B70A', trophy: '#16A594' } as const;

/** The hero gradient on Home (deep teal to navy). */
export const HERO_GRADIENT = ['#0E7F74', '#0B4F63', '#0F2747'] as const;

/** Teal for progress bars, rings and accent icons, readable on the current background. */
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

/** Colour of each badge's 3D icon (when earned). */
export const BADGE_COLORS: Record<string, string> = {
  'first-drop': '#0EA5E9',
  'streak-7': '#FF7A2E',
  'streak-30': '#F5B70A',
  'correct-100': '#8B5CF6',
  'all-categories': '#16A594',
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
