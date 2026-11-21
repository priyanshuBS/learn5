/**
 * Results screen — score, points earned, time taken and a review of each answer.
 * Address: /results?category=math&date=2026-11-08&drop=2
 */
import { router, useLocalSearchParams } from 'expo-router';
import { View } from 'react-native';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { twMerge } from 'tailwind-merge';

import { Button, IconButton } from '@/components/Button';
import { CARD_CLASSES } from '@/components/Card';
import { Icon } from '@/components/Icon';
import { SectionTitle } from '@/components/PageHeader';
import { Confetti } from '@/components/Confetti';
import { ReminderPrompt } from '@/components/RemindersCard';
import { Screen } from '@/components/Screen';
import { StatStrip } from '@/components/StatCard';
import { Icon3D } from '@/components/Icon3D';
import { LoadingView, MessageView } from '@/components/StateViews';
import { Muted, Txt } from '@/components/Txt';
import { newlyEarned } from '@/features/badges/badges';
import { useDropFile } from '@/features/content/store';
import { displayTitle } from '@/lib/title';
import { dropKey, findEntry, getTodaySlots, type DropRef } from '@/features/drops/status';
import { PERFECT_BONUS } from '@/features/points/points';
import { useSession } from '@/features/progress/store';
import { correctAnswerText, itemText } from '@/features/quiz/check';
import { computeStats } from '@/features/stats';
import { useAppData } from '@/hooks/useAppData';
import { categoryHref, parseDropParams, quizHref, goHome } from '@/lib/routes';
import type { IndexEntry } from '@/lib/schema';
import { formatDuration } from '@/lib/time';
import { BADGE_ICONS, colors, type IconName } from '@/theme';

function verdict(correct: number, total: number) {
  const ratio = total > 0 ? correct / total : 0;
  if (ratio === 1) return { title: 'Perfect score.' };
  if (ratio >= 0.8) return { title: 'Great work.' };
  if (ratio >= 0.6) return { title: 'Good effort.' };
  return { title: 'Keep practising.' };
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
  const { title } = verdict(attempt.correctCount, total);
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
        <Muted className="text-[13px]">
          {category.name} · {displayTitle(attempt.title)}
        </Muted>
        <IconButton icon="x" label="Close results" onPress={goHome} variant="ghost" />
      </View>

      {/* Celebrate the first (scoring) play of a drop */}
      {justScored ? <Confetti /> : null}

      {/* Score */}
      <Animated.View entering={FadeInDown.duration(260)} className="mt-6">
        <View
          accessible
          accessibilityLabel={`You got ${attempt.correctCount} out of ${total} correct`}
          className="flex-row items-baseline"
        >
          <Txt
            weight="display"
            className="text-[72px] leading-[80px] tracking-[-2px] text-brand-600 dark:text-brand-400"
          >
            {attempt.correctCount}
          </Txt>
          <Txt weight="display" className="text-[32px] text-zinc-300 dark:text-zinc-600">
            /{total}
          </Txt>
        </View>
        <Txt weight="display" accessibilityRole="header" className="mt-1 text-[24px] leading-8">
          {title}
        </Txt>
        <View className="mt-5 flex-row gap-1">
          {attempt.items.map((r) => (
            <View
              key={r.itemId}
              className={twMerge(
                'h-1 flex-1 rounded-full',
                r.type === 'fact_card'
                  ? 'bg-zinc-300 dark:bg-zinc-700'
                  : r.correct
                    ? 'bg-emerald-600'
                    : 'bg-rose-500',
              )}
            />
          ))}
        </View>
      </Animated.View>

      {/* Stats */}
      <StatStrip
        className="mt-8"
        stats={[
          {
            icon: 'star',
            color: '#F59E0B',
            label: attempt.practice ? 'Practice' : 'Points',
            value: attempt.practice ? '—' : `+${attempt.points}`,
          },
          {
            icon: 'timer',
            color: '#2F51E0',
            label: 'Time',
            value: formatDuration(attempt.durationSec),
          },
          { icon: 'target', color: '#12A150', label: 'Accuracy', value: `${accuracy}%` },
        ]}
      />
      {attempt.perfect && !attempt.practice ? (
        <Muted className="mt-2 text-[13px]">
          Includes a +{PERFECT_BONUS} bonus for a perfect drop.
        </Muted>
      ) : null}

      {/* Level up and new badges */}
      {levelUp ? (
        <Celebration
          icon="trending-up"
          title={`Level ${levelUp.level} reached`}
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
      <View className="mt-8 gap-2">
        {nextEntry && nextCategory ? (
          <Button
            label={`Next: ${nextCategory.name}`}
            icon="arrow-right"
            iconRight
            onPress={() => nextEntry && router.replace(quizHref(nextEntry))}
          />
        ) : (
          <Button label="Back to Today" onPress={goHome} />
        )}
        <View className="flex-row gap-2">
          <Button
            label="Play again"
            variant="secondary"
            size="md"
            className="flex-1"
            accessibilityHint="Replay as practice. No new points."
            onPress={() => router.replace(quizHref(thisRef))}
          />
          <Button
            label={nextEntry ? 'Back to Today' : category.name}
            variant="secondary"
            size="md"
            className="flex-1"
            onPress={() => (nextEntry ? goHome() : router.replace(categoryHref(category.id)))}
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
                'flex-row gap-3.5 px-4 py-3.5',
                i > 0 && 'border-t border-line dark:border-ink-line',
              )}
            >
              <Txt
                weight="mono"
                className="mt-0.5 w-5 text-[12px] text-zinc-400 dark:text-zinc-500"
              >
                {String(i + 1).padStart(2, '0')}
              </Txt>
              <View className="flex-1">
                <Txt className="text-[15px] leading-6">
                  {item ? itemText(item) : `Question ${i + 1}`}
                </Txt>
                {item && !isFact && !r.correct ? (
                  <Muted className="mt-1 text-[13px]">
                    You: “{r.given ?? '—'}” · Answer: {correctAnswerText(item)}
                  </Muted>
                ) : null}
              </View>
              <View className="mt-1">
                {isFact ? (
                  <Icon name="bookmark" size={14} color={colors.mutedDark} />
                ) : r.correct ? (
                  <Icon name="check" size={15} color={colors.success} strokeWidth={2.5} />
                ) : (
                  <Icon name="x" size={15} color={colors.danger} strokeWidth={2.5} />
                )}
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
    <Animated.View entering={FadeInDown.delay(250).duration(260)}>
      <View
        accessible
        accessibilityLabel={`${title}. ${text}`}
        className="mt-3 flex-row items-center gap-3.5 rounded-2xl bg-amber-50 p-4 dark:bg-amber-500/10"
      >
        <Icon3D icon={icon} color="#F59E0B" size={40} solid />
        <View className="flex-1">
          <Txt weight="semibold" className="text-[15px]">
            {title}
          </Txt>
          <Muted className="text-[13px]">{text}</Muted>
        </View>
      </View>
    </Animated.View>
  );
}
