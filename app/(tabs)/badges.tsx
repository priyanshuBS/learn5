/**
 * Progress — level, points, streaks and all 5 badges.
 * (Address stays /badges.)
 */
import { Pressable, View } from 'react-native';
import { twMerge } from 'tailwind-merge';

import { BadgeCard } from '@/components/BadgeCard';
import { Button } from '@/components/Button';
import { Card, CARD_CLASSES } from '@/components/Card';
import { Icon } from '@/components/Icon';
import { PageHeader, SectionTitle } from '@/components/PageHeader';
import { ProgressBar, ProgressRing } from '@/components/ProgressBar';
import { Screen } from '@/components/Screen';
import { StatCard } from '@/components/StatCard';
import { ThemeToggle } from '@/components/ThemeToggle';
import { LoadingView } from '@/components/StateViews';
import { Eyebrow, Muted, Txt } from '@/components/Txt';
import { useAuth } from '@/features/auth/store';
import { useProgress } from '@/features/progress/store';
import { syncProgress, useSyncStatus } from '@/features/progress/sync';
import { LEVELS } from '@/features/levels/levels';
import { useAppData } from '@/hooks/useAppData';
import { colors } from '@/theme';

export default function ProgressScreen() {
  const { ready, stats } = useAppData();
  const user = useAuth((s) => s.user);
  const expiresAt = useAuth((s) => s.expiresAt);
  const signOut = useAuth((s) => s.signOut);
  if (!ready) {
    return (
      <Screen>
        <LoadingView />
      </Screen>
    );
  }

  const { level, points, streak, badges } = stats;
  const earned = badges.filter((b) => b.earned).length;
  const nextLevel = LEVELS[level.level];

  return (
    <Screen>
      <PageHeader title="Progress" subtitle="Your level, streaks and badges" />

      <View className="gap-4 xl:flex-row">
        {/* Level */}
        <Card className="xl:flex-[3]">
          <View className="flex-row items-center gap-5">
            <ProgressRing
              value={level.progress}
              size={84}
              strokeWidth={8}
              label={`Level progress ${Math.round(level.progress * 100)} percent`}
            >
              <Txt weight="heavy" className="text-2xl tracking-tight">
                {level.level}
              </Txt>
            </ProgressRing>
            <View className="flex-1">
              <Eyebrow>Current level</Eyebrow>
              <Txt weight="bold" className="mt-1 text-2xl tracking-tight">
                {level.name}
              </Txt>
              <View className="mt-1 flex-row items-center gap-1.5">
                <Icon name="star" size={14} color={colors.points} filled />
                <Txt weight="semibold" className="text-[15px]">
                  {points.toLocaleString('en-IN')} points
                </Txt>
              </View>
            </View>
          </View>
          <ProgressBar
            value={level.progress}
            className="mt-5 h-2"
            label={`Level progress ${Math.round(level.progress * 100)} percent`}
          />
          <Muted className="mt-2">
            {level.nextAt === null || !nextLevel
              ? 'You reached the top level.'
              : `${(level.nextAt - points).toLocaleString('en-IN')} points to Level ${nextLevel.level} · ${nextLevel.name}`}
          </Muted>
        </Card>

        {/* Stats */}
        <View className="-m-1.5 flex-row flex-wrap xl:flex-[2]">
          <View className="w-1/2 p-1.5">
            <StatCard
              icon="flame"
              color={colors.streak}
              value={`${streak.current}`}
              label="Current streak"
            />
          </View>
          <View className="w-1/2 p-1.5">
            <StatCard
              icon="chart"
              color={colors.brand}
              value={`${streak.best}`}
              label="Best streak"
            />
          </View>
          <View className="w-1/2 p-1.5">
            <StatCard
              icon="check-circle"
              color={colors.success}
              value={`${stats.correctAnswers}`}
              label="Correct answers"
            />
          </View>
          <View className="w-1/2 p-1.5">
            <StatCard
              icon="layers"
              color={colors.points}
              value={`${stats.dropsDone}`}
              label="Drops done"
            />
          </View>
        </View>
      </View>

      <SectionTitle
        title="Badges"
        right={
          <Muted>
            {earned} of {badges.length} earned
          </Muted>
        }
      />
      <View className="-m-1.5 flex-row flex-wrap">
        {badges.map((badge) => (
          <View key={badge.id} className="w-1/2 p-1.5 md:w-1/3 xl:w-1/5">
            <BadgeCard badge={badge} />
          </View>
        ))}
      </View>

      <SectionTitle title="Levels" />
      <View className={twMerge(CARD_CLASSES, 'overflow-hidden')}>
        {LEVELS.map((l, i) => {
          const current = l.level === level.level;
          const reached = l.level <= level.level;
          return (
            <View
              key={l.level}
              className={twMerge(
                'flex-row items-center gap-3 px-4 py-3',
                i > 0 && 'border-t border-line dark:border-ink-line',
                current && 'bg-brand-50 dark:bg-brand-500/10',
              )}
            >
              <View
                className={twMerge(
                  'h-5 w-5 items-center justify-center rounded-full',
                  reached ? 'bg-brand-600' : 'border border-line dark:border-ink-line',
                )}
              >
                {reached ? (
                  <Icon name="check" size={11} color={colors.white} strokeWidth={3.5} />
                ) : null}
              </View>
              <Txt weight={current ? 'semibold' : 'regular'} className="flex-1 text-[15px]">
                Level {l.level} · {l.name}
              </Txt>
              {current ? (
                <View className="rounded-full bg-brand-600 px-2 py-0.5">
                  <Txt weight="semibold" className="text-[11px] text-white dark:text-white">
                    You are here
                  </Txt>
                </View>
              ) : null}
              <Muted className="w-20 text-right">{l.minPoints.toLocaleString('en-IN')} pts</Muted>
            </View>
          );
        })}
      </View>

      <SectionTitle title="Appearance" />
      <Card className="gap-4 md:flex-row md:items-center md:justify-between">
        <View className="flex-1">
          <Txt weight="semibold">Theme</Txt>
          <Muted className="mt-0.5">Light, dark, or match your device.</Muted>
        </View>
        <ThemeToggle className="md:w-80" />
      </Card>

      <SectionTitle title="Account" />
      <Card className="gap-4 md:flex-row md:items-center">
        <View className="flex-1 flex-row items-center gap-3">
          <View className="h-11 w-11 items-center justify-center rounded-full bg-brand-600">
            <Txt weight="bold" className="text-base uppercase text-white dark:text-white">
              {user?.email?.[0] ?? '?'}
            </Txt>
          </View>
          <View className="flex-1">
            <Txt weight="semibold" numberOfLines={1}>
              {user?.email ?? 'Signed in'}
            </Txt>
            {expiresAt ? (
              <Muted>
                Signed in until{' '}
                {new Date(expiresAt).toLocaleDateString('en-IN', {
                  day: 'numeric',
                  month: 'short',
                })}
              </Muted>
            ) : null}
            <SyncLine />
          </View>
        </View>
        <Button
          label="Sign out"
          icon="log-out"
          variant="secondary"
          size="md"
          onPress={() => void signOut()}
        />
      </Card>
    </Screen>
  );
}

/** "Saved to your account" — or what is still waiting to be saved. */
function SyncLine() {
  const pending = useProgress(
    (s) => s.pending.results.length + s.pending.fixed.length + s.pending.reports.length,
  );
  const lastSyncedAt = useProgress((s) => s.lastSyncedAt);
  const { syncing, error } = useSyncStatus();

  const waiting = pending > 0;
  const text = syncing
    ? 'Saving your progress…'
    : waiting
      ? `${pending} ${pending === 1 ? 'change' : 'changes'} waiting to save${error ? ' · offline?' : ''}`
      : lastSyncedAt
        ? 'Progress saved to your account'
        : 'Progress will be saved to your account';

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={`${text}. Tap to save now`}
      onPress={() => void syncProgress()}
      hitSlop={6}
      className="mt-1 flex-row items-center gap-1.5 self-start"
    >
      <Icon
        name={waiting ? 'cloud-off' : 'check-circle'}
        size={13}
        color={waiting ? colors.warning : colors.success}
      />
      <Txt
        className={
          waiting
            ? 'text-xs text-amber-700 dark:text-amber-300'
            : 'text-xs text-emerald-700 dark:text-emerald-300'
        }
      >
        {text}
      </Txt>
    </Pressable>
  );
}
