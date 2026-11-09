/**
 * Main app layout with navigation:
 *   - wide screens (1024px+, e.g. desktop web): sidebar on the left
 *   - phones and small windows: tab bar at the bottom
 *
 * The "(tabs)" folder name is a group: it does NOT appear in web addresses.
 * Quiz and Results live outside this group, so they open full-screen.
 */
import { Tabs } from 'expo-router/js-tabs';
import { useWindowDimensions } from 'react-native';

import { AppNav } from '@/components/AppNav';
import { useIsClient } from '@/hooks/useClient';
import { useColorScheme } from '@/hooks/useScheme';
import { colors } from '@/theme';

const SIDEBAR_MIN_WIDTH = 1024;

export default function TabsLayout() {
  const { width } = useWindowDimensions();
  const isClient = useIsClient();
  const scheme = useColorScheme();
  // During website pre-rendering the width is unknown, so start with the phone layout.
  const wide = isClient && width >= SIDEBAR_MIN_WIDTH;

  return (
    <Tabs
      backBehavior="history"
      tabBar={(props) => <AppNav {...props} variant={wide ? 'sidebar' : 'bottom'} />}
      screenOptions={{
        headerShown: false,
        tabBarPosition: wide ? 'left' : 'bottom',
        sceneStyle: { backgroundColor: scheme === 'dark' ? colors.ink : colors.canvas },
      }}
    >
      <Tabs.Screen name="index" options={{ title: 'Home' }} />
      <Tabs.Screen name="badges" options={{ title: 'Progress' }} />
      <Tabs.Screen name="review" options={{ title: 'Review' }} />
      <Tabs.Screen name="flashcards" options={{ title: 'Flashcards' }} />
      {/*
        Category pages belong to Home. They are NOT hidden with `href: null`,
        because hidden tabs redirect to Home in this Expo Router version.
        AppNav only draws the 4 items above, so this never shows in the bar.
      */}
      <Tabs.Screen name="category/[id]" options={{ title: 'Category' }} />
    </Tabs>
  );
}
