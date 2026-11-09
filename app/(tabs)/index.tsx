/**
 * Home — the daily dashboard.
 *   1. greeting + big heading
 *   2. "Up next" hero: the drop to play now (or a catch-up drop)
 *   3. this week's streak + three small stats (today, points, level)
 *   4. every subject with today's drops and its one next step
 */
import { router } from 'expo-router';
import type { ReactNode } from 'react';
import { Pressable, View } from 'react-native';
import Animated, { FadeIn, FadeInDown } from 'react-native-reanimated';
import { twMerge } from 'tailwind-merge';

import { usePress } from '@/components/Button';
import { CARD_CLASSES } from '@/components/Card';
import { CategoryCard } from '@/components/CategoryCard';
import { Glow, GlowDot, GradientText } from '@/components/Glow';
import { Gradient } from '@/components/Gradient';
import { Icon } from '@/components/Icon';
import { Logo } from '@/components/Logo';
import { SectionTitle } from '@/components/PageHeader';
import { ProgressBar, ProgressRing } from '@/components/ProgressBar';
import { Screen } from '@/components/Screen';
import { SkeletonBlock } from '@/components/StateViews';
import { ThemeIconButton } from '@/components/ThemeToggle';
import { Eyebrow, Txt } from '@/components/Txt';
import { WeekStreak } from '@/components/WeekStreak';
import {
  dropKey,
  getCatchUpEntry,
  getNextOpening,
  getTodaySlots,
  SLOT_NAMES,
} from '@/features/drops/status';
import { useAppData } from '@/hooks/useAppData';
import { quizHref } from '@/lib/routes';
import type { Category, IndexEntry } from '@/lib/schema';
import { friendlyDate, greeting, localClockLabel, longDate } from '@/lib/time';
import { CATEGORY_ICONS, colors, GLOW, HERO_GRADIENT } from '@/theme';

export default function HomeScreen() {
  const { ready, index, zonedNow, now, today, stats, results, isDone } = useAppData();

  if (!ready || !index) return <HomeSkeleton />;

  // Every category's 3 slots for today.
  const rows = index.categories.map((category) => ({
    category,
    slots: getTodaySlots(index, category.id, zonedNow, isDone),
    catchUp: getCatchUpEntry(index, category.id, zonedNow, isDone),
  }));

  // "Up next": the first drop you can play right now, else a catch-up drop.
  let upNext: { entry: IndexEntry; category: Category; label: string } | null = null;
  for (const row of rows) {
    const slot = row.slots.find((s) => s.status === 'available' && s.entry);
    if (slot?.entry) {
      upNext = { entry: slot.entry, category: row.category, label: SLOT_NAMES[slot.drop - 1] };
      break;
    }
  }
  if (!upNext) {
    // Nothing open today (e.g. early morning) or today's drop is late:
    // offer the newest drop you haven't played yet — never a dead end.
    const row =
      rows.find((r) => r.slots.some((s) => s.status === 'missing') && r.catchUp) ??
      rows.find((r) => r.catchUp);
    if (row?.catchUp) {
      upNext = {
        entry: row.catchUp,
        category: row.category,
        label: `Catch up · ${friendlyDate(row.catchUp.date, zonedNow.date)}`,
      };
    }
  }

  const next = getNextOpening(index, zonedNow);
  const nextTime = next ? localClockLabel(next.time, zonedNow.offsetMinutes) : '—';
  const doneToday = rows.reduce((n, r) => n + r.slots.filter((s) => s.status === 'done').length, 0);
  const totalToday = rows.reduce((n, r) => n + r.slots.length, 0);
  const { streak, level, points } = stats;
  const playedDays = new Set(Object.values(results).map((r) => r.completedOn));

  return (
    <Screen>
      <Animated.View entering={FadeIn.duration(300)}>
        {/* Phone top bar (the sidebar has these on wide screens) */}
        <View className="mb-8 flex-row items-center justify-between lg:hidden">
          <Logo />
          <View className="flex-row items-center gap-2">
            <View
              accessible
              accessibilityLabel={`${streak.current} day streak`}
              className="flex-row items-center gap-1.5 rounded-full border border-line bg-white px-3 py-1.5 dark:border-white/10 dark:bg-white/[0.04]"
            >
              <Icon name="flame" size={14} color={colors.streak} filled />
              <Txt weight="bold" className="text-[13px]">
                {streak.current}
              </Txt>
            </View>
            <ThemeIconButton />
          </View>
        </View>

        {/* Greeting */}
        <Eyebrow>
          {greeting(now)} · {longDate(zonedNow.date)}
        </Eyebrow>
        <Txt
          weight="heavy"
          accessibilityRole="header"
          className="mt-3 text-[38px] leading-[42px] md:text-[56px] md:leading-[60px]"
        >
          Ready for today’s{'\n'}
          <GradientText className="text-[38px] leading-[42px] md:text-[56px] md:leading-[60px]">
            5 minutes?
          </GradientText>
        </Txt>

        <View className="mt-10 gap-4 xl:flex-row">
          {/* ── Up next ── */}
          <View className="xl:flex-[3]">
            <UpNextHero
              upNext={upNext}
              doneToday={doneToday}
              nextTime={nextTime}
              nextTomorrow={!!next?.tomorrow}
            />
          </View>

          {/* ── Streak + stats ── */}
          <View className="gap-4 xl:flex-[2]">
            <WeekStreak
              playedDays={playedDays}
              today={today}
              current={streak.current}
              best={streak.best}
            />
            {streak.current > 0 && !streak.playedToday ? (
              <View className="flex-row items-center gap-2.5 rounded-2xl border border-orange-500/25 bg-orange-500/10 px-4 py-3">
                <Icon name="flame" size={15} color={colors.streak} />
                <Txt className="flex-1 text-[13px] text-orange-700 dark:text-orange-200">
                  Play one drop today to keep your {streak.current}-day streak alive.
                </Txt>
              </View>
            ) : null}
            <View className={twMerge(CARD_CLASSES, 'flex-row')}>
              <StatCell label="Today" value={`${doneToday}/${totalToday}`}>
                <ProgressRing
                  value={totalToday ? doneToday / totalToday : 0}
                  size={26}
                  strokeWidth={3.5}
                  label={`${doneToday} of ${totalToday} drops done today`}
                />
              </StatCell>
              <View className="my-5 w-px bg-line dark:bg-white/10" />
              <StatCell label="Points" value={points.toLocaleString('en-IN')}>
                <Icon name="star" size={18} color={colors.points} filled />
              </StatCell>
              <View className="my-5 w-px bg-line dark:bg-white/10" />
              <StatCell label={level.name} value={`Lvl ${level.level}`}>
                <Icon name="trophy" size={18} color={colors.brandOnDark} />
              </StatCell>
            </View>
            <View className={twMerge(CARD_CLASSES, 'px-5 py-4')}>
              <View className="mb-2.5 flex-row justify-between">
                <Eyebrow>{level.nextAt ? `To level ${level.level + 1}` : 'Highest level'}</Eyebrow>
                <Eyebrow>
                  {level.nextAt
                    ? `${points.toLocaleString('en-IN')} / ${level.nextAt.toLocaleString('en-IN')}`
                    : 'Legend'}
                </Eyebrow>
              </View>
              <ProgressBar
                value={level.progress}
                label={`Level progress ${Math.round(level.progress * 100)} percent`}
              />
            </View>
          </View>
        </View>

        {/* ── Subjects ── */}
        <SectionTitle
          eyebrow="Subjects"
          title="Your daily drops"
          right={
            <Eyebrow>
              {doneToday}/{totalToday} done
            </Eyebrow>
          }
        />
        <View className="-m-2 flex-row flex-wrap">
          {rows.map((row, i) => (
            <View key={row.category.id} className="w-full p-2 md:w-1/2 xl:w-1/3">
              <Animated.View entering={FadeInDown.delay(60 * i).duration(450)} style={{ flex: 1 }}>
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
      </Animated.View>
    </Screen>
  );
}

function UpNextHero({
  upNext,
  doneToday,
  nextTime,
  nextTomorrow,
}: {
  upNext: { entry: IndexEntry; category: Category; label: string } | null;
  doneToday: number;
  nextTime: string;
  nextTomorrow: boolean;
}) {
  const press = usePress(0.985);
  const watermark = upNext ? CATEGORY_ICONS[upNext.category.id] : 'sparkles';
  const start = () => upNext && router.push(quizHref(upNext.entry));

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={
        upNext
          ? `Up next: ${upNext.entry.title}. ${upNext.category.name}. Start drop`
          : 'All caught up'
      }
      accessibilityHint={upNext ? 'Starts 5 quick questions' : undefined}
      disabled={!upNext}
      onPress={start}
      onPressIn={press.onPressIn}
      onPressOut={press.onPressOut}
    >
      <Animated.View style={press.style}>
        <Gradient
          colors={HERO_GRADIENT}
          radius={28}
          className="min-h-80 justify-between p-7 md:p-9"
        >
          {/* Glow orbs */}
          <Glow color={GLOW.violet} size={420} opacity={0.55} style={{ top: -200, left: -160 }} />
          <Glow color={GLOW.cyan} size={360} opacity={0.4} style={{ bottom: -200, right: -120 }} />
          {watermark ? (
            <View className="absolute right-7 top-7 opacity-[0.12]" pointerEvents="none">
              <Icon name={watermark} size={120} color={colors.white} strokeWidth={1} />
            </View>
          ) : null}

          {upNext ? (
            <>
              <View>
                <View className="flex-row flex-wrap items-center gap-3">
                  <GlassChip>
                    <GlowDot />
                    <Eyebrow className="text-white/90 dark:text-white/90">Up next</Eyebrow>
                  </GlassChip>
                  <Eyebrow className="text-white/60 dark:text-white/60">
                    {upNext.category.name} · {upNext.label}
                  </Eyebrow>
                </View>
                <Txt
                  weight="heavy"
                  className="mt-6 max-w-lg text-[32px] leading-[38px] text-white dark:text-white md:text-[42px] md:leading-[48px]"
                  numberOfLines={3}
                >
                  {upNext.entry.title}
                </Txt>
              </View>

              <View className="mt-10 flex-row items-end justify-between gap-4">
                <View className="flex-1 flex-row flex-wrap gap-2">
                  <GlassChip>
                    <Icon name="layers" size={13} color="rgba(255,255,255,0.85)" />
                    <Txt className="text-xs text-white/85 dark:text-white/85">5 questions</Txt>
                  </GlassChip>
                  <GlassChip>
                    <Icon name="timer" size={13} color="rgba(255,255,255,0.85)" />
                    <Txt className="text-xs text-white/85 dark:text-white/85">~5 min</Txt>
                  </GlassChip>
                  <GlassChip>
                    <Icon name="star" size={13} color="rgba(255,255,255,0.85)" />
                    <Txt className="text-xs text-white/85 dark:text-white/85">100 pts</Txt>
                  </GlassChip>
                </View>
                <View className="h-[72px] w-[72px] items-center justify-center rounded-full bg-[#F2F2F5] web:shadow-[0_10px_40px_-8px_rgba(139,92,246,0.9)]">
                  <Icon name="play" size={26} color="#050508" filled />
                </View>
              </View>
            </>
          ) : (
            <>
              <GlassChip>
                <Icon name="check-circle" size={13} color={colors.white} />
                <Eyebrow className="text-white/90 dark:text-white/90">All caught up</Eyebrow>
              </GlassChip>
              <View>
                <Txt
                  weight="heavy"
                  className="text-[32px] leading-[38px] text-white dark:text-white"
                >
                  {doneToday > 0 ? 'Great work today.' : 'Your first drops open soon.'}
                </Txt>
                <Txt className="mt-2 text-[15px] text-white/70 dark:text-white/70">
                  Next drop {nextTomorrow ? 'tomorrow' : 'today'} at {nextTime}.
                </Txt>
              </View>
            </>
          )}
        </Gradient>
      </Animated.View>
    </Pressable>
  );
}

function GlassChip({ children }: { children: ReactNode }) {
  return (
    <View className="flex-row items-center gap-2 self-start rounded-full border border-white/15 bg-white/[0.08] px-3 py-1.5">
      {children}
    </View>
  );
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
    <View accessible accessibilityLabel={`${label}: ${value}`} className="flex-1 p-5">
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
      <View className="mt-10 gap-4 xl:flex-row">
        <SkeletonBlock className="h-80 rounded-[28px] xl:flex-[3]" />
        <SkeletonBlock className="h-80 rounded-3xl xl:flex-[2]" />
      </View>
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
