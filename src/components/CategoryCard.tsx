/**
 * CategoryCard — one subject on the Home screen ("Slate & Teal").
 * Every subject has ONE drop a day (opening at 4 AM), so the card is simple:
 *   - a soft subject-coloured band with the 3D icon, name and a status pill
 *   - today's drop title (or a calm line while it is not open yet)
 *   - ONE clear next step: Play, a score when done, a catch-up, or the opening time
 * Tap the top part to open the subject page (it presses down a little).
 */
import { router } from 'expo-router';
import { Pressable, View } from 'react-native';
import Animated from 'react-native-reanimated';
import { twMerge } from 'tailwind-merge';

import type { DropSlot } from '@/features/drops/status';
import type { DropResult } from '@/features/progress/store';
import { useColorScheme } from '@/hooks/useScheme';
import { categoryHref, quizHref, resultsHref } from '@/lib/routes';
import type { Category, IndexEntry } from '@/lib/schema';
import { localClockLabel } from '@/lib/time';
import { displayTitle } from '@/lib/title';
import { categoryTone, colors, withAlpha } from '@/theme';

import { Button, usePress } from './Button';
import { CARD_CLASSES, CARD_PRESSABLE_CLASSES } from './Card';
import { CategoryIcon } from './CategoryIcon';
import { Icon } from './Icon';
import { Muted, Txt } from './Txt';

interface CategoryCardProps {
  category: Category;
  slots: DropSlot[];
  offsetMinutes: number;
  getResult: (slot: DropSlot) => DropResult | undefined;
  /** Latest available drop, shown when today's drop is missing. */
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
  const press = usePress(0.985);
  const tone = categoryTone(category.color, dark);
  // One drop a day: today's slot (the first one).
  const slot = slots[0];
  const result = slot ? getResult(slot) : undefined;
  const status = slot?.status ?? 'missing';
  const time = slot ? localClockLabel(slot.time, offsetMinutes) : '';
  const title = slot?.entry ? displayTitle(slot.entry.title) : null;

  const pill =
    status === 'done'
      ? {
          text: `${result?.correctCount ?? 0}/${result?.items.length ?? 5}`,
          icon: 'check' as const,
        }
      : status === 'available'
        ? { text: 'Open', icon: null }
        : status === 'missing'
          ? { text: 'Late', icon: null }
          : { text: time, icon: 'lock' as const };

  return (
    <Animated.View style={press.style} className="flex-1">
      <View className={twMerge(CARD_CLASSES, CARD_PRESSABLE_CLASSES, 'flex-1 overflow-hidden')}>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel={`${category.name}. ${category.tagline}. ${status === 'done' ? 'Done today' : status === 'available' ? 'Open now' : `Opens at ${time}`}. Open subject`}
          onPress={() => router.push(categoryHref(category.id))}
          onPressIn={press.onPressIn}
          onPressOut={press.onPressOut}
          className="flex-1"
        >
          {/* Subject band */}
          <View
            className="flex-row items-center gap-3 px-5 pb-4 pt-5"
            style={{ backgroundColor: withAlpha(category.color, dark ? 0.1 : 0.07) }}
          >
            <CategoryIcon category={category} size="md" />
            <View className="flex-1">
              <Txt weight="display" className="text-[17px] leading-6" numberOfLines={1}>
                {category.name}
              </Txt>
              <Muted className="text-[12.5px]" numberOfLines={1}>
                {category.tagline}
              </Muted>
            </View>
            <View
              className={twMerge(
                'flex-row items-center gap-1 rounded-full px-2.5 py-1',
                status === 'available' && 'bg-brand-600 dark:bg-brand-400',
                status === 'done' && 'bg-emerald-50 dark:bg-emerald-500/15',
                (status === 'upcoming' || status === 'locked' || status === 'missing') &&
                  'bg-white/80 dark:bg-white/[0.06]',
              )}
            >
              {status === 'available' ? (
                <View className="h-1.5 w-1.5 rounded-full bg-white dark:bg-ink" />
              ) : pill.icon ? (
                <Icon
                  name={pill.icon}
                  size={11}
                  strokeWidth={status === 'done' ? 3 : 2}
                  color={
                    status === 'done' ? colors.success : dark ? colors.mutedDark : colors.muted
                  }
                />
              ) : null}
              <Txt
                weight="mono"
                className={twMerge(
                  'text-[11.5px]',
                  status === 'available' && 'text-white dark:text-ink',
                  status === 'done' && 'text-emerald-700 dark:text-emerald-300',
                  status !== 'available' && status !== 'done' && 'text-zinc-600 dark:text-zinc-300',
                )}
              >
                {pill.text}
              </Txt>
            </View>
          </View>

          {/* Today's drop */}
          <View className="flex-1 px-5 pt-4">
            <Txt
              weight="mono"
              className="text-[10.5px] uppercase tracking-[1.2px]"
              style={{ color: tone }}
            >
              Today&apos;s drop · 5 questions
            </Txt>
            <Txt weight="semibold" className="mt-1.5 text-[15px] leading-[22px]" numberOfLines={2}>
              {title ??
                (status === 'missing'
                  ? 'Today’s questions are on their way.'
                  : `New questions at ${time}.`)}
            </Txt>
          </View>
        </Pressable>

        {/* The one next step */}
        <View className="px-5 pb-5 pt-4">
          {status === 'available' && slot?.entry ? (
            <Button
              label="Start drop"
              size="md"
              icon="play"
              onPress={() => slot.entry && router.push(quizHref(slot.entry))}
              accessibilityHint={`Starts ${title}`}
            />
          ) : status === 'done' && slot?.entry ? (
            <Button
              label="See results"
              size="md"
              variant="secondary"
              icon="check-circle"
              onPress={() => slot.entry && router.push(resultsHref(slot.entry))}
            />
          ) : status === 'missing' && catchUp ? (
            <Button
              label="Play the latest"
              size="md"
              variant="soft"
              icon="arrow-right"
              iconRight
              onPress={() => router.push(quizHref(catchUp))}
              accessibilityHint={`Plays ${displayTitle(catchUp.title)}`}
            />
          ) : (
            <View className="h-[46px] flex-row items-center justify-center gap-2 rounded-xl bg-zinc-100 dark:bg-ink-raised">
              <Icon name="clock" size={14} color={dark ? colors.mutedDark : colors.muted} />
              <Muted className="text-[13px]">
                {status === 'missing' ? 'Check back soon' : `Opens at ${time}`}
              </Muted>
            </View>
          )}
        </View>
      </View>
    </Animated.View>
  );
}
