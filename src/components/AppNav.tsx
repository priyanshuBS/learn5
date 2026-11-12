/**
 * AppNav — the main navigation.
 *   Wide screens (desktop/tablet web): a sidebar on the left.
 *   Phones: a bottom tab bar.
 * Used as the custom tab bar of app/(tabs)/_layout.tsx.
 */
import type { BottomTabBarProps } from 'expo-router/js-tabs';
import { LinearGradient } from 'expo-linear-gradient';
import { useEffect, useState, type ReactNode } from 'react';
import { Pressable, View } from 'react-native';
import Animated, { useAnimatedStyle, useSharedValue, withSpring } from 'react-native-reanimated';
import { twMerge } from 'tailwind-merge';

import { useAuth } from '@/features/auth/store';
import { useAppData } from '@/hooks/useAppData';
import { useColorScheme } from '@/hooks/useScheme';
import { colors } from '@/theme';

import { Icon, type IconName } from './Icon';
import { Logo } from './Logo';
import { ProgressBar } from './ProgressBar';
import { ThemeToggle } from './ThemeToggle';
import { Muted, Txt } from './Txt';

const NAV_ITEMS: { name: string; label: string; icon: IconName }[] = [
  { name: 'index', label: 'Home', icon: 'home' },
  { name: 'articles', label: 'Read', icon: 'articles' },
  { name: 'review', label: 'Review', icon: 'review' },
  { name: 'flashcards', label: 'Flashcards', icon: 'flashcards' },
  { name: 'badges', label: 'Progress', icon: 'trophy' },
];

export function AppNav({
  state,
  navigateToTab,
  insets,
  variant,
}: BottomTabBarProps & { variant: 'sidebar' | 'bottom' }) {
  const scheme = useColorScheme();
  const dark = scheme === 'dark';
  const { ready, stats, mistakes } = useAppData();
  const email = useAuth((s) => s.user?.email);

  const focused = state.routes[state.index]?.name ?? 'index';
  // The category page belongs to Home.
  const activeName = focused.startsWith('category') ? 'index' : focused;

  const go = (name: string) => {
    const route = state.routes.find((r) => r.name === name);
    if (route && route.key !== state.routes[state.index]?.key) navigateToTab(route.key);
  };

  const iconColor = (active: boolean) =>
    active ? (dark ? colors.brandOnDark : colors.brand) : dark ? colors.mutedDark : colors.muted;

  const badgeFor = (name: string) =>
    name === 'review' && ready && mistakes.length > 0 ? mistakes.length : 0;

  if (variant === 'sidebar') {
    return (
      <View
        className="w-64 border-r border-line bg-white/70 px-3 pb-4 web:backdrop-blur-xl dark:border-ink-line dark:bg-ink-soft"
        style={{ paddingTop: insets.top + 20 }}
      >
        <View className="px-3">
          <Logo />
        </View>

        <View className="mt-8" />
        <View className="gap-0.5" accessibilityRole="tablist">
          {NAV_ITEMS.map((item) => {
            const active = item.name === activeName;
            const badge = badgeFor(item.name);
            return (
              <Pressable
                key={item.name}
                accessibilityRole="tab"
                accessibilityLabel={badge ? `${item.label}, ${badge} to fix` : item.label}
                accessibilityState={{ selected: active }}
                onPress={() => go(item.name)}
                className={twMerge(
                  'min-h-10 flex-row items-center gap-3 rounded-lg px-3 py-2 web:transition-colors',
                  active
                    ? 'bg-brand-50 dark:bg-brand-400/10'
                    : 'active:bg-black/5 web:hover:bg-black/[0.03] dark:active:bg-white/5 dark:web:hover:bg-white/[0.04]',
                )}
              >
                <Icon
                  name={item.icon}
                  size={18}
                  color={iconColor(active)}
                  strokeWidth={active ? 2.25 : 2}
                />
                <Txt
                  weight={active ? 'semibold' : 'medium'}
                  className={twMerge(
                    'flex-1 text-[14px]',
                    active
                      ? 'text-brand-700 dark:text-brand-300'
                      : 'text-zinc-600 dark:text-[#9A9CAA]',
                  )}
                >
                  {item.label}
                </Txt>
                {badge ? (
                  <View className="min-w-5 items-center rounded-md bg-rose-50 px-1.5 py-0.5 dark:bg-rose-500/15">
                    <Txt weight="semibold" className="text-[11px] text-rose-600 dark:text-rose-300">
                      {badge}
                    </Txt>
                  </View>
                ) : null}
              </Pressable>
            );
          })}
        </View>

        <View className="flex-1" />

        {ready ? (
          <View className="mx-1 rounded-2xl border border-line bg-white/80 p-4 dark:border-ink-line dark:bg-ink-card">
            <View className="flex-row items-center justify-between">
              <View className="flex-row items-center gap-1.5">
                <Icon name="flame" size={15} color={colors.streak} filled />
                <Txt weight="semibold" className="text-[13px]">
                  {stats.streak.current} day{stats.streak.current === 1 ? '' : 's'}
                </Txt>
              </View>
              <View className="flex-row items-center gap-1.5">
                <Icon name="star" size={14} color={colors.points} filled />
                <Txt weight="semibold" className="text-[13px]">
                  {stats.points.toLocaleString('en-IN')}
                </Txt>
              </View>
            </View>
            <View className="mt-3 flex-row items-center justify-between">
              <Muted className="text-xs">
                Level {stats.level.level} · {stats.level.name}
              </Muted>
              <Muted className="text-xs">{Math.round(stats.level.progress * 100)}%</Muted>
            </View>
            <ProgressBar
              value={stats.level.progress}
              className="mt-1.5"
              label={`Level progress ${Math.round(stats.level.progress * 100)} percent`}
            />
          </View>
        ) : null}

        <ThemeToggle compact className="mx-1 mt-3" />

        {email ? (
          <Pressable
            accessibilityRole="button"
            accessibilityLabel={`Account: ${email}. Open progress and account`}
            onPress={() => go('badges')}
            className="mt-2 flex-row items-center gap-2.5 rounded-lg px-3 py-2.5 active:bg-zinc-100 web:hover:bg-zinc-50 dark:active:bg-white/5 dark:web:hover:bg-white/[0.03]"
          >
            <View className="h-7 w-7 items-center justify-center rounded-full bg-brand-600">
              <Txt weight="semibold" className="text-xs uppercase text-white dark:text-white">
                {email[0]}
              </Txt>
            </View>
            <Txt weight="medium" className="flex-1 text-[13px]" numberOfLines={1}>
              {email}
            </Txt>
          </Pressable>
        ) : null}
      </View>
    );
  }

  // Phones: a floating glass bar. A gradient pill slides to the active tab.
  return (
    <BottomBar
      activeIndex={Math.max(
        0,
        NAV_ITEMS.findIndex((i) => i.name === activeName),
      )}
      bottomInset={insets.bottom}
    >
      {NAV_ITEMS.map((item) => {
        const active = item.name === activeName;
        const badge = badgeFor(item.name);
        return (
          <Pressable
            key={item.name}
            accessibilityRole="tab"
            accessibilityLabel={badge ? `${item.label}, ${badge} to fix` : item.label}
            accessibilityState={{ selected: active }}
            onPress={() => go(item.name)}
            className="flex-1 items-center gap-0.5 py-2 active:opacity-70"
          >
            <View className="h-7 items-center justify-center">
              <Icon
                name={item.icon}
                size={21}
                color={iconColor(active)}
                strokeWidth={active ? 2.4 : 1.75}
              />
              {badge ? (
                <View className="absolute -right-2.5 -top-1 h-4 min-w-4 items-center justify-center rounded-full bg-red-500 px-1">
                  <Txt weight="bold" className="text-[9px] leading-3 text-white dark:text-white">
                    {badge > 9 ? '9+' : badge}
                  </Txt>
                </View>
              ) : null}
            </View>
            <Txt
              weight={active ? 'semibold' : 'medium'}
              className={twMerge(
                'text-[10.5px]',
                active ? 'text-brand-700 dark:text-brand-300' : 'text-zinc-500 dark:text-zinc-400',
              )}
              numberOfLines={1}
            >
              {item.label}
            </Txt>
          </Pressable>
        );
      })}
    </BottomBar>
  );
}

/** The floating bar and its sliding pill. */
function BottomBar({
  activeIndex,
  bottomInset,
  children,
}: {
  activeIndex: number;
  bottomInset: number;
  children: ReactNode;
}) {
  const [width, setWidth] = useState(0);
  const x = useSharedValue(0);
  const itemWidth = width / NAV_ITEMS.length;
  useEffect(() => {
    if (width > 0) x.set(withSpring(activeIndex * itemWidth, { damping: 18, stiffness: 220 }));
  }, [activeIndex, itemWidth, width, x]);
  const pill = useAnimatedStyle(() => ({ transform: [{ translateX: x.get() }] }));

  return (
    <View
      className="bg-canvas px-3 pt-1.5 dark:bg-ink"
      style={{ paddingBottom: Math.max(bottomInset, 10) }}
    >
      <View
        accessibilityRole="tablist"
        onLayout={(e) => setWidth(e.nativeEvent.layout.width - 12)}
        className="flex-row overflow-hidden rounded-[26px] border border-line bg-white/90 p-1.5 web:shadow-[0_12px_40px_-12px_rgba(0,0,0,0.35)] web:backdrop-blur-xl dark:border-ink-line dark:bg-ink-soft"
      >
        {width > 0 ? (
          <Animated.View
            pointerEvents="none"
            style={[
              {
                position: 'absolute',
                top: 6,
                bottom: 6,
                left: 6,
                width: itemWidth,
                borderRadius: 20,
                overflow: 'hidden',
              },
              pill,
            ]}
          >
            <LinearGradient
              colors={['rgba(255,106,26,0.28)', 'rgba(255,179,71,0.12)']}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={{
                flex: 1,
                borderRadius: 20,
                borderWidth: 1,
                borderColor: 'rgba(255,138,61,0.35)',
              }}
            />
          </Animated.View>
        ) : null}
        {children}
      </View>
    </View>
  );
}
