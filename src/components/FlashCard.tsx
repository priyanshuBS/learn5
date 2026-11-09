/**
 * FlashCard — a fact card that flips.
 *   Front (indigo gradient): "Did you know?" + the fact.
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
import { colors, HERO_GRADIENT, HERO_LIP, GLOW } from '@/theme';

import { CARD_CLASSES } from './Card';
import { Glow } from './Glow';
import { Gradient } from './Gradient';
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
      <Icon
        name="refresh"
        size={14}
        color={
          showBack ? (scheme === 'dark' ? colors.mutedDark : colors.muted) : 'rgba(255,255,255,0.7)'
        }
      />
      <Txt
        weight="medium"
        className={twMerge(
          'text-[13px]',
          showBack ? 'text-zinc-500 dark:text-zinc-400' : 'text-white/70 dark:text-white/70',
        )}
      >
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
              <View className="flex-row items-center gap-2">
                <Icon name="lightbulb" size={16} color={colors.brand} />
                <Txt
                  weight="semibold"
                  className="text-[11px] uppercase tracking-widest text-brand-700 dark:text-brand-300"
                >
                  Why it’s true
                </Txt>
              </View>
              <Txt className="mt-4 text-[17px] leading-8 text-zinc-800 dark:text-zinc-200">
                {item.explanation}
              </Txt>
              {item.funFact ? (
                <View className="mt-4 flex-row gap-2.5 rounded-xl bg-amber-50/70 p-3.5 dark:bg-amber-500/5">
                  <Icon name="sparkles" size={16} color={colors.points} />
                  <Txt className="flex-1 text-sm leading-6 text-zinc-700 dark:text-zinc-300">
                    {item.funFact}
                  </Txt>
                </View>
              ) : null}
            </View>
            {hint}
          </View>
        ) : (
          <Gradient
            colors={HERO_GRADIENT}
            lip={HERO_LIP}
            radius={24}
            className="min-h-72 justify-between p-6 md:p-8"
          >
            <Glow color={GLOW.violet} size={380} opacity={0.55} style={{ top: -180, left: -140 }} />
            <Glow
              color={GLOW.cyan}
              size={300}
              opacity={0.35}
              style={{ bottom: -160, right: -110 }}
            />

            <View>
              <View className="flex-row items-center gap-2">
                <Icon name="sparkles" size={16} color={colors.brandOnDark} />
                <Txt
                  weight="semibold"
                  className="text-[11px] uppercase tracking-widest text-brand-200 dark:text-brand-200"
                >
                  Did you know?
                </Txt>
              </View>
              <Txt
                weight="semibold"
                className="mt-5 text-2xl leading-9 tracking-tight text-white dark:text-white md:text-[26px] md:leading-10"
              >
                {item.fact}
              </Txt>
            </View>
            {hint}
          </Gradient>
        )}
      </Pressable>
    </Animated.View>
  );
}
