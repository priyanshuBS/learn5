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
import { Eyebrow, Muted, Txt } from './Txt';

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
        className="w-64 border-r border-line bg-white/80 px-3 pb-4 dark:border-white/10 dark:bg-white/[0.02]"
        style={{ paddingTop: insets.top + 20 }}
      >
        <View className="px-3">
          <Logo />
        </View>

        <Eyebrow className="mb-3 mt-10 px-3">Menu</Eyebrow>
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
                  'min-h-11 flex-row items-center gap-3 rounded-full px-4 py-2 web:transition-colors',
                  active
                    ? 'border border-line bg-white dark:border-white/15 dark:bg-white/[0.07]'
                    : 'border border-transparent active:bg-zinc-100 web:hover:bg-zinc-50 dark:active:bg-white/5 dark:web:hover:bg-white/[0.04]',
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
                    active ? 'text-[#0B0B12] dark:text-white' : 'text-zinc-500 dark:text-[#8E8EA3]',
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
          <View className="mx-1 rounded-3xl border border-line bg-white p-4 dark:border-white/10 dark:bg-white/[0.035]">
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
            <View className="h-7 w-7 items-center justify-center rounded-full bg-brand-500">
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

  // Phones: a floating pill bar. The active tab grows into a saffron pill with its label.
  return (
    <View
      className="bg-canvas px-4 pt-2 dark:bg-ink"
      style={{ paddingBottom: Math.max(insets.bottom, 10) }}
    >
      <View
        accessibilityRole="tablist"
        className="flex-row items-center rounded-full border border-line bg-white p-1.5 dark:border-white/10 dark:bg-[#0E0E15]"
        style={FLOATING_SHADOW}
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
              className={twMerge(
                'h-12 flex-row items-center justify-center gap-2 rounded-full',
                active
                  ? 'flex-[1.8] bg-[#0B0B12] dark:bg-[#F2F2F5]'
                  : 'flex-1 active:bg-zinc-100 dark:active:bg-white/5',
              )}
            >
              <View>
                <Icon
                  name={item.icon}
                  size={20}
                  color={active ? (dark ? '#050508' : colors.white) : iconColor(false)}
                  strokeWidth={active ? 2.25 : 2}
                />
                {badge && !active ? (
                  <View className="absolute -right-2 -top-1.5 h-4 min-w-4 items-center justify-center rounded-full border border-white bg-rose-500 px-0.5 dark:border-ink-card">
                    <Txt weight="bold" className="text-[9px] leading-3 text-white dark:text-white">
                      {badge > 9 ? '9+' : badge}
                    </Txt>
                  </View>
                ) : null}
              </View>
              {active ? (
                <Txt
                  weight="semibold"
                  className="text-[13px] text-white dark:text-[#050508]"
                  numberOfLines={1}
                >
                  {item.label}
                </Txt>
              ) : null}
            </Pressable>
          );
        })}
      </View>
    </View>
  );
}

/** Soft shadow under the floating tab bar on phones (the website uses web:shadow-lg). */
const FLOATING_SHADOW = {
  shadowColor: '#000000',
  shadowOpacity: 0.12,
  shadowRadius: 18,
  shadowOffset: { width: 0, height: 8 },
  elevation: 8,
} as const;
