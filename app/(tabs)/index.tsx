/**
 * Home — the daily dashboard ("Slate & Teal"). Simple by design:
 *   1. date and greeting
 *   2. a teal hero: today's progress (one drop per subject, all at 4 AM),
 *      plus streak, points and level
 *   3. the four subjects, each with its ONE drop for today
 *   4. today's read: ONE article a day, the subject rotates
 *   5. this week: streak days and level progress
 * No motion on load: the screen is calm until you interact with it.
 */
import { LinearGradient } from 'expo-linear-gradient';
import { router } from 'expo-router';
import { Pressable, View } from 'react-native';
import { twMerge } from 'tailwind-merge';

import { ArticleCard } from '@/components/ArticleCard';
import { CARD_CLASSES } from '@/components/Card';
import { CategoryCard } from '@/components/CategoryCard';
import { CategoryIcon } from '@/components/CategoryIcon';
import { Icon, type IconName } from '@/components/Icon';
import { Icon3D } from '@/components/Icon3D';
import { Logo } from '@/components/Logo';
import { SectionTitle } from '@/components/PageHeader';
import { ProgressBar, ProgressRing } from '@/components/ProgressBar';
import { Screen } from '@/components/Screen';
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
import { greeting, localClockLabel, longDate } from '@/lib/time';
import { colors, HERO_GRADIENT, ICON3D } from '@/theme';

export default function HomeScreen() {
  const { ready, index, zonedNow, now, today, stats, results, isDone } = useAppData();
  const articles = useArticles((s) => s.articles);
  const readMarks = useArticleReads((s) => s.read);

  if (!ready || !index) return <HomeSkeleton />;

  // Every subject's drop for today.
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
  const pct = totalToday ? Math.round((doneToday / totalToday) * 100) : 0;

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

  const headline =
    totalToday > 0 && doneToday === totalToday
      ? 'All done for today'
      : openNow > 0
        ? `${openNow} ${openNow === 1 ? 'drop' : 'drops'} ready for you`
        : `Next drops at ${nextTime}`;
  const subline =
    totalToday > 0 && doneToday === totalToday
      ? `Great work. New drops ${next?.tomorrow === false ? 'today' : 'tomorrow'} at ${nextTime}.`
      : `One drop per subject, every day at ${nextTime}. About 5 minutes each.`;

  return (
    <Screen>
      {/* Phone top bar (the sidebar has these on wide screens) */}
      <View className="mb-6 flex-row items-center justify-between lg:hidden">
        <Logo />
        <ThemeIconButton />
      </View>

      {/* Greeting */}
      <Txt
        weight="mono"
        className="text-[11.5px] uppercase tracking-[1.6px] text-zinc-500 dark:text-zinc-400"
      >
        {longDate(zonedNow.date)}
      </Txt>
      <Txt
        weight="display"
        accessibilityRole="header"
        className="mt-1.5 text-[30px] leading-[36px] md:text-[38px] md:leading-[46px]"
      >
        {greeting(now)}
      </Txt>

      {/* Hero: today's progress */}
      <View className="mt-5 overflow-hidden rounded-[24px] border border-transparent web:shadow-[0_24px_60px_-28px_rgba(0,0,0,0.55)] dark:border-ink-line">
        <LinearGradient
          colors={[...HERO_GRADIENT]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={{ padding: 22 }}
        >
          {/* A soft light in the corner for depth */}
          <View
            pointerEvents="none"
            className="absolute -right-16 -top-20 h-56 w-56 rounded-full bg-white/[0.07]"
          />
          <View className="flex-row items-center gap-5">
            <View className="flex-1">
              <Txt
                weight="mono"
                className="text-[11px] uppercase tracking-[1.6px] text-white/70 dark:text-white/70"
              >
                Today · {doneToday} of {totalToday} done
              </Txt>
              <Txt
                weight="display"
                className="mt-2 text-[24px] leading-[30px] text-white dark:text-white md:text-[28px] md:leading-[34px]"
              >
                {headline}
              </Txt>
              <Txt className="mt-1.5 text-[13.5px] leading-5 text-white/75 dark:text-white/75">
                {subline}
              </Txt>
            </View>
            <ProgressRing
              value={totalToday ? doneToday / totalToday : 0}
              size={84}
              strokeWidth={8}
              color="#FFFFFF"
              trackColor="rgba(255,255,255,0.18)"
              label={`${doneToday} of ${totalToday} drops done today`}
            >
              <Txt weight="display" className="text-[19px] text-white dark:text-white">
                {pct}%
              </Txt>
            </ProgressRing>
          </View>

          <View className="mt-5 flex-row gap-2">
            <HeroStat icon="flame" color="#FFFFFF" value={`${streak.current}`} label="day streak" />
            <HeroStat
              icon="star"
              color="#FFFFFF"
              value={points.toLocaleString('en-IN')}
              label="points"
            />
            <HeroStat
              icon="trophy"
              color="#FFFFFF"
              value={`Lv ${level.level}`}
              label={level.name}
            />
          </View>
        </LinearGradient>
      </View>

      {streak.current > 0 && !streak.playedToday ? (
        <View className="mt-3 flex-row items-center gap-2.5 rounded-2xl border border-line bg-white px-4 py-3 dark:border-ink-line dark:bg-ink-card">
          <Icon name="flame" size={15} color={colors.brand} />
          <Txt className="flex-1 text-[13px] text-zinc-700 dark:text-zinc-200">
            Play one drop today to keep your {streak.current}-day streak.
          </Txt>
        </View>
      ) : null}

      {/* ── Today's drops: one per subject ── */}
      <SectionTitle
        title="Today's drops"
        subtitle="Five questions per subject, from easy to hard."
        right={
          <Txt weight="mono" className="text-[12px] text-zinc-500 dark:text-zinc-400">
            {doneToday}/{totalToday}
          </Txt>
        }
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

      {/* ── Today's read ── */}
      <SectionTitle
        title={latestDate === zonedNow.date ? "Today's read" : 'Latest read'}
        subtitle="One short article a day, a new subject each morning."
        right={
          <Pressable accessibilityRole="link" onPress={() => router.push('/articles')} hitSlop={8}>
            <Txt weight="semibold" className="text-[13px] text-brand-700 dark:text-brand-300">
              All reads
            </Txt>
          </Pressable>
        }
      />
      {read && readCategory ? (
        <ArticleCard article={read} category={readCategory} read={!!readMarks[articleKey(read)]} />
      ) : (
        <View className="flex-row items-center gap-3 rounded-[20px] border border-dashed border-line p-5 dark:border-ink-line">
          <Icon name="articles" size={18} color={colors.muted} />
          <Muted className="flex-1 text-[14px]">Today&apos;s article is being written.</Muted>
        </View>
      )}
      {tomorrowCategory ? (
        <View className="mt-3 flex-row items-center gap-2.5 px-1">
          <CategoryIcon category={tomorrowCategory} size="xs" />
          <Muted className="text-[13px]">
            Tomorrow&apos;s read:{' '}
            <Txt weight="semibold" className="text-[13px]">
              {tomorrowCategory.name}
            </Txt>
          </Muted>
        </View>
      ) : null}

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
          <View className="flex-row items-center gap-3.5">
            <Icon3D icon="trophy" color={ICON3D.trophy} size={44} />
            <View className="flex-1">
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
    </Screen>
  );
}

/** One number on the hero, on a frosted chip. */
function HeroStat({
  icon,
  color,
  value,
  label,
}: {
  icon: IconName;
  color: string;
  value: string;
  label: string;
}) {
  return (
    <View
      accessible
      accessibilityLabel={`${label}: ${value}`}
      className="flex-1 flex-row items-center gap-2 rounded-2xl border border-white/10 bg-white/10 px-3 py-2.5"
    >
      <Icon name={icon} size={16} color={color} filled={icon !== 'trophy'} />
      <View className="flex-1">
        <Txt
          weight="bold"
          className="text-[15px] leading-5 text-white dark:text-white"
          numberOfLines={1}
        >
          {value}
        </Txt>
        <Txt className="text-[11px] text-white/70 dark:text-white/70" numberOfLines={1}>
          {label}
        </Txt>
      </View>
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
      <SkeletonBlock className="mt-5 h-44 rounded-[24px]" />
      <View className="-m-1.5 mt-10 flex-row flex-wrap">
        {[0, 1, 2, 3].map((i) => (
          <View key={i} className="w-full p-1.5 sm:w-1/2">
            <SkeletonBlock className="h-52 rounded-[20px]" />
          </View>
        ))}
      </View>
    </Screen>
  );
}
