/**
 * Category screen — today's 3 drops for one category, plus an archive of past days.
 */
import { router, useLocalSearchParams } from 'expo-router';
import { useState } from 'react';
import { View } from 'react-native';
import { twMerge } from 'tailwind-merge';

import categoriesFile from '../../../content/categories.json';
import { Button, IconButton } from '@/components/Button';
import { CARD_CLASSES } from '@/components/Card';
import { StatStrip } from '@/components/StatCard';
import { DropCard, TimelineDrop } from '@/components/DropCard';
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
import { displayTitle } from '@/lib/title';
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
      <View className="flex-row">
        <IconButton icon="arrow-left" label="Go back" onPress={goBack} />
      </View>
      <View className="mt-8 flex-row items-center gap-4">
        <CategoryIcon category={category} size="lg" />
        <View className="flex-1">
          <Txt weight="display" accessibilityRole="header" className="text-[30px] leading-9">
            {category.name}
          </Txt>
          <Muted className="mt-0.5 text-[15px]">{category.tagline}</Muted>
        </View>
      </View>
      <StatStrip
        className="mt-8"
        stats={[
          { label: 'Drops done', value: `${categoryResults.length}` },
          { label: 'Accuracy', value: accuracy },
          { label: 'To review', value: `${categoryMistakes}` },
        ]}
      />

      {categoryMistakes > 0 ? (
        <Button
          label={`Review ${categoryMistakes} ${categoryMistakes === 1 ? 'mistake' : 'mistakes'}`}
          icon="review"
          variant="secondary"
          size="md"
          onPress={() => router.push({ pathname: '/review', params: { category: category.id } })}
          className="mt-3"
        />
      ) : null}

      {/* Today, as a timeline */}
      <SectionTitle
        title="Today"
        subtitle={`One new drop every day at ${localClockLabel(slots[0]?.time ?? '04:00', zonedNow.offsetMinutes)}.`}
      />
      {slots.map((slot, i) => {
        const name =
          slots.length === 1 ? 'Today’s drop' : (SLOT_NAMES[slot.drop - 1] ?? `Drop ${slot.drop}`);
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
            title={showTitle ? displayTitle(entry.title) : waitingTitle}
            scoreLabel={result ? `${result.correctCount}/${result.items.length}` : undefined}
            onPress={showTitle ? () => openDrop(entry) : undefined}
            last={i === slots.length - 1}
          />
        );
      })}

      {hasMissing && catchUp ? (
        <View className="rounded-xl border border-dashed border-zinc-300 bg-zinc-100 p-5 dark:border-ink-line dark:bg-white/[0.05]">
          <View className="flex-row items-center gap-2">
            <Icon name="hourglass" size={16} color={colors.warning} />
            <Txt weight="semibold" className="text-zinc-900 dark:text-zinc-200">
              Today’s drop is running late
            </Txt>
          </View>
          <Txt className="mt-1 text-sm text-zinc-900 dark:text-zinc-200">
            While you wait, try the latest one: {displayTitle(catchUp.title)}
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
          <View key={date} className="mb-5">
            <Muted className="mb-2 text-[13px]">{friendlyDate(date, zonedNow.date)}</Muted>
            <View className={twMerge(CARD_CLASSES, 'overflow-hidden')}>
              {(byDate.get(date) ?? [])
                .slice()
                .sort((x, y) => x.drop - y.drop)
                .map((entry, i) => {
                  const result = results[dropKey(entry)];
                  return (
                    <DropCard
                      key={entry.path}
                      divider={i > 0}
                      status={result ? 'done' : 'available'}
                      title={displayTitle(entry.title)}
                      meta=""
                      timeLabel=""
                      scoreLabel={
                        result ? `${result.correctCount}/${result.items.length}` : undefined
                      }
                      onPress={() => openDrop(entry)}
                    />
                  );
                })}
            </View>
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
