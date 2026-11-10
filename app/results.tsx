/**
 * Results screen — score, points earned, time taken and a review of each answer.
 * Address: /results?category=math&date=2026-11-08&drop=2
 */
import { router, useLocalSearchParams } from 'expo-router';
import { View } from 'react-native';
import Animated, { FadeInDown, ZoomIn } from 'react-native-reanimated';
import { twMerge } from 'tailwind-merge';

import { Button, IconButton } from '@/components/Button';
import { CARD_CLASSES } from '@/components/Card';
import { Icon } from '@/components/Icon';
import { SectionTitle } from '@/components/PageHeader';
import { Confetti } from '@/components/Confetti';
import { ReminderPrompt } from '@/components/RemindersCard';
import { ProgressRing } from '@/components/ProgressBar';
import { Screen } from '@/components/Screen';
import { StatCard } from '@/components/StatCard';
import { LoadingView, MessageView } from '@/components/StateViews';
import { Muted, Txt } from '@/components/Txt';
import { newlyEarned } from '@/features/badges/badges';
import { useDropFile } from '@/features/content/store';
import { dropKey, findEntry, getTodaySlots, type DropRef } from '@/features/drops/status';
import { PERFECT_BONUS } from '@/features/points/points';
import { useSession } from '@/features/progress/store';
import { correctAnswerText, itemText } from '@/features/quiz/check';
import { computeStats } from '@/features/stats';
import { useAppData } from '@/hooks/useAppData';
import { categoryHref, parseDropParams, quizHref, goHome } from '@/lib/routes';
import type { IndexEntry } from '@/lib/schema';
import { formatDuration } from '@/lib/time';
import { displayTitle } from '@/lib/title';
import { BADGE_ICONS, colors, type IconName } from '@/theme';

function verdict(correct: number, total: number) {
  const ratio = total > 0 ? correct / total : 0;
  if (ratio === 1) return { title: 'Perfect score', ring: colors.success };
  if (ratio >= 0.8) return { title: 'Great job', ring: colors.success };
  if (ratio >= 0.6) return { title: 'Good work', ring: colors.brand };
  return { title: 'Keep practising', ring: colors.warning };
}

export default function ResultsScreen() {
  const params = useLocalSearchParams<{ category?: string; date?: string; drop?: string }>();
  const ref = parseDropParams(params);
  const lastAttempt = useSession((s) => s.lastAttempt);
  const { ready, index, results, zonedNow, isDone, stats, today } = useAppData();

  const entry = index && ref ? findEntry(index, ref) : null;
  const dropFile = useDropFile(ready && entry ? entry.path : null);

  if (!ready || !index) {
    return (
      <Screen width="narrow">
        <LoadingView />
      </Screen>
    );
  }

  const key = ref ? dropKey(ref) : '';
  // Prefer the attempt just played (could be a practice replay), else the saved result.
  const attempt =
    lastAttempt && ref && dropKey(lastAttempt) === key
      ? lastAttempt
      : results[key]
        ? { ...results[key], practice: false }
        : null;
  const category = ref ? index.categories.find((c) => c.id === ref.category) : undefined;

  if (!ref || !attempt || !category) {
    return (
      <Screen width="narrow">
        <MessageView
          icon="file-text"
          title="No result yet"
          message="Play this drop first and your score will show up here."
          actionLabel={entry ? 'Play this drop' : 'Go to Home'}
          onAction={() => (entry ? router.replace(quizHref(entry)) : goHome())}
        />
      </Screen>
    );
  }

  const total = attempt.items.length;
  const { title, ring } = verdict(attempt.correctCount, total);
  const accuracy = Math.round((attempt.correctCount / total) * 100);

  // Celebrations: only right after the first (scoring) play of this drop.
  // We compare stats without this drop ("before") and with it ("after").
  const justScored =
    lastAttempt !== null &&
    dropKey(lastAttempt) === key &&
    !lastAttempt.practice &&
    Boolean(results[key]);
  const before = justScored
    ? computeStats(
        Object.fromEntries(Object.entries(results).filter(([k]) => k !== key)),
        index.categories.length,
        today,
      )
    : null;
  const newBadges = before ? newlyEarned(before.badges, stats.badges) : [];
  const levelUp = before && stats.level.level > before.level.level ? stats.level : null;

  // Suggest the next drop: first playable one today in any category (this one first).
  const ordered = [category, ...index.categories.filter((c) => c.id !== category.id)];
  let nextEntry: IndexEntry | null = null;
  for (const c of ordered) {
    const slot = getTodaySlots(index, c.id, zonedNow, isDone).find(
      (s) => s.status === 'available' && s.entry && dropKey(s.entry) !== key,
    );
    if (slot?.entry) {
      nextEntry = slot.entry;
      break;
    }
  }
  const nextCategory = nextEntry
    ? index.categories.find((c) => c.id === nextEntry?.category)
    : null;

  const drop = dropFile.status === 'ready' ? dropFile.drop : null;
  const thisRef: DropRef = ref;

  return (
    <Screen width="narrow">
      <View className="flex-row items-center justify-between">
        <Txt weight="display" accessibilityRole="header" className="text-2xl tracking-tight">
          Results
        </Txt>
        <IconButton icon="x" label="Close results" onPress={goHome} variant="ghost" />
      </View>

      {/* Celebrate the first (scoring) play of a drop */}
      {justScored ? <Confetti /> : null}

      {/* Score */}
      <View className="mt-5">
        <View className={twMerge(CARD_CLASSES, 'items-center px-6 py-10')}>
          <Animated.View entering={ZoomIn.duration(350)}>
            <ProgressRing
              value={total > 0 ? attempt.correctCount / total : 0}
              size={136}
              strokeWidth={11}
              color={ring}
              label={`You got ${attempt.correctCount} out of ${total} correct`}
            >
              <Txt weight="display" className="text-5xl">
                {attempt.correctCount}
                <Txt weight="medium" className="text-xl text-[#6B6B68] dark:text-[#A1A19E]">
                  /{total}
                </Txt>
              </Txt>
            </ProgressRing>
          </Animated.View>
          <Txt weight="display" className="mt-6 text-[26px]">
            {title}
          </Txt>
          <Muted className="mt-1 text-center text-[15px]">
            {category.name} · {displayTitle(attempt.title)} · {accuracy}% accuracy
          </Muted>
        </View>
      </View>

      {/* Stats */}
      <Animated.View entering={FadeInDown.delay(100).duration(300)}>
        <View className="-m-1.5 mt-3 flex-row">
          <View className="flex-1 p-1.5">
            <StatCard
              icon="star"
              color={colors.points}
              value={attempt.practice ? '—' : `+${attempt.points}`}
              label={attempt.practice ? 'Practice' : 'Points'}
            />
          </View>
          <View className="flex-1 p-1.5">
            <StatCard
              icon="timer"
              color={colors.brand}
              value={formatDuration(attempt.durationSec)}
              label="Time"
            />
          </View>
          <View className="flex-1 p-1.5">
            <StatCard
              icon="target"
              color={colors.success}
              value={`${accuracy}%`}
              label="Accuracy"
            />
          </View>
        </View>
        {attempt.perfect && !attempt.practice ? (
          <Muted className="mt-2 text-center">
            Includes a +{PERFECT_BONUS} bonus for a perfect drop.
          </Muted>
        ) : null}
      </Animated.View>

      {/* Level up and new badges */}
      {levelUp ? (
        <Celebration
          icon="trending-up"
          title={`Level up — Level ${levelUp.level}`}
          text={`You are now a ${levelUp.name}.`}
        />
      ) : null}
      {newBadges.map((badge) => (
        <Celebration
          key={badge.id}
          icon={BADGE_ICONS[badge.id] ?? 'medal'}
          title={`New badge: ${badge.name}`}
          text={badge.description}
        />
      ))}

      {/* After a first (scoring) play: offer a daily reminder, once */}
      {justScored ? <ReminderPrompt /> : null}

      {/* Actions */}
      <View className="mt-6 gap-2.5">
        {nextEntry && nextCategory ? (
          <Button
            label={`Next drop: ${nextCategory.name}`}
            icon="arrow-right"
            iconRight
            onPress={() => nextEntry && router.replace(quizHref(nextEntry))}
          />
        ) : null}
        <Button
          label="Back to Home"
          variant={nextEntry ? 'secondary' : 'primary'}
          onPress={goHome}
        />
        <View className="flex-row gap-2.5">
          <Button
            label="Play again"
            icon="refresh"
            variant="secondary"
            className="flex-1"
            accessibilityHint="Replay as practice. No new points."
            onPress={() => router.replace(quizHref(thisRef))}
          />
          <Button
            label={category.name}
            variant="secondary"
            className="flex-1"
            onPress={() => router.replace(categoryHref(category.id))}
          />
        </View>
      </View>

      {/* Answer review */}
      <SectionTitle title="Your answers" />
      <View className={twMerge(CARD_CLASSES, 'overflow-hidden')}>
        {attempt.items.map((r, i) => {
          const item = drop?.items.find((it) => it.id === r.itemId);
          const isFact = r.type === 'fact_card';
          return (
            <View
              key={r.itemId}
              accessible
              accessibilityLabel={`Question ${i + 1}: ${isFact ? 'fact card' : r.correct ? 'correct' : 'wrong'}`}
              className={twMerge(
                'flex-row gap-3 px-4 py-3.5',
                i > 0 && 'border-t border-line dark:border-ink-line',
              )}
            >
              <View
                className={twMerge(
                  'mt-0.5 h-6 w-6 items-center justify-center rounded-full',
                  isFact
                    ? 'bg-brand-50 dark:bg-brand-400/15'
                    : r.correct
                      ? 'bg-emerald-500'
                      : 'bg-rose-500',
                )}
              >
                <Icon
                  name={isFact ? 'lightbulb' : r.correct ? 'check' : 'x'}
                  size={13}
                  color={isFact ? colors.brand : colors.white}
                  strokeWidth={isFact ? 2.25 : 3}
                />
              </View>
              <View className="flex-1">
                <Txt className="text-[15px] leading-6">
                  {item ? itemText(item) : `Question ${i + 1}`}
                </Txt>
                {item && !isFact && !r.correct ? (
                  <Muted className="mt-1">
                    You answered “{r.given ?? '—'}” · Correct: {correctAnswerText(item)}
                  </Muted>
                ) : null}
              </View>
            </View>
          );
        })}
      </View>
    </Screen>
  );
}

function Celebration({ icon, title, text }: { icon: IconName; title: string; text: string }) {
  return (
    <Animated.View entering={ZoomIn.delay(300).duration(300)}>
      <View
        accessible
        accessibilityLabel={`${title}. ${text}`}
        className="mt-3 flex-row items-center gap-3 rounded-2xl border border-amber-200 bg-amber-50 p-4 dark:border-amber-500/20 dark:bg-amber-500/10"
      >
        <View className="h-11 w-11 items-center justify-center rounded-xl bg-amber-100 dark:bg-amber-500/20">
          <Icon name={icon} size={20} color={colors.points} />
        </View>
        <View className="flex-1">
          <Txt weight="semibold" className="text-amber-900 dark:text-amber-100">
            {title}
          </Txt>
          <Txt className="text-sm text-amber-800 dark:text-amber-200">{text}</Txt>
        </View>
      </View>
    </Animated.View>
  );
}
