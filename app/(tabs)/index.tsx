/**
 * Today — minimal daily page.
 *   a handwritten greeting, "Today" in a large serif, one quiet status line,
 *   the four drops as a list, and today's one article. Nothing else.
 * Streaks, levels and badges live on the Progress tab.
 */
import { router } from 'expo-router';
import { Pressable, View } from 'react-native';

import { CategoryCard } from '@/components/CategoryCard';
import { Icon } from '@/components/Icon';
import { Logo } from '@/components/Logo';
import { Screen } from '@/components/Screen';
import { SkeletonBlock } from '@/components/StateViews';
import { ThemeIconButton } from '@/components/ThemeToggle';
import { Muted, Txt } from '@/components/Txt';
import { useArticleReads, useArticles } from '@/features/articles/store';
import { dropKey, getCatchUpEntry, getNextOpening, getTodaySlots } from '@/features/drops/status';
import { useAppData } from '@/hooks/useAppData';
import { useColorScheme } from '@/hooks/useScheme';
import { articleKey } from '@/lib/articles';
import { articleHref } from '@/lib/routes';
import { scheduledArticleCategory } from '@/lib/rotation';
import { greeting, localClockLabel, longDate } from '@/lib/time';
import { colors } from '@/theme';

export default function TodayScreen() {
  const { ready, index, zonedNow, now, stats, results, isDone } = useAppData();
  const articles = useArticles((s) => s.articles);
  const readMarks = useArticleReads((s) => s.read);
  const dark = useColorScheme() === 'dark';
  const accent = dark ? colors.brandOnDark : colors.brand;

  if (!ready || !index) return <TodaySkeleton />;

  const rows = index.categories.map((category) => ({
    category,
    slots: getTodaySlots(index, category.id, zonedNow, isDone),
    catchUp: getCatchUpEntry(index, category.id, zonedNow, isDone),
  }));
  const slotsToday = rows.flatMap((r) => r.slots);
  const doneToday = slotsToday.filter((s) => s.status === 'done').length;
  const totalToday = slotsToday.length;
  const next = getNextOpening(index, zonedNow);
  const nextTime = next ? localClockLabel(next.time, zonedNow.offsetMinutes) : '4:00 AM';
  const { streak } = stats;

  // Today's read: one article a day (before 4 AM, the latest one).
  const latestDate = articles?.reduce((max, a) => (a.date > max ? a.date : max), '') ?? '';
  const todaysSubject = scheduledArticleCategory(index, latestDate || zonedNow.date);
  const read =
    articles?.find(
      (a) => a.date === latestDate && (!todaysSubject || a.category === todaysSubject),
    ) ?? null;
  const readCategory = read ? index.categories.find((c) => c.id === read.category) : undefined;
  const wasRead = read ? !!readMarks[articleKey(read)] : false;

  return (
    <Screen width="narrow">
      {/* Phone top bar (the sidebar has these on wide screens) */}
      <View className="mb-10 flex-row items-center justify-between lg:hidden">
        <Logo />
        <ThemeIconButton />
      </View>

      {/* Greeting */}
      <Txt
        weight="script"
        className="text-[26px] leading-[30px] text-brand-600 dark:text-brand-300"
      >
        {greeting(now).toLowerCase()},
      </Txt>
      <Txt
        weight="display"
        accessibilityRole="header"
        className="mt-1 text-[56px] leading-[60px] md:text-[64px] md:leading-[68px]"
      >
        Today
      </Txt>
      <Muted className="mt-3 text-[14px]">
        {longDate(zonedNow.date)} · {doneToday} of {totalToday} done · {streak.current}-day streak
      </Muted>

      {/* Drops */}
      <View className="mt-14 flex-row items-baseline justify-between">
        <Txt weight="italic" className="text-[22px] leading-7">
          Drops
        </Txt>
        <Txt weight="mono" className="text-[12px] text-zinc-400 dark:text-zinc-500">
          new at {nextTime}
        </Txt>
      </View>
      <View className="mt-2 border-t border-zinc-900 dark:border-zinc-300">
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

      {/* Today's read */}
      <View className="mt-14 flex-row items-baseline justify-between">
        <Txt weight="italic" className="text-[22px] leading-7">
          Today&apos;s read
        </Txt>
        <Pressable accessibilityRole="link" onPress={() => router.push('/articles')} hitSlop={8}>
          <Txt weight="mono" className="text-[12px] text-zinc-500 dark:text-zinc-400">
            all reads
          </Txt>
        </Pressable>
      </View>
      <View className="mt-2 border-t border-zinc-900 dark:border-zinc-300">
        {read && readCategory ? (
          <Pressable
            accessibilityRole="button"
            accessibilityLabel={`${readCategory.name} article: ${read.title}`}
            onPress={() => router.push(articleHref(read))}
            className="py-6 active:opacity-60 web:hover:opacity-80"
          >
            <Txt weight="mono" className="text-[11.5px] uppercase tracking-[1px] text-zinc-500">
              {readCategory.name} · {read.readingMinutes} min{wasRead ? ' · read' : ''}
            </Txt>
            <Txt weight="display" className="mt-3 text-[30px] leading-[34px]">
              {read.title}
            </Txt>
            <Muted className="mt-2 text-[15px] leading-6" numberOfLines={2}>
              {read.summary}
            </Muted>
            <View className="mt-4 flex-row items-center gap-1.5">
              <Txt weight="medium" className="text-[14px] text-brand-700 dark:text-brand-300">
                {wasRead ? 'Read again' : 'Read'}
              </Txt>
              <Icon name="arrow-right" size={14} color={accent} />
            </View>
          </Pressable>
        ) : (
          <Muted className="py-6 text-[14px]">Today&apos;s article is on its way.</Muted>
        )}
      </View>
    </Screen>
  );
}

/** Placeholder shapes while saved progress and content load. */
function TodaySkeleton() {
  return (
    <Screen width="narrow">
      <View className="mb-10 lg:hidden">
        <Logo />
      </View>
      <SkeletonBlock className="h-6 w-40" />
      <SkeletonBlock className="mt-3 h-14 w-48" />
      <SkeletonBlock className="mt-4 h-3 w-64" />
      <SkeletonBlock className="mt-14 h-72" />
    </Screen>
  );
}
