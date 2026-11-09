/**
 * useColorScheme — "light" or "dark", following the user's theme choice
 * (System / Light / Dark). Use this instead of React Native's useColorScheme,
 * which on the website ignores the user's choice.
 */
import { useColorScheme as useNativeWindScheme } from 'nativewind';

export function useColorScheme(): 'light' | 'dark' {
  return useNativeWindScheme().colorScheme === 'dark' ? 'dark' : 'light';
}
