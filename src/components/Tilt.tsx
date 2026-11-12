/**
 * Tilt — makes its child feel like a 3D card.
 *   Website: the card leans toward the mouse and lifts a little.
 *   Phones:  the card leans toward your finger while you press.
 * Springs back when you let go. Does nothing when reduced motion is on.
 *
 * Wrap a card: <Tilt><CategoryCard … /></Tilt>. Taps still reach the card.
 */
import { useRef, type ReactNode } from 'react';
import { Platform, type GestureResponderEvent, type LayoutChangeEvent } from 'react-native';
import Animated, {
  useAnimatedStyle,
  useReducedMotion,
  useSharedValue,
  withSpring,
} from 'react-native-reanimated';

const SPRING = { damping: 14, stiffness: 160, mass: 0.6 };

export function Tilt({
  children,
  /** Strongest lean, in degrees. */
  max = 7,
  fill = false,
}: {
  children: ReactNode;
  max?: number;
  /** Stretch to the parent's height (for cards in a row). */
  fill?: boolean;
}) {
  const reduce = useReducedMotion();
  const size = useRef({ w: 1, h: 1 });
  const rx = useSharedValue(0);
  const ry = useSharedValue(0);
  const lift = useSharedValue(0);

  const lean = (x: number, y: number, amount = 1) => {
    if (reduce) return;
    const nx = Math.min(1, Math.max(0, x / size.current.w)) - 0.5;
    const ny = Math.min(1, Math.max(0, y / size.current.h)) - 0.5;
    ry.set(withSpring(nx * max * 2 * amount, SPRING));
    rx.set(withSpring(-ny * max * 2 * amount, SPRING));
    lift.set(withSpring(1, SPRING));
  };
  const reset = () => {
    rx.set(withSpring(0, SPRING));
    ry.set(withSpring(0, SPRING));
    lift.set(withSpring(0, SPRING));
  };

  const style = useAnimatedStyle(() => ({
    transform: [
      { perspective: 900 },
      { rotateX: `${rx.get()}deg` },
      { rotateY: `${ry.get()}deg` },
      { translateY: -lift.get() * 3 },
      { scale: 1 + lift.get() * 0.012 },
    ],
  }));

  const onLayout = (e: LayoutChangeEvent) => {
    size.current = { w: e.nativeEvent.layout.width || 1, h: e.nativeEvent.layout.height || 1 };
  };

  const web = Platform.OS === 'web';
  const touchProps = web
    ? {}
    : {
        onTouchStart: (e: GestureResponderEvent) =>
          lean(e.nativeEvent.locationX, e.nativeEvent.locationY, 0.6),
        onTouchEnd: reset,
        onTouchCancel: reset,
      };
  const pointerProps = web
    ? {
        // Measured against the card itself (not whichever child is under the mouse).
        onPointerMove: (e: {
          currentTarget: unknown;
          nativeEvent: { clientX: number; clientY: number };
        }) => {
          const rect = (e.currentTarget as HTMLElement | null)?.getBoundingClientRect?.();
          if (!rect) return;
          lean(e.nativeEvent.clientX - rect.left, e.nativeEvent.clientY - rect.top);
        },
        onPointerLeave: reset,
      }
    : {};

  return (
    <Animated.View
      onLayout={onLayout}
      style={[style, fill ? { flex: 1 } : null]}
      {...touchProps}
      {...(pointerProps as object)}
    >
      {children}
    </Animated.View>
  );
}
