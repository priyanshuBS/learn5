/**
 * Float3D — shows its child as a 3D object floating in space: turned a little in
 * perspective, gently bobbing and swaying. Used for the product preview on the
 * welcome page. Holds still when reduced motion is on.
 */
import { useEffect, type ReactNode } from 'react';
import Animated, {
  Easing,
  useAnimatedStyle,
  useReducedMotion,
  useSharedValue,
  withRepeat,
  withTiming,
} from 'react-native-reanimated';

export function Float3D({
  children,
  /** Resting turn, in degrees. */
  rotateY = -14,
  rotateX = 8,
}: {
  children: ReactNode;
  rotateY?: number;
  rotateX?: number;
}) {
  const reduce = useReducedMotion();
  const t = useSharedValue(0);
  useEffect(() => {
    if (reduce) return;
    t.set(
      withRepeat(withTiming(1, { duration: 5200, easing: Easing.inOut(Easing.sin) }), -1, true),
    );
  }, [reduce, t]);

  const style = useAnimatedStyle(() => {
    const p = t.get();
    return {
      transform: [
        { perspective: 1200 },
        { translateY: -10 + p * 20 },
        { rotateY: `${rotateY + p * 6}deg` },
        { rotateX: `${rotateX - p * 4}deg` },
      ],
    };
  });

  return <Animated.View style={style}>{children}</Animated.View>;
}
