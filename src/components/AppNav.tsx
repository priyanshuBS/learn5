/**
 * AppNav — the main navigation.
 *   Wide screens (desktop/tablet web): a sidebar on the left.
 *   Phones: a bottom tab bar.
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
import { ProgressBar } from './ProgressBar';
import { ThemeToggle } from './ThemeToggle';
import { Muted, Txt } from './Txt';

const NAV_ITEMS: { name: string; label: string; icon: IconName }[] = [
  { name: 'index', label: 'Home', icon: 'home' },
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
        className="w-64 border-r border-line bg-white px-3 pb-4 dark:border-ink-line dark:bg-ink-soft"
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
                    ? 'bg-[#FCE8ED] dark:bg-ink-raised'
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
                      ? 'text-[#2A1219] dark:text-[#F7E9EE]'
                      : 'text-zinc-600 dark:text-[#B8A5AD]',
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
          <View className="mx-1 rounded-2xl border border-line bg-white p-4 dark:border-ink-line dark:bg-ink-card">
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
            <View className="h-7 w-7 items-center justify-center rounded-full bg-brand-600 dark:bg-brand-400">
              <Txt weight="semibold" className="text-xs uppercase text-white dark:text-[#2A1219]">
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

  // Phones: a standard bottom tab bar — an icon and a label for every tab.
  return (
    <View
      accessibilityRole="tablist"
      className="flex-row border-t border-line bg-white dark:border-ink-line dark:bg-ink-soft"
      style={{ paddingBottom: Math.max(insets.bottom, 6) }}
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
            className="flex-1 items-center gap-1 pb-1 pt-2.5 active:opacity-70"
          >
            <View>
              <Icon
                name={item.icon}
                size={22}
                color={iconColor(active)}
                strokeWidth={active ? 2.25 : 1.75}
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
                'text-[11px]',
                active ? 'text-brand-600 dark:text-brand-400' : 'text-zinc-500 dark:text-zinc-400',
              )}
              numberOfLines={1}
            >
              {item.label}
            </Txt>
          </Pressable>
        );
      })}
    </View>
  );
}
