/**
 * Card — a plain surface: white with a soft border in light mode, a raised
 * charcoal panel in dark mode.
 */
import { View, type ViewProps } from 'react-native';
import { twMerge } from 'tailwind-merge';

export const CARD_CLASSES =
  'rounded-2xl border border-line bg-white web:shadow-[0_1px_2px_rgba(24,24,27,0.04)] dark:border-ink-line dark:bg-ink-card dark:web:shadow-none';

/** Tappable cards: the border darkens a little on hover. */
export const CARD_PRESSABLE_CLASSES =
  'active:opacity-90 web:transition-colors web:duration-150 web:hover:border-zinc-300 dark:web:hover:border-zinc-600';

export function Card({ className, ...rest }: ViewProps) {
  return <View className={twMerge(CARD_CLASSES, 'p-5', className)} {...rest} />;
}
