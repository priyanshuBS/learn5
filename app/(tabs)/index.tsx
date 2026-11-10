/**
 * Home — the daily dashboard. All subjects are equal, so none is pushed first.
 *   1. date, greeting and a one-line summary of today
 *   2. a card with today's progress, streak, points and level
 *   3. every subject with today's drops and its one next step (the main content)
 *   4. this week: streak days and level progress
 */
import type { ReactNode } from 'react';
import { View } from 'react-native';
import Animated, { FadeIn } from 'react-native-reanimated';
import { twMerge } from 'tailwind-merge';

import { CARD_CLASSES } from '@/components/Card';
import { CategoryCard } from '@/components/CategoryCard';
import { Icon } from '@/components/Icon';
import { Logo } from '@/components/Logo';
import { SectionTitle } from '@/components/PageHeader';
import { ProgressBar } from '@/components/ProgressBar';
import { Screen } from '@/components/Screen';
import { SkeletonBlock } from '@/components/StateViews';
import { ThemeIconButton } from '@/components/ThemeToggle';
import { Muted, Txt } from '@/components/Txt';
import { WeekStreak } from '@/components/WeekStreak';
import { dropKey, getCatchUpEntry, getNextOpening, getTodaySlots } from '@/features/drops/status';
import { useAppData } from '@/hooks/useAppData';
import { useColorScheme } from '@/hooks/useScheme';
import { greeting, localClockLabel, longDate } from '@/lib/time';
import { colors } from '@/theme';

export default function HomeScreen() {
  const dark = useColorScheme() === 'dark';
  const { ready, index, zonedNow, now, today, stats, results, isDone } = useAppData();

  if (!ready || !index) return <HomeSkeleton />;

  // Every category's 3 slots for today.
  const rows = index.categories.map((category) => ({
    category,
    slots: getTodaySlots(index, category.id, zonedNow, isDone),
    catchUp: getCatchUpEntry(index, category.id, zonedNow, isDone),
  }));

  const next = getNextOpening(index, zonedNow);
  const nextTime = next ? localClockLabel(next.time, zonedNow.offsetMinutes) : '—';
  const doneToday = rows.reduce((n, r) => n + r.slots.filter((s) => s.status === 'done').length, 0);
  const totalToday = rows.reduce((n, r) => n + r.slots.length, 0);
  const openNow = rows.reduce(
    (n, r) => n + r.slots.filter((s) => s.status === 'available').length,
    0,
  );
  const { streak, level, points } = stats;
  const playedDays = new Set(Object.values(results).map((r) => r.completedOn));

  const summary =
    openNow > 0
      ? `${openNow} ${openNow === 1 ? 'drop is' : 'drops are'} open now. Each one takes about 5 minutes.`
      : doneToday === totalToday && totalToday > 0
        ? 'You finished every drop today. Well done.'
        : `The next drop opens ${next?.tomorrow ? 'tomorrow' : 'today'} at ${nextTime}.`;

  return (
    <Screen>
      <Animated.View entering={FadeIn.duration(250)}>
        {/* Phone top bar (the sidebar has these on wide screens) */}
        <View className="mb-6 flex-row items-center justify-between lg:hidden">
          <Logo />
          <ThemeIconButton />
        </View>

        {/* Greeting */}
        <Muted className="text-[14px]">{longDate(zonedNow.date)}</Muted>
        <Txt
          weight="display"
          accessibilityRole="header"
          className="mt-1 text-[30px] leading-[38px] md:text-[36px] md:leading-[44px]"
        >
          {greeting(now)}
        </Txt>
        <Muted className="mt-1.5 text-[15px] leading-6">{summary}</Muted>

        {/* Today at a glance: a normal card, like everything else */}
        <View className={twMerge(CARD_CLASSES, 'mt-6 flex-row')}>
          <StatCell
            label="Today"
            value={`${doneToday}/${totalToday}`}
            icon={<Icon name="check-circle" size={14} color={colors.success} />}
          >
            <ProgressBar
              value={totalToday ? doneToday / totalToday : 0}
              color={colors.success}
              className="mt-2 h-1"
              label={`${doneToday} of ${totalToday} drops done today`}
            />
          </StatCell>
          <Divider />
          <StatCell
            label="Streak"
            value={`${streak.current} ${streak.current === 1 ? 'day' : 'days'}`}
            icon={<Icon name="flame" size={14} color={colors.streak} filled />}
          />
          <Divider />
          <StatCell
            label="Points"
            value={points.toLocaleString('en-IN')}
            icon={<Icon name="star" size={14} color={colors.points} filled />}
          />
          <Divider className="hidden md:flex" />
          <View className="hidden flex-1 md:flex">
            <StatCell
              label="Level"
              value={`${level.level} · ${level.name}`}
              icon={<Icon name="trophy" size={14} color={dark ? colors.mutedDark : colors.muted} />}
            />
          </View>
        </View>

        {streak.current > 0 && !streak.playedToday ? (
          <View className="mt-3 flex-row items-center gap-2.5 rounded-xl bg-orange-50 px-4 py-3 dark:bg-orange-500/10">
            <Icon name="flame" size={15} color={colors.streak} />
            <Txt className="flex-1 text-[13px] text-orange-800 dark:text-orange-200">
              Play one drop today to keep your {streak.current}-day streak.
            </Txt>
          </View>
        ) : null}

        {/* ── All subjects (the main content) ── */}
        <SectionTitle
          title="Subjects"
          right={
            <Muted className="text-[13px]">
              {doneToday} of {totalToday} drops done
            </Muted>
          }
        />
        <View className="-m-1.5 flex-row flex-wrap">
          {rows.map((row) => (
            <View key={row.category.id} className="w-full p-1.5 md:w-1/2 xl:w-1/3">
              <CategoryCard
                category={row.category}
                slots={row.slots}
                offsetMinutes={zonedNow.offsetMinutes}
                catchUp={row.catchUp}
                getResult={(slot) => (slot.entry ? results[dropKey(slot.entry)] : undefined)}
              />
            </View>
          ))}
        </View>

        {/* ── This week ── */}
        <SectionTitle title="This week" />
        <View className="gap-3 md:flex-row">
          <View className="md:flex-1">
            <WeekStreak
              playedDays={playedDays}
              today={today}
              current={streak.current}
              best={streak.best}
            />
          </View>
          <View className={twMerge(CARD_CLASSES, 'justify-between p-5 md:flex-1')}>
            <View className="flex-row items-start justify-between">
              <View>
                <Muted className="text-[13px]">Level {level.level}</Muted>
                <Txt weight="display" className="mt-0.5 text-lg">
                  {level.name}
                </Txt>
              </View>
              <View className="items-end">
                <Muted className="text-[13px]">Points</Muted>
                <Txt weight="display" className="mt-0.5 text-lg">
                  {points.toLocaleString('en-IN')}
                </Txt>
              </View>
            </View>
            <View className="mt-5">
              <ProgressBar
                value={level.progress}
                label={`Level progress ${Math.round(level.progress * 100)} percent`}
              />
              <Muted className="mt-2 text-[13px]">
                {level.nextAt
                  ? `${(level.nextAt - points).toLocaleString('en-IN')} points to Level ${level.level + 1}`
                  : 'You reached the highest level.'}
              </Muted>
            </View>
          </View>
        </View>
      </Animated.View>
    </Screen>
  );
}

function Divider({ className }: { className?: string }) {
  return <View className={twMerge('my-4 w-px bg-line dark:bg-ink-line', className)} />;
}

function StatCell({
  label,
  value,
  icon,
  children,
}: {
  label: string;
  value: string;
  icon: ReactNode;
  children?: ReactNode;
}) {
  return (
    <View accessible accessibilityLabel={`${label}: ${value}`} className="flex-1 px-4 py-4 md:px-5">
      <View className="flex-row items-center gap-1.5">
        {icon}
        <Muted className="text-[13px]" numberOfLines={1}>
          {label}
        </Muted>
      </View>
      <Txt weight="display" className="mt-1 text-[20px] leading-7" numberOfLines={1}>
        {value}
      </Txt>
      {children}
    </View>
  );
}

/** Placeholder shapes while saved progress and content load. */
function HomeSkeleton() {
  return (
    <Screen>
      <View className="mb-6 lg:hidden">
        <Logo />
      </View>
      <SkeletonBlock className="h-3 w-40" />
      <SkeletonBlock className="mt-3 h-8 w-56" />
      <SkeletonBlock className="mt-6 h-20 rounded-2xl" />
      <View className="-m-1.5 mt-10 flex-row flex-wrap">
        {[0, 1, 2, 3, 4, 5].map((i) => (
          <View key={i} className="w-full p-1.5 md:w-1/2 xl:w-1/3">
            <SkeletonBlock className="h-40 rounded-2xl" />
          </View>
        ))}
      </View>
    </Screen>
  );
}
