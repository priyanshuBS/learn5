/**
 * Root layout — wraps every screen.
 *   - loads Tailwind styles and the Inter font
 *   - starts loading content (bundled/cached first, then checks the website)
 *   - restores the sign-in session (7 days) and guards the app behind sign-in
 *   - keeps progress in step with the user's account (features/progress/sync.ts)
 *   - stack navigation: the tab area, plus full-screen Quiz and Results
 */
import '../global.css';

import {
  Inter_400Regular,
  Inter_500Medium,
  Inter_600SemiBold,
  Inter_700Bold,
} from '@expo-google-fonts/inter';
import { useFonts } from 'expo-font';
import { Stack } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { StatusBar } from 'expo-status-bar';
import { useEffect } from 'react';
import { ActivityIndicator, Platform, StyleSheet, View } from 'react-native';

import { Logo } from '@/components/Logo';
import { useAuth, useAuthBootstrap } from '@/features/auth/store';
import { useContentBootstrap } from '@/features/content/store';
import { useProgressSync } from '@/features/progress/sync';
import { useRemindersBootstrap } from '@/features/reminders/reminders';
import { useThemeBootstrap, useThemeReady } from '@/features/theme/store';
import { useColorScheme } from '@/hooks/useScheme';
import { colors } from '@/theme';

// Keep the splash screen up until fonts are ready (phones only; harmless on web).
void SplashScreen.preventAutoHideAsync().catch(() => {});

export default function RootLayout() {
  const scheme = useColorScheme();
  const [fontsLoaded, fontError] = useFonts({
    Inter_400Regular,
    Inter_500Medium,
    Inter_600SemiBold,
    Inter_700Bold,
  });
  useContentBootstrap();
  useAuthBootstrap();
  useProgressSync();
  useThemeBootstrap();
  const themeReady = useThemeReady();
  useRemindersBootstrap();
  const authStatus = useAuth((s) => s.status);

  const ready = (fontsLoaded || !!fontError) && themeReady;
  // While the saved session is being read (and while the website is pre-built),
  // allow every screen, so nothing redirects too early. Phones keep the splash up.
  const authLoading = authStatus === 'loading';
  const signedIn = authStatus === 'signedIn';
  useEffect(() => {
    if (ready && !authLoading) void SplashScreen.hideAsync().catch(() => {});
  }, [ready, authLoading]);

  // If fonts fail to load we still show the app with the system font.
  if (!ready) return null;

  return (
    <>
      {/* Follow the app's theme (not the phone's), so the clock and battery icons stay visible. */}
      <StatusBar style={scheme === 'dark' ? 'light' : 'dark'} />
      <Stack
        screenOptions={{
          headerShown: false,
          // Phones only: on the website each page's classes paint the background
          // (a colour from code would not match the pre-rendered HTML).
          contentStyle:
            Platform.OS === 'web'
              ? undefined
              : { backgroundColor: scheme === 'dark' ? colors.ink : colors.canvas },
        }}
      >
        {/* Learning screens: only when signed in. */}
        <Stack.Protected guard={signedIn || authLoading} redirectTo="/welcome">
          <Stack.Screen name="(tabs)" />
          <Stack.Screen
            name="quiz"
            options={{ animation: 'slide_from_bottom', gestureEnabled: false }}
          />
          <Stack.Screen name="results" options={{ animation: 'fade' }} />
        </Stack.Protected>
        {/* Public pages: only when signed out (signing in moves you to Home). */}
        <Stack.Protected guard={!signedIn || authLoading} redirectTo="/">
          <Stack.Screen name="welcome" options={{ animation: 'fade' }} />
          <Stack.Screen name="sign-in" />
        </Stack.Protected>
        {/* Legal pages: open to everyone, signed in or not. */}
        <Stack.Screen name="privacy" />
        <Stack.Screen name="terms" />
      </Stack>
      {/* Covers the screen while the saved session is read, so no page flashes
          before the right one opens (phones show the splash screen instead). */}
      {authLoading ? (
        <View
          style={StyleSheet.absoluteFill}
          className="items-center justify-center gap-6 bg-canvas dark:bg-ink"
        >
          <Logo />
          <ActivityIndicator color={colors.brand} />
        </View>
      ) : null}
    </>
  );
}
