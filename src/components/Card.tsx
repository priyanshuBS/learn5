/**
 * Card — a surface: white with a hairline border and a soft shadow in light
 * mode, a raised midnight panel with a faint top highlight in dark mode.
 */
import { View, type ViewProps } from 'react-native';
import { twMerge } from 'tailwind-merge';

export const CARD_CLASSES =
  'rounded-3xl border border-line bg-white web:shadow-[0_1px_2px_rgba(14,15,20,0.04),0_8px_24px_-12px_rgba(14,15,20,0.10)] dark:border-ink-line dark:bg-ink-card dark:web:shadow-[inset_0_1px_0_rgba(255,255,255,0.04)]';

/** Tappable cards: lift a little on hover. */
export const CARD_PRESSABLE_CLASSES =
  'active:opacity-90 web:transition-all web:duration-200 web:hover:-translate-y-0.5 web:hover:border-zinc-300 dark:web:hover:border-zinc-700';

export function Card({ className, ...rest }: ViewProps) {
  return <View className={twMerge(CARD_CLASSES, 'p-5', className)} {...rest} />;
}
