/**
 * theme.ts — Learn5 design tokens used from code (icons, gradients, inline styles).
 * Tailwind classes use the same values from tailwind.config.js.
 */
import type { IconName } from '@/components/Icon';

export type { IconName } from '@/components/Icon';

export const colors = {
  /** The one accent: indigo (light mode). */
  brand: '#4F5BFF',
  brandDark: '#3B45E0',
  brandSoft: '#F1F2FF',
  /** Indigo on dark backgrounds (active tab, links). */
  brandOnDark: '#9AA2FF',
  /** Indigo for progress, "open now" and highlights. */
  pop: '#4F5BFF',
  popLight: '#7C85FF',
  popDark: '#3B45E0',
  /** Older names. */
  leaf: '#4F5BFF',
  leafLight: '#7C85FF',
  volt: '#4F5BFF',
  /** Darkest text colour, used where code needs "black". */
  black: '#0D0D10',
  white: '#FFFFFF',
  text: '#0D0D10',
  textDark: '#F1F1F3',
  muted: '#6B6B75',
  mutedDark: '#8C8C96',
  line: '#ECECF0',
  inkLine: '#222228',
  success: '#16A34A',
  danger: '#E5484D',
  warning: '#D97706',
  streak: '#FF7A2E',
  points: '#F5B70A',
  canvas: '#FAFAFB',
  ink: '#0B0B0D',
  /** A solid dark surface (for things that must not be see-through). */
  inkSolid: '#131316',
  /** Empty part of progress rings. */
  track: '#ECECF0',
  trackDark: '#222228',
} as const;

/** Colours of the 3D stat icons. */
export const ICON3D = { flame: '#FF7A2E', star: '#F5B70A', trophy: '#6E78FF' } as const;

/** Indigo for progress bars, rings and accent icons, readable on the current background. */
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

/** Colour of each badge's 3D icon (when earned). */
export const BADGE_COLORS: Record<string, string> = {
  'first-drop': '#38BDF8',
  'streak-7': '#FF7A2E',
  'streak-30': '#F5B70A',
  'correct-100': '#6E78FF',
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
