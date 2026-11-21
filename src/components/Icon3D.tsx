/**
 * Icon3D — kept under its old name: a soft colour TILE with a line icon.
 *   <Icon3D icon="flame" color="#F59E0B" />   → a light orange tile with an orange icon
 * Without a colour it uses the main indigo. `solid` fills the tile with the colour
 * and draws the icon in white. `muted` draws a quiet grey tile (e.g. a badge not
 * earned yet). `filled` fills the icon shape (flame, star).
 */
import { View } from 'react-native';

import { useColorScheme } from '@/hooks/useScheme';
import { colors, darken, lighten, withAlpha } from '@/theme';

import { Icon, type IconName } from './Icon';

export function Icon3D({
  icon,
  color = colors.brand,
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
  const glyph = Math.round(size * 0.48);
  const radius = Math.max(8, Math.round(size * 0.3));

  let background: string;
  let iconColor: string;
  if (muted) {
    background = dark ? '#1D1C38' : '#F1F1F8';
    iconColor = dark ? '#514F6E' : '#9F9DBA';
  } else if (solid) {
    background = dark ? lighten(color, 0.05) : color;
    iconColor = '#FFFFFF';
  } else {
    background = withAlpha(color, dark ? 0.18 : 0.12);
    iconColor = dark ? lighten(color, 0.35) : darken(color, 0.08);
  }

  return (
    <View
      style={{
        width: size,
        height: size,
        borderRadius: radius,
        backgroundColor: background,
        alignItems: 'center',
        justifyContent: 'center',
      }}
    >
      <Icon name={icon} size={glyph} color={iconColor} strokeWidth={2} filled={filled && !muted} />
    </View>
  );
}
