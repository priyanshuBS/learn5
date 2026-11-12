/**
 * Text components in Geist: weight="display" (Bold, slightly tight) for headings and big
 * numbers, weight="mono" (Geist Mono) for times, counts and small labels.
 *   Txt     — body text; weight picks the Inter weight
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
  display: 'font-display tracking-[-0.4px]',
  mono: 'font-mono',
} as const;

export type TxtWeight = keyof typeof WEIGHTS;
export type TxtProps = TextProps & { weight?: TxtWeight };

export function Txt({ weight = 'regular', className, ...rest }: TxtProps) {
  return (
    <Text
      className={twMerge(
        'text-base text-[#0D0D10] dark:text-[#F1F1F3]',
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
    <Txt className={twMerge('text-sm text-[#6B6B75] dark:text-[#8C8C96]', className)} {...rest} />
  );
}

/** Small grey label, e.g. "Up next" or "Current level". */
export function Eyebrow({ className, ...rest }: TxtProps) {
  return (
    <Text
      className={twMerge(
        'font-body-medium text-[13px] text-[#6B6B75] dark:text-[#8C8C96]',
        className,
      )}
      {...rest}
    />
  );
}
