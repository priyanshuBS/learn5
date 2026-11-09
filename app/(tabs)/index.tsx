/**
 * Home — "Up next" drop, today's progress and stats, and today's drops for every category.
 */
import { router } from 'expo-router';
import { View } from 'react-native';
import Animated, { FadeIn } from 'react-native-reanimated';

import { Button } from '@/components/Button';
import { Card } from '@/components/Card';
import { CategoryCard } from '@/components/CategoryCard';
import { Gradient } from '@/components/Gradient';
import { Icon, type IconName } from '@/components/Icon';
import { Logo } from '@/components/Logo';
import { SectionTitle } from '@/components/PageHeader';
import { ProgressBar, ProgressRing } from '@/components/ProgressBar';
import { Screen } from '@/components/Screen';
import { ThemeIconButton } from '@/components/ThemeToggle';
import { SkeletonBlock } from '@/components/StateViews';
import { Muted, Txt } from '@/components/Txt';
import {
  dropKey,
  getCatchUpEntry,
  getNextOpening,
  getTodaySlots,
  SLOT_NAMES,
} from '@/features/drops/status';
import { useAppData } from '@/hooks/useAppData';
import { useColorScheme } from '@/hooks/useScheme';
import { quizHref } from '@/lib/routes';
import type { Category, IndexEntry } from '@/lib/schema';
import { friendlyDate, greeting, localClockLabel, longDate } from '@/lib/time';
import { CATEGORY_ICONS, colors, HERO_GRADIENT } from '@/theme';

export default function HomeScreen() {
  const scheme = useColorScheme();
  const { ready, index, zonedNow, now, stats, results, isDone } = useAppData();

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
  const upNextIcon = upNext ? CATEGORY_ICONS[upNext.category.id] : undefined;

  return (
    <Screen>
      <Animated.View entering={FadeIn.duration(250)}>
        {/* Phone header (the logo and stats live in the sidebar on wide screens) */}
        <View className="mb-6 flex-row items-center justify-between lg:hidden">
          <Logo />
          <ThemeIconButton />
        </View>

        <Muted className="text-[15px]">
          {greeting(now)} · {longDate(zonedNow.date)}
        </Muted>
        <Txt
          weight="bold"
          accessibilityRole="header"
          className="mt-1 text-[26px] leading-9 tracking-tight md:text-[32px] md:leading-[42px]"
        >
          Ready for today’s 5 minutes?
        </Txt>

        <View className="mt-6 gap-4 xl:flex-row">
          {/* Up next */}
          <Gradient colors={HERO_GRADIENT} className="rounded-3xl p-6 md:p-7 xl:flex-[3]">
            {upNextIcon ? (
              <View className="absolute -right-4 -top-4 opacity-[0.12]" pointerEvents="none">
                <Icon name={upNextIcon} size={150} color={colors.white} strokeWidth={1.25} />
              </View>
            ) : null}
            {upNext ? (
              <>
                <View className="flex-row flex-wrap items-center gap-2">
                  <View className="flex-row items-center gap-1.5 rounded-full bg-white/10 px-2.5 py-1">
                    <View className="h-1.5 w-1.5 rounded-full bg-emerald-400" />
                    <Txt weight="semibold" className="text-xs text-white dark:text-white">
                      Up next
                    </Txt>
                  </View>
                  <Txt className="text-[13px] text-brand-200 dark:text-brand-200">
                    {upNext.category.name} · {upNext.label}
                  </Txt>
                </View>
                <Txt
                  weight="bold"
                  className="mt-4 max-w-lg text-[26px] leading-9 tracking-tight text-white dark:text-white md:text-[30px] md:leading-[40px]"
                  numberOfLines={2}
                >
                  {upNext.entry.title}
                </Txt>
                <View className="mt-3 flex-row flex-wrap gap-x-5 gap-y-1.5">
                  <HeroMeta icon="layers" text="5 questions" />
                  <HeroMeta icon="timer" text="About 5 min" />
                  <HeroMeta icon="star" text="Up to 100 pts" />
                </View>
                <View className="mt-7 flex-row">
                  <Button
                    label="Start drop"
                    variant="inverse"
                    icon="arrow-right"
                    iconRight
                    onPress={() => upNext && router.push(quizHref(upNext.entry))}
                    accessibilityHint="Starts 5 quick questions"
                  />
                </View>
              </>
            ) : (
              <>
                <View className="flex-row items-center gap-1.5 self-start rounded-full bg-white/10 px-2.5 py-1">
                  <Icon name="check-circle" size={13} color={colors.white} />
                  <Txt weight="semibold" className="text-xs text-white dark:text-white">
                    All caught up
                  </Txt>
                </View>
                <Txt
                  weight="bold"
                  className="mt-4 text-[26px] leading-9 tracking-tight text-white dark:text-white"
                >
                  {doneToday > 0 ? 'Great work today.' : 'Your first drops open soon.'}
                </Txt>
                <Txt className="mt-2 text-[15px] text-brand-100 dark:text-brand-100">
                  Next drop {next?.tomorrow ? 'tomorrow' : 'today'} at {nextTime}.
                </Txt>
              </>
            )}
          </Gradient>

          {/* Today + stats */}
          <Card className="justify-between gap-5 xl:flex-[2]">
            <View className="flex-row items-center gap-4">
              <ProgressRing
                value={totalToday ? doneToday / totalToday : 0}
                size={68}
                strokeWidth={7}
                label={`${doneToday} of ${totalToday} drops done today`}
              >
                <Txt weight="bold" className="text-[15px]">
                  {totalToday ? Math.round((doneToday / totalToday) * 100) : 0}%
                </Txt>
              </ProgressRing>
              <View className="flex-1">
                <Txt weight="semibold" className="text-[15px]">
                  Today’s progress
                </Txt>
                <Muted className="mt-0.5">
                  {doneToday} of {totalToday} drops done
                </Muted>
                <View className="mt-1.5 flex-row items-center gap-1.5">
                  <Icon
                    name="clock"
                    size={13}
                    color={scheme === 'dark' ? colors.mutedDark : colors.muted}
                  />
                  <Muted className="text-[13px]">
                    Next drop {next?.tomorrow ? 'tomorrow, ' : ''}
                    {nextTime}
                  </Muted>
                </View>
              </View>
            </View>

            <View className="flex-row border-t border-line pt-4 dark:border-ink-line">
              <MiniStat
                icon="flame"
                color={colors.streak}
                value={`${streak.current}`}
                label="Day streak"
              />
              <MiniStat
                icon="star"
                color={colors.points}
                value={points.toLocaleString('en-IN')}
                label="Points"
              />
              <MiniStat
                icon="trophy"
                color={colors.brand}
                value={`Lvl ${level.level}`}
                label={level.name}
              />
            </View>

            <View>
              <View className="mb-1.5 flex-row justify-between">
                <Muted className="text-xs">
                  {level.nextAt ? `Progress to Level ${level.level + 1}` : 'Highest level reached'}
                </Muted>
                <Muted className="text-xs">
                  {level.nextAt
                    ? `${points.toLocaleString('en-IN')} / ${level.nextAt.toLocaleString('en-IN')}`
                    : 'Top level'}
                </Muted>
              </View>
              <ProgressBar
                value={level.progress}
                label={`Level progress ${Math.round(level.progress * 100)} percent`}
              />
            </View>

            {streak.current > 0 && !streak.playedToday ? (
              <View className="flex-row items-center gap-2 rounded-xl bg-orange-50 px-3 py-2.5 dark:bg-orange-500/10">
                <Icon name="flame" size={15} color={colors.streak} />
                <Txt className="flex-1 text-[13px] text-orange-800 dark:text-orange-200">
                  Play one drop today to keep your {streak.current}-day streak.
                </Txt>
              </View>
            ) : null}
          </Card>
        </View>

        {/* Today's drops */}
        <SectionTitle
          title="Today’s drops"
          right={
            <Muted className="hidden md:flex">
              {doneToday} of {totalToday} done
            </Muted>
          }
        />
        <View className="-m-2 flex-row flex-wrap">
          {rows.map((row) => (
            <View key={row.category.id} className="w-full p-2 md:w-1/2 xl:w-1/3">
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
      </Animated.View>
    </Screen>
  );
}

function HeroMeta({ icon, text }: { icon: IconName; text: string }) {
  return (
    <View className="flex-row items-center gap-1.5">
      <Icon name={icon} size={14} color={colors.brandOnDark} />
      <Txt className="text-[13px] text-brand-100 dark:text-brand-100">{text}</Txt>
    </View>
  );
}

function MiniStat({
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
    <View accessible accessibilityLabel={`${label}: ${value}`} className="flex-1">
      <View className="flex-row items-center gap-1.5">
        <Icon name={icon} size={15} color={color} filled={icon !== 'trophy'} />
        <Txt weight="bold" className="text-[17px] tracking-tight" numberOfLines={1}>
          {value}
        </Txt>
      </View>
      <Muted className="mt-0.5 text-xs" numberOfLines={1}>
        {label}
      </Muted>
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
      <SkeletonBlock className="h-4 w-48" />
      <SkeletonBlock className="mt-3 h-8 w-72" />
      <View className="mt-6 gap-4 xl:flex-row">
        <SkeletonBlock className="h-56 rounded-3xl xl:flex-[3]" />
        <SkeletonBlock className="h-56 xl:flex-[2]" />
      </View>
      <View className="-m-2 mt-12 flex-row flex-wrap">
        {[0, 1, 2, 3, 4, 5].map((i) => (
          <View key={i} className="w-full p-2 md:w-1/2 xl:w-1/3">
            <SkeletonBlock className="h-40" />
          </View>
        ))}
      </View>
    </Screen>
  );
}
