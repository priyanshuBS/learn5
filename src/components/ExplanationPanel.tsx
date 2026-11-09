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

const PRAISE = ['Correct', 'Nicely done', 'Well done', 'Spot on', 'Exactly right'];

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
        ? 'Not quite'
        : 'Fact collected';

  return (
    <Animated.View entering={FadeInDown.duration(280)}>
      <View
        accessibilityLiveRegion="polite"
        className={twMerge(CARD_CLASSES, 'mt-6 overflow-hidden')}
      >
        {/* Coloured header strip */}
        <View
          className={twMerge(
            'flex-row items-center gap-3 px-5 py-3.5',
            kind === 'correct' && 'bg-emerald-50 dark:bg-emerald-500/10',
            kind === 'wrong' && 'bg-rose-50 dark:bg-rose-500/10',
            kind === 'fact' && 'bg-brand-50 dark:bg-brand-500/10',
          )}
        >
          <View
            className={twMerge(
              'h-7 w-7 items-center justify-center rounded-full',
              kind === 'correct' && 'bg-emerald-500',
              kind === 'wrong' && 'bg-rose-500',
              kind === 'fact' && 'bg-brand-600',
            )}
          >
            <Icon
              name={kind === 'correct' ? 'check' : kind === 'wrong' ? 'x' : 'bookmark'}
              size={15}
              color={colors.white}
              strokeWidth={3}
            />
          </View>
          <View className="flex-1">
            <Txt
              weight="bold"
              accessibilityRole="header"
              className={twMerge(
                'text-[17px]',
                kind === 'correct' && 'text-emerald-800 dark:text-emerald-200',
                kind === 'wrong' && 'text-rose-800 dark:text-rose-200',
                kind === 'fact' && 'text-brand-800 dark:text-brand-200',
              )}
            >
              {heading}
            </Txt>
            {kind === 'wrong' ? (
              <Txt className="text-sm text-rose-800/80 dark:text-rose-200/80">
                Correct answer:{' '}
                <Txt weight="semibold" className="text-sm text-rose-900 dark:text-rose-100">
                  {correctAnswer}
                </Txt>
              </Txt>
            ) : null}
          </View>
        </View>

        <View className="px-5 pb-4 pt-4">
          {/* Fact cards show their explanation on the back of the card instead. */}
          {kind !== 'fact' ? (
            <Txt className="text-[15px] leading-7 text-zinc-700 dark:text-zinc-300">
              {explanation}
            </Txt>
          ) : (
            <Muted className="text-[15px]">Saved to your Flashcards deck.</Muted>
          )}

          {funFact && kind !== 'fact' ? (
            <View className="mt-4 flex-row gap-2.5 rounded-xl bg-amber-50/70 p-3.5 dark:bg-amber-500/5">
              <Icon name="sparkles" size={16} color={colors.points} />
              <Txt className="flex-1 text-sm leading-6 text-zinc-700 dark:text-zinc-300">
                <Txt weight="semibold" className="text-sm">
                  Fun fact{' '}
                </Txt>
                {funFact}
              </Txt>
            </View>
          ) : null}

          <View className="mt-4 flex-row flex-wrap items-center justify-between gap-2 border-t border-line pt-3 dark:border-ink-line">
            <View className="flex-1 flex-row items-center gap-1.5">
              <Icon name="library" size={13} color={colors.mutedDark} />
              <Muted className="flex-1 text-xs">{source}</Muted>
            </View>
            <Pressable
              accessibilityRole="button"
              accessibilityLabel={reported ? 'Reported. Thank you' : 'Report a wrong answer'}
              disabled={reported}
              onPress={onReport}
              hitSlop={8}
              className="min-h-9 flex-row items-center gap-1.5 rounded-lg px-2 active:bg-zinc-100 web:hover:bg-zinc-100 dark:active:bg-white/5 dark:web:hover:bg-white/5"
            >
              <Icon
                name={reported ? 'check-circle' : 'flag'}
                size={13}
                color={reported ? colors.success : colors.mutedDark}
              />
              <Muted className="text-xs">{reported ? 'Thanks, reported' : 'Report an error'}</Muted>
            </Pressable>
          </View>
        </View>
      </View>
    </Animated.View>
  );
}
