/**
 * QuizCard — one question (mcq, true/false or fill-in-the-blank)
 * with large answer options and instant right/wrong feedback.
 */
import { useState } from 'react';
import { Pressable, TextInput, View } from 'react-native';
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
  const base = 'text-[22px] leading-8 tracking-tight md:text-[26px] md:leading-[38px]';
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
          answer ? 'text-emerald-600 dark:text-emerald-400' : 'text-brand-600 dark:text-brand-400',
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
  return (
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
        'min-h-14 flex-row items-center gap-3.5 rounded-2xl border bg-white px-4 py-3.5 web:transition-colors dark:bg-ink-card',
        state === 'idle' &&
          'border-line active:border-brand-500 active:bg-brand-50 web:hover:border-brand-300 web:hover:bg-brand-50/40 dark:border-ink-line dark:active:bg-brand-500/10 dark:web:hover:border-brand-500/40 dark:web:hover:bg-brand-500/5',
        good &&
          'border-emerald-500 bg-emerald-50 dark:border-emerald-500/70 dark:bg-emerald-500/10',
        state === 'wrong' &&
          'border-rose-500 bg-rose-50 dark:border-rose-500/70 dark:bg-rose-500/10',
        state === 'dim' && 'border-line opacity-45 dark:border-ink-line',
        className,
      )}
    >
      <View
        className={twMerge(
          'h-8 w-8 items-center justify-center rounded-lg border border-line bg-slate-50 dark:border-ink-line dark:bg-white/5',
          good && 'border-emerald-500 bg-emerald-500 dark:border-emerald-500 dark:bg-emerald-500',
          state === 'wrong' && 'border-rose-500 bg-rose-500 dark:border-rose-500 dark:bg-rose-500',
        )}
      >
        {good ? (
          <Icon name="check" size={16} color={colors.white} strokeWidth={3} />
        ) : state === 'wrong' ? (
          <Icon name="x" size={16} color={colors.white} strokeWidth={3} />
        ) : (
          <Txt weight="semibold" className="text-[13px] text-slate-500 dark:text-zinc-400">
            {marker}
          </Txt>
        )}
      </View>
      <Txt weight="medium" className="flex-1 text-base leading-6">
        {label}
      </Txt>
    </Pressable>
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
          'min-h-14 rounded-2xl border bg-white px-4 font-inter-medium text-lg text-slate-900 web:outline-none dark:bg-ink-card dark:text-zinc-100',
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
