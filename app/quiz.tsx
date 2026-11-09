/**
 * Quiz player — plays one drop: 5 items, one at a time.
 * Address: /quiz?category=math&date=2026-11-08&drop=2
 *
 * Flow per item: answer → instant colour feedback → explanation → Next.
 * At the end the result is saved (first play only) and the Results screen opens.
 */

import { router, useLocalSearchParams } from 'expo-router';
import { useState } from 'react';
import { View } from 'react-native';

import { Button, IconButton } from '@/components/Button';
import { DifficultyBadge, Tag } from '@/components/DifficultyBadge';
import { ExplanationPanel } from '@/components/ExplanationPanel';
import { FlashCard } from '@/components/FlashCard';
import { Icon } from '@/components/Icon';
import { QuizProgress, type SegmentState } from '@/components/ProgressBar';
import { QuizCard } from '@/components/QuizCard';
import { Screen } from '@/components/Screen';
import { LoadingView, MessageView } from '@/components/StateViews';
import { Muted, Txt } from '@/components/Txt';
import { useDropFile } from '@/features/content/store';
import { findEntry, isOpen } from '@/features/drops/status';
import { scoreDrop } from '@/features/points/points';
import { useProgress, useSession, type DropResult } from '@/features/progress/store';
import { correctAnswerText, isFillBlankCorrect } from '@/features/quiz/check';
import { reportWrongAnswer } from '@/features/quiz/report';
import type { ItemAnswer } from '@/features/quiz/types';
import { useAppData } from '@/hooks/useAppData';
import { todayLocal } from '@/lib/dates';
import { haptics } from '@/lib/haptics';
import { goBack, parseDropParams, resultsHref, goHome } from '@/lib/routes';
import type { Category, Drop } from '@/lib/schema';
import { localClockLabel } from '@/lib/time';
import { colors } from '@/theme';

export default function QuizScreen() {
  const params = useLocalSearchParams<{ category?: string; date?: string; drop?: string }>();
  const ref = parseDropParams(params);
  const { ready, index, zonedNow, isDone } = useAppData();

  const entry = index && ref ? findEntry(index, ref) : null;
  const open = !!(index && entry && isOpen(index, entry, zonedNow));
  const load = useDropFile(ready && entry && open ? entry.path : null);

  if (!ready || !index) {
    return (
      <Screen width="narrow">
        <LoadingView />
      </Screen>
    );
  }

  const category = ref ? index.categories.find((c) => c.id === ref.category) : undefined;
  if (!ref || !category || !entry) {
    return (
      <Screen width="narrow">
        <MessageView
          icon="search"
          title="Drop not found"
          message="This drop doesn't exist yet. Let's find you another one."
          actionLabel="Go to Home"
          onAction={goHome}
        />
      </Screen>
    );
  }

  if (!open) {
    const time = index.schedule[entry.category]?.[entry.drop - 1];
    return (
      <Screen width="narrow">
        <MessageView
          icon="lock"
          title="Not open yet"
          message={
            time
              ? `This drop opens at ${localClockLabel(time, zonedNow.offsetMinutes)}. See you then.`
              : 'This drop is not open yet.'
          }
          actionLabel="Go to Home"
          onAction={goHome}
        />
      </Screen>
    );
  }

  if (load.status === 'loading') {
    return (
      <Screen width="narrow">
        <LoadingView label="Getting your drop…" />
      </Screen>
    );
  }
  if (load.status === 'error') {
    return (
      <Screen width="narrow">
        <MessageView
          icon="cloud-off"
          tone="warning"
          title="Couldn't load this drop"
          message="It isn't saved on this device yet. Check your internet connection and try again."
          actionLabel="Try again"
          onAction={load.retry}
          secondaryLabel="Go to Home"
          onSecondary={goHome}
        />
      </Screen>
    );
  }

  // `key` makes a fresh player (with fresh answers) for every different drop.
  return (
    <QuizPlayer key={entry.path} drop={load.drop} category={category} practice={isDone(entry)} />
  );
}

function QuizPlayer({
  drop,
  category,
  practice,
}: {
  drop: Drop;
  category: Category;
  practice: boolean;
}) {
  const saveResult = useProgress((s) => s.saveResult);
  const setLastAttempt = useSession((s) => s.setLastAttempt);

  const [position, setPosition] = useState(0);
  const [answers, setAnswers] = useState<(ItemAnswer | null)[]>(() => drop.items.map(() => null));
  const [startedAt] = useState(() => Date.now());
  const [reported, setReported] = useState<string[]>([]);
  /** Fact cards: is the card turned over to the "why" side? */
  const [flipped, setFlipped] = useState(false);

  const item = drop.items[position];
  const answer = answers[position];
  const isLast = position === drop.items.length - 1;

  const record = (a: ItemAnswer) => {
    setAnswers((prev) => prev.map((old, i) => (i === position ? a : old)));
    if (item.type === 'fact_card') haptics.tap();
    else if (a.correct) haptics.success();
    else haptics.error();
  };

  const onChoose = (choice: number) => {
    if (answer || (item.type !== 'mcq' && item.type !== 'true_false')) return;
    record({
      correct: choice === item.answerIndex,
      given: item.options[choice],
      choiceIndex: choice,
    });
  };

  const onSubmitText = (text: string) => {
    if (answer || item.type !== 'fill_blank') return;
    record({ correct: isFillBlankCorrect(item, text), given: text.trim(), choiceIndex: null });
  };

  const finish = () => {
    const itemResults = drop.items.map((it, i) => ({
      itemId: it.id,
      type: it.type,
      difficulty: it.difficulty,
      correct: answers[i]?.correct ?? false,
      given: answers[i]?.given ?? null,
    }));
    const score = scoreDrop(itemResults);
    const result: DropResult = {
      category: drop.category,
      date: drop.date,
      drop: drop.drop,
      title: drop.title,
      items: itemResults,
      correctCount: score.correctCount,
      points: score.total,
      perfect: score.perfect,
      durationSec: Math.round((Date.now() - startedAt) / 1000),
      completedAt: new Date().toISOString(),
      completedOn: todayLocal(),
    };
    // Points only count the first time; replays are practice.
    const firstTime = !practice && saveResult(result);
    setLastAttempt({ ...result, practice: !firstTime });
    router.replace(resultsHref(drop));
  };

  const next = () => {
    setFlipped(false);
    if (isLast) finish();
    else setPosition((p) => p + 1);
  };

  const segments: SegmentState[] = drop.items.map((_, i) => {
    const a = answers[i];
    if (a) return a.correct ? 'correct' : 'wrong';
    return i === position ? 'current' : 'todo';
  });

  const footer = answer ? (
    <Button
      label={isLast ? 'See results' : 'Continue'}
      icon={isLast ? 'trophy' : 'arrow-right'}
      iconRight
      onPress={next}
    />
  ) : item.type === 'fact_card' ? (
    flipped ? (
      <Button
        label="Got it"
        icon="check"
        onPress={() => record({ correct: true, given: null, choiceIndex: null })}
      />
    ) : (
      // First flip the card to read why, then "Got it".
      <Button label="Flip to see why" icon="refresh" onPress={() => setFlipped(true)} />
    )
  ) : (
    <Muted className="py-3 text-center">
      {item.type === 'fill_blank' ? 'Type your answer above' : 'Choose an answer to continue'}
    </Muted>
  );

  return (
    // A new `key` per item scrolls back to the top and replays the entry animations.
    <Screen key={item.id} width="narrow" footer={footer}>
      {/* Top bar: close, progress, counter */}
      <View className="flex-row items-center gap-4">
        <IconButton icon="x" label="Leave quiz" onPress={goBack} variant="ghost" />
        <QuizProgress segments={segments} />
        <Muted className="w-10 text-right">
          {position + 1}/{drop.items.length}
        </Muted>
      </View>

      {practice ? (
        <View className="mt-4 flex-row items-center gap-2 rounded-xl bg-brand-50 px-4 py-2.5 dark:bg-brand-500/10">
          <Icon name="info" size={16} color={colors.brand} />
          <Txt className="flex-1 text-sm text-brand-800 dark:text-brand-200">
            Practice round — you already finished this drop, so no new points.
          </Txt>
        </View>
      ) : null}

      {/* Labels */}
      <View className="mt-8 flex-row flex-wrap items-center gap-2">
        <Tag label={category.name} color={category.color} />
        <DifficultyBadge difficulty={item.difficulty} />
        <Muted numberOfLines={1}>{item.topic}</Muted>
      </View>

      {/* The item */}
      <View className="mt-4">
        {item.type === 'fact_card' ? (
          <FlashCard item={item} flipped={flipped} onToggle={() => setFlipped((f) => !f)} />
        ) : (
          <QuizCard item={item} answer={answer} onChoose={onChoose} onSubmitText={onSubmitText} />
        )}
      </View>

      {/* Explanation after answering */}
      {answer ? (
        <ExplanationPanel
          kind={item.type === 'fact_card' ? 'fact' : answer.correct ? 'correct' : 'wrong'}
          position={position}
          correctAnswer={correctAnswerText(item)}
          explanation={item.explanation}
          funFact={item.funFact}
          source={item.source}
          reported={reported.includes(item.id)}
          onReport={() => {
            setReported((r) => [...r, item.id]);
            void reportWrongAnswer(drop, item);
          }}
        />
      ) : null}

      <Muted className="mt-8 text-center text-xs">{drop.title}</Muted>
    </Screen>
  );
}
