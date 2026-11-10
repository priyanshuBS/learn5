/**
 * theme store — the user's appearance choice: System (follow the device), Light or Dark.
 *
 * Saved on the device. NativeWind's `colorScheme` switches the "dark:" classes;
 * on phones it also tells the system (status bar, keyboards). On the website
 * app/+html.tsx reads the same saved choice before the page paints (no flash).
 *
 * Code that needs to know light/dark uses `useResolvedScheme` (via
 * src/hooks/useScheme.ts), never NativeWind's own useColorScheme hook: that hook
 * subscribes while a screen is drawn and never unsubscribes, so after any
 * discarded draw a theme change makes React warn "Can't perform a React state
 * update on a component that hasn't mounted yet".
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

const DEFAULT_PREFERENCE: ThemePreference = 'dark';

const isWeb = Platform.OS === 'web';
const inBrowser = isWeb && typeof window !== 'undefined';

/**
 * Website: the saved choice, read straight away (localStorage answers instantly),
 * so the first screen already uses it. Phones read it later, behind the splash screen.
 */
function savedPreferenceNow(): ThemePreference {
  if (!inBrowser) return DEFAULT_PREFERENCE;
  try {
    const raw = JSON.parse(window.localStorage.getItem(THEME_STORAGE_KEY) ?? 'null');
    const pref = raw?.state?.preference;
    if (pref === 'light' || pref === 'dark' || pref === 'system') return pref;
  } catch {
    // Storage blocked or unreadable: keep the default.
  }
  return DEFAULT_PREFERENCE;
}

interface ThemeState {
  preference: ThemePreference;
  setPreference: (preference: ThemePreference) => void;
}

export const useTheme = create<ThemeState>()(
  persist(
    (set) => ({
      preference: savedPreferenceNow(),
      setPreference: (preference) => set({ preference }),
    }),
    {
      name: THEME_STORAGE_KEY,
      storage: createJSONStorage(() => storage),
      partialize: (s) => ({ preference: s.preference }),
    },
  ),
);

function systemScheme(): 'light' | 'dark' {
  if (isWeb) {
    return inBrowser && window.matchMedia?.('(prefers-color-scheme: dark)').matches
      ? 'dark'
      : 'light';
  }
  return Appearance.getColorScheme() === 'dark' ? 'dark' : 'light';
}

/** Calls onChange when the device switches between light and dark. */
function subscribeSystemScheme(onChange: () => void): () => void {
  if (isWeb) {
    const query = inBrowser ? window.matchMedia?.('(prefers-color-scheme: dark)') : undefined;
    if (!query) return () => {};
    query.addEventListener?.('change', onChange);
    return () => query.removeEventListener?.('change', onChange);
  }
  const sub = Appearance.addChangeListener(onChange);
  return () => sub.remove();
}

/** "light" or "dark" as shown right now: the user's choice, or the device setting on "System". */
export function useResolvedScheme(): 'light' | 'dark' {
  const preference = useTheme((s) => s.preference);
  const system = useSyncExternalStore(subscribeSystemScheme, systemScheme, () => 'light' as const);
  return preference === 'system' ? system : preference;
}

function apply(preference: ThemePreference): void {
  try {
    if (isWeb) {
      if (!inBrowser) return; // website pre-render: nothing to switch yet
      // On the web, NativeWind's "system" would always pick light, so we decide ourselves.
      const target = preference === 'system' ? systemScheme() : preference;
      if (colorScheme.get() !== target) colorScheme.set(target);
    } else {
      colorScheme.set(preference); // "system" = follow the phone setting
    }
  } catch {
    // Very old browsers/devices: keep the default look.
  }
}

// Before the first screen is drawn:
//  - phones switch to the default (dark) look, so a phone set to light mode never
//    flashes a light screen first; the saved choice replaces it once it is read.
//  - the website tells NativeWind the saved choice (app/+html.tsx already used it
//    for the page colours).
if (isWeb) apply(savedPreferenceNow());
else apply(DEFAULT_PREFERENCE);

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
  useEffect(() => {
    apply(preference);
    if (!isWeb || preference !== 'system' || !inBrowser) return;
    const query = window.matchMedia?.('(prefers-color-scheme: dark)');
    if (!query) return;
    const onChange = () => apply('system');
    query.addEventListener?.('change', onChange);
    return () => query.removeEventListener?.('change', onChange);
  }, [preference]);
}
