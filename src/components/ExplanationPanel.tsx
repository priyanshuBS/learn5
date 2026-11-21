/**
 * ExplanationPanel — appears after every answer: right/wrong, the correct
 * answer, a simple explanation, a fun fact, the source, and "Report".
 */
import { Pressable, View } from 'react-native';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { twMerge } from 'tailwind-merge';

import { colors } from '@/theme';

import { CARD_CLASSES } from './Card';
import { Icon } from './Icon';
import { Muted, Txt } from './Txt';

const PRAISE = ['Correct', 'Correct', 'Correct', 'Correct', 'Correct'];

interface ExplanationPanelProps {
  kind: 'correct' | 'wrong' | 'fact';
  /** Which item this is (varies the praise message). */
  position: number;
  correctAnswer: string;
  explanation: string;
  funFact?: string;
  source: string;
  reported: boolean;
  onReport: () => void;
}

export function ExplanationPanel({
  kind,
  position,
  correctAnswer,
  explanation,
  funFact,
  source,
  reported,
  onReport,
}: ExplanationPanelProps) {
  const heading =
    kind === 'correct'
      ? PRAISE[position % PRAISE.length]
      : kind === 'wrong'
        ? 'Incorrect'
        : 'Fact saved';

  return (
    <Animated.View entering={FadeInDown.duration(220)}>
      <View accessibilityLiveRegion="polite" className={twMerge(CARD_CLASSES, 'mt-5 p-5')}>
        <View className="flex-row items-center gap-2.5">
          <View
            className={twMerge(
              'h-5 w-5 items-center justify-center rounded-full',
              kind === 'correct' && 'bg-emerald-600',
              kind === 'wrong' && 'bg-rose-500',
              kind === 'fact' && 'bg-brand-600 dark:bg-brand-500',
            )}
          >
            <Icon
              name={kind === 'correct' ? 'check' : kind === 'wrong' ? 'x' : 'bookmark'}
              size={11}
              color={kind === 'fact' ? '#FFFFFF' : colors.white}
              strokeWidth={3}
            />
          </View>
          <Txt weight="semibold" accessibilityRole="header" className="text-[15px]">
            {heading}
          </Txt>
        </View>
        {kind === 'wrong' ? (
          <Txt className="mt-2 text-[14px] text-zinc-600 dark:text-zinc-400">
            Correct answer:{' '}
            <Txt weight="medium" className="text-[14px]">
              {correctAnswer}
            </Txt>
          </Txt>
        ) : null}

        {/* Fact cards show their explanation on the back of the card instead. */}
        {kind !== 'fact' ? (
          <Txt className="mt-3 text-[15px] leading-[25px] text-zinc-700 dark:text-zinc-300">
            {explanation}
          </Txt>
        ) : (
          <Muted className="mt-2 text-[14px]">Saved to your flashcards.</Muted>
        )}

        {funFact && kind !== 'fact' ? (
          <View className="mt-4 border-l-2 border-zinc-200 pl-3.5 dark:border-zinc-700">
            <Txt className="text-[14px] leading-6 text-zinc-600 dark:text-zinc-400">
              <Txt weight="medium" className="text-[14px] text-zinc-900 dark:text-[#E6EAF5]">
                Did you know?{' '}
              </Txt>
              {funFact}
            </Txt>
          </View>
        ) : null}

        <View className="mt-5 flex-row flex-wrap items-center justify-between gap-2 border-t border-line pt-3 dark:border-ink-line">
          <Muted className="flex-1 text-[12px]" numberOfLines={1}>
            Source: {source}
          </Muted>
          <Pressable
            accessibilityRole="button"
            accessibilityLabel={reported ? 'Reported. Thank you' : 'Report a wrong answer'}
            disabled={reported}
            onPress={onReport}
            hitSlop={8}
            className="min-h-8 flex-row items-center gap-1.5 rounded-md px-2 active:bg-zinc-100 web:hover:bg-zinc-100 dark:active:bg-white/5 dark:web:hover:bg-white/5"
          >
            <Icon
              name={reported ? 'check' : 'flag'}
              size={12}
              color={reported ? colors.success : colors.mutedDark}
            />
            <Muted className="text-[12px]">{reported ? 'Reported' : 'Report an error'}</Muted>
          </Pressable>
        </View>
      </View>
    </Animated.View>
  );
}
