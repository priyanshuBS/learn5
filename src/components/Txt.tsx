/**
 * Text components in Figtree. weight="display" = bold headings and big numbers,
 * "italic" = semibold section titles (name kept for older code), "script" = Patrick Hand
 * (the one handwritten touch), "mono" = Geist Mono: weight="display" (Bold, slightly tight) for headings and big
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
  italic: 'font-serif-italic tracking-[-0.3px]',
  script: 'font-script',
  mono: 'font-mono',
} as const;

export type TxtWeight = keyof typeof WEIGHTS;
export type TxtProps = TextProps & { weight?: TxtWeight };

export function Txt({ weight = 'regular', className, ...rest }: TxtProps) {
  return (
    <Text
      className={twMerge(
        'text-base text-[#171630] dark:text-[#ECEBFA]',
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
    <Txt className={twMerge('text-sm text-[#6E6C8C] dark:text-[#9897B8]', className)} {...rest} />
  );
}

/** Small grey label, e.g. "Up next" or "Current level". */
export function Eyebrow({ className, ...rest }: TxtProps) {
  return (
    <Text
      className={twMerge(
        'font-mono text-[11px] uppercase tracking-[1px] text-[#6E6C8C] dark:text-[#9897B8]',
        className,
      )}
      {...rest}
    />
  );
}
