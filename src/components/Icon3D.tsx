/**
 * Icon3D — a glossy 3D icon: a coloured tile with depth (a darker base below it),
 * a light top-to-bottom gradient, a soft rim light and a gloss highlight, with a
 * white icon that has a subtle shadow. Drawn in code (react-native-svg), so it is
 * crisp at any size and looks the same on phones and the website.
 *
 *   <Icon3D icon="flame" color="#FF6A1A" size={44} />
 */
import { useId } from 'react';
import { View } from 'react-native';
import Svg, { Defs, Ellipse, LinearGradient, Rect, Stop } from 'react-native-svg';

import { darken, lighten } from '@/theme';

import { Icon, type IconName } from './Icon';

export function Icon3D({
  icon,
  color,
  size = 44,
  filled = false,
}: {
  icon: IconName;
  color: string;
  size?: number;
  /** Fill the icon shape (good for flame, star, heart). */
  filled?: boolean;
}) {
  const id = useId().replace(/[^a-zA-Z0-9]/g, '');
  const depth = Math.max(2, Math.round(size * 0.07));
  const face = size - depth;
  const radius = size * 0.28;
  const glyph = Math.round(size * 0.5);

  return (
    <View
      style={{
        width: size,
        height: size,
        shadowColor: color,
        shadowOpacity: 0.35,
        shadowRadius: size * 0.18,
        shadowOffset: { width: 0, height: size * 0.1 },
        elevation: 4,
      }}
    >
      <Svg width={size} height={size} style={{ position: 'absolute' }}>
        <Defs>
          <LinearGradient id={`f${id}`} x1="0" y1="0" x2="0.4" y2="1">
            <Stop offset="0" stopColor={lighten(color, 0.32)} />
            <Stop offset="0.55" stopColor={color} />
            <Stop offset="1" stopColor={darken(color, 0.18)} />
          </LinearGradient>
          <LinearGradient id={`g${id}`} x1="0" y1="0" x2="0" y2="1">
            <Stop offset="0" stopColor="#FFFFFF" stopOpacity={0.55} />
            <Stop offset="1" stopColor="#FFFFFF" stopOpacity={0} />
          </LinearGradient>
        </Defs>
        {/* The side of the tile (gives it thickness) */}
        <Rect x={0} y={depth} width={size} height={face} rx={radius} fill={darken(color, 0.42)} />
        {/* The face */}
        <Rect x={0} y={0} width={size} height={face} rx={radius} fill={`url(#f${id})`} />
        {/* Rim light */}
        <Rect
          x={0.75}
          y={0.75}
          width={size - 1.5}
          height={face - 1.5}
          rx={radius - 0.75}
          fill="none"
          stroke="#FFFFFF"
          strokeOpacity={0.35}
          strokeWidth={1.5}
        />
        {/* Gloss */}
        <Ellipse
          cx={size * 0.5}
          cy={face * 0.2}
          rx={size * 0.36}
          ry={face * 0.15}
          fill={`url(#g${id})`}
        />
      </Svg>
      {/* The icon, with a soft shadow under it for depth */}
      <View style={{ width: size, height: face, alignItems: 'center', justifyContent: 'center' }}>
        <View style={{ position: 'absolute', top: (face - glyph) / 2 + Math.max(1, size * 0.03) }}>
          <Icon
            name={icon}
            size={glyph}
            color={darken(color, 0.45)}
            strokeWidth={2.4}
            filled={filled}
          />
        </View>
        <Icon name={icon} size={glyph} color="#FFFFFF" strokeWidth={2.4} filled={filled} />
      </View>
    </View>
  );
}
