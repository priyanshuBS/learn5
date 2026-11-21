/**
 * Progress — level, points, streaks and all 5 badges.
 * (Address stays /badges.)
 */
import { router } from 'expo-router';
import { useState } from 'react';
import { Pressable, View } from 'react-native';
import { twMerge } from 'tailwind-merge';

import { BadgeCard } from '@/components/BadgeCard';
import { Button } from '@/components/Button';
import { Card, CARD_CLASSES } from '@/components/Card';
import { Icon } from '@/components/Icon';
import { PageHeader, SectionTitle } from '@/components/PageHeader';
import { ProgressBar } from '@/components/ProgressBar';
import { RemindersSettings } from '@/components/RemindersCard';
import { Screen } from '@/components/Screen';
import { StatStrip } from '@/components/StatCard';
import { ThemeToggle } from '@/components/ThemeToggle';
import { LoadingView } from '@/components/StateViews';
import { Muted, Txt } from '@/components/Txt';
import { deleteMyAccount } from '@/features/account/deleteAccount';
import { useAuth } from '@/features/auth/store';
import { useProgress } from '@/features/progress/store';
import { syncProgress, useSyncStatus } from '@/features/progress/sync';
import { LEVELS } from '@/features/levels/levels';
import { useAppData } from '@/hooks/useAppData';
import { confirmAsync, notify } from '@/lib/confirm';
import { colors } from '@/theme';

export default function ProgressScreen() {
  const { ready, stats } = useAppData();
  const user = useAuth((s) => s.user);
  const expiresAt = useAuth((s) => s.expiresAt);
  const signOut = useAuth((s) => s.signOut);
  const [deleting, setDeleting] = useState(false);
  const [showAllLevels, setShowAllLevels] = useState(false);

  const onDeleteAccount = async () => {
    const ok = await confirmAsync({
      title: 'Delete your account?',
      message:
        'This permanently deletes your account, progress, streaks and badges on every device. It cannot be undone.',
      confirmLabel: 'Delete account',
      destructive: true,
    });
    if (!ok) return;
    setDeleting(true);
    try {
      await deleteMyAccount();
    } catch (err) {
      notify(
        'Could not delete your account',
        err instanceof Error ? err.message : 'Please check your internet connection and try again.',
      );
      setDeleting(false);
    }
  };
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
  // The levels around yours (one before, yours, two after); all of them on request.
  const shownLevels = showAllLevels
    ? LEVELS
    : LEVELS.filter((l) => l.level >= level.level - 1 && l.level <= level.level + 2);

  return (
    <Screen>
      <PageHeader title="Progress" subtitle="Level, streaks, badges and settings." />

      {/* Level */}
      <View className={twMerge(CARD_CLASSES, 'p-5 md:p-6')}>
        <View className="flex-row items-end justify-between gap-4">
          <View className="flex-1">
            <Muted className="text-[13px]">Level {level.level}</Muted>
            <Txt weight="display" className="mt-1 text-[28px] leading-9">
              {level.name}
            </Txt>
          </View>
          <View className="items-end">
            <Muted className="text-[13px]">Points</Muted>
            <Txt weight="display" className="mt-1 text-[28px] leading-9">
              {points.toLocaleString('en-IN')}
            </Txt>
          </View>
        </View>
        <ProgressBar
          value={level.progress}
          className="mt-6"
          label={`Level progress ${Math.round(level.progress * 100)} percent`}
        />
        <Muted className="mt-2.5 text-[13px]">
          {level.nextAt === null || !nextLevel
            ? 'You reached the top level.'
            : `${(level.nextAt - points).toLocaleString('en-IN')} points to level ${nextLevel.level} · ${nextLevel.name}`}
        </Muted>
      </View>

      {/* Stats */}
      <View className="mt-3 gap-3 md:flex-row">
        <StatStrip
          className="md:flex-1"
          stats={[
            { label: 'Current streak', value: `${streak.current}d` },
            { label: 'Best streak', value: `${streak.best}d` },
          ]}
        />
        <StatStrip
          className="md:flex-1"
          stats={[
            { label: 'Correct answers', value: `${stats.correctAnswers}` },
            { label: 'Drops done', value: `${stats.dropsDone}` },
          ]}
        />
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
        {shownLevels.map((l, i) => {
          const current = l.level === level.level;
          const reached = l.level <= level.level;
          return (
            <View
              key={l.level}
              className={twMerge(
                'flex-row items-center gap-3 px-4 py-3',
                i > 0 && 'border-t border-line dark:border-ink-line',
                current && 'bg-zinc-50 dark:bg-white/[0.03]',
              )}
            >
              <View className="w-5 items-center">
                {reached ? (
                  <Icon name="check" size={14} color={colors.brand} strokeWidth={2.5} />
                ) : (
                  <View className="h-1.5 w-1.5 rounded-full bg-zinc-300 dark:bg-zinc-700" />
                )}
              </View>
              <Txt weight={current ? 'medium' : 'regular'} className="flex-1 text-[15px]">
                Level {l.level} · {l.name}
              </Txt>
              {current ? (
                <Txt weight="mono" className="text-[11px] uppercase tracking-[1px] text-zinc-500">
                  Current
                </Txt>
              ) : null}
              <Txt weight="mono" className="w-20 text-right text-[12.5px] text-zinc-500">
                {l.minPoints.toLocaleString('en-IN')}
              </Txt>
            </View>
          );
        })}
      </View>
      {LEVELS.length > shownLevels.length || showAllLevels ? (
        <Button
          label={showAllLevels ? 'Show fewer levels' : `Show all ${LEVELS.length} levels`}
          variant="ghost"
          size="sm"
          onPress={() => setShowAllLevels((v) => !v)}
          className="mt-2 self-start"
        />
      ) : null}

      <SectionTitle title="Reminders" />
      <RemindersSettings />

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
          <View className="h-10 w-10 items-center justify-center rounded-full bg-zinc-950 dark:bg-[#EDEDED]">
            <Txt weight="semibold" className="text-[15px] uppercase text-white dark:text-[#111111]">
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
      <Card className="mt-3 flex-row flex-wrap items-center justify-between gap-3">
        <View className="flex-row flex-wrap gap-5">
          <TextLink label="Privacy policy" onPress={() => router.push('/privacy')} />
          <TextLink label="Terms of use" onPress={() => router.push('/terms')} />
        </View>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Delete my account"
          accessibilityState={{ disabled: deleting, busy: deleting }}
          disabled={deleting}
          onPress={() => void onDeleteAccount()}
          hitSlop={8}
          className="flex-row items-center gap-1.5 rounded-full px-3 py-2 active:bg-rose-500/10 web:hover:bg-rose-500/10"
        >
          <Icon name="trash" size={14} color={colors.danger} />
          <Txt weight="semibold" className="text-[13px] text-rose-600 dark:text-rose-400">
            {deleting ? 'Deleting…' : 'Delete account'}
          </Txt>
        </Pressable>
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
            ? 'text-xs text-zinc-700 dark:text-zinc-300'
            : 'text-xs text-emerald-700 dark:text-emerald-300'
        }
      >
        {text}
      </Txt>
    </Pressable>
  );
}

function TextLink({ label, onPress }: { label: string; onPress: () => void }) {
  return (
    <Pressable accessibilityRole="link" onPress={onPress} hitSlop={6}>
      <Txt className="text-[13px] text-zinc-500 underline dark:text-[#A1A1A1]">{label}</Txt>
    </Pressable>
  );
}
