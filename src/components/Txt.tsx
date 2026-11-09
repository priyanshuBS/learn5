/**
 * Txt — our Text component: the Inter font + readable colours in light and dark mode.
 * Any className you pass overrides the defaults (thanks to tailwind-merge).
 */
import { Text, type TextProps } from 'react-native';
import { twMerge } from 'tailwind-merge';

const WEIGHTS = {
  regular: 'font-inter',
  medium: 'font-inter-medium',
  semibold: 'font-inter-semibold',
  bold: 'font-inter-bold',
  heavy: 'font-inter-heavy',
} as const;

export type TxtWeight = keyof typeof WEIGHTS;
export type TxtProps = TextProps & { weight?: TxtWeight };

export function Txt({ weight = 'regular', className, ...rest }: TxtProps) {
  return (
    <Text
      className={twMerge('text-base text-slate-900 dark:text-zinc-100', WEIGHTS[weight], className)}
      {...rest}
    />
  );
}

/** Small grey helper text. */
export function Muted({ className, ...rest }: TxtProps) {
  return (
    <Txt className={twMerge('text-sm text-slate-500 dark:text-zinc-400', className)} {...rest} />
  );
}

/** Small uppercase label above a section or value. */
export function Eyebrow({ className, ...rest }: TxtProps) {
  return (
    <Txt
      weight="semibold"
      className={twMerge(
        'text-[11px] uppercase tracking-widest text-slate-500 dark:text-zinc-400',
        className,
      )}
      {...rest}
    />
  );
}
