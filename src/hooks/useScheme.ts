/**
 * useColorScheme — "light" or "dark", following the user's theme choice
 * (System / Light / Dark). Use this instead of React Native's useColorScheme,
 * which on the website ignores the user's choice, and instead of NativeWind's,
 * which leaks subscriptions (see src/features/theme/store.ts).
 */
import { useResolvedScheme } from '@/features/theme/store';

import { useIsClient } from './useClient';

export function useColorScheme(): 'light' | 'dark' {
  const scheme = useResolvedScheme();
  const isClient = useIsClient();
  // Website: the pre-built HTML is made in light mode. While the browser takes
  // over that HTML, answer "light" too so both match; it switches right after.
  // (Colours set with classes are already correct, thanks to app/+html.tsx.)
  if (!isClient) return 'light';
  return scheme;
}
