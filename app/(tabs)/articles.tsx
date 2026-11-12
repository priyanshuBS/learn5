/**
 * Read — the daily articles. Every morning at 04:00 the AI writes one short
 * article per subject in simple English. Today's are shown big; older ones below.
 */
import { useState } from 'react';
import { View } from 'react-native';

import { ArticleCard } from '@/components/ArticleCard';
import { Button } from '@/components/Button';
import { PageHeader, SectionTitle } from '@/components/PageHeader';
import { Screen } from '@/components/Screen';
import { LoadingView, MessageView } from '@/components/StateViews';
import { Muted } from '@/components/Txt';
import { useArticleReads, useArticles } from '@/features/articles/store';
import { useAppData } from '@/hooks/useAppData';
import { articleKey } from '@/lib/articles';
import type { ArticleSummary } from '@/lib/schema';
import { friendlyDate } from '@/lib/time';

const DAYS_PER_PAGE = 7;

export default function ArticlesScreen() {
  const { ready, index, zonedNow } = useAppData();
  const articles = useArticles((s) => s.articles);
  const checked = useArticles((s) => s.checked);
  const refreshing = useArticles((s) => s.refreshing);
  const refresh = useArticles((s) => s.refresh);
  const read = useArticleReads((s) => s.read);
  const [daysShown, setDaysShown] = useState(DAYS_PER_PAGE);

  if (!ready || !index || (articles === null && !checked)) {
    return (
      <Screen>
        <LoadingView label="Getting today's articles…" />
      </Screen>
    );
  }

  const categoryOf = (a: ArticleSummary) => index.categories.find((c) => c.id === a.category);
  const order = new Map(index.categories.map((c, i) => [c.id, i]));
  const list = (articles ?? [])
    .filter((a) => categoryOf(a))
    .sort(
      (a, b) =>
        b.date.localeCompare(a.date) || (order.get(a.category) ?? 0) - (order.get(b.category) ?? 0),
    );
  const today = list.filter((a) => a.date === zonedNow.date);
  const older = list.filter((a) => a.date !== zonedNow.date);
  const byDate = new Map<string, ArticleSummary[]>();
  for (const a of older) byDate.set(a.date, [...(byDate.get(a.date) ?? []), a]);
  const dates = [...byDate.keys()];

  return (
    <Screen>
      <PageHeader
        title="Daily reads"
        subtitle="One short article for each subject, written fresh every morning in simple English."
      />

      {list.length === 0 ? (
        <MessageView
          icon="articles"
          title={articles === null ? "Couldn't load articles" : 'No articles yet'}
          message={
            articles === null
              ? 'Check your internet connection and try again.'
              : 'New articles arrive every morning at 4 AM. Check back soon.'
          }
          actionLabel="Try again"
          onAction={() => void refresh()}
        />
      ) : (
        <>
          <SectionTitle
            title="Today"
            subtitle={
              today.length === 0
                ? undefined
                : `${today.length} new ${today.length === 1 ? 'read' : 'reads'}`
            }
          />
          {today.length === 0 ? (
            <Muted className="text-[15px] leading-6">
              Today&apos;s articles arrive at 4 AM. Here are the latest ones meanwhile.
            </Muted>
          ) : (
            <View className="-m-1.5 flex-row flex-wrap">
              {today.map((a) => {
                const category = categoryOf(a);
                return category ? (
                  <View key={articleKey(a)} className="w-full p-1.5 md:w-1/2 xl:w-1/3">
                    <ArticleCard article={a} category={category} read={!!read[articleKey(a)]} />
                  </View>
                ) : null;
              })}
            </View>
          )}

          {dates.length > 0 ? <SectionTitle title="Earlier" /> : null}
          {dates.slice(0, daysShown).map((date) => (
            <View key={date} className="mb-3">
              <Muted className="mb-2 mt-1 text-[13px]">{friendlyDate(date, zonedNow.date)}</Muted>
              {(byDate.get(date) ?? []).map((a) => {
                const category = categoryOf(a);
                return category ? (
                  <ArticleCard
                    key={articleKey(a)}
                    article={a}
                    category={category}
                    read={!!read[articleKey(a)]}
                    variant="row"
                  />
                ) : null;
              })}
            </View>
          ))}
          {dates.length > daysShown ? (
            <Button
              label="Show older days"
              variant="secondary"
              onPress={() => setDaysShown((n) => n + DAYS_PER_PAGE)}
            />
          ) : null}
          {refreshing ? (
            <Muted className="mt-4 text-center text-[12px]">Checking for new articles…</Muted>
          ) : null}
        </>
      )}
    </Screen>
  );
}
