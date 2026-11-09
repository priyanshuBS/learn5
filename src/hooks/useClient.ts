/**
 * Hooks about time and the browser.
 */
import { useEffect, useState, useSyncExternalStore } from 'react';
import { AppState } from 'react-native';

const noopSubscribe = () => () => {};

/**
 * False while the website is pre-rendered on the server (and for the very
 * first browser render), true afterwards and always on phones.
 * Use it to show time-based or device-saved info only on the real device.
 */
export function useIsClient(): boolean {
  return useSyncExternalStore(
    noopSubscribe,
    () => true,
    () => false,
  );
}

/** The current time, refreshed every 15 seconds and whenever the app comes back to the front. */
export function useNow(intervalMs = 15_000): Date {
  const [now, setNow] = useState(() => new Date());
  useEffect(() => {
    const timer = setInterval(() => setNow(new Date()), intervalMs);
    const sub = AppState.addEventListener('change', (state) => {
      if (state === 'active') setNow(new Date());
    });
    return () => {
      clearInterval(timer);
      sub.remove();
    };
  }, [intervalMs]);
  return now;
}
