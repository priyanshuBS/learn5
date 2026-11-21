/**
 * Text components in Geist: weight="display" (Bold, slightly tight) for headings and big
 * numbers, weight="mono" (Geist Mono) for times, counts and small labels.
 *   Txt     — body text; weight picks the font weight
 *   Muted   — soft grey helper text
 *   Eyebrow — small grey label above a section or value
 * Any className you pass overrides the defaults (thanks to tailwind-merge).
 */
import { Text, type TextProps } from 'react-native';
import { twMerge } from 'tailwind-merge';

const WEIGHTS = {
  regular: 'font-body',
  medium: 'font-body-medium',
  semibold: 'font-body-semibold',
  bold: 'font-body-bold',
  heavy: 'font-body-heavy',
  display: 'font-display tracking-[-0.6px]',
  mono: 'font-mono',
} as const;

export type TxtWeight = keyof typeof WEIGHTS;
export type TxtProps = TextProps & { weight?: TxtWeight };

export function Txt({ weight = 'regular', className, ...rest }: TxtProps) {
  return (
    <Text
      className={twMerge(
        'text-base text-[#0A0A0A] dark:text-[#EDEDED]',
        WEIGHTS[weight],
        className,
      )}
      {...rest}
    />
  );
}

/** Small grey helper text. */
export function Muted({ className, ...rest }: TxtProps) {
  return (
    <Txt className={twMerge('text-sm text-[#737373] dark:text-[#8F8F8F]', className)} {...rest} />
  );
}

/** Small grey label, e.g. "Up next" or "Current level". */
export function Eyebrow({ className, ...rest }: TxtProps) {
  return (
    <Text
      className={twMerge(
        'font-mono text-[11px] uppercase tracking-[1px] text-[#737373] dark:text-[#8F8F8F]',
        className,
      )}
      {...rest}
    />
  );
}
