/**
 * Category screen — today's 3 drops for one category, plus an archive of past days.
 */
import { router, useLocalSearchParams } from 'expo-router';
import { useState } from 'react';
import { View } from 'react-native';

import categoriesFile from '../../../content/categories.json';
import { Button, IconButton } from '@/components/Button';
import { DropCard, TimelineDrop } from '@/components/DropCard';
import { Glow } from '@/components/Glow';
import { Gradient } from '@/components/Gradient';
import { usePrefetchDrops } from '@/features/content/store';
import { Icon } from '@/components/Icon';
import { SectionTitle } from '@/components/PageHeader';
import { Screen } from '@/components/Screen';
import { LoadingView, MessageView } from '@/components/StateViews';
import { Muted, Txt } from '@/components/Txt';
import {
  dropKey,
  getCatchUpEntry,
  getOpenEntries,
  getTodaySlots,
  SLOT_NAMES,
} from '@/features/drops/status';
import { useAppData } from '@/hooks/useAppData';
import { goBack, goHome, quizHref, resultsHref } from '@/lib/routes';
import type { IndexEntry } from '@/lib/schema';
import { friendlyDate, localClockLabel } from '@/lib/time';
import { CATEGORY_ICONS, colors, darken, gradientFrom, GLOW } from '@/theme';

/** Website build: create one page per category (/category/english, /category/math, …). */
export async function generateStaticParams(): Promise<Record<string, string>[]> {
  return categoriesFile.map((c) => ({ id: c.id }));
}

const DAYS_PER_PAGE = 7;

export default function CategoryScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { ready, index, zonedNow, results, isDone, mistakes } = useAppData();
  const [daysShown, setDaysShown] = useState(DAYS_PER_PAGE);

  // Opening a category downloads only its LATEST open drop (5 questions with answers
  // and explanations) and saves it on the device. Locked drops stay on the server.
  const latestOpen = ready && index && id ? getOpenEntries(index, id, zonedNow)[0] : undefined;
  usePrefetchDrops(latestOpen ? [latestOpen.path] : []);

  if (!ready || !index) {
    return (
      <Screen>
        <LoadingView />
      </Screen>
    );
  }

  const category = index.categories.find((c) => c.id === id);
  if (!category) {
    return (
      <Screen>
        <MessageView
          icon="search"
          title="Category not found"
          message="We couldn't find this category."
          actionLabel="Go to Home"
          onAction={goHome}
        />
      </Screen>
    );
  }

  const slots = getTodaySlots(index, category.id, zonedNow, isDone);
  const catchUp = getCatchUpEntry(index, category.id, zonedNow, isDone);
  const hasMissing = slots.some((s) => s.status === 'missing');

  // Archive: open drops from earlier days, grouped by date (newest first).
  const pastEntries = getOpenEntries(index, category.id, zonedNow).filter(
    (e) => e.date !== zonedNow.date,
  );
  const byDate = new Map<string, IndexEntry[]>();
  for (const e of pastEntries) byDate.set(e.date, [...(byDate.get(e.date) ?? []), e]);
  const dates = [...byDate.keys()];

  const categoryResults = Object.values(results).filter((r) => r.category === category.id);
  const answered = categoryResults.reduce((n, r) => n + r.items.length, 0);
  const correct = categoryResults.reduce((n, r) => n + r.correctCount, 0);
  const accuracy = answered > 0 ? `${Math.round((correct / answered) * 100)}%` : '—';
  const categoryMistakes = mistakes.filter((m) => m.drop.category === category.id).length;

  const heroIcon = CATEGORY_ICONS[category.id];

  const openDrop = (entry: IndexEntry) =>
    router.push(isDone(entry) ? resultsHref(entry) : quizHref(entry));

  return (
    <Screen width="narrow">
      {/* Subject hero, in the subject's own colour */}
      <Gradient
        colors={gradientFrom(category.color)}
        lip={darken(category.color, 0.62)}
        radius={28}
        className="p-6 md:p-7"
      >
        <Glow color={category.color} size={420} opacity={0.55} style={{ top: -200, right: -160 }} />
        <Glow color={GLOW.cyan} size={300} opacity={0.18} style={{ bottom: -170, left: -120 }} />

        <View className="flex-row items-center justify-between">
          <IconButton icon="arrow-left" label="Go back" onPress={goBack} onDark />
          <View className="h-12 w-12 items-center justify-center rounded-2xl bg-white/15">
            {heroIcon ? (
              <Icon name={heroIcon} size={24} color={colors.white} />
            ) : (
              <Txt className="text-2xl">{category.emoji}</Txt>
            )}
          </View>
        </View>
        <Txt
          weight="heavy"
          accessibilityRole="header"
          className="mt-6 text-[32px] leading-10 tracking-tighter text-white"
        >
          {category.name}
        </Txt>
        <Txt className="mt-1 text-[15px] text-white/80">{category.tagline}</Txt>
        <View className="mt-6 flex-row gap-2">
          <HeroStat value={`${categoryResults.length}`} label="Drops done" />
          <HeroStat value={accuracy} label="Accuracy" />
          <HeroStat value={`${categoryMistakes}`} label="To review" />
        </View>
      </Gradient>

      {categoryMistakes > 0 ? (
        <Button
          label={`Review ${categoryMistakes} ${categoryMistakes === 1 ? 'mistake' : 'mistakes'}`}
          icon="review"
          variant="soft"
          onPress={() => router.push({ pathname: '/review', params: { category: category.id } })}
          className="mt-4"
        />
      ) : null}

      {/* Today, as a timeline */}
      <SectionTitle title="Today" subtitle="A new drop every morning, afternoon and evening." />
      {slots.map((slot, i) => {
        const name = SLOT_NAMES[slot.drop - 1] ?? `Drop ${slot.drop}`;
        const time = localClockLabel(slot.time, zonedNow.offsetMinutes);
        const result = slot.entry ? results[dropKey(slot.entry)] : undefined;
        const entry = slot.entry;
        const showTitle = entry && (slot.status === 'available' || slot.status === 'done');
        const waitingTitle = slot.status === 'missing' ? 'Running a little late' : 'Opens soon';
        return (
          <TimelineDrop
            key={slot.drop}
            drop={slot.drop}
            name={name}
            time={time}
            status={slot.status}
            title={showTitle ? entry.title : waitingTitle}
            scoreLabel={result ? `${result.correctCount}/${result.items.length}` : undefined}
            onPress={showTitle ? () => openDrop(entry) : undefined}
            last={i === slots.length - 1}
          />
        );
      })}

      {hasMissing && catchUp ? (
        <View className="rounded-3xl border border-dashed border-amber-300 bg-amber-50/60 p-5 dark:border-amber-500/30 dark:bg-amber-500/5">
          <View className="flex-row items-center gap-2">
            <Icon name="hourglass" size={16} color={colors.warning} />
            <Txt weight="semibold" className="text-amber-900 dark:text-amber-200">
              Today’s drop is running late
            </Txt>
          </View>
          <Txt className="mt-1 text-sm text-amber-900 dark:text-amber-200">
            While you wait, try the latest one: {catchUp.title}
          </Txt>
          <Button
            label="Play latest drop"
            icon="play"
            size="md"
            onPress={() => router.push(quizHref(catchUp))}
            className="mt-4 self-start"
          />
        </View>
      ) : null}

      {/* Archive */}
      <SectionTitle title="Archive" />
      {dates.length === 0 ? (
        <Muted className="text-[15px]">Past drops will appear here. Come back tomorrow.</Muted>
      ) : (
        dates.slice(0, daysShown).map((date) => (
          <View key={date} className="mb-4">
            <Muted className="mb-2 mt-1 text-[11px] uppercase tracking-widest">
              {friendlyDate(date, zonedNow.date)}
            </Muted>
            {(byDate.get(date) ?? [])
              .slice()
              .sort((a, b) => a.drop - b.drop)
              .map((entry) => {
                const result = results[dropKey(entry)];
                return (
                  <DropCard
                    key={entry.path}
                    drop={entry.drop}
                    status={result ? 'done' : 'available'}
                    title={entry.title}
                    meta={SLOT_NAMES[entry.drop - 1] ?? `Drop ${entry.drop}`}
                    timeLabel=""
                    scoreLabel={
                      result ? `${result.correctCount}/${result.items.length}` : undefined
                    }
                    onPress={() => openDrop(entry)}
                  />
                );
              })}
          </View>
        ))
      )}
      {dates.length > daysShown ? (
        <Button
          label="Show older days"
          variant="secondary"
          onPress={() => setDaysShown((n) => n + DAYS_PER_PAGE)}
        />
      ) : null}
    </Screen>
  );
}

function HeroStat({ value, label }: { value: string; label: string }) {
  return (
    <View
      accessible
      accessibilityLabel={`${label}: ${value}`}
      className="flex-1 rounded-2xl border border-white/15 bg-white/10 px-3 py-3"
    >
      <Txt weight="bold" className="text-xl tracking-tight text-white">
        {value}
      </Txt>
      <Txt className="text-xs text-white/75">{label}</Txt>
    </View>
  );
}
