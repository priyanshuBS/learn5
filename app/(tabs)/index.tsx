/**
 * Today — the daily dashboard ("Scholar" theme).
 *   1. A blue welcome card: greeting, today's progress, streak and ONE "continue" button
 *   2. Today's drops: one card per subject (2-column grid), all open at 4 AM
 *   3. Today's read: ONE article a day, the subject rotates
 *   4. Side column (below on phones): overview numbers, this week, level progress
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
import { useColorScheme } from '@/hooks/useScheme';
import { articleKey } from '@/lib/articles';
import { addDays } from '@/lib/dates';
import { quizHref } from '@/lib/routes';
import { scheduledArticleCategory } from '@/lib/rotation';
import { greeting, localClockLabel, longDate } from '@/lib/time';
import { colors, ICON3D } from '@/theme';

export default function TodayScreen() {
  const { ready, index, zonedNow, now, today, stats, results, isDone } = useAppData();
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
  const nextOpen = rows.find((r) => r.slots[0]?.status === 'available');
  const next = getNextOpening(index, zonedNow);
  const nextTime = next ? localClockLabel(next.time, zonedNow.offsetMinutes) : '4:00 AM';
  const { streak, level, points } = stats;
  const allDone = totalToday > 0 && doneToday === totalToday;

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

  const headline = allDone
    ? 'You finished today’s drops.'
    : doneToday > 0
      ? 'Nice progress. Keep going.'
      : 'Ready for today’s drops?';

  return (
    <Screen>
      {/* Phone top bar (the sidebar has these on wide screens) */}
      <View className="mb-6 flex-row items-center justify-between lg:hidden">
        <Logo />
        <ThemeIconButton />
      </View>

      <View className="lg:flex-row lg:gap-8">
        {/* ── Main column ── */}
        <View className="lg:flex-[2]">
          {/* Welcome card */}
          <View className="overflow-hidden rounded-3xl bg-brand-900 p-6 dark:bg-[#272366] md:p-7">
            <View
              pointerEvents="none"
              className="absolute -right-10 -top-16 h-48 w-48 rounded-full bg-white/[0.06]"
            />
            <View className="flex-row items-center justify-between gap-3">
              <Txt className="text-[13px] text-white/75 dark:text-white/75">
                {longDate(zonedNow.date)}
              </Txt>
              <View className="flex-row items-center gap-1.5 rounded-full bg-white/15 px-3 py-1">
                <Icon name="flame" size={13} color="#FBBF24" filled />
                <Txt weight="semibold" className="text-[12.5px] text-white dark:text-white">
                  {streak.current} day streak
                </Txt>
              </View>
            </View>
            <Txt
              weight="display"
              accessibilityRole="header"
              className="mt-4 text-[26px] leading-[32px] text-white dark:text-white md:text-[30px] md:leading-[36px]"
            >
              {greeting(now)}. {headline}
            </Txt>
            <View className="mt-5 flex-row items-center gap-3">
              <View className="h-2 flex-1 overflow-hidden rounded-full bg-white/15">
                <View
                  className="h-full rounded-full bg-gold"
                  style={{ width: `${totalToday ? (doneToday / totalToday) * 100 : 0}%` }}
                />
              </View>
              <Txt weight="semibold" className="text-[13px] text-white dark:text-white">
                {doneToday}/{totalToday} done
              </Txt>
            </View>
            <View className="mt-6 flex-row flex-wrap items-center gap-3">
              {nextOpen?.slots[0]?.entry ? (
                <Button3
                  label={`Continue with ${nextOpen.category.name}`}
                  onPress={() =>
                    nextOpen.slots[0]?.entry && router.push(quizHref(nextOpen.slots[0].entry))
                  }
                />
              ) : (
                <Txt className="text-[14px] text-white/85 dark:text-white/85">
                  {allDone
                    ? `New drops ${next?.tomorrow === false ? 'today' : 'tomorrow'} at ${nextTime}.`
                    : `Next drops at ${nextTime}.`}
                </Txt>
              )}
            </View>
          </View>

          <SectionTitle
            title="Today's drops"
            subtitle={`One per subject · 5 questions each · new at ${nextTime}`}
          />
          <View className="-m-1.5 flex-row flex-wrap">
            {rows.map((row) => (
              <View key={row.category.id} className="w-full p-1.5 sm:w-1/2">
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
                <Txt weight="semibold" className="text-[13px] text-brand-700 dark:text-brand-300">
                  All reads
                </Txt>
                <Icon
                  name="chevron-right"
                  size={14}
                  color={dark ? colors.brandOnDark : colors.brand}
                />
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
            <View className="rounded-2xl border border-dashed border-line px-5 py-8 dark:border-ink-line">
              <Muted className="text-center text-[14px]">
                Today&apos;s article is being written. Check back soon.
              </Muted>
            </View>
          )}
        </View>

        {/* ── Side column ── */}
        <View className="lg:flex-1">
          <SectionTitle title="Your progress" />
          <StatStrip
            stats={[
              { icon: 'flame', color: ICON3D.flame, label: 'Streak', value: `${streak.current}d` },
              {
                icon: 'star',
                color: ICON3D.star,
                label: 'Points',
                value: points.toLocaleString('en-IN'),
              },
              { icon: 'trophy', color: ICON3D.trophy, label: 'Level', value: `${level.level}` },
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
              <Txt weight="semibold" className="text-[13px] text-brand-700 dark:text-brand-300">
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
        </View>
      </View>
    </Screen>
  );
}

/** White button on the blue welcome card. */
function Button3({ label, onPress }: { label: string; onPress: () => void }) {
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={label}
      onPress={onPress}
      className="h-11 flex-row items-center gap-2 rounded-xl bg-gold px-4 active:opacity-90 web:hover:bg-gold-light"
    >
      <Txt weight="semibold" className="text-[14px] text-brand-900 dark:text-brand-900">
        {label}
      </Txt>
      <Icon name="arrow-right" size={15} color="#1E1B4C" />
    </Pressable>
  );
}

/** Placeholder shapes while saved progress and content load. */
function TodaySkeleton() {
  return (
    <Screen>
      <View className="mb-6 lg:hidden">
        <Logo />
      </View>
      <SkeletonBlock className="h-56 rounded-3xl" />
      <View className="-m-1.5 mt-10 flex-row flex-wrap">
        {[0, 1, 2, 3].map((i) => (
          <View key={i} className="w-full p-1.5 sm:w-1/2">
            <SkeletonBlock className="h-52" />
          </View>
        ))}
      </View>
    </Screen>
  );
}
