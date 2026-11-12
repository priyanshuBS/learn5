/**
 * QuizCard — one question (mcq, true/false or fill-in-the-blank)
 * with large answer options and instant right/wrong feedback.
 */
import { useEffect, useState } from 'react';
import { Pressable, TextInput, View } from 'react-native';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withSequence,
  withSpring,
  withTiming,
} from 'react-native-reanimated';
import { twMerge } from 'tailwind-merge';

import type { ItemAnswer } from '@/features/quiz/types';
import { BLANK_MARKER, type FillBlankItem, type McqItem, type TrueFalseItem } from '@/lib/schema';
import { colors } from '@/theme';

import { Button } from './Button';
import { Icon } from './Icon';
import { Txt } from './Txt';

export type QuestionItem = McqItem | TrueFalseItem | FillBlankItem;

interface QuizCardProps {
  item: QuestionItem;
  answer: ItemAnswer | null;
  onChoose: (index: number) => void;
  onSubmitText: (text: string) => void;
}

export function QuizCard({ item, answer, onChoose, onSubmitText }: QuizCardProps) {
  return (
    <View>
      <QuestionText item={item} answer={answer} />
      <View className="mt-7">
        {item.type === 'fill_blank' ? (
          <FillBlankInput answer={answer} onSubmit={onSubmitText} />
        ) : item.type === 'true_false' ? (
          <View className="flex-row gap-3">
            {item.options.map((option, i) => (
              <OptionButton
                key={option}
                label={option}
                marker={i === 0 ? 'T' : 'F'}
                state={optionState(i, item.answerIndex, answer)}
                onPress={() => onChoose(i)}
                className="flex-1"
              />
            ))}
          </View>
        ) : (
          <View className="gap-2.5">
            {item.options.map((option, i) => (
              <OptionButton
                key={option}
                label={option}
                marker={String.fromCharCode(65 + i)}
                state={optionState(i, item.answerIndex, answer)}
                onPress={() => onChoose(i)}
              />
            ))}
          </View>
        )}
      </View>
    </View>
  );
}

/** The question. For fill-in-the-blank, the gap is drawn as an underlined blank. */
function QuestionText({ item, answer }: { item: QuestionItem; answer: ItemAnswer | null }) {
  const base = 'text-[24px] leading-[34px] md:text-[28px] md:leading-[40px]';
  if (item.type !== 'fill_blank') {
    return (
      <Txt weight="semibold" accessibilityRole="header" className={base}>
        {item.question}
      </Txt>
    );
  }
  const [before, ...rest] = item.question.split(BLANK_MARKER);
  const after = rest.join(BLANK_MARKER);
  return (
    <Txt
      weight="semibold"
      accessibilityRole="header"
      accessibilityLabel={item.question.replace(BLANK_MARKER, 'blank')}
      className={base}
    >
      {before}
      <Txt
        weight="bold"
        className={twMerge(
          base,
          'underline',
          answer ? 'text-emerald-600 dark:text-emerald-400' : 'text-brand-700 dark:text-brand-400',
        )}
      >
        {answer ? item.answer : '      '}
      </Txt>
      {after}
    </Txt>
  );
}

type OptionState = 'idle' | 'correct' | 'wrong' | 'reveal' | 'dim';

function optionState(index: number, answerIndex: number, answer: ItemAnswer | null): OptionState {
  if (!answer) return 'idle';
  if (index === answerIndex) return answer.choiceIndex === index ? 'correct' : 'reveal';
  if (index === answer.choiceIndex) return 'wrong';
  return 'dim';
}

function OptionButton({
  label,
  marker,
  state,
  onPress,
  className,
}: {
  label: string;
  marker: string;
  state: OptionState;
  onPress: () => void;
  className?: string;
}) {
  const answered = state !== 'idle';
  const good = state === 'correct' || state === 'reveal';
  const stateWord =
    state === 'correct'
      ? ', your answer, correct'
      : state === 'wrong'
        ? ', your answer, wrong'
        : state === 'reveal'
          ? ', correct answer'
          : '';

  // Game feel: a wrong answer shakes, a right one pops.
  const shakeX = useSharedValue(0);
  const scale = useSharedValue(1);
  useEffect(() => {
    if (state === 'wrong') {
      shakeX.set(
        withSequence(
          withTiming(-9, { duration: 45 }),
          withRepeat(withTiming(9, { duration: 70 }), 4, true),
          withTiming(0, { duration: 45 }),
        ),
      );
    } else if (state === 'correct') {
      scale.set(withSequence(withTiming(1.045, { duration: 110 }), withSpring(1, { damping: 8 })));
    }
  }, [state, shakeX, scale]);
  const motion = useAnimatedStyle(() => ({
    transform: [{ translateX: shakeX.get() }, { scale: scale.get() }],
  }));

  return (
    // (Animated views don't take layout classes, so the one we need — flex-1 — is a style.)
    <Animated.View style={[motion, className?.includes('flex-1') ? { flex: 1 } : null]}>
      <Pressable
        accessibilityRole="button"
        accessibilityLabel={`${label}${stateWord}`}
        accessibilityState={{
          disabled: answered,
          selected: state === 'correct' || state === 'wrong',
        }}
        disabled={answered}
        onPress={onPress}
        className={twMerge(
          'min-h-[60px] flex-row items-center gap-3.5 rounded-2xl border bg-white px-4 py-3 web:transition-all web:duration-200 dark:bg-ink-card',
          state === 'idle' &&
            'border-line active:border-brand-400 active:bg-brand-50 web:hover:border-brand-300 web:hover:bg-brand-50/50 dark:border-ink-line dark:active:bg-brand-400/10 dark:web:hover:border-brand-400/60 dark:web:hover:bg-brand-400/10',
          good &&
            'border-emerald-500 bg-emerald-50 web:shadow-[0_0_30px_-8px_rgba(52,211,153,0.7)] dark:border-emerald-400/70 dark:bg-emerald-500/10',
          state === 'wrong' &&
            'border-rose-500 bg-rose-50 dark:border-rose-400/70 dark:bg-rose-500/10',
          state === 'dim' && 'border-line opacity-40 dark:border-ink-line',
        )}
      >
        <View
          className={twMerge(
            'h-9 w-9 items-center justify-center rounded-full border border-line bg-canvas dark:border-ink-line dark:bg-ink-card',
            good && 'border-emerald-600 bg-emerald-500 dark:border-emerald-600 dark:bg-emerald-500',
            state === 'wrong' &&
              'border-rose-600 bg-rose-500 dark:border-rose-600 dark:bg-rose-500',
          )}
        >
          {good ? (
            <Icon name="check" size={16} color={colors.white} strokeWidth={3.5} />
          ) : state === 'wrong' ? (
            <Icon name="x" size={16} color={colors.white} strokeWidth={3.5} />
          ) : (
            <Txt weight="bold" className="text-[13px] text-zinc-500 dark:text-zinc-400">
              {marker}
            </Txt>
          )}
        </View>
        <Txt weight="bold" className="flex-1 text-[17px] leading-6">
          {label}
        </Txt>
      </Pressable>
    </Animated.View>
  );
}

function FillBlankInput({
  answer,
  onSubmit,
}: {
  answer: ItemAnswer | null;
  onSubmit: (text: string) => void;
}) {
  const [text, setText] = useState('');
  const submit = () => {
    if (text.trim()) onSubmit(text);
  };
  return (
    <View>
      <TextInput
        value={answer ? (answer.given ?? '') : text}
        onChangeText={setText}
        onSubmitEditing={submit}
        editable={!answer}
        placeholder="Type your answer"
        placeholderTextColor={colors.mutedDark}
        accessibilityLabel="Your answer"
        autoCapitalize="none"
        autoCorrect={false}
        returnKeyType="done"
        className={twMerge(
          'min-h-[60px] rounded-2xl border bg-white px-4 font-body-semibold text-xl text-zinc-900 web:outline-none dark:bg-ink-card dark:text-zinc-100',
          !answer && 'border-line focus:border-brand-500 dark:border-ink-line',
          answer?.correct && 'border-emerald-500 bg-emerald-50 dark:bg-emerald-500/10',
          answer && !answer.correct && 'border-rose-500 bg-rose-50 dark:bg-rose-500/10',
        )}
      />
      {!answer ? (
        <Button
          label="Check answer"
          icon="check"
          onPress={submit}
          disabled={!text.trim()}
          className="mt-3"
        />
      ) : null}
    </View>
  );
}
