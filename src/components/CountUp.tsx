/**
 * CountUp — a number that counts up from 0 when it first appears (and glides to
 * new values). Shows the final number at once when reduced motion is on.
 */
import { useEffect, useRef, useState } from 'react';
import { useReducedMotion } from 'react-native-reanimated';

import { Txt, type TxtProps } from './Txt';

export function CountUp({
  value,
  durationMs = 900,
  format = (n) => n.toLocaleString('en-IN'),
  ...rest
}: TxtProps & { value: number; durationMs?: number; format?: (n: number) => string }) {
  const reduce = useReducedMotion();
  const [shown, setShown] = useState(reduce ? value : 0);
  const from = useRef(reduce ? value : 0);

  useEffect(() => {
    if (reduce) return;
    const start = from.current;
    const began = Date.now();
    let frame = 0;
    const tick = () => {
      const p = Math.min(1, (Date.now() - began) / durationMs);
      const eased = 1 - Math.pow(1 - p, 3);
      setShown(Math.round(start + (value - start) * eased));
      if (p < 1) frame = requestAnimationFrame(tick);
      else from.current = value;
    };
    frame = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frame);
  }, [value, durationMs, reduce]);

  // With reduced motion the final number shows straight away.
  return <Txt {...rest}>{format(reduce ? value : shown)}</Txt>;
}
