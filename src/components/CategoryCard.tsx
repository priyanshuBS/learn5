/**
 * CategoryCard — one subject on the Home screen, as a glass tile with a soft glow
 * in the subject's colour (priyanshusingh.co.in style).
 *   - today's 3 drops (morning / afternoon / evening) as small pills
 *   - ONE clear next step: a light "Play" pill, when the next drop opens, or "All done"
 * Tap the tile to open the subject page.
 */
import { router } from 'expo-router';
import { Pressable, View } from 'react-native';
import Animated from 'react-native-reanimated';
import { twMerge } from 'tailwind-merge';

import { SLOT_NAMES, type DropSlot } from '@/features/drops/status';
import type { DropResult } from '@/features/progress/store';
import { useColorScheme } from '@/hooks/useScheme';
import { categoryHref, quizHref } from '@/lib/routes';
import type { Category, IndexEntry } from '@/lib/schema';
import { localClockLabel } from '@/lib/time';
import { CATEGORY_ICONS, categoryTone, colors, SLOT_ICONS, withAlpha } from '@/theme';

import { Button, usePress } from './Button';
import { CARD_CLASSES, CARD_PRESSABLE_CLASSES } from './Card';
import { Glow } from './Glow';
import { Icon, type IconName } from './Icon';
import { Eyebrow, Muted, Txt } from './Txt';

interface CategoryCardProps {
  category: Category;
  slots: DropSlot[];
  offsetMinutes: number;
  getResult: (slot: DropSlot) => DropResult | undefined;
  /** Latest available drop, shown when one of today's drops is missing. */
  catchUp: IndexEntry | null;
}

export function CategoryCard({
  category,
  slots,
  offsetMinutes,
  getResult,
  catchUp,
}: CategoryCardProps) {
  const dark = useColorScheme() === 'dark';
  const press = usePress(0.98);
  const tone = categoryTone(category.color, dark);
  const doneCount = slots.filter((s) => s.status === 'done').length;
  const open = slots.find((s) => s.status === 'available' && s.entry);
  const next = slots.find((s) => s.status === 'upcoming');
  const missing = slots.some((s) => s.status === 'missing');
  const allDone = slots.length > 0 && doneCount === slots.length;
  const scoreToday = slots.reduce((n, s) => n + (getResult(s)?.correctCount ?? 0), 0);
  const icon = CATEGORY_ICONS[category.id];
  const mutedIcon = dark ? colors.mutedDark : colors.muted;

  // Two tap areas side by side (never one inside the other — on the website a
  // button inside a button is invalid HTML): the top opens the subject, the
  // bottom row holds the Play button.
  return (
    <Animated.View style={press.style}>
      <View className={twMerge(CARD_CLASSES, CARD_PRESSABLE_CLASSES, 'overflow-hidden p-6')}>
        <Glow
          color={category.color}
          size={260}
          opacity={dark ? 0.28 : 0.14}
          style={{ top: -120, left: -110 }}
        />

        <Pressable
          accessibilityRole="button"
          accessibilityLabel={`${category.name}. ${category.tagline}. ${doneCount} of ${slots.length} drops done today. Open subject`}
          onPress={() => router.push(categoryHref(category.id))}
          onPressIn={press.onPressIn}
          onPressOut={press.onPressOut}
        >
          <View className="flex-row items-start justify-between">
            <View
              className="h-12 w-12 items-center justify-center rounded-2xl border"
              style={{
                borderColor: withAlpha(tone, 0.35),
                backgroundColor: withAlpha(tone, dark ? 0.14 : 0.1),
              }}
            >
              {icon ? (
                <Icon name={icon} size={22} color={tone} />
              ) : (
                <Txt className="text-xl">{category.emoji}</Txt>
              )}
            </View>
            <View className="h-9 w-9 items-center justify-center rounded-full border border-line dark:border-white/15">
              <Icon name="arrow-up-right" size={15} color={mutedIcon} />
            </View>
          </View>

          <Txt weight="bold" className="mt-6 text-[22px] leading-7">
            {category.name}
          </Txt>
          <Muted className="mt-1 text-[14px]" numberOfLines={1}>
            {category.tagline}
          </Muted>

          {/* Today's 3 drops */}
          <View className="mt-5 flex-row gap-2">
            {slots.map((slot) => {
              const done = slot.status === 'done';
              const isOpen = slot.status === 'available';
              return (
                <View
                  key={slot.drop}
                  className={twMerge(
                    'h-8 flex-1 flex-row items-center justify-center rounded-full border',
                    !done && !isOpen && 'border-line dark:border-white/10',
                  )}
                  style={
                    done
                      ? { backgroundColor: tone, borderColor: tone }
                      : isOpen
                        ? {
                            borderColor: withAlpha(tone, 0.6),
                            backgroundColor: withAlpha(tone, 0.12),
                          }
                        : undefined
                  }
                >
                  <Icon
                    name={done ? 'check' : (SLOT_ICONS[slot.drop - 1] ?? 'clock')}
                    size={13}
                    color={done ? '#050508' : isOpen ? tone : mutedIcon}
                    strokeWidth={done ? 3 : 2}
                  />
                </View>
              );
            })}
          </View>
          <Eyebrow className="mt-2.5 text-[10px]">
            {doneCount}/{slots.length} today{doneCount > 0 ? ` · ${scoreToday} correct` : ''}
          </Eyebrow>
        </Pressable>

        {/* The one next step */}
        <View className="mt-5">
          {open?.entry ? (
            <View className="flex-row items-center gap-3">
              <Txt weight="semibold" className="flex-1 text-[14px]" numberOfLines={2}>
                {open.entry.title}
              </Txt>
              <Button
                label="Play"
                icon="play"
                size="sm"
                onPress={() => open.entry && router.push(quizHref(open.entry))}
                accessibilityHint={`Starts the ${SLOT_NAMES[open.drop - 1]} drop`}
              />
            </View>
          ) : allDone ? (
            <NextLine icon="check-circle" color={colors.success} text="All done for today" />
          ) : missing && catchUp ? (
            <View className="flex-row items-center gap-3">
              <Muted className="flex-1 text-[13px]" numberOfLines={2}>
                Running late · try “{catchUp.title}”
              </Muted>
              <Button
                label="Play"
                icon="play"
                size="sm"
                variant="secondary"
                onPress={() => router.push(quizHref(catchUp))}
              />
            </View>
          ) : next ? (
            <NextLine
              icon="clock"
              color={mutedIcon}
              text={`${SLOT_NAMES[next.drop - 1]} drop at ${localClockLabel(next.time, offsetMinutes)}`}
            />
          ) : (
            <NextLine icon="moon" color={mutedIcon} text="New drops tomorrow morning" />
          )}
        </View>
      </View>
    </Animated.View>
  );
}

function NextLine({ icon, color, text }: { icon: IconName; color: string; text: string }) {
  return (
    <View className="flex-row items-center gap-2">
      <Icon name={icon} size={14} color={color} />
      <Muted className="text-[13px]">{text}</Muted>
    </View>
  );
}
