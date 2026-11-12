/**
 * CategoryCard — one subject on the Home screen.
 *   - the subject (solid icon, name, tagline) and today's count, e.g. "1/3"
 *   - today's 3 drops as chips: Done / Open / Late / opening time
 *   - ONE clear next step: a "Play" button when a drop is open, otherwise
 *     a quiet line (catch-up, next drop time, or all done)
 * Tap the top part to open the subject page.
 */
import { router } from 'expo-router';
import { useEffect, type ReactNode } from 'react';
import { Pressable, View } from 'react-native';
import Animated, {
  Easing,
  useAnimatedStyle,
  useReducedMotion,
  useSharedValue,
  withRepeat,
  withTiming,
} from 'react-native-reanimated';
import { twMerge } from 'tailwind-merge';

import { SLOT_NAMES, type DropSlot } from '@/features/drops/status';
import type { DropResult } from '@/features/progress/store';
import { DROPS_TO_MOVE, type TierInfo } from '@/features/tiers/tiers';
import { useColorScheme } from '@/hooks/useScheme';
import { categoryHref, quizHref } from '@/lib/routes';
import type { Category, IndexEntry } from '@/lib/schema';
import { localClockLabel } from '@/lib/time';
import { displayTitle } from '@/lib/title';
import { categoryTone, colors, withAlpha } from '@/theme';

import { Button } from './Button';
import { CARD_CLASSES, CARD_PRESSABLE_CLASSES } from './Card';
import { CategoryIcon } from './CategoryIcon';
import { Icon, type IconName } from './Icon';
import { Muted, Txt } from './Txt';

interface CategoryCardProps {
  category: Category;
  slots: DropSlot[];
  offsetMinutes: number;
  getResult: (slot: DropSlot) => DropResult | undefined;
  /** Latest available drop, shown when one of today's drops is missing. */
  catchUp: IndexEntry | null;
  /** The player's question tier in this category. */
  tier?: TierInfo;
}

export function CategoryCard({
  category,
  slots,
  offsetMinutes,
  getResult,
  catchUp,
  tier,
}: CategoryCardProps) {
  const dark = useColorScheme() === 'dark';
  const doneCount = slots.filter((s) => s.status === 'done').length;
  const open = slots.find((s) => s.status === 'available' && s.entry);
  const next = slots.find((s) => s.status === 'upcoming');
  const missing = slots.some((s) => s.status === 'missing');
  const allDone = slots.length > 0 && doneCount === slots.length;
  const scoreToday = slots.reduce((n, s) => n + (getResult(s)?.correctCount ?? 0), 0);
  const mutedIcon = dark ? colors.mutedDark : colors.muted;

  // Two tap areas one above the other (never one inside the other — on the
  // website a button inside a button is invalid HTML).
  return (
    <View className={twMerge(CARD_CLASSES, CARD_PRESSABLE_CLASSES, 'overflow-hidden')}>
      <Pressable
        accessibilityRole="button"
        accessibilityLabel={`${category.name}. ${category.tagline}. ${doneCount} of ${slots.length} drops done today. Open subject`}
        onPress={() => router.push(categoryHref(category.id))}
        className="p-5"
      >
        {/* A soft glow in the subject's colour */}
        <View
          pointerEvents="none"
          className="absolute -right-12 -top-14 h-40 w-40 rounded-full"
          style={{ backgroundColor: withAlpha(category.color, dark ? 0.16 : 0.1) }}
        />
        <View className="flex-row items-center gap-3.5">
          <CategoryIcon category={category} size="md" />
          <View className="flex-1">
            <Txt weight="display" className="text-[19px] leading-6" numberOfLines={1}>
              {category.name}
            </Txt>
            <Muted className="mt-0.5 text-[13px]" numberOfLines={1}>
              {category.tagline}
            </Muted>
          </View>
          <View className="items-end">
            <Txt
              weight="display"
              className="text-[24px] leading-8"
              style={{ color: categoryTone(category.color, dark) }}
            >
              {doneCount}
              <Txt weight="display" className="text-[15px] text-zinc-400 dark:text-zinc-500">
                /{slots.length}
              </Txt>
            </Txt>
          </View>
        </View>

        {/* Question tier */}
        {tier ? <TierLine tier={tier} color={categoryTone(category.color, dark)} /> : null}

        {/* Today's 3 drops */}
        <View className="mt-4 flex-row gap-1.5">
          {slots.map((slot) => (
            <SlotChip
              key={slot.drop}
              slot={slot}
              label={localClockLabel(slot.time, offsetMinutes)}
            />
          ))}
        </View>
      </Pressable>

      {/* The one next step */}
      {open?.entry ? (
        <Footer>
          <View className="flex-row items-center gap-3">
            <View className="flex-1">
              <Muted className="text-[12px]">{SLOT_NAMES[open.drop - 1]} drop · open now</Muted>
              <Txt weight="medium" className="text-[14px] leading-5" numberOfLines={1}>
                {displayTitle(open.entry.title)}
              </Txt>
            </View>
            <Button
              label="Play"
              size="sm"
              icon="play"
              onPress={() => open.entry && router.push(quizHref(open.entry))}
              accessibilityHint={`Starts ${displayTitle(open.entry.title)}`}
            />
          </View>
        </Footer>
      ) : allDone ? (
        <Footer>
          <NextLine
            icon="check-circle"
            color={colors.success}
            text={`All done today · ${scoreToday} correct`}
          />
        </Footer>
      ) : missing && catchUp ? (
        <Pressable
          accessibilityRole="button"
          accessibilityLabel={`Running late. Play the latest drop instead: ${displayTitle(catchUp.title)}`}
          onPress={() => router.push(quizHref(catchUp))}
          className="flex-row items-center gap-3 border-t border-line px-5 py-3.5 active:bg-black/5 web:hover:bg-black/[0.03] dark:border-ink-line dark:active:bg-white/5 dark:web:hover:bg-white/[0.03]"
        >
          <View className="flex-1">
            <Muted className="text-[12px]">Running late · play the latest instead</Muted>
            <Txt weight="medium" className="text-[14px] leading-5" numberOfLines={1}>
              {displayTitle(catchUp.title)}
            </Txt>
          </View>
          <Icon name="arrow-right" size={17} color={dark ? colors.textDark : colors.text} />
        </Pressable>
      ) : next ? (
        <Footer>
          <NextLine
            icon="clock"
            color={mutedIcon}
            text={`Next drop at ${localClockLabel(next.time, offsetMinutes)}${doneCount > 0 ? ` · ${scoreToday} correct so far` : ''}`}
          />
        </Footer>
      ) : (
        <Footer>
          <NextLine icon="moon" color={mutedIcon} text="New drops tomorrow morning" />
        </Footer>
      )}
    </View>
  );
}

/** One of today's drops as a small chip. */
function SlotChip({ slot, label }: { slot: DropSlot; label: string }) {
  const name = SLOT_NAMES[slot.drop - 1];
  switch (slot.status) {
    case 'done':
      return (
        <View
          accessible
          accessibilityLabel={`${name} drop done`}
          className="h-8 flex-1 flex-row items-center justify-center gap-1 rounded-full bg-emerald-50 px-2 dark:bg-emerald-500/15"
        >
          <Icon name="check" size={12} color={colors.success} strokeWidth={3} />
          <Txt weight="semibold" className="text-[12px] text-emerald-700 dark:text-emerald-300">
            Done
          </Txt>
        </View>
      );
    case 'available':
      return (
        <View
          accessible
          accessibilityLabel={`${name} drop open now`}
          className="h-8 flex-1 flex-row items-center justify-center gap-1.5 rounded-full bg-pop px-2 dark:bg-pop-light"
        >
          <PulseDot />
          <Txt weight="semibold" className="text-[12px] text-white dark:text-[#2A0E02]">
            Open
          </Txt>
        </View>
      );
    case 'missing':
      return (
        <View
          accessible
          accessibilityLabel={`${name} drop is running late`}
          className="h-8 flex-1 flex-row items-center justify-center rounded-full border border-dashed border-zinc-300 px-2 dark:border-zinc-700"
        >
          <Txt className="text-[12px] text-zinc-500 dark:text-zinc-400">Late</Txt>
        </View>
      );
    default:
      return (
        <View
          accessible
          accessibilityLabel={`${name} drop opens at ${label}`}
          className="h-8 flex-1 flex-row items-center justify-center rounded-full border border-line px-2 dark:border-ink-line"
        >
          <Txt className="text-[12px] text-zinc-500 dark:text-zinc-400" numberOfLines={1}>
            {label}
          </Txt>
        </View>
      );
  }
}

/** A small dot that pulses with a glow ring: "open now". */
function PulseDot() {
  const reduce = useReducedMotion();
  const t = useSharedValue(0);
  useEffect(() => {
    if (reduce) return;
    t.set(withRepeat(withTiming(1, { duration: 1400, easing: Easing.out(Easing.quad) }), -1));
  }, [reduce, t]);
  const ring = useAnimatedStyle(() => ({
    opacity: 0.7 * (1 - t.get()),
    transform: [{ scale: 1 + t.get() * 2.2 }],
  }));
  return (
    <View className="h-1.5 w-1.5 items-center justify-center">
      <Animated.View
        style={[
          { position: 'absolute', width: 6, height: 6, borderRadius: 3, backgroundColor: '#fff' },
          ring,
        ]}
      />
      <View className="h-1.5 w-1.5 rounded-full bg-white dark:bg-[#2A0E02]" />
    </View>
  );
}

/** "Intermediate · 2/3 to Advanced" with 3 small progress dots. */
export function TierLine({ tier, color }: { tier: TierInfo; color: string }) {
  return (
    <View
      accessible
      accessibilityLabel={
        tier.nextName
          ? `${tier.name} questions. ${tier.strongInARow} of ${DROPS_TO_MOVE} strong drops towards ${tier.nextName}`
          : `${tier.name} questions, the hardest tier`
      }
      className="mt-4 flex-row items-center gap-2"
    >
      <Icon name="chevrons-up" size={14} color={color} strokeWidth={2.5} />
      <Txt weight="semibold" className="text-[12px]" style={{ color }}>
        {tier.name}
      </Txt>
      {tier.nextName ? (
        <>
          <View className="flex-row gap-1">
            {Array.from({ length: DROPS_TO_MOVE }, (_, i) => (
              <View
                key={i}
                className="h-1.5 w-4 rounded-full bg-zinc-200 dark:bg-ink-line"
                style={i < tier.strongInARow ? { backgroundColor: color } : undefined}
              />
            ))}
          </View>
          <Muted className="text-[12px]" numberOfLines={1}>
            to {tier.nextName}
          </Muted>
        </>
      ) : (
        <Muted className="text-[12px]">· top tier</Muted>
      )}
    </View>
  );
}

function Footer({ children }: { children: ReactNode }) {
  return <View className="border-t border-line px-5 py-3.5 dark:border-ink-line">{children}</View>;
}

function NextLine({ icon, color, text }: { icon: IconName; color: string; text: string }) {
  return (
    <View className="min-h-9 flex-row items-center gap-2">
      <Icon name={icon} size={15} color={color} />
      <Muted className="text-[13px]">{text}</Muted>
    </View>
  );
}
