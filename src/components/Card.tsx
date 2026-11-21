/**
 * Card — a white surface on the soft page (navy in dark mode): a hairline border,
 * 16px corners and a barely-there shadow.
 */
import { View, type ViewProps } from 'react-native';
import { twMerge } from 'tailwind-merge';

export const CARD_CLASSES =
  'rounded-2xl border border-line bg-white web:shadow-[0_1px_2px_rgba(30,27,75,0.04)] dark:border-ink-line dark:bg-ink-card';

/** Tappable cards: a faint grey wash on hover and press. */
export const CARD_PRESSABLE_CLASSES =
  'active:bg-zinc-50 web:transition-colors web:duration-150 web:hover:border-brand-200 dark:active:bg-white/[0.03] dark:web:hover:border-brand-400/40';

export function Card({ className, ...rest }: ViewProps) {
  return <View className={twMerge(CARD_CLASSES, 'p-5', className)} {...rest} />;
}
