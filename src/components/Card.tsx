/**
 * Card — a solid surface: white with a hairline border and a soft shadow in
 * light mode; a charcoal panel with a hairline border and a faint top
 * highlight in dark mode.
 */
import { View, type ViewProps } from 'react-native';
import { twMerge } from 'tailwind-merge';

export const CARD_CLASSES =
  'rounded-2xl border border-line bg-white web:shadow-[0_1px_2px_rgba(16,17,22,0.04),0_6px_20px_-12px_rgba(16,17,22,0.12)] dark:border-ink-line dark:bg-ink-card dark:web:shadow-[inset_0_1px_0_rgba(255,255,255,0.04)]';

/** Tappable cards: the border darkens a little on hover; a light press dims them. */
export const CARD_PRESSABLE_CLASSES =
  'active:opacity-90 web:transition-colors web:duration-150 web:hover:border-zinc-300 dark:web:hover:border-zinc-600';

export function Card({ className, ...rest }: ViewProps) {
  return <View className={twMerge(CARD_CLASSES, 'p-5', className)} {...rest} />;
}
