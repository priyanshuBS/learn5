/**
 * Logo — the Learn5 mark and wordmark.
 * The mark is a "5-minute timer": a glossy 3D orange tile (the same style as the
 * app's 3D icons) with a white ring that is almost closed, a dark dot where the
 * ring ends, and a white "5" in the middle.
 * The app icon, splash screen and browser tab icon use the same drawing.
 */
import { View } from 'react-native';
import Svg, { Circle, Defs, Ellipse, LinearGradient, Rect, Stop } from 'react-native-svg';
import { twMerge } from 'tailwind-merge';

import { colors } from '@/theme';

import { Txt } from './Txt';

// The ring, in a 100 × 100 box: radius 30, 300° of a full turn, starting at the top.
const R = 30;
const CIRCUMFERENCE = 2 * Math.PI * R;
const ARC = (CIRCUMFERENCE * 300) / 360;
// Where the ring ends (210° clockwise from the right = upper left), for the mint dot.
const END_X = 50 + R * Math.cos((210 * Math.PI) / 180);
const END_Y = 50 + R * Math.sin((210 * Math.PI) / 180);

export function LogoMark({ size = 28 }: { size?: number }) {
  // A fixed id (every logo uses the same gradients), so the website's pre-built
  // HTML and the live page match.
  const id = 'learn5logo';
  return (
    <View style={{ width: size, height: size }}>
      <Svg width={size} height={size} viewBox="0 0 100 100" style={{ position: 'absolute' }}>
        <Defs>
          <LinearGradient id={`lf${id}`} x1="0" y1="0" x2="0.5" y2="1">
            <Stop offset="0" stopColor="#FFA15C" />
            <Stop offset="0.55" stopColor="#FF6A1A" />
            <Stop offset="1" stopColor="#E2480C" />
          </LinearGradient>
          <LinearGradient id={`lg${id}`} x1="0" y1="0" x2="0" y2="1">
            <Stop offset="0" stopColor="#FFFFFF" stopOpacity={0.5} />
            <Stop offset="1" stopColor="#FFFFFF" stopOpacity={0} />
          </LinearGradient>
        </Defs>
        {/* Depth, face, rim light and gloss: the same 3D style as the app's icons */}
        <Rect x={0} y={6} width={100} height={94} rx={28} fill="#8A2A06" />
        <Rect x={0} y={0} width={100} height={94} rx={28} fill={`url(#lf${id})`} />
        <Rect
          x={1}
          y={1}
          width={98}
          height={92}
          rx={27}
          fill="none"
          stroke="#FFFFFF"
          strokeOpacity={0.35}
          strokeWidth={2}
        />
        <Ellipse cx={50} cy={20} rx={36} ry={14} fill={`url(#lg${id})`} />
        {/* The "5-minute timer" ring and its end dot */}
        <Circle
          cx={50}
          cy={47}
          r={R}
          stroke={colors.white}
          strokeWidth={8}
          strokeLinecap="round"
          fill="none"
          strokeDasharray={`${ARC} ${CIRCUMFERENCE}`}
          transform="rotate(-90 50 47)"
        />
        <Circle cx={END_X} cy={END_Y - 3} r={8} fill="#2A0E02" />
      </Svg>
      <View
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          width: size,
          height: size * 0.94,
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <Txt
          weight="display"
          className="text-white dark:text-white"
          style={{ fontSize: size * 0.36, lineHeight: size * 0.44 }}
        >
          5
        </Txt>
      </View>
    </View>
  );
}

export function Logo({
  showWordmark = true,
  size = 'md',
}: {
  showWordmark?: boolean;
  size?: 'md' | 'lg';
}) {
  const lg = size === 'lg';
  return (
    <View
      className="flex-row items-center gap-2"
      accessible
      accessibilityRole="header"
      accessibilityLabel="Learn5"
    >
      <LogoMark size={lg ? 44 : 30} />
      {showWordmark ? (
        <Txt weight="display" className={twMerge(lg ? 'text-[26px]' : 'text-[19px]')}>
          Learn5
        </Txt>
      ) : null}
    </View>
  );
}
