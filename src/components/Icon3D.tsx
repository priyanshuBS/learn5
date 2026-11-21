/**
 * Icon3D — a glossy 3D icon tile in black and white (the app is monochrome):
 *   light mode → a black tile with a white icon
 *   dark mode  → a white tile with a black icon
 * The tile has depth (a darker base below it), a soft gradient, a rim light and a
 * gloss highlight. Drawn in code (react-native-svg), so it is crisp at any size and
 * looks the same on phones and the website.
 *
 *   <Icon3D icon="flame" size={44} />
 *
 * `color` is accepted for older callers but not shown. `muted` draws a quiet grey
 * tile (e.g. a badge not earned yet).
 */
import { View } from 'react-native';
import Svg, { Defs, Ellipse, LinearGradient, Rect, Stop } from 'react-native-svg';

import { useColorScheme } from '@/hooks/useScheme';

import { Icon, type IconName } from './Icon';

const PALETTES = {
  light: {
    top: '#3A3A3A',
    mid: '#161616',
    bottom: '#000000',
    base: '#000000',
    glyph: '#FFFFFF',
    shade: '#000000',
    rim: 0.18,
    gloss: 0.35,
  },
  dark: {
    top: '#FFFFFF',
    mid: '#F2F2F2',
    bottom: '#D4D4D4',
    base: '#8A8A8A',
    glyph: '#111111',
    shade: '#A3A3A3',
    rim: 0.6,
    gloss: 0.7,
  },
  mutedLight: {
    top: '#EDEDED',
    mid: '#E2E2E2',
    bottom: '#D4D4D4',
    base: '#BDBDBD',
    glyph: '#A3A3A3',
    shade: '#D4D4D4',
    rim: 0.5,
    gloss: 0.5,
  },
  mutedDark: {
    top: '#2E2E2E',
    mid: '#232323',
    bottom: '#1A1A1A',
    base: '#0E0E0E',
    glyph: '#5C5C5C',
    shade: '#111111',
    rim: 0.08,
    gloss: 0.12,
  },
} as const;

export function Icon3D({
  icon,
  size = 44,
  filled = false,
  muted = false,
}: {
  icon: IconName;
  /** Kept for older callers; the monochrome theme ignores it. */
  color?: string;
  size?: number;
  /** Fill the icon shape (good for flame, star, heart). */
  filled?: boolean;
  /** A quiet grey tile (e.g. a badge not earned yet). */
  muted?: boolean;
}) {
  const dark = useColorScheme() === 'dark';
  const key = muted ? (dark ? 'mutedDark' : 'mutedLight') : dark ? 'dark' : 'light';
  const p = PALETTES[key];
  // Stable ids (same palette = same gradients), so the website's pre-built HTML matches.
  const id = `i3d${key}`;
  const depth = Math.max(2, Math.round(size * 0.07));
  const face = size - depth;
  const radius = size * 0.28;
  const glyph = Math.round(size * 0.5);

  return (
    <View
      style={{
        width: size,
        height: size,
        shadowColor: '#000000',
        shadowOpacity: muted ? 0 : dark ? 0.5 : 0.22,
        shadowRadius: size * 0.16,
        shadowOffset: { width: 0, height: size * 0.08 },
        elevation: muted ? 0 : 3,
      }}
    >
      <Svg width={size} height={size} style={{ position: 'absolute' }}>
        <Defs>
          <LinearGradient id={`f${id}`} x1="0" y1="0" x2="0.4" y2="1">
            <Stop offset="0" stopColor={p.top} />
            <Stop offset="0.55" stopColor={p.mid} />
            <Stop offset="1" stopColor={p.bottom} />
          </LinearGradient>
          <LinearGradient id={`g${id}`} x1="0" y1="0" x2="0" y2="1">
            <Stop offset="0" stopColor="#FFFFFF" stopOpacity={p.gloss} />
            <Stop offset="1" stopColor="#FFFFFF" stopOpacity={0} />
          </LinearGradient>
        </Defs>
        {/* The side of the tile (gives it thickness) */}
        <Rect x={0} y={depth} width={size} height={face} rx={radius} fill={p.base} />
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
          strokeOpacity={p.rim}
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
          <Icon name={icon} size={glyph} color={p.shade} strokeWidth={2.4} filled={filled} />
        </View>
        <Icon name={icon} size={glyph} color={p.glyph} strokeWidth={2.4} filled={filled} />
      </View>
    </View>
  );
}
