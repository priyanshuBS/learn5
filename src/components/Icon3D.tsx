/**
 * Icon3D — kept under its old name, now a FLAT icon tile: a line icon in a square
 * with a hairline border (the app is black and white and flat).
 *
 *   <Icon3D icon="flame" size={40} />
 *
 * `color` is accepted for older callers but not shown. `filled` fills the shape.
 * `muted` draws it quieter (e.g. a badge not earned yet). `solid` inverts it:
 * a black tile (white in dark mode) with the icon knocked out.
 */
import { View } from 'react-native';
import { twMerge } from 'tailwind-merge';

import { useColorScheme } from '@/hooks/useScheme';
import { colors } from '@/theme';

import { Icon, type IconName } from './Icon';

export function Icon3D({
  icon,
  size = 40,
  filled = false,
  muted = false,
  solid = false,
}: {
  icon: IconName;
  /** Kept for older callers; the monochrome theme ignores it. */
  color?: string;
  size?: number;
  filled?: boolean;
  muted?: boolean;
  solid?: boolean;
}) {
  const dark = useColorScheme() === 'dark';
  const glyph = Math.round(size * 0.45);
  const iconColor = solid
    ? dark
      ? '#111111'
      : '#FFFFFF'
    : muted
      ? dark
        ? '#525252'
        : '#A3A3A3'
      : dark
        ? colors.textDark
        : '#171717';
  return (
    <View
      style={{ width: size, height: size, borderRadius: Math.max(6, Math.round(size * 0.24)) }}
      className={twMerge(
        'items-center justify-center',
        solid
          ? 'bg-zinc-950 dark:bg-[#EDEDED]'
          : 'border border-line bg-white dark:border-ink-line dark:bg-ink-raised',
      )}
    >
      <Icon
        name={icon}
        size={glyph}
        color={iconColor}
        strokeWidth={1.75}
        filled={filled && !muted}
      />
    </View>
  );
}
