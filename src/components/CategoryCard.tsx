/**
 * CategoryCard — one subject as a ROW in the Today list (flat, black and white).
 * Every subject has ONE drop a day (opening at 4 AM):
 *   [icon]  Subject                                   [ Start ]
 *           Drop title · 5 questions                  / 4/5 ✓ / 4:00 AM
 * Tap the row to open the subject page; the button starts the drop.
 */
import { router } from 'expo-router';
import { Pressable, View } from 'react-native';
import { twMerge } from 'tailwind-merge';

import type { DropSlot } from '@/features/drops/status';
import type { DropResult } from '@/features/progress/store';
import { useColorScheme } from '@/hooks/useScheme';
import { categoryHref, quizHref, resultsHref } from '@/lib/routes';
import type { Category, IndexEntry } from '@/lib/schema';
import { localClockLabel } from '@/lib/time';
import { displayTitle } from '@/lib/title';
import { colors } from '@/theme';

import { Button } from './Button';
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
  /** Draw a hairline above the row (every row but the first). */
  divider?: boolean;
}

export function CategoryCard({
  category,
  slots,
  offsetMinutes,
  getResult,
  catchUp,
  divider,
}: CategoryCardProps) {
  const dark = useColorScheme() === 'dark';
  const slot = slots[0];
  const result = slot ? getResult(slot) : undefined;
  const status = slot?.status ?? 'missing';
  const time = slot ? localClockLabel(slot.time, offsetMinutes) : '';
  const title = slot?.entry ? displayTitle(slot.entry.title) : null;

  const subline =
    status === 'available' || status === 'done'
      ? `${title} · 5 questions`
      : status === 'missing'
        ? 'Running late — check back soon'
        : `Opens at ${time}`;

  return (
    <View
      className={twMerge(
        'flex-row items-center gap-3 px-4 py-3.5 md:px-5',
        divider && 'border-t border-line dark:border-ink-line',
      )}
    >
      <Pressable
        accessibilityRole="button"
        accessibilityLabel={`${category.name}. ${subline}. Open subject`}
        onPress={() => router.push(categoryHref(category.id))}
        className="flex-1 flex-row items-center gap-3.5 active:opacity-70 web:hover:opacity-80"
      >
        <CategoryIcon category={category} size="md" />
        <View className="flex-1">
          <Txt weight="medium" className="text-[15px] leading-5" numberOfLines={1}>
            {category.name}
          </Txt>
          <Muted className="mt-0.5 text-[13px] leading-5" numberOfLines={1}>
            {subline}
          </Muted>
        </View>
      </Pressable>

      {status === 'available' && slot?.entry ? (
        <Button
          label="Start"
          size="sm"
          onPress={() => slot.entry && router.push(quizHref(slot.entry))}
          accessibilityHint={`Starts ${title}`}
        />
      ) : status === 'done' && slot?.entry ? (
        <Pressable
          accessibilityRole="button"
          accessibilityLabel={`Done, ${result?.correctCount ?? 0} of ${result?.items.length ?? 5} correct. See results`}
          onPress={() => slot.entry && router.push(resultsHref(slot.entry))}
          className="h-8 flex-row items-center gap-1.5 rounded-md px-2 active:bg-zinc-100 web:hover:bg-zinc-100 dark:active:bg-white/5 dark:web:hover:bg-white/5"
        >
          <Icon name="check" size={14} color={colors.success} strokeWidth={2.5} />
          <Txt weight="mono" className="text-[13px]">
            {result?.correctCount ?? 0}/{result?.items.length ?? 5}
          </Txt>
        </Pressable>
      ) : status === 'missing' && catchUp ? (
        <Button
          label="Play latest"
          size="sm"
          variant="secondary"
          onPress={() => router.push(quizHref(catchUp))}
          accessibilityHint={`Plays ${displayTitle(catchUp.title)}`}
        />
      ) : (
        <View className="flex-row items-center gap-1.5 px-1">
          <Icon name="lock" size={12} color={dark ? '#737373' : '#A3A3A3'} />
          <Txt weight="mono" className="text-[12.5px] text-zinc-500 dark:text-zinc-500">
            {status === 'missing' ? 'Soon' : time}
          </Txt>
        </View>
      )}
    </View>
  );
}
