/**
 * theme store — the user's appearance choice: System (follow the device), Light or Dark.
 *
 * Saved on the device. NativeWind's `colorScheme` switches the "dark:" classes;
 * on phones it also tells the system (status bar, keyboards). On the website
 * app/+html.tsx reads the same saved choice before the page paints (no flash).
 */
import { colorScheme } from 'nativewind';
import { useEffect } from 'react';
import { Appearance, Platform } from 'react-native';
import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';

import { storage } from '@/lib/storage';

export type ThemePreference = 'system' | 'light' | 'dark';

/** Storage key — app/+html.tsx reads it too, keep them the same. */
export const THEME_STORAGE_KEY = 'learn5:theme';

interface ThemeState {
  preference: ThemePreference;
  setPreference: (preference: ThemePreference) => void;
}

export const useTheme = create<ThemeState>()(
  persist(
    (set) => ({
      preference: 'system',
      setPreference: (preference) => set({ preference }),
    }),
    {
      name: THEME_STORAGE_KEY,
      storage: createJSONStorage(() => storage),
      partialize: (s) => ({ preference: s.preference }),
    },
  ),
);

const isWeb = Platform.OS === 'web';

function systemScheme(): 'light' | 'dark' {
  if (isWeb) {
    return typeof window !== 'undefined' &&
      window.matchMedia?.('(prefers-color-scheme: dark)').matches
      ? 'dark'
      : 'light';
  }
  return Appearance.getColorScheme() === 'dark' ? 'dark' : 'light';
}

function apply(preference: ThemePreference): void {
  try {
    if (isWeb) {
      if (typeof window === 'undefined') return; // website pre-render: nothing to switch yet
      // On the web, NativeWind's "system" would always pick light, so we decide ourselves.
      colorScheme.set(preference === 'system' ? systemScheme() : preference);
    } else {
      colorScheme.set(preference); // "system" = follow the phone setting
    }
  } catch {
    // Very old browsers/devices: keep the default look.
  }
}

/** Applies the saved choice and follows the device while on "System". Use once, in the root layout. */
export function useThemeBootstrap(): void {
  const preference = useTheme((s) => s.preference);
  useEffect(() => {
    apply(preference);
    if (!isWeb || preference !== 'system' || typeof window === 'undefined') return;
    const query = window.matchMedia?.('(prefers-color-scheme: dark)');
    if (!query) return;
    const onChange = () => apply('system');
    query.addEventListener?.('change', onChange);
    return () => query.removeEventListener?.('change', onChange);
  }, [preference]);
}
