/**
 * theme store — the user's appearance choice: System (follow the device), Light or Dark.
 *
 * Saved on the device. NativeWind's `colorScheme` switches the "dark:" classes;
 * on phones it also tells the system (status bar, keyboards). On the website
 * app/+html.tsx reads the same saved choice before the page paints (no flash).
 */
import { colorScheme } from 'nativewind';
import { useEffect, useSyncExternalStore } from 'react';
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
      preference: 'dark',
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
      const target = preference === 'system' ? systemScheme() : preference;
      // app/+html.tsx usually set it already. Setting it again re-renders every
      // screen while the app is still starting, which React warns about
      // ("Can't perform a React state update on a component that hasn't mounted yet").
      if (colorScheme.get() !== target) colorScheme.set(target);
    } else {
      colorScheme.set(preference); // "system" = follow the phone setting
    }
  } catch {
    // Very old browsers/devices: keep the default look.
  }
}

// Phones: switch to the default (dark) look straight away, before the first screen
// is drawn, so a phone set to light mode never flashes a light screen first.
// The saved choice replaces it as soon as it has been read from the device.
if (!isWeb) apply('dark');

// Website: tell NativeWind the saved choice before the first screen is drawn
// (the same choice app/+html.tsx already used for the page colours). Otherwise
// NativeWind starts from the computer's setting, and fixing it later re-renders
// screens that are still starting ("Can't perform a React state update…").
if (isWeb && typeof window !== 'undefined') {
  let saved: ThemePreference = 'dark';
  try {
    const raw = JSON.parse(window.localStorage.getItem(THEME_STORAGE_KEY) ?? 'null');
    const pref = raw?.state?.preference;
    if (pref === 'light' || pref === 'dark' || pref === 'system') saved = pref;
  } catch {
    // Storage blocked or unreadable: keep the default.
  }
  apply(saved);
}

/** True once the saved choice has been read (phones keep the splash screen up until then). */
export function useThemeReady(): boolean {
  return useSyncExternalStore(
    (onChange) => useTheme.persist.onFinishHydration(onChange),
    // The website needs no wait: app/+html.tsx sets the theme before the page paints.
    () => isWeb || useTheme.persist.hasHydrated(),
    () => true, // website pre-render: nothing to wait for
  );
}

/** Applies the saved choice and follows the device while on "System". Use once, in the root layout. */
export function useThemeBootstrap(): void {
  const preference = useTheme((s) => s.preference);
  const hydrated = useSyncExternalStore(
    (onChange) => useTheme.persist.onFinishHydration(onChange),
    () => useTheme.persist.hasHydrated(),
    () => false,
  );
  useEffect(() => {
    // Website: wait for the saved choice. Until then app/+html.tsx has already
    // shown the right colours, and applying the default (dark) first would flip
    // the page to dark and back again.
    if (isWeb && !hydrated) return;
    apply(preference);
    if (!isWeb || preference !== 'system' || typeof window === 'undefined') return;
    const query = window.matchMedia?.('(prefers-color-scheme: dark)');
    if (!query) return;
    const onChange = () => apply('system');
    query.addEventListener?.('change', onChange);
    return () => query.removeEventListener?.('change', onChange);
  }, [preference, hydrated]);
}
