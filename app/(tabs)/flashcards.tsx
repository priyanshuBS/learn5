/**
 * Flashcards — every fact card from drops you have finished, as a flip deck.
 */
import { useState } from 'react';
import { View } from 'react-native';

import { Button, IconButton } from '@/components/Button';
import { Tag } from '@/components/DifficultyBadge';
import { FlashCard } from '@/components/FlashCard';
import { PageHeader } from '@/components/PageHeader';
import { ProgressBar } from '@/components/ProgressBar';
import { Screen } from '@/components/Screen';
import { LoadingView, MessageView } from '@/components/StateViews';
import { Muted } from '@/components/Txt';
import { useDropFiles } from '@/features/content/store';
import { findEntry, type DropRef } from '@/features/drops/status';
import { getCollectedFactCards } from '@/features/review/mistakes';
import { useAppData } from '@/hooks/useAppData';
import { goHome } from '@/lib/routes';
import { shuffle } from '@/lib/shuffle';
import type { Category, FactCardItem } from '@/lib/schema';

interface Card {
  item: FactCardItem;
  category: Category;
}

export default function FlashcardsScreen() {
  const { ready, index, results } = useAppData();
  const [position, setPosition] = useState(0);
  const [flipped, setFlipped] = useState(false);
  /** Shuffled order of card ids (null = newest first). */
  const [order, setOrder] = useState<string[] | null>(null);

  const refs = getCollectedFactCards(results);
  const pathFor = (ref: { drop: DropRef }) =>
    index ? findEntry(index, ref.drop)?.path : undefined;
  const paths = index ? refs.map((r) => pathFor(r)).filter((p): p is string => !!p) : [];
  const loaded = useDropFiles(ready ? paths : []);

  if (!ready || !index || loaded.loading) {
    return (
      <Screen>
        <LoadingView label="Loading your cards…" />
      </Screen>
    );
  }

  const byId: Record<string, Card> = {};
  for (const r of refs) {
    const path = pathFor(r);
    const item = path ? loaded.drops[path]?.items.find((it) => it.id === r.itemId) : undefined;
    const category = index.categories.find((c) => c.id === r.drop.category);
    if (item?.type === 'fact_card' && category) byId[item.id] = { item, category };
  }
  const ids = (order ?? Object.keys(byId)).filter((id) => byId[id]);

  if (ids.length === 0) {
    return (
      <Screen width="narrow">
        <PageHeader title="Flashcards" subtitle="Facts you have collected" />
        <MessageView
          icon="flashcards"
          title="No flashcards yet"
          message="Finish drops to collect fact cards. Every “Did you know?” card you play is saved here."
          actionLabel="Go to Home"
          onAction={goHome}
        />
      </Screen>
    );
  }

  const safePos = Math.min(position, ids.length - 1);
  const card = byId[ids[safePos]];
  const go = (delta: number) => {
    setFlipped(false);
    setPosition((safePos + delta + ids.length) % ids.length);
  };

  return (
    <Screen width="narrow">
      <PageHeader
        title="Flashcards"
        subtitle={`${ids.length} ${ids.length === 1 ? 'fact' : 'facts'} collected`}
        right={
          <IconButton
            icon="shuffle"
            label="Shuffle cards"
            onPress={() => {
              setOrder(shuffle(ids));
              setPosition(0);
              setFlipped(false);
            }}
          />
        }
      />

      <View className="flex-row items-center justify-between gap-3">
        <View className="flex-1 flex-row flex-wrap gap-2">
          <Tag label={card.category.name} color={card.category.color} />
          <Tag label={card.item.topic} />
        </View>
        <Muted>
          {safePos + 1} of {ids.length}
        </Muted>
      </View>
      <ProgressBar
        value={(safePos + 1) / ids.length}
        className="mt-3"
        label={`Card ${safePos + 1} of ${ids.length}`}
      />

      <View className="mt-5">
        {/* key: a fresh card (front side) for every fact */}
        <FlashCard
          key={card.item.id}
          item={card.item}
          flipped={flipped}
          onToggle={() => setFlipped((f) => !f)}
        />
      </View>

      <View className="mt-5 flex-row gap-3">
        <Button
          label="Previous"
          icon="arrow-left"
          variant="secondary"
          className="flex-1"
          disabled={ids.length < 2}
          onPress={() => go(-1)}
        />
        <Button
          label="Next"
          icon="arrow-right"
          iconRight
          className="flex-1"
          disabled={ids.length < 2}
          onPress={() => go(1)}
        />
      </View>
      {loaded.failed > 0 ? (
        <Muted className="mt-4 text-center">
          Some cards need the internet to load ({loaded.failed}).
        </Muted>
      ) : null}
    </Screen>
  );
}
