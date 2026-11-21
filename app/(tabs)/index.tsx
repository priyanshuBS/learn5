/**
 * Today — the daily dashboard. Flat, black and white, built from lists and type:
 *   1. "Today", the date and a one-line status, with a segmented progress line
 *   2. Drops: the four subjects as one list, one drop each (all open at 4 AM)
 *   3. Today's read: ONE article a day, the subject rotates
 *   4. Side column (below on phones): streak/points/level, this week, level progress
 */
import { router } from 'expo-router';
import { Pressable, View } from 'react-native';
import { twMerge } from 'tailwind-merge';

import { ArticleCard } from '@/components/ArticleCard';
import { CARD_CLASSES } from '@/components/Card';
import { CategoryCard } from '@/components/CategoryCard';
import { Icon } from '@/components/Icon';
import { Logo } from '@/components/Logo';
import { SectionTitle } from '@/components/PageHeader';
import { ProgressBar } from '@/components/ProgressBar';
import { Screen } from '@/components/Screen';
import { StatStrip } from '@/components/StatCard';
import { SkeletonBlock } from '@/components/StateViews';
import { ThemeIconButton } from '@/components/ThemeToggle';
import { Muted, Txt } from '@/components/Txt';
import { WeekStreak } from '@/components/WeekStreak';
import { useArticleReads, useArticles } from '@/features/articles/store';
import { dropKey, getCatchUpEntry, getNextOpening, getTodaySlots } from '@/features/drops/status';
import { useAppData } from '@/hooks/useAppData';
import { articleKey } from '@/lib/articles';
import { addDays } from '@/lib/dates';
import { scheduledArticleCategory } from '@/lib/rotation';
import { localClockLabel, longDate } from '@/lib/time';
import { useColorScheme } from '@/hooks/useScheme';
import { colors } from '@/theme';

export default function TodayScreen() {
  const { ready, index, zonedNow, today, stats, results, isDone } = useAppData();
  const articles = useArticles((s) => s.articles);
  const readMarks = useArticleReads((s) => s.read);
  const dark = useColorScheme() === 'dark';

  if (!ready || !index) return <TodaySkeleton />;

  // Every subject's drop for today.
  const rows = index.categories.map((category) => ({
    category,
    slots: getTodaySlots(index, category.id, zonedNow, isDone),
    catchUp: getCatchUpEntry(index, category.id, zonedNow, isDone),
  }));
  const slotsToday = rows.flatMap((r) => r.slots);
  const doneToday = slotsToday.filter((s) => s.status === 'done').length;
  const totalToday = slotsToday.length;
  const openNow = slotsToday.filter((s) => s.status === 'available').length;
  const next = getNextOpening(index, zonedNow);
  const nextTime = next ? localClockLabel(next.time, zonedNow.offsetMinutes) : '4:00 AM';
  const { streak, level, points } = stats;

  // Today's read: one article a day (before 4 AM, the latest one).
  const latestDate = articles?.reduce((max, a) => (a.date > max ? a.date : max), '') ?? '';
  const todaysSubject = scheduledArticleCategory(index, latestDate || zonedNow.date);
  const read =
    articles?.find(
      (a) => a.date === latestDate && (!todaysSubject || a.category === todaysSubject),
    ) ?? null;
  const readCategory = read ? index.categories.find((c) => c.id === read.category) : undefined;
  const tomorrowId = scheduledArticleCategory(index, addDays(zonedNow.date, 1));
  const tomorrowCategory = index.categories.find((c) => c.id === tomorrowId);
  const playedDays = new Set(Object.values(results).map((r) => r.completedOn));

  const status =
    totalToday > 0 && doneToday === totalToday
      ? `All ${totalToday} drops done. New ones ${next?.tomorrow === false ? 'today' : 'tomorrow'} at ${nextTime}.`
      : openNow > 0
        ? `${doneToday} of ${totalToday} done · ${openNow} ready to play`
        : `${doneToday} of ${totalToday} done · next drops at ${nextTime}`;

  return (
    <Screen>
      {/* Phone top bar (the sidebar has these on wide screens) */}
      <View className="mb-8 flex-row items-center justify-between lg:hidden">
        <Logo />
        <ThemeIconButton />
      </View>

      {/* Header */}
      <Muted className="text-[13px]">{longDate(zonedNow.date)}</Muted>
      <Txt
        weight="display"
        accessibilityRole="header"
        className="mt-1 text-[32px] leading-[38px] md:text-[36px] md:leading-[42px]"
      >
        Today
      </Txt>
      <Muted className="mt-1.5 text-[15px] leading-6">{status}</Muted>
      <View
        className="mt-5 flex-row gap-1"
        accessible
        accessibilityRole="progressbar"
        accessibilityLabel={`${doneToday} of ${totalToday} drops done today`}
      >
        {rows.map((r) => (
          <View
            key={r.category.id}
            className={twMerge(
              'h-1 flex-1 rounded-full',
              r.slots[0]?.status === 'done'
                ? 'bg-zinc-950 dark:bg-[#EDEDED]'
                : 'bg-zinc-200 dark:bg-ink-raised',
            )}
          />
        ))}
      </View>

      <View className="lg:flex-row lg:gap-10">
        {/* ── Main column ── */}
        <View className="lg:flex-[2]">
          <SectionTitle
            title="Drops"
            subtitle={`One per subject · 5 questions · opens daily at ${nextTime}`}
          />
          <View className={twMerge(CARD_CLASSES, 'overflow-hidden')}>
            {rows.map((row, i) => (
              <CategoryCard
                key={row.category.id}
                category={row.category}
                slots={row.slots}
                offsetMinutes={zonedNow.offsetMinutes}
                catchUp={row.catchUp}
                divider={i > 0}
                getResult={(slot) => (slot.entry ? results[dropKey(slot.entry)] : undefined)}
              />
            ))}
          </View>

          <SectionTitle
            title={latestDate === zonedNow.date ? "Today's read" : 'Latest read'}
            subtitle={
              tomorrowCategory ? `Tomorrow: ${tomorrowCategory.name}` : 'A new subject every day'
            }
            right={
              <Pressable
                accessibilityRole="link"
                onPress={() => router.push('/articles')}
                hitSlop={8}
                className="flex-row items-center gap-1"
              >
                <Txt weight="medium" className="text-[13px] text-zinc-600 dark:text-zinc-400">
                  All reads
                </Txt>
                <Icon name="chevron-right" size={14} color={dark ? '#8F8F8F' : '#737373'} />
              </Pressable>
            }
          />
          {read && readCategory ? (
            <ArticleCard
              article={read}
              category={readCategory}
              read={!!readMarks[articleKey(read)]}
            />
          ) : (
            <View className="rounded-xl border border-dashed border-line px-5 py-8 dark:border-ink-line">
              <Muted className="text-center text-[14px]">
                Today&apos;s article is being written. Check back soon.
              </Muted>
            </View>
          )}
        </View>

        {/* ── Side column ── */}
        <View className="lg:flex-1">
          <SectionTitle title="Overview" />
          <StatStrip
            stats={[
              { label: 'Points', value: points.toLocaleString('en-IN') },
              { label: 'Level', value: `${level.level}` },
              { label: 'Drops done', value: `${stats.dropsDone}` },
            ]}
          />
          <WeekStreak
            className="mt-3"
            playedDays={playedDays}
            today={today}
            current={streak.current}
            best={streak.best}
          />
          <View className={twMerge(CARD_CLASSES, 'mt-3 p-5')}>
            <View className="flex-row items-end justify-between">
              <View>
                <Muted className="text-[13px]">Level {level.level}</Muted>
                <Txt weight="display" className="mt-1 text-[20px] leading-7">
                  {level.name}
                </Txt>
              </View>
              <Txt weight="mono" className="text-[12.5px] text-zinc-500 dark:text-zinc-400">
                {Math.round(level.progress * 100)}%
              </Txt>
            </View>
            <ProgressBar
              value={level.progress}
              className="mt-4"
              label={`Level progress ${Math.round(level.progress * 100)} percent`}
            />
            <Muted className="mt-2.5 text-[13px]">
              {level.nextAt
                ? `${(level.nextAt - points).toLocaleString('en-IN')} points to level ${level.level + 1}`
                : 'You reached the highest level.'}
            </Muted>
          </View>
          {streak.current > 0 && !streak.playedToday ? (
            <View className="mt-3 flex-row items-center gap-2.5 rounded-xl border border-line px-4 py-3 dark:border-ink-line">
              <Icon name="flame" size={14} color={colors.brand} />
              <Txt className="flex-1 text-[13px] text-zinc-700 dark:text-zinc-300">
                Play one drop today to keep your {streak.current}-day streak.
              </Txt>
            </View>
          ) : null}
        </View>
      </View>
    </Screen>
  );
}

/** Placeholder shapes while saved progress and content load. */
function TodaySkeleton() {
  return (
    <Screen>
      <View className="mb-8 lg:hidden">
        <Logo />
      </View>
      <SkeletonBlock className="h-3 w-36" />
      <SkeletonBlock className="mt-3 h-9 w-32" />
      <SkeletonBlock className="mt-3 h-3 w-56" />
      <SkeletonBlock className="mt-5 h-1 rounded-full" />
      <SkeletonBlock className="mt-12 h-72" />
    </Screen>
  );
}
