/**
 * Card — a "glass" surface: frosted white in light mode; in dark mode a
 * see-through panel (the glowing background shows through) with a faint
 * top highlight and, on the website, a background blur.
 */
import { View, type ViewProps } from 'react-native';
import { twMerge } from 'tailwind-merge';

export const CARD_CLASSES =
  'rounded-3xl border border-line bg-white/80 web:shadow-[0_1px_2px_rgba(14,15,20,0.04),0_12px_32px_-16px_rgba(14,15,20,0.18)] web:backdrop-blur-xl dark:border-ink-line dark:bg-ink-card dark:web:shadow-[inset_0_1px_0_rgba(255,255,255,0.07),0_20px_50px_-24px_rgba(0,0,0,0.8)]';

/** Tappable cards: the border lights up on hover (the 3D lean comes from <Tilt>). */
export const CARD_PRESSABLE_CLASSES =
  'active:opacity-90 web:transition-colors web:duration-200 web:hover:border-zinc-300 dark:web:hover:border-white/20';

export function Card({ className, ...rest }: ViewProps) {
  return <View className={twMerge(CARD_CLASSES, 'p-5', className)} {...rest} />;
}
