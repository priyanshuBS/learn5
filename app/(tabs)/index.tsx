/**
 * Home — the daily dashboard. All subjects are equal, so none is pushed first.
 *   1. date, greeting and a one-line summary of today
 *   2. a glowing glass hero with a 3D orbit around today's progress, streak, points and level
 *   3. every subject with today's drops and its one next step (the main content)
 *   4. today's reads: the daily articles
 *   5. this week: streak days and level progress
 */
import { LinearGradient } from 'expo-linear-gradient';
import { router } from 'expo-router';
import { Pressable, StyleSheet, View } from 'react-native';
import Animated, { FadeIn, FadeInDown } from 'react-native-reanimated';
import { twMerge } from 'tailwind-merge';

import { ArticleCard } from '@/components/ArticleCard';
import { CARD_CLASSES } from '@/components/Card';
import { CategoryCard } from '@/components/CategoryCard';
import { CountUp } from '@/components/CountUp';
import { Icon, type IconName } from '@/components/Icon';
import { Logo } from '@/components/Logo';
import { Orbit3D } from '@/components/Orbit3D';
import { SectionTitle } from '@/components/PageHeader';
import { ProgressBar, ProgressRing } from '@/components/ProgressBar';
import { Screen } from '@/components/Screen';
import { SkeletonBlock } from '@/components/StateViews';
import { ThemeIconButton } from '@/components/ThemeToggle';
import { Muted, Txt } from '@/components/Txt';
import { Tilt } from '@/components/Tilt';
import { WeekStreak } from '@/components/WeekStreak';
import { useArticleReads, useArticles } from '@/features/articles/store';
import { dropKey, getCatchUpEntry, getNextOpening, getTodaySlots } from '@/features/drops/status';
import { useAppData } from '@/hooks/useAppData';
import { articleKey } from '@/lib/articles';
import { greeting, localClockLabel, longDate } from '@/lib/time';
import { AURORA, colors } from '@/theme';

/** The hero card's glowing edge: orange into violet into cyan. */
const HERO_EDGE = [
  'rgba(255,106,26,0.95)',
  'rgba(124,92,255,0.55)',
  'rgba(6,182,212,0.7)',
] as const;

export default function HomeScreen() {
  const { ready, index, zonedNow, now, today, stats, results, isDone } = useAppData();
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

        {/* Hero: greeting and today at a glance, in a glowing glass card with a 3D orbit */}
        <Animated.View entering={FadeInDown.duration(500)}>
          <Tilt max={4}>
            <LinearGradient
              colors={HERO_EDGE}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={{ borderRadius: 30, padding: 1.5 }}
            >
              <View className="overflow-hidden rounded-[28.5px] bg-white/90 web:backdrop-blur-xl dark:bg-[rgba(11,12,22,0.82)]">
                {/* A warm glow in the corner */}
                <LinearGradient
                  pointerEvents="none"
                  colors={['rgba(255,106,26,0.22)', 'rgba(255,106,26,0)']}
                  start={{ x: 1, y: 0 }}
                  end={{ x: 0.3, y: 0.9 }}
                  style={StyleSheet.absoluteFill}
                />
                <View className="p-5 md:p-7">
                  <View className="flex-row items-center gap-3">
                    <View className="flex-1">
                      <Txt
                        weight="semibold"
                        className="text-[12px] uppercase tracking-widest text-brand-700 dark:text-brand-300"
                      >
                        {longDate(zonedNow.date)}
                      </Txt>
                      <Txt
                        weight="display"
                        accessibilityRole="header"
                        className="mt-1.5 text-[30px] leading-[36px] md:text-[42px] md:leading-[48px]"
                      >
                        {greeting(now)}
                      </Txt>
                      <Muted className="mt-2 text-[15px] leading-6">{summary}</Muted>
                    </View>
                    <Orbit3D
                      size={128}
                      rings={index.categories.slice(0, 3).map((c, i) => ({
                        color: c.color,
                        tilt: 68,
                        turn: i * 60 - 60,
                        seconds: 9 + i * 4,
                        scale: 0.98,
                      }))}
                    >
                      <ProgressRing
                        value={totalToday ? doneToday / totalToday : 0}
                        size={78}
                        strokeWidth={7}
                        label={`${doneToday} of ${totalToday} drops done today`}
                      >
                        <Txt weight="display" className="text-[20px] leading-6">
                          {doneToday}
                          <Muted className="text-[13px]">/{totalToday}</Muted>
                        </Txt>
                      </ProgressRing>
                    </Orbit3D>
                  </View>

                  <View className="mt-5 flex-row gap-2">
                    <HeroStat
                      icon="flame"
                      color={colors.streak}
                      label="Streak"
                      value={streak.current}
                      suffix={streak.current === 1 ? ' day' : ' days'}
                    />
                    <HeroStat icon="star" color={colors.points} label="Points" value={points} />
                    <HeroStat
                      icon="trophy"
                      color={AURORA.violet}
                      label={level.name}
                      value={level.level}
                      prefix="Lv "
                    />
                  </View>
                </View>
              </View>
            </LinearGradient>
          </Tilt>
        </Animated.View>

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
          {rows.map((row, i) => (
            <View key={row.category.id} className="w-full p-1.5 md:w-1/2">
              <Animated.View entering={FadeInDown.delay(120 + i * 80).duration(450)}>
                <Tilt>
                  <CategoryCard
                    category={row.category}
                    slots={row.slots}
                    offsetMinutes={zonedNow.offsetMinutes}
                    catchUp={row.catchUp}
                    getResult={(slot) => (slot.entry ? results[dropKey(slot.entry)] : undefined)}
                  />
                </Tilt>
              </Animated.View>
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
              {reads.map(({ article, category }, i) => (
                <View key={articleKey(article)} className="w-full p-1.5 md:w-1/2">
                  <Animated.View entering={FadeInDown.delay(200 + i * 80).duration(450)}>
                    <Tilt>
                      <ArticleCard
                        article={article}
                        category={category}
                        read={!!readMarks[articleKey(article)]}
                      />
                    </Tilt>
                  </Animated.View>
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
                <CountUp weight="display" className="mt-0.5 text-lg" value={points} />
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

/** A glass chip on the hero: coloured icon, small label, a number that counts up. */
function HeroStat({
  icon,
  color,
  label,
  value,
  prefix = '',
  suffix = '',
}: {
  icon: IconName;
  color: string;
  label: string;
  value: number;
  prefix?: string;
  suffix?: string;
}) {
  return (
    <View
      accessible
      accessibilityLabel={`${label}: ${prefix}${value}${suffix}`}
      className="flex-1 rounded-2xl border border-line bg-zinc-50/80 px-3 py-2.5 dark:border-ink-line dark:bg-white/[0.04]"
    >
      <View className="flex-row items-center gap-1.5">
        <Icon name={icon} size={13} color={color} filled={icon !== 'trophy'} />
        <Muted className="text-[12px]" numberOfLines={1}>
          {label}
        </Muted>
      </View>
      <CountUp
        weight="display"
        className="mt-0.5 text-[18px] leading-6"
        numberOfLines={1}
        value={value}
        format={(n) => `${prefix}${n.toLocaleString('en-IN')}${suffix}`}
      />
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
        {[0, 1, 2, 3].map((i) => (
          <View key={i} className="w-full p-1.5 md:w-1/2">
            <SkeletonBlock className="h-44 rounded-3xl" />
          </View>
        ))}
      </View>
    </Screen>
  );
}
