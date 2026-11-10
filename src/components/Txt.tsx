/**
 * Text components. Inter for text; Space Grotesk (weight="display") for headings and big numbers.
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
  bold: 'font-body-bold tracking-tight',
  heavy: 'font-body-heavy tracking-tight',
  display: 'font-display tracking-tight',
} as const;

export type TxtWeight = keyof typeof WEIGHTS;
export type TxtProps = TextProps & { weight?: TxtWeight };

export function Txt({ weight = 'regular', className, ...rest }: TxtProps) {
  return (
    <Text
      className={twMerge(
        'text-base text-[#2A1219] dark:text-[#F7E9EE]',
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
    <Txt className={twMerge('text-sm text-[#7A6970] dark:text-[#B8A5AD]', className)} {...rest} />
  );
}

/** Small grey label, e.g. "Up next" or "Current level". */
export function Eyebrow({ className, ...rest }: TxtProps) {
  return (
    <Text
      className={twMerge(
        'font-body-medium text-[13px] text-[#7A6970] dark:text-[#B8A5AD]',
        className,
      )}
      {...rest}
    />
  );
}
