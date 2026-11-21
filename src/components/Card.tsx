/**
 * Card — a flat surface: the page colour with a 1px hairline and 12px corners.
 * No shadows; depth comes from spacing and lines.
 */
import { View, type ViewProps } from 'react-native';
import { twMerge } from 'tailwind-merge';

export const CARD_CLASSES =
  'rounded-xl border border-line bg-white dark:border-ink-line dark:bg-ink-card';

/** Tappable cards: a faint grey wash on hover and press. */
export const CARD_PRESSABLE_CLASSES =
  'active:bg-zinc-50 web:transition-colors web:duration-150 web:hover:bg-zinc-50 dark:active:bg-white/[0.03] dark:web:hover:bg-white/[0.03]';

export function Card({ className, ...rest }: ViewProps) {
  return <View className={twMerge(CARD_CLASSES, 'p-5', className)} {...rest} />;
}
