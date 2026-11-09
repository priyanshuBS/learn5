/**
 * CategoryCard — one category on the Home screen: name, today's progress,
 * and today's 3 drops as small tiles (morning / afternoon / evening).
 */
import { router } from 'expo-router';
import { Pressable, View } from 'react-native';
import { twMerge } from 'tailwind-merge';

import { SLOT_NAMES, type DropSlot } from '@/features/drops/status';
import type { DropResult } from '@/features/progress/store';
import { useColorScheme } from '@/hooks/useScheme';
import { categoryHref, quizHref, resultsHref } from '@/lib/routes';
import type { Category, IndexEntry } from '@/lib/schema';
import { localClockLabel } from '@/lib/time';
import { categoryTone, colors } from '@/theme';

import { CARD_CLASSES } from './Card';
import { CategoryIcon } from './CategoryIcon';
import { SlotTile } from './DropCard';
import { Icon } from './Icon';
import { ProgressRing } from './ProgressBar';
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
  const scheme = useColorScheme();
  const doneCount = slots.filter((s) => s.status === 'done').length;
  const hasMissing = slots.some((s) => s.status === 'missing');

  return (
    <View className={twMerge(CARD_CLASSES, 'h-full p-4')}>
      {/* Header: tap to open the category */}
      <Pressable
        accessibilityRole="button"
        accessibilityLabel={`${category.name}. ${category.tagline}. ${doneCount} of ${slots.length} drops done today. Open category`}
        onPress={() => router.push(categoryHref(category.id))}
        className="-m-1.5 flex-row items-center gap-3 rounded-xl p-1.5 active:bg-slate-50 web:hover:bg-slate-50 dark:active:bg-white/5 dark:web:hover:bg-white/[0.03]"
      >
        <CategoryIcon category={category} />
        <View className="flex-1">
          <View className="flex-row items-center gap-1">
            <Txt weight="semibold" className="text-[15px]">
              {category.name}
            </Txt>
            <Icon
              name="chevron-right"
              size={15}
              color={scheme === 'dark' ? colors.mutedDark : colors.muted}
            />
          </View>
          <Muted className="text-[13px]" numberOfLines={1}>
            {category.tagline}
          </Muted>
        </View>
        <ProgressRing
          value={slots.length ? doneCount / slots.length : 0}
          size={34}
          strokeWidth={3.5}
          color={categoryTone(category.color, scheme === 'dark')}
          label={`${doneCount} of ${slots.length} done today`}
        >
          <Txt weight="semibold" className="text-[11px]">
            {doneCount}/{slots.length}
          </Txt>
        </ProgressRing>
      </Pressable>

      {/* Today's 3 drops */}
      <View className="mt-4 flex-row gap-2">
        {slots.map((slot) => {
          const result = getResult(slot);
          const ref = slot.entry ?? { category: category.id, date: '', drop: slot.drop };
          const onPress =
            slot.status === 'available'
              ? () => router.push(quizHref(ref))
              : slot.status === 'done'
                ? () => router.push(resultsHref(ref))
                : slot.status === 'missing'
                  ? () => router.push(categoryHref(category.id))
                  : undefined;
          return (
            <SlotTile
              key={slot.drop}
              drop={slot.drop}
              name={SLOT_NAMES[slot.drop - 1] ?? `Drop ${slot.drop}`}
              timeLabel={localClockLabel(slot.time, offsetMinutes)}
              status={slot.status}
              scoreLabel={result ? `${result.correctCount}/${result.items.length}` : undefined}
              onPress={onPress}
            />
          );
        })}
      </View>

      {/* Never a dead end: offer the latest drop when today's is late */}
      {hasMissing && catchUp ? (
        <Pressable
          accessibilityRole="button"
          accessibilityLabel={`Today's drop is running late. Play the latest drop: ${catchUp.title}`}
          onPress={() => router.push(quizHref(catchUp))}
          className="mt-3 flex-row items-center gap-2 rounded-lg px-1 py-1 active:opacity-70"
        >
          <Muted className="flex-1 text-[13px]" numberOfLines={1}>
            While you wait:{' '}
            <Txt weight="semibold" className="text-[13px] text-brand-600 dark:text-brand-300">
              {catchUp.title}
            </Txt>
          </Muted>
          <Icon name="arrow-right" size={14} color={colors.brand} />
        </Pressable>
      ) : null}
    </View>
  );
}
