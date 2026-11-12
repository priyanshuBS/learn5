/**
 * Read — the daily articles. Every morning at 04:00 the AI writes one short
 * article per subject in simple English.
 *   - filter by subject (All / English / …)
 *   - Today: one card per subject (or "being written" until it arrives)
 *   - Earlier: every older article, newest first
 */
import { useState } from 'react';
import { Pressable, ScrollView, View } from 'react-native';

import { ArticleCard } from '@/components/ArticleCard';
import { Button } from '@/components/Button';
import { PageHeader, SectionTitle } from '@/components/PageHeader';
import { Screen } from '@/components/Screen';
import { LoadingView, MessageView } from '@/components/StateViews';
import { CategoryIcon } from '@/components/CategoryIcon';
import { Muted, Txt } from '@/components/Txt';
import { useArticleReads, useArticles } from '@/features/articles/store';
import { useAppData } from '@/hooks/useAppData';
import { articleKey } from '@/lib/articles';
import type { ArticleSummary } from '@/lib/schema';
import { friendlyDate, localClockLabel } from '@/lib/time';
import { useColorScheme } from '@/hooks/useScheme';
import { categoryTone, withAlpha } from '@/theme';
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
  const shownCategories = index.categories.filter((c) => !subject || c.id === subject);
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
        subtitle="One short article for each subject, written fresh every morning in simple English."
      />

      {/* Subject filter */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerClassName="gap-2 pb-1"
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
            subtitle={`${today.length} of ${shownCategories.length} ready · new every day at ${articlesTime}`}
          />
          <View className="-m-1.5 flex-row flex-wrap">
            {shownCategories.map((category) => {
              const a = today.find((x) => x.category === category.id);
              return (
                <View key={category.id} className="w-full p-1.5 md:w-1/2">
                  {a ? (
                    <ArticleCard article={a} category={category} read={!!read[articleKey(a)]} />
                  ) : (
                    <View className="flex-row items-center gap-3.5 rounded-2xl border border-dashed border-line p-4 dark:border-ink-line">
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

/** A pill to filter the list by subject. */
function FilterChip({
  label,
  color,
  active,
  onPress,
}: {
  label: string;
  color?: string;
  active: boolean;
  onPress: () => void;
}) {
  const dark = useColorScheme() === 'dark';
  const tone = color ? categoryTone(color, dark) : undefined;
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityState={{ selected: active }}
      onPress={onPress}
      className={twMerge(
        'h-9 flex-row items-center gap-2 rounded-full border px-4',
        active
          ? 'border-transparent bg-zinc-900 dark:bg-white'
          : 'border-line bg-white active:bg-zinc-100 dark:border-ink-line dark:bg-ink-card dark:active:bg-ink-raised',
      )}
      style={
        active && tone
          ? { backgroundColor: withAlpha(tone, dark ? 0.2 : 0.14), borderColor: tone }
          : undefined
      }
    >
      {color ? <View className="h-2 w-2 rounded-full" style={{ backgroundColor: tone }} /> : null}
      <Txt
        weight="semibold"
        className={twMerge(
          'text-[13px]',
          active && !color ? 'text-white dark:text-zinc-900' : 'text-zinc-700 dark:text-zinc-200',
        )}
      >
        {label}
      </Txt>
    </Pressable>
  );
}
