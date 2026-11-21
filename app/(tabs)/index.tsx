/**
 * Today — the daily page. Minimal content, clear structure:
 *   a handwritten greeting and a bold title, one soft progress card,
 *   the four drops as a list, and today's one article.
 * Streaks, levels and badges in detail live on the Progress tab.
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
      <View className="mb-9 flex-row items-center justify-between lg:hidden">
        <Logo />
        <ThemeIconButton />
      </View>

      {/* Greeting */}
      <Txt weight="script" className="text-[22px] leading-7 text-brand-600 dark:text-brand-300">
        {greeting(now)},
      </Txt>
      <Txt
        weight="display"
        accessibilityRole="header"
        className="mt-1 text-[36px] leading-[42px] tracking-[-1.2px] md:text-[42px] md:leading-[48px]"
      >
        Today&apos;s drops
      </Txt>
      <Muted className="mt-1 text-[14px]">{longDate(zonedNow.date)}</Muted>

      {/* Progress */}
      <View className="mt-7 rounded-2xl bg-brand-50 p-4 dark:bg-brand-400/10">
        <View className="flex-row items-baseline justify-between">
          <Txt className="text-[14px] text-zinc-700 dark:text-zinc-300">
            <Txt weight="display" className="text-[20px]">
              {doneToday}
            </Txt>{' '}
            of {totalToday} done
          </Txt>
          <View className="flex-row items-center gap-1.5">
            <Icon name="flame" size={14} color={accent} filled />
            <Txt weight="medium" className="text-[14px] text-zinc-700 dark:text-zinc-300">
              {streak.current}-day streak
            </Txt>
          </View>
        </View>
        <View className="mt-3 h-1.5 overflow-hidden rounded-full bg-white dark:bg-ink-raised">
          <View
            className="h-full rounded-full bg-brand-600 dark:bg-brand-400"
            style={{ width: `${totalToday ? (doneToday / totalToday) * 100 : 0}%` }}
          />
        </View>
      </View>

      {/* Drops */}
      <View className="mt-10 flex-row items-baseline justify-between">
        <Txt weight="italic" className="text-[18px]">
          Drops
        </Txt>
        <Txt weight="mono" className="text-[12px] text-zinc-400 dark:text-zinc-500">
          new at {nextTime}
        </Txt>
      </View>
      <View className="mt-1">
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
      <View className="mt-10 flex-row items-baseline justify-between">
        <Txt weight="italic" className="text-[18px]">
          Today&apos;s read
        </Txt>
        <Pressable accessibilityRole="link" onPress={() => router.push('/articles')} hitSlop={8}>
          <Txt weight="medium" className="text-[13px] text-brand-700 dark:text-brand-300">
            All reads
          </Txt>
        </Pressable>
      </View>
      {read && readCategory ? (
        <Pressable
          accessibilityRole="button"
          accessibilityLabel={`${readCategory.name} article: ${read.title}`}
          onPress={() => router.push(articleHref(read))}
          className="mt-3 rounded-2xl border border-line p-5 active:opacity-70 web:hover:border-zinc-300 dark:border-ink-line dark:web:hover:border-zinc-700"
        >
          <View className="flex-row items-center gap-2">
            <View
              className="h-2 w-2 rounded-full"
              style={{ backgroundColor: readCategory.color }}
            />
            <Muted className="text-[13px]">
              {readCategory.name} · {read.readingMinutes} min{wasRead ? ' · read' : ''}
            </Muted>
          </View>
          <Txt weight="display" className="mt-2 text-[20px] leading-[26px] tracking-[-0.4px]">
            {read.title}
          </Txt>
          <Muted className="mt-1.5 text-[14px] leading-[21px]" numberOfLines={2}>
            {read.summary}
          </Muted>
          <View className="mt-4 flex-row items-center gap-1.5">
            <Txt weight="semibold" className="text-[14px] text-brand-700 dark:text-brand-300">
              {wasRead ? 'Read again' : 'Read'}
            </Txt>
            <Icon name="arrow-right" size={14} color={accent} />
          </View>
        </Pressable>
      ) : (
        <Muted className="mt-3 text-[14px]">Today&apos;s article is on its way.</Muted>
      )}
    </Screen>
  );
}

/** Placeholder shapes while saved progress and content load. */
function TodaySkeleton() {
  return (
    <Screen width="narrow">
      <View className="mb-9 lg:hidden">
        <Logo />
      </View>
      <SkeletonBlock className="h-5 w-32" />
      <SkeletonBlock className="mt-3 h-10 w-56" />
      <SkeletonBlock className="mt-7 h-20" />
      <SkeletonBlock className="mt-10 h-64" />
    </Screen>
  );
}
