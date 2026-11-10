/**
 * Confetti — a short burst of falling, spinning pieces to celebrate a finished drop.
 * Purely decorative: it never blocks taps and is hidden from screen readers.
 */
import { useEffect, useMemo } from 'react';
import { StyleSheet, useWindowDimensions, View } from 'react-native';
import Animated, {
  Easing,
  useAnimatedStyle,
  useSharedValue,
  withDelay,
  withTiming,
} from 'react-native-reanimated';

const COLORS = ['#1F5C45', '#5FBF8F', '#C99A2E', '#E0662B', '#F4F1E8', '#B5487F', '#2E7FA6'];
const COUNT = 36;

/** Same pieces every render, different per index (no Math.random during render). */
function seeded(i: number, salt: number): number {
  const x = Math.sin(i * 12.9898 + salt * 78.233) * 43758.5453;
  return x - Math.floor(x);
}

export function Confetti({ height = 700 }: { height?: number }) {
  const { width } = useWindowDimensions();
  const pieces = useMemo(
    () =>
      Array.from({ length: COUNT }, (_, i) => ({
        x: seeded(i, 1),
        delay: seeded(i, 2) * 500,
        drift: (seeded(i, 3) - 0.5) * 120,
        spin: 360 + seeded(i, 4) * 720,
        duration: 1600 + seeded(i, 5) * 1200,
        size: 7 + seeded(i, 6) * 7,
        round: seeded(i, 7) > 0.6,
        color: COLORS[i % COLORS.length],
      })),
    [],
  );
  const areaWidth = Math.min(width, 720);

  return (
    <View
      pointerEvents="none"
      accessibilityElementsHidden
      importantForAccessibility="no-hide-descendants"
      style={[StyleSheet.absoluteFill, { height, overflow: 'hidden', zIndex: 20 }]}
    >
      {pieces.map((p, i) => (
        <Piece key={i} {...p} left={p.x * areaWidth} height={height} />
      ))}
    </View>
  );
}

function Piece({
  left,
  delay,
  drift,
  spin,
  duration,
  size,
  round,
  color,
  height,
}: {
  left: number;
  delay: number;
  drift: number;
  spin: number;
  duration: number;
  size: number;
  round: boolean;
  color: string;
  height: number;
}) {
  const t = useSharedValue(0);
  useEffect(() => {
    t.set(withDelay(delay, withTiming(1, { duration, easing: Easing.out(Easing.quad) })));
  }, [t, delay, duration]);

  const style = useAnimatedStyle(() => {
    const p = t.get();
    return {
      opacity: p < 0.85 ? 1 : (1 - p) / 0.15,
      transform: [
        { translateY: -40 + p * (height + 40) },
        { translateX: drift * p },
        { rotate: `${spin * p}deg` },
      ],
    };
  });

  return (
    <Animated.View
      style={[
        {
          position: 'absolute',
          top: 0,
          left,
          width: size,
          height: round ? size : size * 0.45,
          borderRadius: round ? size : 2,
          backgroundColor: color,
        },
        style,
      ]}
    />
  );
}
