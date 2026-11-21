/**
 * FlashCard — a fact card that flips.
 *   Front: "Did you know?" + the fact.
 *   Back (white):            "Why it's true" + the explanation and fun fact.
 *
 * The flip: the card turns to its edge (90°), swaps sides while invisible,
 * then turns back. Works the same on phones and on the website.
 */
import { useEffect, useRef, useState } from 'react';
import { Pressable, View } from 'react-native';

import Animated, {
  Easing,
  useAnimatedStyle,
  useSharedValue,
  withSequence,
  withTiming,
} from 'react-native-reanimated';
import { twMerge } from 'tailwind-merge';

import { useColorScheme } from '@/hooks/useScheme';
import type { FactCardItem } from '@/lib/schema';
import { colors } from '@/theme';

import { CARD_CLASSES } from './Card';
import { Icon } from './Icon';
import { Txt } from './Txt';

const HALF_FLIP_MS = 180;

interface FlashCardProps {
  item: FactCardItem;
  /** false = front (fact), true = back (why). */
  flipped: boolean;
  onToggle: () => void;
}

export function FlashCard({ item, flipped, onToggle }: FlashCardProps) {
  const scheme = useColorScheme();
  const rotation = useSharedValue(0);
  // Which side is drawn right now (changes halfway through the flip).
  const [showBack, setShowBack] = useState(flipped);
  const lastFlipped = useRef(flipped);

  useEffect(() => {
    if (lastFlipped.current === flipped) return;
    lastFlipped.current = flipped;
    rotation.set(
      withSequence(
        withTiming(90, { duration: HALF_FLIP_MS, easing: Easing.in(Easing.quad) }),
        withTiming(0, { duration: HALF_FLIP_MS, easing: Easing.out(Easing.quad) }),
      ),
    );
    const timer = setTimeout(() => setShowBack(flipped), HALF_FLIP_MS);
    return () => clearTimeout(timer);
  }, [flipped, rotation]);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ perspective: 1000 }, { rotateY: `${rotation.get()}deg` }],
  }));

  const hint = (
    <View className="mt-8 flex-row items-center gap-1.5">
      <Icon name="refresh" size={14} color={scheme === 'dark' ? colors.mutedDark : colors.muted} />
      <Txt weight="medium" className="text-[13px] text-zinc-500 dark:text-zinc-400">
        Tap to flip
      </Txt>
    </View>
  );

  return (
    <Animated.View style={animatedStyle}>
      <Pressable
        accessibilityRole="button"
        accessibilityLabel={
          showBack
            ? `Why it's true: ${item.explanation}. Tap to see the fact again.`
            : `Did you know? ${item.fact}. Tap to flip and see why.`
        }
        onPress={onToggle}
      >
        {showBack ? (
          <View className={twMerge(CARD_CLASSES, 'min-h-72 justify-between p-6 md:p-8')}>
            <View>
              <View className="flex-row items-center gap-2.5">
                <Txt
                  weight="script"
                  className="text-[24px] leading-7 text-brand-600 dark:text-brand-300"
                >
                  why it’s true
                </Txt>
              </View>
              <Txt className="mt-4 text-[17px] leading-7 text-zinc-800 dark:text-zinc-200">
                {item.explanation}
              </Txt>
              {item.funFact ? (
                <View className="mt-5 border-l-2 border-zinc-200 pl-3.5 dark:border-zinc-700">
                  <Txt className="text-sm leading-6 text-zinc-600 dark:text-zinc-400">
                    {item.funFact}
                  </Txt>
                </View>
              ) : null}
            </View>
            {hint}
          </View>
        ) : (
          <View className={twMerge(CARD_CLASSES, 'min-h-72 justify-between p-6 md:p-8')}>
            <View>
              <View className="flex-row items-center gap-2.5">
                <Txt
                  weight="script"
                  className="text-[24px] leading-7 text-brand-600 dark:text-brand-300"
                >
                  did you know?
                </Txt>
                <Txt weight="semibold" className="text-[13px] text-amber-700 dark:text-amber-300">
                  Did you know??
                </Txt>
              </View>
              <Txt
                weight="display"
                className="mt-4 text-[30px] leading-[36px] md:text-[34px] md:leading-[40px]"
              >
                {item.fact}
              </Txt>
            </View>
            {hint}
          </View>
        )}
      </Pressable>
    </Animated.View>
  );
}
