/**
 * Category screen — today's 3 drops for one category, plus an archive of past days.
 */
import { router, useLocalSearchParams } from 'expo-router';
import { useState } from 'react';
import { View } from 'react-native';

import categoriesFile from '../../../content/categories.json';
import { Button, IconButton } from '@/components/Button';
import { DropCard, TimelineDrop } from '@/components/DropCard';
import { Card } from '@/components/Card';
import { CategoryIcon } from '@/components/CategoryIcon';
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
import { colors } from '@/theme';

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

  const openDrop = (entry: IndexEntry) =>
    router.push(isDone(entry) ? resultsHref(entry) : quizHref(entry));

  return (
    <Screen width="narrow">
      {/* Subject header */}
      <Card className="p-6">
        <View className="flex-row items-center justify-between">
          <IconButton icon="arrow-left" label="Go back" onPress={goBack} />
        </View>
        <View className="mt-5 flex-row items-center gap-4">
          <CategoryIcon category={category} size="lg" />
          <View className="flex-1">
            <Txt weight="display" accessibilityRole="header" className="text-[28px] leading-[34px]">
              {category.name}
            </Txt>
            <Muted className="mt-0.5 text-[15px]">{category.tagline}</Muted>
          </View>
        </View>
        <View className="mt-6 flex-row gap-2">
          <HeroStat value={`${categoryResults.length}`} label="Drops done" />
          <HeroStat value={accuracy} label="Accuracy" />
          <HeroStat value={`${categoryMistakes}`} label="To review" />
        </View>
      </Card>

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
        <View className="rounded-2xl border border-dashed border-amber-300 bg-amber-50/60 p-5 dark:border-amber-500/30 dark:bg-amber-500/5">
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
            <Muted className="mb-2 mt-1 text-[13px]">{friendlyDate(date, zonedNow.date)}</Muted>
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
      className="flex-1 rounded-xl bg-[#F0F0EC] px-3 py-3 dark:bg-ink-raised"
    >
      <Txt weight="display" className="text-xl">
        {value}
      </Txt>
      <Muted className="text-xs">{label}</Muted>
    </View>
  );
}
