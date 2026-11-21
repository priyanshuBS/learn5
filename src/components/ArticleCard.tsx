/**
 * ArticleCard — one daily article, editorial style (flat, black and white).
 *   "feature" = the day's article: subject + reading time, a large title, summary
 *   "row"     = a compact line for older articles
 */
import { router } from 'expo-router';
import { Pressable, View } from 'react-native';
import { twMerge } from 'tailwind-merge';

import { useColorScheme } from '@/hooks/useScheme';
import { articleHref } from '@/lib/routes';
import type { ArticleSummary, Category } from '@/lib/schema';
import { categoryTone, colors } from '@/theme';

import { CARD_CLASSES, CARD_PRESSABLE_CLASSES } from './Card';
import { Icon } from './Icon';
import { Eyebrow, Muted, Txt } from './Txt';

export function ArticleCard({
  article,
  category,
  read,
  variant = 'feature',
  divider,
}: {
  article: ArticleSummary;
  category: Category;
  read: boolean;
  variant?: 'feature' | 'row';
  /** Rows only: draw a hairline above (every row but the first in a list). */
  divider?: boolean;
}) {
  const dark = useColorScheme() === 'dark';
  const label = `${category.name} article: ${article.title}. ${article.readingMinutes} minute read${read ? '. Read' : ''}`;
  const open = () => router.push(articleHref(article));
  const muted = dark ? '#6E6C8C' : '#9F9DBA';
  const tone = categoryTone(category.color, dark);

  if (variant === 'row') {
    return (
      <Pressable
        accessibilityRole="button"
        accessibilityLabel={label}
        onPress={open}
        className={twMerge(
          'flex-row items-center gap-4 px-4 py-3.5 md:px-5',
          CARD_PRESSABLE_CLASSES,
          divider && 'border-t border-line dark:border-ink-line',
        )}
      >
        <View className="flex-1">
          <Txt weight="medium" className="text-[15px] leading-[22px]" numberOfLines={2}>
            {article.title}
          </Txt>
          <Muted className="mt-0.5 text-[13px]">
            {category.name} · {article.readingMinutes} min
          </Muted>
        </View>
        {read ? (
          <Icon name="check" size={15} color={colors.success} strokeWidth={2.5} />
        ) : (
          <Icon name="chevron-right" size={16} color={muted} />
        )}
      </Pressable>
    );
  }

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={label}
      onPress={open}
      className={twMerge(CARD_CLASSES, CARD_PRESSABLE_CLASSES, 'p-5 md:p-6')}
    >
      <View className="flex-row items-center justify-between">
        <Txt
          weight="mono"
          className="text-[11.5px] uppercase tracking-[1px]"
          style={{ color: tone }}
        >
          {category.name} · {article.readingMinutes} min
        </Txt>
        {read ? (
          <View className="flex-row items-center gap-1">
            <Icon name="check" size={12} color={colors.success} strokeWidth={2.5} />
            <Eyebrow>Read</Eyebrow>
          </View>
        ) : null}
      </View>
      <Txt weight="display" className="mt-3 text-[22px] leading-7" numberOfLines={3}>
        {article.title}
      </Txt>
      <Muted className="mt-2 text-[15px] leading-6" numberOfLines={3}>
        {article.summary}
      </Muted>
      <View className="mt-5 flex-row items-center gap-1.5">
        <Txt weight="semibold" className="text-[14px] text-brand-700 dark:text-brand-300">
          {read ? 'Read again' : 'Read article'}
        </Txt>
        <Icon name="arrow-right" size={14} color={colors.brand} />
      </View>
    </Pressable>
  );
}
