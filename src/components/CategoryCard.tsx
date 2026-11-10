/**
 * CategoryCard — one subject on the Home screen.
 *   - the subject (solid icon, name, tagline) and today's count, e.g. "1/3"
 *   - today's 3 drops as chips: Done / Open / Late / opening time
 *   - ONE clear next step: a lime "Play" bar when a drop is open, otherwise
 *     a quiet line (catch-up, next drop time, or all done)
 * Tap the top part to open the subject page.
 */
import { router } from 'expo-router';
import type { ReactNode } from 'react';
import { Pressable, View } from 'react-native';
import { twMerge } from 'tailwind-merge';

import { SLOT_NAMES, type DropSlot } from '@/features/drops/status';
import type { DropResult } from '@/features/progress/store';
import { useColorScheme } from '@/hooks/useScheme';
import { categoryHref, quizHref } from '@/lib/routes';
import type { Category, IndexEntry } from '@/lib/schema';
import { localClockLabel } from '@/lib/time';
import { displayTitle } from '@/lib/title';
import { colors } from '@/theme';

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
        <View className="flex-row items-center gap-3.5">
          <CategoryIcon category={category} size="md" />
          <View className="flex-1">
            <Txt weight="display" className="text-[18px] leading-6" numberOfLines={1}>
              {category.name}
            </Txt>
            <Muted className="mt-0.5 text-[13px]" numberOfLines={1}>
              {category.tagline}
            </Muted>
          </View>
          <View className="items-end">
            <Txt weight="display" className="text-[20px] leading-7">
              {doneCount}
              <Txt weight="display" className="text-[15px] text-zinc-400 dark:text-zinc-500">
                /{slots.length}
              </Txt>
            </Txt>
          </View>
        </View>

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
        <Pressable
          accessibilityRole="button"
          accessibilityLabel={`Play the ${SLOT_NAMES[open.drop - 1]} ${category.name} drop: ${displayTitle(open.entry.title)}`}
          onPress={() => open.entry && router.push(quizHref(open.entry))}
          className="flex-row items-center gap-3 bg-volt px-5 py-3.5 active:bg-volt-dim web:transition-colors web:hover:bg-volt-dim"
        >
          <View className="flex-1">
            <Txt weight="bold" className="text-[14px] text-[#0A0A0A] dark:text-[#0A0A0A]">
              Play {SLOT_NAMES[open.drop - 1].toLowerCase()} drop
            </Txt>
            <Txt
              className="text-[13px] leading-5 text-[#0A0A0A]/70 dark:text-[#0A0A0A]/70"
              numberOfLines={1}
            >
              {displayTitle(open.entry.title)}
            </Txt>
          </View>
          <View className="h-9 w-9 items-center justify-center rounded-full bg-[#0A0A0A]">
            <Icon name="arrow-right" size={17} color={colors.volt} strokeWidth={2.5} />
          </View>
        </Pressable>
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
          className="h-7 flex-1 flex-row items-center justify-center gap-1 rounded-full bg-[#0A0A0A] px-2 dark:bg-white"
        >
          <Icon name="check" size={12} color={colors.volt} strokeWidth={3} />
          <Txt weight="semibold" className="text-[12px] text-white dark:text-[#0A0A0A]">
            Done
          </Txt>
        </View>
      );
    case 'available':
      return (
        <View
          accessible
          accessibilityLabel={`${name} drop open now`}
          className="h-7 flex-1 flex-row items-center justify-center gap-1.5 rounded-full bg-volt px-2"
        >
          <View className="h-1.5 w-1.5 rounded-full bg-[#0A0A0A]" />
          <Txt weight="semibold" className="text-[12px] text-[#0A0A0A] dark:text-[#0A0A0A]">
            Open
          </Txt>
        </View>
      );
    case 'missing':
      return (
        <View
          accessible
          accessibilityLabel={`${name} drop is running late`}
          className="h-7 flex-1 flex-row items-center justify-center rounded-full border border-dashed border-zinc-300 px-2 dark:border-zinc-700"
        >
          <Txt className="text-[12px] text-zinc-500 dark:text-zinc-400">Late</Txt>
        </View>
      );
    default:
      return (
        <View
          accessible
          accessibilityLabel={`${name} drop opens at ${label}`}
          className="h-7 flex-1 flex-row items-center justify-center rounded-full border border-line px-2 dark:border-ink-line"
        >
          <Txt className="text-[12px] text-zinc-500 dark:text-zinc-400" numberOfLines={1}>
            {label}
          </Txt>
        </View>
      );
  }
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
