/**
 * CategoryCard — one subject as a quiet ROW on Today: a small colour dot, the name,
 *   Math                                         Start →
 *   Everyday Math Fun                             (or ✓ 4/5, or 4:00 AM)
 * A hairline above every row but the first. Tap the left side to open the subject.
 */
import { router } from 'expo-router';
import { Pressable, View } from 'react-native';
import { twMerge } from 'tailwind-merge';

import type { DropSlot } from '@/features/drops/status';
import type { DropResult } from '@/features/progress/store';
import { categoryHref, quizHref, resultsHref } from '@/lib/routes';
import type { Category, IndexEntry } from '@/lib/schema';
import { localClockLabel } from '@/lib/time';
import { displayTitle } from '@/lib/title';
import { colors } from '@/theme';

import { Icon } from './Icon';
import { Muted, Txt } from './Txt';

interface CategoryCardProps {
  category: Category;
  slots: DropSlot[];
  offsetMinutes: number;
  getResult: (slot: DropSlot) => DropResult | undefined;
  /** Latest available drop, shown when today's drop is missing. */
  catchUp: IndexEntry | null;
  /** Hairline above the row (every row but the first). */
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
  const slot = slots[0];
  const result = slot ? getResult(slot) : undefined;
  const status = slot?.status ?? 'missing';
  const time = slot ? localClockLabel(slot.time, offsetMinutes) : '';
  const title = slot?.entry ? displayTitle(slot.entry.title) : null;
  const subline = title ?? (status === 'missing' ? 'On its way' : `Opens at ${time}`);

  const action =
    status === 'available' && slot?.entry
      ? { label: 'Start', onPress: () => slot.entry && router.push(quizHref(slot.entry)) }
      : status === 'missing' && catchUp
        ? { label: 'Play latest', onPress: () => router.push(quizHref(catchUp)) }
        : null;

  return (
    <View
      className={twMerge(
        'flex-row items-center gap-3.5 py-4',
        divider && 'border-t border-line dark:border-ink-line',
      )}
    >
      <Pressable
        accessibilityRole="button"
        accessibilityLabel={`${category.name}. ${subline}. Open subject`}
        onPress={() => router.push(categoryHref(category.id))}
        className="flex-1 flex-row items-center gap-3.5 active:opacity-60 web:hover:opacity-75"
      >
        <View className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: category.color }} />
        <View className="flex-1">
          <Txt weight="semibold" className="text-[17px] leading-6" numberOfLines={1}>
            {category.name}
          </Txt>
          <Muted className="text-[14px] leading-5" numberOfLines={1}>
            {subline}
          </Muted>
        </View>
      </Pressable>

      {action ? (
        <Pressable
          accessibilityRole="button"
          accessibilityLabel={`${action.label} ${category.name}`}
          onPress={action.onPress}
          hitSlop={10}
          className="flex-row items-center gap-1.5 rounded-full bg-brand-600 px-4 py-2 active:opacity-80 web:hover:bg-brand-700 dark:bg-brand-500"
        >
          <Txt weight="semibold" className="text-[13.5px] text-white dark:text-white">
            {action.label}
          </Txt>
          <Icon name="arrow-right" size={14} color="#FFFFFF" />
        </Pressable>
      ) : status === 'done' && slot?.entry ? (
        <Pressable
          accessibilityRole="button"
          accessibilityLabel={`Done, ${result?.correctCount ?? 0} of ${result?.items.length ?? 5}. See results`}
          onPress={() => slot.entry && router.push(resultsHref(slot.entry))}
          hitSlop={10}
          className="flex-row items-center gap-1.5 active:opacity-60"
        >
          <Icon name="check" size={15} color={colors.success} strokeWidth={2.5} />
          <Txt weight="mono" className="text-[13px] text-zinc-600 dark:text-zinc-400">
            {result?.correctCount ?? 0}/{result?.items.length ?? 5}
          </Txt>
        </Pressable>
      ) : (
        <Txt weight="mono" className="text-[12.5px] text-zinc-400 dark:text-zinc-500">
          {status === 'missing' ? 'soon' : time}
        </Txt>
      )}
    </View>
  );
}
