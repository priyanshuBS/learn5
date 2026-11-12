/**
 * Aurora — the glowing background behind every screen: three soft blobs of
 * colour (orange, violet, cyan) that drift slowly. Bright in dark mode, faint in
 * light mode. Soft edges come from SVG radial gradients (work on phones and web).
 * Stays still when the device asks for reduced motion.
 */
import { useEffect } from 'react';
import { StyleSheet, View } from 'react-native';
import Animated, {
  Easing,
  useAnimatedStyle,
  useReducedMotion,
  useSharedValue,
  withRepeat,
  withTiming,
} from 'react-native-reanimated';
import Svg, { Defs, RadialGradient, Rect, Stop } from 'react-native-svg';

import { useColorScheme } from '@/hooks/useScheme';
import { AURORA } from '@/theme';

interface BlobSpec {
  color: string;
  size: number;
  /** Position as a share of the screen (0–1). */
  x: number;
  y: number;
  /** How far it drifts, in px. */
  drift: number;
  durationMs: number;
}

const BLOBS: BlobSpec[] = [
  { color: AURORA.orange, size: 560, x: 0.85, y: -0.08, drift: 70, durationMs: 14000 },
  { color: AURORA.violet, size: 620, x: -0.15, y: 0.25, drift: 90, durationMs: 18000 },
  { color: AURORA.cyan, size: 520, x: 0.7, y: 0.75, drift: 80, durationMs: 16000 },
];

export function Aurora() {
  const dark = useColorScheme() === 'dark';
  return (
    <View pointerEvents="none" style={[StyleSheet.absoluteFill, styles.clip]}>
      {BLOBS.map((b, i) => (
        <Blob key={i} spec={b} id={`aurora-${i}`} strength={dark ? 0.32 : 0.14} />
      ))}
    </View>
  );
}

function Blob({ spec, id, strength }: { spec: BlobSpec; id: string; strength: number }) {
  const reduce = useReducedMotion();
  const t = useSharedValue(0);
  useEffect(() => {
    if (reduce) return;
    t.set(
      withRepeat(
        withTiming(1, { duration: spec.durationMs, easing: Easing.inOut(Easing.sin) }),
        -1,
        true,
      ),
    );
  }, [reduce, spec.durationMs, t]);

  const style = useAnimatedStyle(() => {
    const p = t.get();
    return {
      transform: [
        { translateX: (p - 0.5) * spec.drift * 2 },
        { translateY: (0.5 - p) * spec.drift },
        { scale: 1 + p * 0.12 },
      ],
    };
  });

  return (
    <Animated.View
      style={[
        {
          position: 'absolute',
          width: spec.size,
          height: spec.size,
          left: `${spec.x * 100}%`,
          top: `${spec.y * 100}%`,
          marginLeft: -spec.size / 2,
          marginTop: -spec.size / 2,
        },
        style,
      ]}
    >
      <Svg width="100%" height="100%">
        <Defs>
          <RadialGradient id={id} cx="50%" cy="50%" r="50%">
            <Stop offset="0" stopColor={spec.color} stopOpacity={strength} />
            <Stop offset="0.55" stopColor={spec.color} stopOpacity={strength * 0.35} />
            <Stop offset="1" stopColor={spec.color} stopOpacity={0} />
          </RadialGradient>
        </Defs>
        <Rect width="100%" height="100%" fill={`url(#${id})`} />
      </Svg>
    </Animated.View>
  );
}

const styles = StyleSheet.create({ clip: { overflow: 'hidden' } });
