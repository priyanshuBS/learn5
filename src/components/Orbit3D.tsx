/**
 * Orbit3D — a small 3D scene: rings tilted in space that spin around whatever
 * is in the middle (e.g. today's progress), each with a glowing "planet" riding it.
 *
 * The 3D look comes from perspective + rotateX (tips each ring back) and an
 * animated rotateZ (spins it), so it works the same on phones and the website.
 */
import { useEffect, type ReactNode } from 'react';
import { View } from 'react-native';
import Animated, {
  Easing,
  useAnimatedStyle,
  useReducedMotion,
  useSharedValue,
  withRepeat,
  withTiming,
} from 'react-native-reanimated';

interface Ring {
  color: string;
  /** How far the ring is tipped back, in degrees. */
  tilt: number;
  /** Turn of the ring's axis, in degrees (so rings cross each other). */
  turn: number;
  /** Seconds per full spin. */
  seconds: number;
  /** Ring size as a share of the scene. */
  scale: number;
}

export function Orbit3D({
  size,
  rings,
  children,
}: {
  size: number;
  rings: Ring[];
  children?: ReactNode;
}) {
  return (
    <View style={{ width: size, height: size }} className="items-center justify-center">
      {rings.map((ring, i) => (
        <OrbitRing key={i} ring={ring} size={size} />
      ))}
      {children}
    </View>
  );
}

function OrbitRing({ ring, size }: { ring: Ring; size: number }) {
  const reduce = useReducedMotion();
  const spin = useSharedValue(0);
  useEffect(() => {
    if (reduce) return;
    spin.set(
      withRepeat(withTiming(360, { duration: ring.seconds * 1000, easing: Easing.linear }), -1),
    );
  }, [reduce, ring.seconds, spin]);

  const d = size * ring.scale;
  const planet = Math.max(6, size * 0.07);
  const style = useAnimatedStyle(() => ({
    transform: [
      { perspective: 600 },
      { rotateZ: `${ring.turn}deg` },
      { rotateX: `${ring.tilt}deg` },
      { rotateZ: `${spin.get()}deg` },
    ],
  }));

  return (
    <Animated.View
      pointerEvents="none"
      style={[
        {
          position: 'absolute',
          width: d,
          height: d,
          borderRadius: d / 2,
          borderWidth: 1.5,
          borderColor: `${ring.color}66`,
        },
        style,
      ]}
    >
      <View
        style={{
          position: 'absolute',
          top: -planet / 2,
          left: d / 2 - planet / 2,
          width: planet,
          height: planet,
          borderRadius: planet / 2,
          backgroundColor: ring.color,
          shadowColor: ring.color,
          shadowOpacity: 0.9,
          shadowRadius: 8,
          shadowOffset: { width: 0, height: 0 },
        }}
      />
    </Animated.View>
  );
}
