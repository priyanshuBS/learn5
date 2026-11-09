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

        <Muted className="mb-2 mt-8 px-3 text-[11px] uppercase tracking-widest">Menu</Muted>
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
                    ? 'bg-slate-100 dark:bg-white/[0.06]'
                    : 'active:bg-slate-100 web:hover:bg-slate-50 dark:active:bg-white/5 dark:web:hover:bg-white/[0.03]',
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
                    active ? 'text-slate-900 dark:text-white' : 'text-slate-600 dark:text-zinc-400',
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
          <View className="mx-1 rounded-xl border border-line p-3.5 dark:border-ink-line">
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
            className="mt-2 flex-row items-center gap-2.5 rounded-lg px-3 py-2.5 active:bg-slate-100 web:hover:bg-slate-50 dark:active:bg-white/5 dark:web:hover:bg-white/[0.03]"
          >
            <View className="h-7 w-7 items-center justify-center rounded-full bg-brand-600">
              <Txt weight="semibold" className="text-xs uppercase text-white">
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

  return (
    <View
      accessibilityRole="tablist"
      className="flex-row border-t border-line bg-white/95 px-2 dark:border-ink-line dark:bg-ink-soft"
      style={{ paddingBottom: Math.max(insets.bottom, 8) }}
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
            className="min-h-14 flex-1 items-center justify-center pt-2"
          >
            <View
              className={twMerge(
                'h-8 w-14 items-center justify-center rounded-full',
                active && 'bg-brand-50 dark:bg-brand-500/15',
              )}
            >
              <Icon
                name={item.icon}
                size={20}
                color={iconColor(active)}
                strokeWidth={active ? 2.25 : 2}
              />
              {badge ? (
                <View className="absolute right-2 top-0.5 h-4 min-w-4 items-center justify-center rounded-full border-2 border-white bg-rose-500 px-0.5 dark:border-ink-soft">
                  <Txt weight="bold" className="text-[9px] leading-3 text-white dark:text-white">
                    {badge > 9 ? '9+' : badge}
                  </Txt>
                </View>
              ) : null}
            </View>
            <Txt
              weight={active ? 'semibold' : 'medium'}
              className={twMerge(
                'mt-1 text-[11px]',
                active ? 'text-brand-700 dark:text-brand-200' : 'text-slate-500 dark:text-zinc-500',
              )}
            >
              {item.label}
            </Txt>
          </Pressable>
        );
      })}
    </View>
  );
}
