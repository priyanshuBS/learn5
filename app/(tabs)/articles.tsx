/**
 * Read — the daily articles. Every morning at 04:00 the AI writes ONE short
 * article in simple English; the subject rotates day by day
 * (Math → Reasoning → English → Computer Science).
 *   - filter by subject (All / Math / …)
 *   - Today: the day's one article (or "being written" until it arrives),
 *     and which subject comes tomorrow
 *   - Earlier: every older article, newest first
 */
import { useState } from 'react';
import { Pressable, ScrollView, View } from 'react-native';

import { ArticleCard } from '@/components/ArticleCard';
import { CARD_CLASSES } from '@/components/Card';
import { Button } from '@/components/Button';
import { PageHeader, SectionTitle } from '@/components/PageHeader';
import { Screen } from '@/components/Screen';
import { LoadingView, MessageView } from '@/components/StateViews';
import { CategoryIcon } from '@/components/CategoryIcon';
import { Muted, Txt } from '@/components/Txt';
import { useArticleReads, useArticles } from '@/features/articles/store';
import { useAppData } from '@/hooks/useAppData';
import { articleKey } from '@/lib/articles';
import { addDays } from '@/lib/dates';
import { scheduledArticleCategory } from '@/lib/rotation';
import type { ArticleSummary } from '@/lib/schema';
import { friendlyDate, localClockLabel } from '@/lib/time';
import { twMerge } from 'tailwind-merge';

const DAYS_PER_PAGE = 7;

export default function ArticlesScreen() {
  const { ready, index, zonedNow } = useAppData();
  const articles = useArticles((s) => s.articles);
  const checked = useArticles((s) => s.checked);
  const refreshing = useArticles((s) => s.refreshing);
  const refresh = useArticles((s) => s.refresh);
  const read = useArticleReads((s) => s.read);
  const [daysShown, setDaysShown] = useState(DAYS_PER_PAGE);
  /** Only this subject's articles (null = all). */
  const [subject, setSubject] = useState<string | null>(null);

  if (!ready || !index || (articles === null && !checked)) {
    return (
      <Screen>
        <LoadingView label="Getting today's articles…" />
      </Screen>
    );
  }

  const categoryOf = (a: ArticleSummary) => index.categories.find((c) => c.id === a.category);
  const order = new Map(index.categories.map((c, i) => [c.id, i]));
  // One article a day: today's subject (older content indexes: every subject).
  const todaysId = scheduledArticleCategory(index, zonedNow.date);
  const tomorrowId = scheduledArticleCategory(index, addDays(zonedNow.date, 1));
  const tomorrow = index.categories.find((c) => c.id === tomorrowId);
  const shownCategories = index.categories.filter(
    (c) => (!subject || c.id === subject) && (!todaysId || c.id === todaysId),
  );
  const list = (articles ?? [])
    .filter((a) => categoryOf(a) && (!subject || a.category === subject))
    .sort(
      (a, b) =>
        b.date.localeCompare(a.date) || (order.get(a.category) ?? 0) - (order.get(b.category) ?? 0),
    );
  const today = list.filter((a) => a.date === zonedNow.date);
  const older = list.filter((a) => a.date !== zonedNow.date);
  const byDate = new Map<string, ArticleSummary[]>();
  for (const a of older) byDate.set(a.date, [...(byDate.get(a.date) ?? []), a]);
  const dates = [...byDate.keys()];
  const articlesTime = localClockLabel('04:00', zonedNow.offsetMinutes);

  return (
    <Screen>
      <PageHeader
        title="Daily reads"
        subtitle="One short article a day in simple English. A new subject every morning."
      />

      {/* Subject filter */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerClassName="gap-1.5 pb-1"
        className="-mx-4 px-4 md:mx-0 md:px-0"
      >
        <FilterChip label="All" active={!subject} onPress={() => setSubject(null)} />
        {index.categories.map((c) => (
          <FilterChip
            key={c.id}
            label={c.name}
            color={c.color}
            active={subject === c.id}
            onPress={() => setSubject(c.id)}
          />
        ))}
      </ScrollView>

      {articles === null ? (
        <MessageView
          icon="articles"
          title="Couldn't load articles"
          message="Check your internet connection and try again."
          actionLabel="Try again"
          onAction={() => void refresh()}
        />
      ) : (
        <>
          <SectionTitle
            title="Today"
            subtitle={`New every day at ${articlesTime}${tomorrow ? ` · tomorrow: ${tomorrow.name}` : ''}`}
          />
          {shownCategories.length === 0 ? (
            <Muted className="text-[14px]">
              No {index.categories.find((c) => c.id === subject)?.name} article today. Its next one
              comes in the rotation.
            </Muted>
          ) : null}
          <View className="-m-1.5 flex-row flex-wrap">
            {shownCategories.map((category) => {
              const a = today.find((x) => x.category === category.id);
              return (
                <View
                  key={category.id}
                  className={twMerge('w-full p-1.5', shownCategories.length > 1 && 'md:w-1/2')}
                >
                  {a ? (
                    <ArticleCard article={a} category={category} read={!!read[articleKey(a)]} />
                  ) : (
                    <View className="flex-row items-center gap-3.5 rounded-xl border border-dashed border-line p-4 dark:border-ink-line">
                      <CategoryIcon category={category} size="sm" />
                      <View className="flex-1">
                        <Txt weight="semibold" className="text-[15px]">
                          {category.name}
                        </Txt>
                        <Muted className="mt-0.5 text-[13px]">
                          Today&apos;s article is being written. Check back soon.
                        </Muted>
                      </View>
                    </View>
                  )}
                </View>
              );
            })}
          </View>

          {dates.length > 0 ? <SectionTitle title="Earlier" /> : null}
          {dates.slice(0, daysShown).map((date) => (
            <View key={date} className="mb-5">
              <Muted className="mb-2 text-[13px]">{friendlyDate(date, zonedNow.date)}</Muted>
              <View className={twMerge(CARD_CLASSES, 'overflow-hidden')}>
                {(byDate.get(date) ?? []).map((a, i) => {
                  const category = categoryOf(a);
                  return category ? (
                    <ArticleCard
                      key={articleKey(a)}
                      article={a}
                      category={category}
                      read={!!read[articleKey(a)]}
                      variant="row"
                      divider={i > 0}
                    />
                  ) : null;
                })}
              </View>
            </View>
          ))}
          {dates.length > daysShown ? (
            <Button
              label="Show older days"
              variant="secondary"
              onPress={() => setDaysShown((n) => n + DAYS_PER_PAGE)}
            />
          ) : null}
          {dates.length === 0 ? (
            <Muted className="mt-6 text-[14px]">Older articles will appear here.</Muted>
          ) : null}
          {refreshing ? (
            <Muted className="mt-4 text-center text-[12px]">Checking for new articles…</Muted>
          ) : null}
        </>
      )}
    </Screen>
  );
}

/** A flat chip to filter the list by subject. */
function FilterChip({
  label,
  active,
  onPress,
}: {
  label: string;
  color?: string;
  active: boolean;
  onPress: () => void;
}) {
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityState={{ selected: active }}
      onPress={onPress}
      className={twMerge(
        'h-8 flex-row items-center rounded-md border px-3 web:transition-colors',
        active
          ? 'border-brand-600 bg-brand-600 dark:border-brand-400 dark:bg-brand-500'
          : 'border-line bg-white active:bg-zinc-50 web:hover:bg-zinc-50 dark:border-ink-line dark:bg-ink dark:active:bg-white/[0.04] dark:web:hover:bg-white/[0.04]',
      )}
    >
      <Txt
        weight="medium"
        className={twMerge(
          'text-[13px]',
          active ? 'text-white dark:text-white' : 'text-zinc-600 dark:text-zinc-400',
        )}
      >
        {label}
      </Txt>
    </Pressable>
  );
}
