/**
 * Logo — the Learn5 mark and wordmark.
 * The mark is a "5-minute timer": a studio-black rounded tile with an indigo ring
 * that is almost closed, a light indigo dot where the ring ends, and a white "5".
 * The app icon, splash screen and browser tab icon use the same drawing.
 */
import { View } from 'react-native';
import Svg, { Circle, Defs, LinearGradient, Rect, Stop } from 'react-native-svg';
import { twMerge } from 'tailwind-merge';

import { Txt } from './Txt';

// The ring, in a 100 × 100 box: radius 30, 300° of a full turn, starting at the top.
const R = 30;
const CIRCUMFERENCE = 2 * Math.PI * R;
const ARC = (CIRCUMFERENCE * 300) / 360;
// Where the ring ends (210° clockwise from the right = upper left), for the mint dot.
const END_X = 50 + R * Math.cos((210 * Math.PI) / 180);
const END_Y = 50 + R * Math.sin((210 * Math.PI) / 180);

export function LogoMark({ size = 28 }: { size?: number }) {
  // Fixed ids (every logo uses the same gradients), so the website's pre-built
  // HTML and the live page match.
  return (
    <View style={{ width: size, height: size }}>
      <Svg width={size} height={size} viewBox="0 0 100 100" style={{ position: 'absolute' }}>
        <Defs>
          <LinearGradient id="learn5tile" x1="0" y1="0" x2="0" y2="1">
            <Stop offset="0" stopColor="#1F1F26" />
            <Stop offset="1" stopColor="#0B0B0D" />
          </LinearGradient>
          <LinearGradient id="learn5ring" x1="0" y1="0" x2="1" y2="1">
            <Stop offset="0" stopColor="#B8BEFF" />
            <Stop offset="1" stopColor="#5B66FF" />
          </LinearGradient>
        </Defs>
        {/* The tile, with a hairline edge so it also reads on dark backgrounds */}
        <Rect x={1} y={1} width={98} height={98} rx={26} fill="url(#learn5tile)" />
        <Rect
          x={1}
          y={1}
          width={98}
          height={98}
          rx={26}
          fill="none"
          stroke="#FFFFFF"
          strokeOpacity={0.12}
          strokeWidth={2}
        />
        {/* The "5-minute timer" ring and its end dot */}
        <Circle
          cx={50}
          cy={50}
          r={R}
          stroke="url(#learn5ring)"
          strokeWidth={8}
          strokeLinecap="round"
          fill="none"
          strokeDasharray={`${ARC} ${CIRCUMFERENCE}`}
          transform="rotate(-90 50 50)"
        />
        <Circle cx={END_X} cy={END_Y} r={7} fill="#B8BEFF" />
      </Svg>
      <View
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          width: size,
          height: size,
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
