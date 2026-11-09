/**
 * Card — the basic surface: white (dark: near-black) with a hairline border
 * and, on the website, a very soft shadow.
 */
import { View, type ViewProps } from 'react-native';
import { twMerge } from 'tailwind-merge';

export const CARD_CLASSES =
  'rounded-2xl border border-line bg-white web:shadow-sm dark:border-ink-line dark:bg-ink-card';

/** Pressable cards: a subtle lift on hover (website) and a tint when pressed. */
export const CARD_PRESSABLE_CLASSES =
  'active:bg-slate-50 web:transition-colors web:hover:border-slate-300 dark:active:bg-ink-raised dark:web:hover:border-white/15';

export function Card({ className, ...rest }: ViewProps) {
  return <View className={twMerge(CARD_CLASSES, 'p-5', className)} {...rest} />;
}
