/**
 * Logo — the Learn5 mark and wordmark.
 * The mark is a "5-minute timer": a graphite tile with a white ring that is almost
 * closed, a small mint dot where the ring ends, and a white "5" in the middle.
 * The app icon, splash screen and browser tab icon use the same drawing.
 */
import { View } from 'react-native';
import Svg, { Circle } from 'react-native-svg';
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
  return (
    <View
      className="items-center justify-center bg-brand-600 dark:border dark:border-ink-line"
      style={{ width: size, height: size, borderRadius: size * 0.26 }}
    >
      <Svg width={size} height={size} viewBox="0 0 100 100" style={{ position: 'absolute' }}>
        <Circle
          cx={50}
          cy={50}
          r={R}
          stroke={colors.white}
          strokeWidth={8}
          strokeLinecap="round"
          fill="none"
          strokeDasharray={`${ARC} ${CIRCUMFERENCE}`}
          transform="rotate(-90 50 50)"
        />
        <Circle cx={END_X} cy={END_Y} r={8} fill={colors.pop} />
      </Svg>
      <Txt
        weight="display"
        className="text-white dark:text-white"
        style={{ fontSize: size * 0.36, lineHeight: size * 0.44 }}
      >
        5
      </Txt>
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
