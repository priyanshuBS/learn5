/**
 * Review my mistakes — replay questions you got wrong.
 * Address: /review   (or /review?category=math for one category)
 *
 * Answer a mistake correctly and it leaves the list. No points here —
 * this is just for learning.
 */
import { router, useLocalSearchParams } from 'expo-router';
import { useState } from 'react';
import { View } from 'react-native';
import { twMerge } from 'tailwind-merge';

import { Button, IconButton } from '@/components/Button';
import { Card, CARD_CLASSES } from '@/components/Card';
import { CategoryIcon } from '@/components/CategoryIcon';
import { Tag } from '@/components/DifficultyBadge';
import { ExplanationPanel } from '@/components/ExplanationPanel';
import { PageHeader, SectionTitle } from '@/components/PageHeader';
import { QuizProgress, type SegmentState } from '@/components/ProgressBar';
import { QuizCard, type QuestionItem } from '@/components/QuizCard';
import { Screen } from '@/components/Screen';
import { LoadingView, MessageView } from '@/components/StateViews';
import { Muted, Txt } from '@/components/Txt';
import { useDropFiles } from '@/features/content/store';
import { findEntry } from '@/features/drops/status';
import { useProgress } from '@/features/progress/store';
import { correctAnswerText, isFillBlankCorrect } from '@/features/quiz/check';
import { reportWrongAnswer } from '@/features/quiz/report';
import type { ItemAnswer } from '@/features/quiz/types';
import { getMistakes } from '@/features/review/mistakes';
import { useAppData } from '@/hooks/useAppData';
import { goHome } from '@/lib/routes';
import { haptics } from '@/lib/haptics';
import type { Category, Drop } from '@/lib/schema';

/** How many mistakes one review round has. */
const ROUND_SIZE = 10;

interface ReviewCard {
  item: QuestionItem;
  drop: Drop;
  category: Category;
  firstAnswer: string | null;
}

export default function ReviewScreen() {
  const { category: categoryParam } = useLocalSearchParams<{ category?: string }>();
  const { ready, index, results, fixedMistakes } = useAppData();

  // The round's questions are frozen when it starts, so fixing one mid-round
  // doesn't change (or reload) the round you are playing.
  const [round, setRound] = useState<ReviewCard[] | null>(null);

  const filterCategory = index?.categories.some((c) => c.id === categoryParam)
    ? categoryParam
    : undefined;
  const mistakes = getMistakes(results, fixedMistakes, filterCategory);
  const paths = index
    ? mistakes.map((m) => findEntry(index, m.drop)?.path).filter((p): p is string => !!p)
    : [];
  const loaded = useDropFiles(ready && !round ? paths : []);

  if (round) {
    return (
      <ReviewPlayer cards={round} remainingNow={mistakes.length} onAgain={() => setRound(null)} />
    );
  }

  if (!ready || !index || loaded.loading) {
    return (
      <Screen>
        <LoadingView label="Finding your mistakes…" />
      </Screen>
    );
  }

  // Turn mistake references into real questions.
  const cards: Record<string, ReviewCard> = {};
  for (const m of mistakes) {
    const path = findEntry(index, m.drop)?.path;
    const drop = path ? loaded.drops[path] : undefined;
    const item = drop?.items.find((it) => it.id === m.itemId);
    const category = index.categories.find((c) => c.id === m.drop.category);
    if (drop && item && item.type !== 'fact_card' && category) {
      cards[m.itemId] = { item, drop, category, firstAnswer: m.given };
    }
  }
  const available = Object.keys(cards);
  const categoryName = filterCategory
    ? index.categories.find((c) => c.id === filterCategory)?.name
    : undefined;

  return (
    <Screen width="narrow">
      <PageHeader
        title="Review mistakes"
        subtitle={categoryName ? `${categoryName} only` : 'Questions you got wrong'}
      />

      {available.length === 0 ? (
        <MessageView
          icon={mistakes.length > 0 ? 'cloud-off' : 'check-circle'}
          tone={mistakes.length > 0 ? 'warning' : 'success'}
          title={mistakes.length > 0 ? 'Connect to load your mistakes' : 'Nothing to review'}
          message={
            mistakes.length > 0
              ? 'Your mistakes need the internet to load. Connect and try again.'
              : 'Every question you answered is correct or already fixed. Great work.'
          }
          actionLabel="Go to Home"
          onAction={goHome}
        />
      ) : (
        <>
          <Card className="flex-row flex-wrap items-center justify-between gap-4">
            <View className="min-w-48 flex-1">
              <Txt weight="display" className="text-3xl tracking-tight">
                {available.length}
              </Txt>
              <Muted className="text-[15px]">
                {available.length === 1 ? 'question' : 'questions'} to fix. Get one right and it
                leaves the list.
              </Muted>
            </View>
            <Button
              label={`Start review (${Math.min(ROUND_SIZE, available.length)})`}
              icon="play"
              onPress={() => setRound(available.slice(0, ROUND_SIZE).map((id) => cards[id]))}
            />
          </Card>

          {filterCategory ? (
            <Button
              label="Show all categories"
              variant="ghost"
              onPress={() => router.replace('/review')}
              className="mt-2 self-start"
            />
          ) : null}

          <SectionTitle title="Your mistakes" />
          <View className={twMerge(CARD_CLASSES, 'overflow-hidden')}>
            {available.map((id, i) => {
              const card = cards[id];
              return (
                <View
                  key={id}
                  className={twMerge(
                    'flex-row gap-3 px-4 py-3.5',
                    i > 0 && 'border-t border-line dark:border-ink-line',
                  )}
                >
                  <CategoryIcon category={card.category} size="sm" />
                  <View className="flex-1">
                    <Txt weight="medium" className="text-[15px] leading-6">
                      {card.item.question}
                    </Txt>
                    <Muted className="mt-0.5">
                      {card.item.topic} · You answered “{card.firstAnswer ?? '—'}”
                    </Muted>
                  </View>
                </View>
              );
            })}
          </View>
        </>
      )}
    </Screen>
  );
}

function ReviewPlayer({
  cards,
  remainingNow,
  onAgain,
}: {
  cards: ReviewCard[];
  /** Live count of mistakes still not fixed. */
  remainingNow: number;
  onAgain: () => void;
}) {
  const markMistakeFixed = useProgress((s) => s.markMistakeFixed);
  const [position, setPosition] = useState(0);
  const [answers, setAnswers] = useState<(ItemAnswer | null)[]>(() => cards.map(() => null));
  const [reported, setReported] = useState<string[]>([]);
  const [finished, setFinished] = useState(false);

  const fixedCount = answers.filter((a) => a?.correct).length;

  if (finished || cards.length === 0) {
    const left = remainingNow;
    return (
      <Screen width="narrow">
        <MessageView
          icon={fixedCount === cards.length ? 'trophy' : 'trending-up'}
          tone="success"
          title={`You fixed ${fixedCount} of ${cards.length}`}
          message={
            left > 0
              ? `${left} ${left === 1 ? 'mistake' : 'mistakes'} left to review.`
              : 'No mistakes left. Excellent work.'
          }
          actionLabel={left > 0 ? 'Review more' : 'Go to Home'}
          onAction={left > 0 ? onAgain : goHome}
          secondaryLabel={left > 0 ? 'Done for now' : undefined}
          onSecondary={left > 0 ? onAgain : undefined}
        />
      </Screen>
    );
  }

  const { item, drop, category } = cards[position];
  const answer = answers[position];
  const isLast = position === cards.length - 1;

  const record = (a: ItemAnswer) => {
    setAnswers((prev) => prev.map((old, i) => (i === position ? a : old)));
    if (a.correct) {
      haptics.success();
      markMistakeFixed(item.id);
    } else {
      haptics.error();
    }
  };

  const segments: SegmentState[] = cards.map((_, i) => {
    const a = answers[i];
    if (a) return a.correct ? 'correct' : 'wrong';
    return i === position ? 'current' : 'todo';
  });

  return (
    <Screen
      key={item.id}
      width="narrow"
      footerSafeArea={false}
      footer={
        answer ? (
          <Button
            label={isLast ? 'Finish review' : 'Next question'}
            icon={isLast ? 'flag' : 'arrow-right'}
            iconRight
            onPress={() => (isLast ? setFinished(true) : setPosition((p) => p + 1))}
          />
        ) : (
          <Muted className="py-3 text-center">Choose an answer to continue</Muted>
        )
      }
    >
      <View className="flex-row items-center gap-4">
        <IconButton
          icon="x"
          label="Stop review"
          onPress={() => setFinished(true)}
          variant="ghost"
        />
        <QuizProgress segments={segments} />
        <Muted className="w-10 text-right">
          {position + 1}/{cards.length}
        </Muted>
      </View>

      <View className="mt-8 flex-row flex-wrap items-center gap-2">
        <Tag label="Review" />
        <Tag label={category.name} color={category.color} />
        <Muted>{item.topic}</Muted>
      </View>

      <Card className="mt-4 p-5 md:p-8">
        <QuizCard
          item={item}
          answer={answer}
          onChoose={(choice) => {
            if (answer || item.type === 'fill_blank') return;
            record({
              correct: choice === item.answerIndex,
              given: item.options[choice],
              choiceIndex: choice,
            });
          }}
          onSubmitText={(text) => {
            if (answer || item.type !== 'fill_blank') return;
            record({
              correct: isFillBlankCorrect(item, text),
              given: text.trim(),
              choiceIndex: null,
            });
          }}
        />
      </Card>

      {answer ? (
        <ExplanationPanel
          kind={answer.correct ? 'correct' : 'wrong'}
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
    </Screen>
  );
}
