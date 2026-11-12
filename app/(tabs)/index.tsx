/**
 * Home — the daily dashboard. All subjects are equal, so none is pushed first.
 *   1. date, greeting and a one-line summary of today
 *   2. a bold orange overview card: today's progress, streak, points and level
 *   3. every subject with today's drops and its one next step (the main content)
 *   4. today's reads: the daily articles
 *   5. this week: streak days and level progress
 * No motion on load: the screen is calm until you interact with it.
 */
import { router } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { Pressable, StyleSheet, View } from 'react-native';
import { twMerge } from 'tailwind-merge';

import { ArticleCard } from '@/components/ArticleCard';
import { CARD_CLASSES } from '@/components/Card';
import { CategoryCard } from '@/components/CategoryCard';
import { Icon, type IconName } from '@/components/Icon';
import { Icon3D } from '@/components/Icon3D';
import { Logo } from '@/components/Logo';
import { SectionTitle } from '@/components/PageHeader';
import { ProgressBar, ProgressRing } from '@/components/ProgressBar';
import { Screen } from '@/components/Screen';
import { SkeletonBlock } from '@/components/StateViews';
import { ThemeIconButton } from '@/components/ThemeToggle';
import { Muted, Txt, type TxtProps } from '@/components/Txt';
import { WeekStreak } from '@/components/WeekStreak';
import { useArticleReads, useArticles } from '@/features/articles/store';
import { dropKey, getCatchUpEntry, getNextOpening, getTodaySlots } from '@/features/drops/status';
import { useAppData } from '@/hooks/useAppData';
import { articleKey } from '@/lib/articles';
import { greeting, localClockLabel, longDate } from '@/lib/time';
import { colors, ICON3D } from '@/theme';

export default function HomeScreen() {
  const { ready, index, zonedNow, now, today, stats, results, isDone } = useAppData();
  const articles = useArticles((s) => s.articles);
  const readMarks = useArticleReads((s) => s.read);

  if (!ready || !index) return <HomeSkeleton />;

  // Every category's slots for today.
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
  // Today's articles (or the latest day's, before 4 AM), in subject order.
  const latestDate = articles?.reduce((max, a) => (a.date > max ? a.date : max), '') ?? '';
  const reads = index.categories.flatMap((category) => {
    const article = articles?.find((a) => a.category === category.id && a.date === latestDate);
    return article ? [{ article, category }] : [];
  });
  const playedDays = new Set(Object.values(results).map((r) => r.completedOn));

  const summary =
    openNow > 0
      ? `${openNow} ${openNow === 1 ? 'drop is' : 'drops are'} open now. Each one takes about 5 minutes.`
      : doneToday === totalToday && totalToday > 0
        ? 'You finished every drop today. Well done.'
        : `The next drop opens ${next?.tomorrow ? 'tomorrow' : 'today'} at ${nextTime}.`;

  return (
    <Screen>
      {/* Phone top bar (the sidebar has these on wide screens) */}
      <View className="mb-6 flex-row items-center justify-between lg:hidden">
        <Logo />
        <ThemeIconButton />
      </View>

      {/* Greeting */}
      <Txt
        weight="semibold"
        className="text-[12px] uppercase tracking-[1.5px] text-zinc-500 dark:text-zinc-400"
      >
        {longDate(zonedNow.date)}
      </Txt>
      <Txt
        weight="display"
        accessibilityRole="header"
        className="mt-1.5 text-[30px] leading-[36px] md:text-[38px] md:leading-[44px]"
      >
        {greeting(now)}
      </Txt>
      <Muted className="mt-1.5 text-[15px] leading-6">{summary}</Muted>

      {/* Overview: a bold orange card with today's progress and the three numbers that matter */}
      <View
        className="mt-6 overflow-hidden rounded-3xl web:shadow-[0_20px_50px_-24px_rgba(255,90,31,0.7)] md:flex-row"
        style={{ backgroundColor: '#FF6A1A' }}
      >
        <LinearGradient
          colors={['#FFA24D', '#FF6A1A', '#F04E0F']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={StyleSheet.absoluteFill}
        />
        <View className="flex-row items-center gap-4 p-5 md:w-[38%] md:border-r md:border-black/10">
          <ProgressRing
            value={totalToday ? doneToday / totalToday : 0}
            size={68}
            strokeWidth={7}
            color={ON_ORANGE}
            trackColor="rgba(26,8,0,0.15)"
            label={`${doneToday} of ${totalToday} drops done today`}
          >
            <OnOrange weight="display" className="text-[17px] leading-6">
              {totalToday ? Math.round((doneToday / totalToday) * 100) : 0}%
            </OnOrange>
          </ProgressRing>
          <View className="flex-1">
            <OnOrange weight="semibold" className="text-[13px] opacity-70">
              Today
            </OnOrange>
            <OnOrange weight="display" className="mt-0.5 text-[24px] leading-8">
              {doneToday}
              <OnOrange weight="display" className="text-[16px] opacity-60">
                {' '}
                / {totalToday} drops
              </OnOrange>
            </OnOrange>
            <OnOrange weight="medium" className="mt-0.5 text-[12px] opacity-70">
              {openNow > 0 ? `${openNow} open now` : `Next at ${nextTime}`}
            </OnOrange>
          </View>
        </View>
        <View className="flex-row border-t border-black/10 md:flex-1 md:border-t-0">
          <Stat icon="flame" label="Day streak" value={`${streak.current}`} />
          <Stat icon="star" label="Points" value={points.toLocaleString('en-IN')} divider />
          <Stat icon="trophy" label={level.name} value={`Lv ${level.level}`} divider />
        </View>
      </View>

      {streak.current > 0 && !streak.playedToday ? (
        <View className="mt-3 flex-row items-center gap-2.5 rounded-xl border border-orange-200 bg-orange-50 px-4 py-3 dark:border-orange-500/20 dark:bg-orange-500/10">
          <Icon name="flame" size={15} color={colors.streak} />
          <Txt className="flex-1 text-[13px] text-orange-800 dark:text-orange-200">
            Play one drop today to keep your {streak.current}-day streak.
          </Txt>
        </View>
      ) : null}

      {/* ── All subjects (the main content): bold colour cards ── */}
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
          <View key={row.category.id} className="w-full p-1.5 md:w-1/2">
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

      {/* ── Today's reads ── */}
      {reads.length > 0 ? (
        <>
          <SectionTitle
            title={latestDate === zonedNow.date ? "Today's reads" : 'Latest reads'}
            right={
              <Pressable
                accessibilityRole="link"
                onPress={() => router.push('/articles')}
                hitSlop={8}
              >
                <Txt weight="semibold" className="text-[13px] text-brand-700 dark:text-brand-300">
                  See all
                </Txt>
              </Pressable>
            }
          />
          <View className="-m-1.5 flex-row flex-wrap">
            {reads.map(({ article, category }) => (
              <View key={articleKey(article)} className="w-full p-1.5 md:w-1/2">
                <ArticleCard
                  article={article}
                  category={category}
                  read={!!readMarks[articleKey(article)]}
                />
              </View>
            ))}
          </View>
        </>
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

/** Text on the bright orange card: near-black, for strong contrast in both themes. */
const ON_ORANGE = '#1A0800';
function OnOrange({ className, ...rest }: TxtProps) {
  return <Txt className={twMerge('text-[#1A0800] dark:text-[#1A0800]', className)} {...rest} />;
}

/** One number in the overview card. */
function Stat({
  icon,
  label,
  value,
  divider,
}: {
  icon: IconName;
  label: string;
  value: string;
  divider?: boolean;
}) {
  return (
    <View
      accessible
      accessibilityLabel={`${label}: ${value}`}
      className={twMerge(
        'flex-1 items-center px-2 py-4 md:flex-row md:gap-3 md:px-5',
        divider && 'border-l border-black/10',
      )}
    >
      <View className="h-10 w-10 items-center justify-center rounded-full bg-black/10">
        <Icon name={icon} size={18} color={ON_ORANGE} strokeWidth={2.4} />
      </View>
      <View className="mt-2 items-center md:mt-0 md:items-start">
        <OnOrange weight="display" className="text-[18px] leading-6" numberOfLines={1}>
          {value}
        </OnOrange>
        <OnOrange weight="medium" className="text-[12px] opacity-70" numberOfLines={1}>
          {label}
        </OnOrange>
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
      <SkeletonBlock className="mt-6 h-36 rounded-2xl" />
      <View className="-m-1.5 mt-10 flex-row flex-wrap">
        {[0, 1, 2, 3].map((i) => (
          <View key={i} className="w-full p-1.5 md:w-1/2">
            <SkeletonBlock className="h-44 rounded-2xl" />
          </View>
        ))}
      </View>
    </Screen>
  );
}
