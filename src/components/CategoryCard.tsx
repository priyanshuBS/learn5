/**
 * CategoryCard — one subject on the Home screen, as a bold card filled with the
 * subject's own colour (a deep gradient, so white text stays easy to read in
 * light and dark mode).
 *   - the subject (icon, name, tagline) and today's count, e.g. "1/2"
 *   - today's drops as chips: Done / Open / Late / opening time
 *   - ONE clear next step: a "Play" button when a drop is open, otherwise
 *     a quiet line (catch-up, next drop time, or all done)
 * Tap the top part to open the subject page.
 */
import { LinearGradient } from 'expo-linear-gradient';
import { router } from 'expo-router';
import type { ReactNode } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';

import { SLOT_NAMES, type DropSlot } from '@/features/drops/status';
import type { DropResult } from '@/features/progress/store';
import { categoryHref, quizHref } from '@/lib/routes';
import type { Category, IndexEntry } from '@/lib/schema';
import { localClockLabel } from '@/lib/time';
import { displayTitle } from '@/lib/title';
import { CATEGORY_ICONS, darken, subjectFill } from '@/theme';

import { Button } from './Button';
import { Icon, type IconName } from './Icon';
import { Txt } from './Txt';

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
  const doneCount = slots.filter((s) => s.status === 'done').length;
  const open = slots.find((s) => s.status === 'available' && s.entry);
  const next = slots.find((s) => s.status === 'upcoming');
  const missing = slots.some((s) => s.status === 'missing');
  const allDone = slots.length > 0 && doneCount === slots.length;
  const scoreToday = slots.reduce((n, s) => n + (getResult(s)?.correctCount ?? 0), 0);
  const deep = darken(category.color, 0.45);

  // Two tap areas one above the other (never one inside the other — on the
  // website a button inside a button is invalid HTML).
  return (
    <View
      className="overflow-hidden rounded-3xl active:opacity-95 web:shadow-[0_18px_40px_-20px_rgba(0,0,0,0.55)]"
      style={{ backgroundColor: deep }}
    >
      <LinearGradient
        colors={subjectFill(category.color)}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={StyleSheet.absoluteFill}
      />
      {/* A big faint icon in the corner gives each card its own look */}
      <View pointerEvents="none" className="absolute -bottom-6 -right-4 opacity-[0.12]">
        <Icon name={CATEGORY_ICONS[category.id] ?? 'lightbulb'} size={120} color="#FFFFFF" />
      </View>

      <Pressable
        accessibilityRole="button"
        accessibilityLabel={`${category.name}. ${category.tagline}. ${doneCount} of ${slots.length} drops done today. Open subject`}
        onPress={() => router.push(categoryHref(category.id))}
        className="p-5"
      >
        <View className="flex-row items-center gap-3.5">
          <OnColorIcon category={category} />
          <View className="flex-1">
            <Txt
              weight="display"
              className="text-[19px] leading-6 text-white dark:text-white"
              numberOfLines={1}
            >
              {category.name}
            </Txt>
            <Txt className="mt-0.5 text-[13px] text-white/75 dark:text-white/75" numberOfLines={1}>
              {category.tagline}
            </Txt>
          </View>
          <Txt weight="display" className="text-[26px] leading-8 text-white dark:text-white">
            {doneCount}
            <Txt weight="display" className="text-[15px] text-white/60 dark:text-white/60">
              /{slots.length}
            </Txt>
          </Txt>
        </View>

        {/* Today's drops */}
        <View className="mt-4 flex-row gap-2">
          {slots.map((slot) => (
            <SlotChip
              key={slot.drop}
              slot={slot}
              color={category.color}
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
              <Txt className="text-[12px] text-white/70 dark:text-white/70">
                {SLOT_NAMES[open.drop - 1]} drop · open now
              </Txt>
              <Txt
                weight="semibold"
                className="text-[14px] leading-5 text-white dark:text-white"
                numberOfLines={1}
              >
                {displayTitle(open.entry.title)}
              </Txt>
            </View>
            <Button
              label="Play"
              size="sm"
              icon="play"
              variant="inverse"
              onPress={() => open.entry && router.push(quizHref(open.entry))}
              accessibilityHint={`Starts ${displayTitle(open.entry.title)}`}
            />
          </View>
        </Footer>
      ) : allDone ? (
        <Footer>
          <NextLine icon="check-circle" text={`All done today · ${scoreToday} correct`} />
        </Footer>
      ) : missing && catchUp ? (
        <Pressable
          accessibilityRole="button"
          accessibilityLabel={`Running late. Play the latest drop instead: ${displayTitle(catchUp.title)}`}
          onPress={() => router.push(quizHref(catchUp))}
          className="flex-row items-center gap-3 border-t border-white/15 px-5 py-3.5 active:bg-white/10 web:hover:bg-white/[0.06]"
        >
          <View className="flex-1">
            <Txt className="text-[12px] text-white/70 dark:text-white/70">
              Running late · play the latest instead
            </Txt>
            <Txt
              weight="semibold"
              className="text-[14px] leading-5 text-white dark:text-white"
              numberOfLines={1}
            >
              {displayTitle(catchUp.title)}
            </Txt>
          </View>
          <Icon name="arrow-right" size={17} color="#FFFFFF" />
        </Pressable>
      ) : next ? (
        <Footer>
          <NextLine
            icon="clock"
            text={`Next drop at ${localClockLabel(next.time, offsetMinutes)}${doneCount > 0 ? ` · ${scoreToday} correct so far` : ''}`}
          />
        </Footer>
      ) : (
        <Footer>
          <NextLine icon="moon" text="New drops tomorrow morning" />
        </Footer>
      )}
    </View>
  );
}

/** The subject's icon on a white tile (reads clearly on the coloured card). */
function OnColorIcon({ category }: { category: Category }) {
  const icon = CATEGORY_ICONS[category.id];
  return (
    <View
      className="h-12 w-12 items-center justify-center rounded-2xl bg-white"
      style={{
        shadowColor: '#000',
        shadowOpacity: 0.18,
        shadowRadius: 8,
        shadowOffset: { width: 0, height: 4 },
        elevation: 3,
      }}
    >
      {icon ? (
        <Icon name={icon} size={24} color={darken(category.color, 0.12)} strokeWidth={2.4} />
      ) : (
        <Txt className="text-xl">{category.emoji}</Txt>
      )}
    </View>
  );
}

/** One of today's drops as a small chip, styled for the coloured card. */
function SlotChip({ slot, label, color }: { slot: DropSlot; label: string; color: string }) {
  const name = SLOT_NAMES[slot.drop - 1];
  switch (slot.status) {
    case 'done':
      return (
        <View
          accessible
          accessibilityLabel={`${name} drop done`}
          className="h-8 flex-1 flex-row items-center justify-center gap-1 rounded-full bg-white/20 px-2"
        >
          <Icon name="check" size={13} color="#FFFFFF" strokeWidth={3} />
          <Txt weight="semibold" className="text-[12px] text-white dark:text-white">
            Done
          </Txt>
        </View>
      );
    case 'available':
      return (
        <View
          accessible
          accessibilityLabel={`${name} drop open now`}
          className="h-8 flex-1 flex-row items-center justify-center gap-1.5 rounded-full bg-white px-2"
        >
          <View className="h-1.5 w-1.5 rounded-full" style={{ backgroundColor: color }} />
          <Txt weight="bold" className="text-[12px]" style={{ color: darken(color, 0.3) }}>
            Open now
          </Txt>
        </View>
      );
    case 'missing':
      return (
        <View
          accessible
          accessibilityLabel={`${name} drop is running late`}
          className="h-8 flex-1 flex-row items-center justify-center rounded-full border border-dashed border-white/40 px-2"
        >
          <Txt className="text-[12px] text-white/80 dark:text-white/80">Late</Txt>
        </View>
      );
    default:
      return (
        <View
          accessible
          accessibilityLabel={`${name} drop opens at ${label}`}
          className="h-8 flex-1 flex-row items-center justify-center gap-1.5 rounded-full border border-white/25 px-2"
        >
          <Icon name="lock" size={11} color="rgba(255,255,255,0.75)" />
          <Txt className="text-[12px] text-white/80 dark:text-white/80" numberOfLines={1}>
            {label}
          </Txt>
        </View>
      );
  }
}

function Footer({ children }: { children: ReactNode }) {
  return <View className="border-t border-white/15 px-5 py-3.5">{children}</View>;
}

function NextLine({ icon, text }: { icon: IconName; text: string }) {
  return (
    <View className="min-h-9 flex-row items-center gap-2">
      <Icon name={icon} size={15} color="rgba(255,255,255,0.85)" />
      <Txt className="text-[13px] text-white/85 dark:text-white/85">{text}</Txt>
    </View>
  );
}
