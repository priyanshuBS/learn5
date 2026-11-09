/**
 * CategoryCard — one subject on the Home screen.
 *   - the subject (icon, name, tagline) and how many of today's drops are done
 *   - today's 3 drops as a small 3-part bar, with each drop's opening time
 *   - ONE clear next step: "Play", when the next drop opens, or "All done"
 * Tap the top part to open the subject page.
 */
import { router } from 'expo-router';
import { Pressable, View } from 'react-native';
import { twMerge } from 'tailwind-merge';

import { SLOT_NAMES, type DropSlot } from '@/features/drops/status';
import type { DropResult } from '@/features/progress/store';
import { useColorScheme } from '@/hooks/useScheme';
import { categoryHref, quizHref } from '@/lib/routes';
import type { Category, IndexEntry } from '@/lib/schema';
import { localClockLabel } from '@/lib/time';
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
}

export function CategoryCard({
  category,
  slots,
  offsetMinutes,
  getResult,
  catchUp,
}: CategoryCardProps) {
  const dark = useColorScheme() === 'dark';
  const tone = categoryTone(category.color, dark);
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
    <View className={twMerge(CARD_CLASSES, CARD_PRESSABLE_CLASSES)}>
      <Pressable
        accessibilityRole="button"
        accessibilityLabel={`${category.name}. ${category.tagline}. ${doneCount} of ${slots.length} drops done today. Open subject`}
        onPress={() => router.push(categoryHref(category.id))}
        className="p-5 pb-4"
      >
        <View className="flex-row items-center gap-3.5">
          <CategoryIcon category={category} size="md" />
          <View className="flex-1">
            <Txt weight="semibold" className="text-[17px] leading-6" numberOfLines={1}>
              {category.name}
            </Txt>
            <Muted className="text-[13px]" numberOfLines={1}>
              {category.tagline}
            </Muted>
          </View>
          <Icon name="chevron-right" size={18} color={mutedIcon} />
        </View>

        {/* Today's 3 drops */}
        <View className="mt-5 flex-row gap-1.5">
          {slots.map((slot) => {
            const done = slot.status === 'done';
            const isOpen = slot.status === 'available';
            return (
              <View key={slot.drop} className="flex-1">
                <View
                  className={twMerge(
                    'h-1.5 rounded-full',
                    !done && !isOpen && 'bg-[#ECEBE7] dark:bg-ink-line',
                  )}
                  style={
                    done
                      ? { backgroundColor: tone }
                      : isOpen
                        ? { backgroundColor: withAlpha(tone, 0.35) }
                        : undefined
                  }
                />
                <Muted className="mt-1.5 text-[12px]" numberOfLines={1}>
                  {done ? 'Done' : localClockLabel(slot.time, offsetMinutes)}
                </Muted>
              </View>
            );
          })}
        </View>
      </Pressable>

      {/* The one next step */}
      <View className="border-t border-line px-5 py-3.5 dark:border-ink-line">
        {open?.entry ? (
          <View className="flex-row items-center gap-3">
            <View className="flex-1">
              <Muted className="text-[12px]">{SLOT_NAMES[open.drop - 1]} drop · open now</Muted>
              <Txt weight="medium" className="text-[14px] leading-5" numberOfLines={1}>
                {open.entry.title}
              </Txt>
            </View>
            <Button
              label="Play"
              size="sm"
              variant="accent"
              onPress={() => open.entry && router.push(quizHref(open.entry))}
              accessibilityHint={`Starts the ${SLOT_NAMES[open.drop - 1]} drop`}
            />
          </View>
        ) : allDone ? (
          <NextLine
            icon="check-circle"
            color={colors.success}
            text={`All done today · ${scoreToday} correct`}
          />
        ) : missing && catchUp ? (
          <View className="flex-row items-center gap-3">
            <Muted className="flex-1 text-[13px]" numberOfLines={2}>
              Running late · try “{catchUp.title}”
            </Muted>
            <Button
              label="Play"
              size="sm"
              variant="secondary"
              onPress={() => router.push(quizHref(catchUp))}
            />
          </View>
        ) : next ? (
          <NextLine
            icon="clock"
            color={mutedIcon}
            text={`Next drop at ${localClockLabel(next.time, offsetMinutes)}${doneCount > 0 ? ` · ${scoreToday} correct so far` : ''}`}
          />
        ) : (
          <NextLine icon="moon" color={mutedIcon} text="New drops tomorrow morning" />
        )}
      </View>
    </View>
  );
}

function NextLine({ icon, color, text }: { icon: IconName; color: string; text: string }) {
  return (
    <View className="min-h-9 flex-row items-center gap-2">
      <Icon name={icon} size={15} color={color} />
      <Muted className="text-[13px]">{text}</Muted>
    </View>
  );
}
