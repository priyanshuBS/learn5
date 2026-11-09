/**
 * Home — the daily dashboard. All six subjects are equal, so none is pushed first.
 *   1. greeting, heading and a one-line summary of today
 *   2. a compact strip: today's progress, streak, points / level
 *   3. every subject with today's drops and its one next step (the main content)
 *   4. this week: streak days and level progress
 */
import type { ReactNode } from 'react';
import { View } from 'react-native';
import Animated, { FadeIn, FadeInDown } from 'react-native-reanimated';
import { twMerge } from 'tailwind-merge';

import { CARD_CLASSES } from '@/components/Card';
import { CategoryCard } from '@/components/CategoryCard';
import { GradientText } from '@/components/Glow';
import { Icon } from '@/components/Icon';
import { Logo } from '@/components/Logo';
import { SectionTitle } from '@/components/PageHeader';
import { ProgressBar, ProgressRing } from '@/components/ProgressBar';
import { Screen } from '@/components/Screen';
import { SkeletonBlock } from '@/components/StateViews';
import { ThemeIconButton } from '@/components/ThemeToggle';
import { Eyebrow, Muted, Txt } from '@/components/Txt';
import { WeekStreak } from '@/components/WeekStreak';
import { dropKey, getCatchUpEntry, getNextOpening, getTodaySlots } from '@/features/drops/status';
import { useAppData } from '@/hooks/useAppData';
import { greeting, localClockLabel, longDate } from '@/lib/time';
import { colors } from '@/theme';

export default function HomeScreen() {
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
      ? `${openNow} ${openNow === 1 ? 'drop is' : 'drops are'} open now · pick any subject below.`
      : doneToday === totalToday && totalToday > 0
        ? 'You finished every drop today. Brilliant!'
        : `Next drop ${next?.tomorrow ? 'tomorrow' : 'today'} at ${nextTime}.`;

  return (
    <Screen>
      <Animated.View entering={FadeIn.duration(300)}>
        {/* Phone top bar (the sidebar has these on wide screens) */}
        <View className="mb-8 flex-row items-center justify-between lg:hidden">
          <Logo />
          <ThemeIconButton />
        </View>

        {/* Greeting */}
        <Eyebrow>
          {greeting(now)} · {longDate(zonedNow.date)}
        </Eyebrow>
        <Txt
          weight="heavy"
          accessibilityRole="header"
          className="mt-3 text-[36px] leading-[40px] md:text-[54px] md:leading-[58px]"
        >
          Pick a subject.{'\n'}
          <GradientText className="text-[36px] leading-[40px] md:text-[54px] md:leading-[58px]">
            Learn in 5 minutes.
          </GradientText>
        </Txt>
        <Muted className="mt-4 text-[15px] leading-6 md:text-base">{summary}</Muted>

        {/* Compact progress strip */}
        <View className={twMerge(CARD_CLASSES, 'mt-8 flex-row')}>
          <StatCell label="Today" value={`${doneToday}/${totalToday}`}>
            <ProgressRing
              value={totalToday ? doneToday / totalToday : 0}
              size={26}
              strokeWidth={3.5}
              label={`${doneToday} of ${totalToday} drops done today`}
            />
          </StatCell>
          <Divider />
          <StatCell label="Day streak" value={`${streak.current}`}>
            <Icon name="flame" size={20} color={colors.streak} filled />
          </StatCell>
          <Divider />
          <StatCell label="Points" value={points.toLocaleString('en-IN')}>
            <Icon name="star" size={20} color={colors.points} filled />
          </StatCell>
          <Divider className="hidden md:flex" />
          <View className="hidden flex-1 md:flex">
            <StatCell label={level.name} value={`Level ${level.level}`}>
              <Icon name="trophy" size={20} color={colors.brand} />
            </StatCell>
          </View>
        </View>

        {streak.current > 0 && !streak.playedToday ? (
          <View className="mt-3 flex-row items-center gap-2.5 rounded-2xl border border-orange-500/25 bg-orange-500/10 px-4 py-3">
            <Icon name="flame" size={15} color={colors.streak} />
            <Txt className="flex-1 text-[13px] text-orange-700 dark:text-orange-200">
              Play one drop today to keep your {streak.current}-day streak alive.
            </Txt>
          </View>
        ) : null}

        {/* ── All subjects (the main content) ── */}
        <SectionTitle
          eyebrow="Subjects"
          title="Choose what to learn"
          right={
            <Eyebrow>
              {doneToday}/{totalToday} done
            </Eyebrow>
          }
        />
        <View className="-m-2 flex-row flex-wrap">
          {rows.map((row, i) => (
            <View key={row.category.id} className="w-full p-2 md:w-1/2 xl:w-1/3">
              <Animated.View entering={FadeInDown.delay(50 * i).duration(420)}>
                <CategoryCard
                  category={row.category}
                  slots={row.slots}
                  offsetMinutes={zonedNow.offsetMinutes}
                  catchUp={row.catchUp}
                  getResult={(slot) => (slot.entry ? results[dropKey(slot.entry)] : undefined)}
                />
              </Animated.View>
            </View>
          ))}
        </View>

        {/* ── This week ── */}
        <SectionTitle eyebrow="Progress" title="Your week" />
        <View className="gap-4 md:flex-row">
          <View className="md:flex-1">
            <WeekStreak
              playedDays={playedDays}
              today={today}
              current={streak.current}
              best={streak.best}
            />
          </View>
          <View className={twMerge(CARD_CLASSES, 'justify-between p-5 md:flex-1')}>
            <View className="flex-row items-center justify-between">
              <View>
                <Eyebrow>Level {level.level}</Eyebrow>
                <Txt weight="bold" className="mt-1.5 text-[22px] leading-7">
                  {level.name}
                </Txt>
              </View>
              <View className="items-end">
                <Txt weight="bold" className="text-[22px] leading-7">
                  {points.toLocaleString('en-IN')}
                </Txt>
                <Eyebrow className="mt-1.5">Points</Eyebrow>
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
  return <View className={twMerge('my-5 w-px bg-line dark:bg-white/10', className)} />;
}

function StatCell({
  label,
  value,
  children,
}: {
  label: string;
  value: string;
  children: ReactNode;
}) {
  return (
    <View accessible accessibilityLabel={`${label}: ${value}`} className="flex-1 px-4 py-5 md:px-6">
      <View className="h-7 justify-center">{children}</View>
      <Txt weight="bold" className="mt-3 text-[22px] leading-7" numberOfLines={1}>
        {value}
      </Txt>
      <Eyebrow className="mt-1 text-[10px]" numberOfLines={1}>
        {label}
      </Eyebrow>
    </View>
  );
}

/** Placeholder shapes while saved progress and content load. */
function HomeSkeleton() {
  return (
    <Screen>
      <View className="mb-8 lg:hidden">
        <Logo />
      </View>
      <SkeletonBlock className="h-3 w-48" />
      <SkeletonBlock className="mt-4 h-12 w-80" />
      <SkeletonBlock className="mt-8 h-28 rounded-3xl" />
      <View className="-m-2 mt-14 flex-row flex-wrap">
        {[0, 1, 2, 3, 4, 5].map((i) => (
          <View key={i} className="w-full p-2 md:w-1/2 xl:w-1/3">
            <SkeletonBlock className="h-60 rounded-3xl" />
          </View>
        ))}
      </View>
    </Screen>
  );
}
