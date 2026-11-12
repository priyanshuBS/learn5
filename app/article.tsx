/**
 * Article reader — one daily article, full screen.
 * Address: /article?category=english&date=2026-11-12
 *
 * Big, comfortable text; headings; "Key points" and "Words to know" boxes;
 * a "Mark as read" button at the end.
 */
import { useLocalSearchParams } from 'expo-router';
import { View } from 'react-native';
import { twMerge } from 'tailwind-merge';

import { Button, IconButton } from '@/components/Button';
import { CARD_CLASSES } from '@/components/Card';
import { Tag } from '@/components/DifficultyBadge';
import { Icon } from '@/components/Icon';
import { Screen } from '@/components/Screen';
import { LoadingView, MessageView } from '@/components/StateViews';
import { Muted, Txt } from '@/components/Txt';
import { useArticle, useArticleReads } from '@/features/articles/store';
import { useAppData } from '@/hooks/useAppData';
import { useColorScheme } from '@/hooks/useScheme';
import { articleKey } from '@/lib/articles';
import { haptics } from '@/lib/haptics';
import { goBack, goHome } from '@/lib/routes';
import { longDate } from '@/lib/time';
import { categoryTone, colors } from '@/theme';

export default function ArticleScreen() {
  const params = useLocalSearchParams<{ category?: string; date?: string }>();
  const one = (v?: string | string[]) => (Array.isArray(v) ? v[0] : v);
  const category = one(params.category);
  const date = one(params.date);
  const ref = category && date && /^\d{4}-\d{2}-\d{2}$/.test(date) ? { category, date } : null;

  const { ready, index } = useAppData();
  const dark = useColorScheme() === 'dark';
  const load = useArticle(ref);
  const read = useArticleReads((s) => (ref ? Boolean(s.read[articleKey(ref)]) : false));
  const markRead = useArticleReads((s) => s.markRead);

  if (!ref) {
    return (
      <Screen width="narrow">
        <MessageView
          icon="search"
          title="Article not found"
          message="This article doesn't exist."
          actionLabel="Go to Home"
          onAction={goHome}
        />
      </Screen>
    );
  }
  if (!ready || !index || load.status === 'loading') {
    return (
      <Screen width="narrow">
        <LoadingView label="Opening the article…" />
      </Screen>
    );
  }
  if (load.status === 'error') {
    return (
      <Screen width="narrow">
        <MessageView
          icon="cloud-off"
          tone="warning"
          title="Couldn't open this article"
          message="It isn't saved on this device yet, or it isn't out yet. Check your internet connection and try again."
          actionLabel="Try again"
          onAction={load.retry}
          secondaryLabel="Go back"
          onSecondary={goBack}
        />
      </Screen>
    );
  }

  const { article } = load;
  const cat = index.categories.find((c) => c.id === article.category);
  const tone = cat ? categoryTone(cat.color, dark) : dark ? colors.brandOnDark : colors.brand;

  return (
    <Screen width="narrow">
      <View className="flex-row items-center justify-between">
        <IconButton icon="arrow-left" label="Go back" onPress={goBack} />
        {read ? (
          <View className="flex-row items-center gap-1.5">
            <Icon name="check-circle" size={16} color={colors.success} />
            <Muted className="text-[13px]">Read</Muted>
          </View>
        ) : null}
      </View>

      {/* Title block */}
      <View className="mt-6 flex-row flex-wrap items-center gap-2">
        {cat ? <Tag label={cat.name} color={cat.color} /> : null}
        <Muted className="text-[13px]">
          {longDate(article.date)} · {article.readingMinutes} min read
        </Muted>
      </View>
      <Txt
        weight="display"
        accessibilityRole="header"
        className="mt-3 text-[30px] leading-[38px] md:text-[36px] md:leading-[44px]"
      >
        {article.title}
      </Txt>
      <Txt weight="medium" className="mt-3 text-[17px] leading-7" style={{ color: tone }}>
        {article.summary}
      </Txt>

      {/* Body */}
      {article.sections.map((section) => (
        <View key={section.heading} className="mt-8">
          <Txt weight="display" accessibilityRole="header" className="text-[21px] leading-7">
            {section.heading}
          </Txt>
          {section.paragraphs.map((p, i) => (
            <Txt
              key={i}
              className="mt-3 text-[17px] leading-[29px] text-zinc-800 dark:text-zinc-200"
            >
              {p}
            </Txt>
          ))}
        </View>
      ))}

      {/* Key points */}
      <View className={twMerge(CARD_CLASSES, 'mt-10 p-5')}>
        <View className="flex-row items-center gap-2">
          <Icon name="lightbulb" size={18} color={tone} />
          <Txt weight="display" className="text-[18px]">
            Key points
          </Txt>
        </View>
        {article.keyPoints.map((point, i) => (
          <View key={i} className="mt-3 flex-row gap-3">
            <View className="mt-2.5 h-1.5 w-1.5 rounded-full" style={{ backgroundColor: tone }} />
            <Txt className="flex-1 text-[16px] leading-7">{point}</Txt>
          </View>
        ))}
      </View>

      {/* Words to know */}
      {article.glossary.length > 0 ? (
        <View className={twMerge(CARD_CLASSES, 'mt-3 p-5')}>
          <View className="flex-row items-center gap-2">
            <Icon name="book-open-text" size={18} color={tone} />
            <Txt weight="display" className="text-[18px]">
              Words to know
            </Txt>
          </View>
          {article.glossary.map((g) => (
            <View key={g.word} className="mt-3">
              <Txt weight="semibold" className="text-[16px]">
                {g.word}
              </Txt>
              <Muted className="mt-0.5 text-[15px] leading-6">{g.meaning}</Muted>
            </View>
          ))}
        </View>
      ) : null}

      <Muted className="mt-6 text-[13px]">Source: {article.source}</Muted>

      <View className="mt-8 gap-2.5">
        {read ? (
          <Button label="Back to articles" variant="secondary" onPress={goBack} />
        ) : (
          <Button
            label="Mark as read"
            icon="check"
            onPress={() => {
              haptics.success();
              markRead(article);
            }}
          />
        )}
      </View>
    </Screen>
  );
}
