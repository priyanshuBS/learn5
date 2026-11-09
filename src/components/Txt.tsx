/**
 * Text components (same type system as priyanshusingh.co.in):
 *   Txt     — Inter for text; weight "bold"/"heavy" switch to Bricolage Grotesque
 *             (headings and numbers)
 *   Muted   — soft grey helper text
 *   Eyebrow — small uppercase JetBrains Mono label above a section or value
 * Any className you pass overrides the defaults (thanks to tailwind-merge).
 */
import { Text, type TextProps } from 'react-native';
import { twMerge } from 'tailwind-merge';

const WEIGHTS = {
  regular: 'font-body',
  medium: 'font-body-medium',
  semibold: 'font-body-semibold',
  bold: 'font-body-bold tracking-tight',
  heavy: 'font-body-heavy tracking-tighter',
} as const;

export type TxtWeight = keyof typeof WEIGHTS;
export type TxtProps = TextProps & { weight?: TxtWeight };

export function Txt({ weight = 'regular', className, ...rest }: TxtProps) {
  return (
    <Text
      className={twMerge(
        'text-base text-[#0B0B12] dark:text-[#F2F2F5]',
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
    <Txt className={twMerge('text-sm text-[#6B6B80] dark:text-[#8E8EA3]', className)} {...rest} />
  );
}

/** Small uppercase monospace label, e.g. "UP NEXT" or "CURRENT LEVEL". */
export function Eyebrow({ className, ...rest }: TxtProps) {
  return (
    <Text
      className={twMerge(
        'font-mono text-[11px] uppercase tracking-[0.18em] text-[#6B6B80] dark:text-[#8E8EA3]',
        className,
      )}
      {...rest}
    />
  );
}
