/**
 * AppNav — the main navigation.
 *   Wide screens (desktop/tablet web): a quiet sidebar on the left.
 *   Phones: a flat bottom tab bar.
 * Used as the custom tab bar of app/(tabs)/_layout.tsx.
 */
import type { BottomTabBarProps } from 'expo-router/js-tabs';
import { Pressable, View } from 'react-native';
import { twMerge } from 'tailwind-merge';

import { useAuth } from '@/features/auth/store';
import { useAppData } from '@/hooks/useAppData';
import { useColorScheme } from '@/hooks/useScheme';
import { colors } from '@/theme';

import { Icon, type IconName } from './Icon';
import { Logo } from './Logo';
import { ThemeToggle } from './ThemeToggle';
import { Muted, Txt } from './Txt';

const NAV_ITEMS: { name: string; label: string; icon: IconName }[] = [
  { name: 'index', label: 'Today', icon: 'home' },
  { name: 'articles', label: 'Read', icon: 'articles' },
  { name: 'review', label: 'Review', icon: 'review' },
  { name: 'flashcards', label: 'Cards', icon: 'flashcards' },
  { name: 'badges', label: 'Progress', icon: 'trophy' },
];

export function AppNav({
  state,
  navigateToTab,
  insets,
  variant,
}: BottomTabBarProps & { variant: 'sidebar' | 'bottom' }) {
  const dark = useColorScheme() === 'dark';
  const { ready, stats, mistakes } = useAppData();
  const email = useAuth((s) => s.user?.email);

  const focused = state.routes[state.index]?.name ?? 'index';
  // The category page belongs to Today.
  const activeName = focused.startsWith('category') ? 'index' : focused;

  const go = (name: string) => {
    const route = state.routes.find((r) => r.name === name);
    if (route && route.key !== state.routes[state.index]?.key) navigateToTab(route.key);
  };

  const iconColor = (active: boolean) =>
    active ? (dark ? colors.brandOnDark : colors.brand) : dark ? '#667085' : '#98A2B6';

  const badgeFor = (name: string) =>
    name === 'review' && ready && mistakes.length > 0 ? mistakes.length : 0;

  if (variant === 'sidebar') {
    return (
      <View
        className="w-60 border-r border-line bg-white px-3 pb-4 dark:border-ink-line dark:bg-ink-soft"
        style={{ paddingTop: insets.top + 24 }}
      >
        <View className="px-2.5">
          <Logo />
        </View>

        <View className="mt-8 gap-px" accessibilityRole="tablist">
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
                  'h-9 flex-row items-center gap-2.5 rounded-md px-2.5 web:transition-colors',
                  active
                    ? 'bg-brand-50 dark:bg-brand-400/[0.12]'
                    : 'active:bg-zinc-50 web:hover:bg-zinc-50 dark:active:bg-white/[0.04] dark:web:hover:bg-white/[0.04]',
                )}
              >
                <Icon name={item.icon} size={16} color={iconColor(active)} strokeWidth={1.75} />
                <Txt
                  weight={active ? 'medium' : 'regular'}
                  className={twMerge(
                    'flex-1 text-[14px]',
                    active
                      ? 'text-brand-700 dark:text-brand-300'
                      : 'text-zinc-500 dark:text-zinc-400',
                  )}
                >
                  {item.label}
                </Txt>
                {badge ? (
                  <Txt weight="mono" className="text-[12px] text-zinc-500 dark:text-zinc-400">
                    {badge}
                  </Txt>
                ) : null}
              </Pressable>
            );
          })}
        </View>

        <View className="flex-1" />

        {ready ? (
          <View className="mx-1 mb-3 flex-row border-y border-line py-3 dark:border-ink-line">
            <View className="flex-1 px-1.5">
              <Muted className="text-[12px]">Streak</Muted>
              <Txt weight="semibold" className="mt-0.5 text-[15px]">
                {stats.streak.current}d
              </Txt>
            </View>
            <View className="flex-1 px-1.5">
              <Muted className="text-[12px]">Points</Muted>
              <Txt weight="semibold" className="mt-0.5 text-[15px]">
                {stats.points.toLocaleString('en-IN')}
              </Txt>
            </View>
            <View className="flex-1 px-1.5">
              <Muted className="text-[12px]">Level</Muted>
              <Txt weight="semibold" className="mt-0.5 text-[15px]">
                {stats.level.level}
              </Txt>
            </View>
          </View>
        ) : null}

        <ThemeToggle compact className="mx-1" />

        {email ? (
          <Pressable
            accessibilityRole="button"
            accessibilityLabel={`Account: ${email}. Open progress and account`}
            onPress={() => go('badges')}
            className="mt-2 flex-row items-center gap-2.5 rounded-md px-2.5 py-2 active:bg-zinc-50 web:hover:bg-zinc-50 dark:active:bg-white/[0.04] dark:web:hover:bg-white/[0.04]"
          >
            <View className="h-6 w-6 items-center justify-center rounded-full bg-brand-600 dark:bg-brand-500">
              <Txt weight="semibold" className="text-[11px] uppercase text-white dark:text-white">
                {email[0]}
              </Txt>
            </View>
            <Txt className="flex-1 text-[13px] text-zinc-600 dark:text-zinc-400" numberOfLines={1}>
              {email}
            </Txt>
          </Pressable>
        ) : null}
      </View>
    );
  }

  // Phones: a flat bottom tab bar.
  return (
    <View
      className="border-t border-line bg-white px-1 pt-1.5 dark:border-ink-line dark:bg-ink-soft"
      style={{ paddingBottom: Math.max(insets.bottom, 8) }}
    >
      <View accessibilityRole="tablist" className="flex-row">
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
              className="flex-1 items-center gap-1 py-1.5 active:opacity-60"
            >
              <View className="h-6 items-center justify-center">
                <Icon
                  name={item.icon}
                  size={21}
                  color={iconColor(active)}
                  strokeWidth={active ? 2 : 1.6}
                />
                {badge ? (
                  <View className="absolute -right-2 -top-0.5 h-2 w-2 rounded-full bg-brand-600 dark:bg-brand-500" />
                ) : null}
              </View>
              <Txt
                weight={active ? 'medium' : 'regular'}
                className={twMerge(
                  'text-[10.5px]',
                  active
                    ? 'text-brand-700 dark:text-brand-300'
                    : 'text-zinc-500 dark:text-zinc-500',
                )}
                numberOfLines={1}
              >
                {item.label}
              </Txt>
            </Pressable>
          );
        })}
      </View>
    </View>
  );
}
