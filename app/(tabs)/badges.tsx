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
import { Glow } from '@/components/Glow';
import { Gradient } from '@/components/Gradient';
import { Icon } from '@/components/Icon';
import { PageHeader, SectionTitle } from '@/components/PageHeader';
import { ProgressRing } from '@/components/ProgressBar';
import { RemindersSettings } from '@/components/RemindersCard';
import { Screen } from '@/components/Screen';
import { StatCard } from '@/components/StatCard';
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
import { colors, HERO_GRADIENT, HERO_LIP, GLOW } from '@/theme';

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
      <PageHeader title="Progress" subtitle="Your level, streaks and badges" />

      <View className="gap-4 xl:flex-row">
        {/* Level */}
        <View className="xl:flex-[3]">
          <Gradient colors={HERO_GRADIENT} lip={HERO_LIP} radius={28} className="p-6 md:p-7">
            <Glow
              color={GLOW.violet}
              size={380}
              opacity={0.55}
              style={{ top: -180, right: -140 }}
            />
            <Glow color={GLOW.cyan} size={300} opacity={0.3} style={{ bottom: -170, left: -120 }} />

            <View className="flex-row items-center gap-5">
              <ProgressRing
                value={level.progress}
                size={92}
                strokeWidth={9}
                color={colors.white}
                trackColor="rgba(255,255,255,0.18)"
                label={`Level progress ${Math.round(level.progress * 100)} percent`}
              >
                <Txt weight="heavy" className="text-3xl tracking-tighter text-white">
                  {level.level}
                </Txt>
              </ProgressRing>
              <View className="flex-1">
                <Txt
                  weight="semibold"
                  className="text-[11px] uppercase tracking-widest text-white/70"
                >
                  Current level
                </Txt>
                <Txt weight="heavy" className="mt-1 text-[28px] tracking-tight text-white">
                  {level.name}
                </Txt>
                <View className="mt-1 flex-row items-center gap-1.5">
                  <Icon name="star" size={14} color={colors.white} filled />
                  <Txt weight="semibold" className="text-[15px] text-white">
                    {points.toLocaleString('en-IN')} points
                  </Txt>
                </View>
              </View>
            </View>
            <View className="mt-6 h-2 overflow-hidden rounded-full bg-white/20">
              <View
                className="h-full rounded-full bg-white"
                style={{ width: `${Math.round(level.progress * 100)}%` }}
              />
            </View>
            <Txt className="mt-2 text-[13px] text-white/80">
              {level.nextAt === null || !nextLevel
                ? 'You reached the top level.'
                : `${(level.nextAt - points).toLocaleString('en-IN')} points to Level ${nextLevel.level} · ${nextLevel.name}`}
            </Txt>
          </Gradient>
        </View>

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
        {shownLevels.map((l, i) => {
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
            ? 'text-xs text-amber-700 dark:text-amber-300'
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
      <Txt className="text-[13px] text-zinc-500 underline dark:text-[#8E8EA3]">{label}</Txt>
    </Pressable>
  );
}
