/**
 * Home — the daily dashboard. All subjects are equal, so none is pushed first.
 *   1. date, greeting and a one-line summary of today
 *   2. an orange hero card with today's progress ring, streak, points and level
 *   3. every subject with today's drops and its one next step (the main content)
 *   4. today's reads: the daily articles
 *   5. this week: streak days and level progress
 */
import { LinearGradient } from 'expo-linear-gradient';
import { router } from 'expo-router';
import { Pressable, View } from 'react-native';
import Animated, { FadeIn } from 'react-native-reanimated';
import { twMerge } from 'tailwind-merge';

import { ArticleCard } from '@/components/ArticleCard';
import { CARD_CLASSES } from '@/components/Card';
import { CategoryCard } from '@/components/CategoryCard';
import { Icon, type IconName } from '@/components/Icon';
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
import { colors } from '@/theme';

/** Deeper than the logo gradient so white text stays readable. */
const HERO_GRADIENT = ['#E23D0B', '#F25A12', '#FF8A1F'] as const;

export default function HomeScreen() {
  const { ready, index, zonedNow, now, today, stats, results, isDone, tiers } = useAppData();
  const articles = useArticles((s) => s.articles);
  const readMarks = useArticleReads((s) => s.read);

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
      <Animated.View entering={FadeIn.duration(250)}>
        {/* Phone top bar (the sidebar has these on wide screens) */}
        <View className="mb-6 flex-row items-center justify-between lg:hidden">
          <Logo />
          <ThemeIconButton />
        </View>

        {/* Hero: greeting and today at a glance, on the signature gradient */}
        <LinearGradient
          colors={HERO_GRADIENT}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={{ borderRadius: 28, overflow: 'hidden' }}
        >
          {/* Soft light circles for depth */}
          <View
            pointerEvents="none"
            className="absolute -right-16 -top-20 h-56 w-56 rounded-full bg-white/10"
          />
          <View
            pointerEvents="none"
            className="absolute -bottom-24 right-24 h-44 w-44 rounded-full bg-white/[0.07]"
          />
          <View className="p-5 md:p-7">
            <View className="flex-row items-start gap-4">
              <View className="flex-1">
                <OnColor
                  weight="semibold"
                  className="text-[13px] uppercase tracking-widest opacity-90"
                >
                  {longDate(zonedNow.date)}
                </OnColor>
                <OnColor
                  weight="display"
                  accessibilityRole="header"
                  className="mt-1.5 text-[32px] leading-[38px] md:text-[40px] md:leading-[46px]"
                >
                  {greeting(now)}
                </OnColor>
                <OnColor weight="medium" className="mt-2 text-[15px] leading-6">
                  {summary}
                </OnColor>
              </View>
              <ProgressRing
                value={totalToday ? doneToday / totalToday : 0}
                size={76}
                strokeWidth={7}
                color={colors.white}
                trackColor="rgba(255,255,255,0.25)"
                label={`${doneToday} of ${totalToday} drops done today`}
              >
                <OnColor weight="display" className="text-[20px] leading-6">
                  {doneToday}
                  <OnColor weight="display" className="text-[13px] opacity-80">
                    /{totalToday}
                  </OnColor>
                </OnColor>
              </ProgressRing>
            </View>

            <View className="mt-5 flex-row gap-2">
              <HeroStat
                icon="flame"
                label="Streak"
                value={`${streak.current} ${streak.current === 1 ? 'day' : 'days'}`}
              />
              <HeroStat icon="star" label="Points" value={points.toLocaleString('en-IN')} />
              <HeroStat icon="trophy" label={`Level ${level.level}`} value={level.name} />
            </View>
          </View>
        </LinearGradient>

        {streak.current > 0 && !streak.playedToday ? (
          <View className="mt-3 flex-row items-center gap-2.5 rounded-2xl border border-orange-200 bg-orange-50 px-4 py-3 dark:border-orange-500/20 dark:bg-orange-500/10">
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
                tier={tiers[row.category.id]}
                getResult={(slot) => (slot.entry ? results[dropKey(slot.entry)] : undefined)}
              />
            </View>
          ))}
        </View>

        {/* ── Today's reads ── */}
        {reads.length > 0 ? (
          <>
            <SectionTitle
              title="Today's reads"
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
                <View key={articleKey(article)} className="w-full p-1.5 md:w-1/2 xl:w-1/3">
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

/** Text that sits on the orange hero (always white, in both themes). */
function OnColor({ className, ...rest }: TxtProps) {
  return <Txt className={twMerge('text-white dark:text-white', className)} {...rest} />;
}

/** A frosted chip on the hero: icon, small label, value. */
function HeroStat({ icon, label, value }: { icon: IconName; label: string; value: string }) {
  return (
    <View
      accessible
      accessibilityLabel={`${label}: ${value}`}
      className="flex-1 rounded-2xl border border-white/20 bg-white/15 px-3 py-2.5"
    >
      <View className="flex-row items-center gap-1.5">
        <Icon name={icon} size={13} color={colors.white} filled={icon !== 'trophy'} />
        <OnColor weight="medium" className="text-[12px] opacity-90" numberOfLines={1}>
          {label}
        </OnColor>
      </View>
      <OnColor weight="display" className="mt-0.5 text-[17px] leading-6" numberOfLines={1}>
        {value}
      </OnColor>
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
      <SkeletonBlock className="h-56 rounded-[28px]" />
      <View className="-m-1.5 mt-10 flex-row flex-wrap">
        {[0, 1, 2].map((i) => (
          <View key={i} className="w-full p-1.5 md:w-1/2 xl:w-1/3">
            <SkeletonBlock className="h-44 rounded-3xl" />
          </View>
        ))}
      </View>
    </Screen>
  );
}
