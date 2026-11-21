/**
 * Icon3D — kept under its old name: a quiet icon tile.
 *   default → a soft neutral tile with a line icon (no colour: the design keeps one accent)
 *   solid   → an indigo tile with a white icon (for the one thing that matters)
 *   muted   → fainter (e.g. a badge not earned yet)
 * `color` is accepted for older callers but not shown.
 */
import { View } from 'react-native';

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
  color?: string;
  size?: number;
  filled?: boolean;
  muted?: boolean;
  solid?: boolean;
}) {
  const dark = useColorScheme() === 'dark';
  const glyph = Math.round(size * 0.46);
  const background = solid ? (dark ? '#5B52E6' : colors.brand) : dark ? '#1B1A2B' : '#F2F2F7';
  const iconColor = solid
    ? '#FFFFFF'
    : muted
      ? dark
        ? '#4A4866'
        : '#B4B3C8'
      : dark
        ? '#C9C8DE'
        : '#3B3A55';
  return (
    <View
      style={{
        width: size,
        height: size,
        borderRadius: Math.max(8, Math.round(size * 0.28)),
        backgroundColor: background,
        alignItems: 'center',
        justifyContent: 'center',
      }}
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
