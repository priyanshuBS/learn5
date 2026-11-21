/**
 * CategoryCard — one subject on Today ("Scholar" theme): a card in a 2-column grid.
 *   [tile] Subject                      status (New / ✓ 4/5 / 4:00 AM)
 *   TODAY'S DROP
 *   Drop title
 *   5 questions · about 5 min
 *   [ Start drop → ]  /  [ See results ]  /  [ Opens at 4:00 AM ]
 * Tap the top part to open the subject page.
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
import { categoryTone, colors } from '@/theme';

import { Button } from './Button';
import { CARD_CLASSES } from './Card';
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
  /** Kept for older callers. */
  divider?: boolean;
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
  const slot = slots[0];
  const result = slot ? getResult(slot) : undefined;
  const status = slot?.status ?? 'missing';
  const time = slot ? localClockLabel(slot.time, offsetMinutes) : '';
  const title = slot?.entry ? displayTitle(slot.entry.title) : null;
  const total = result?.items.length ?? 5;

  return (
    <View className={twMerge(CARD_CLASSES, 'flex-1 p-5')}>
      <Pressable
        accessibilityRole="button"
        accessibilityLabel={`${category.name}. ${title ?? `Opens at ${time}`}. Open subject`}
        onPress={() => router.push(categoryHref(category.id))}
        className="flex-1 active:opacity-70 web:hover:opacity-90"
      >
        <View className="flex-row items-center gap-3">
          <CategoryIcon category={category} size="md" />
          <View className="flex-1">
            <Txt weight="semibold" className="text-[16px] leading-6" numberOfLines={1}>
              {category.name}
            </Txt>
            <Muted className="text-[12.5px]" numberOfLines={1}>
              {category.tagline}
            </Muted>
          </View>
          {status === 'done' ? (
            <View className="flex-row items-center gap-1 rounded-full bg-emerald-50 px-2.5 py-1 dark:bg-emerald-500/15">
              <Icon name="check" size={12} color={colors.success} strokeWidth={3} />
              <Txt weight="semibold" className="text-[12px] text-emerald-700 dark:text-emerald-300">
                {result?.correctCount ?? 0}/{total}
              </Txt>
            </View>
          ) : status === 'available' ? (
            <View className="rounded-full bg-brand-50 px-2.5 py-1 dark:bg-brand-400/15">
              <Txt weight="semibold" className="text-[12px] text-brand-700 dark:text-brand-300">
                New
              </Txt>
            </View>
          ) : null}
        </View>

        <Txt
          weight="mono"
          className="mt-5 text-[10.5px] uppercase tracking-[1.2px]"
          style={{ color: tone }}
        >
          Today&apos;s drop
        </Txt>
        <Txt weight="semibold" className="mt-1 text-[16px] leading-[23px]" numberOfLines={2}>
          {title ?? (status === 'missing' ? 'Questions on their way' : `New questions at ${time}`)}
        </Txt>
        <Muted className="mt-1 text-[13px]">5 questions · about 5 min</Muted>
      </Pressable>

      <View className="mt-5">
        {status === 'available' && slot?.entry ? (
          <Button
            label="Start drop"
            size="md"
            icon="arrow-right"
            iconRight
            onPress={() => slot.entry && router.push(quizHref(slot.entry))}
            accessibilityHint={`Starts ${title}`}
          />
        ) : status === 'done' && slot?.entry ? (
          <Button
            label="See results"
            size="md"
            variant="secondary"
            onPress={() => slot.entry && router.push(resultsHref(slot.entry))}
          />
        ) : status === 'missing' && catchUp ? (
          <Button
            label="Play the latest drop"
            size="md"
            variant="soft"
            onPress={() => router.push(quizHref(catchUp))}
            accessibilityHint={`Plays ${displayTitle(catchUp.title)}`}
          />
        ) : (
          <View className="h-10 flex-row items-center justify-center gap-2 rounded-xl bg-zinc-100 dark:bg-ink-raised">
            <Icon name="lock" size={13} color={dark ? colors.mutedDark : colors.muted} />
            <Muted className="text-[13px]">
              {status === 'missing' ? 'Check back soon' : `Opens at ${time}`}
            </Muted>
          </View>
        )}
      </View>
    </View>
  );
}
