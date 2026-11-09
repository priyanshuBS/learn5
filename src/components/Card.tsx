/**
 * Card — a glass panel (like priyanshusingh.co.in): a faint white fill and a thin
 * white/10 border on the dark background; a clean white card in light mode.
 */
import { View, type ViewProps } from 'react-native';
import { twMerge } from 'tailwind-merge';

export const CARD_CLASSES =
  'rounded-3xl border border-line bg-white web:shadow-[0_1px_2px_rgba(20,16,50,0.05),0_12px_32px_-16px_rgba(76,29,149,0.18)] dark:border-white/10 dark:bg-white/[0.035] dark:web:shadow-none dark:web:backdrop-blur-xl';

/** Tappable cards: the border brightens and the card lifts a little on hover. */
export const CARD_PRESSABLE_CLASSES =
  'active:opacity-80 web:transition-all web:duration-300 web:hover:-translate-y-1 web:hover:border-zinc-300 dark:web:hover:border-white/20';

export function Card({ className, ...rest }: ViewProps) {
  return <View className={twMerge(CARD_CLASSES, 'p-5', className)} {...rest} />;
}
