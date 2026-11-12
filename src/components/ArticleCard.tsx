/**
 * ArticleCard — one daily article in a list: subject, title, summary, reading time.
 *   "feature" = the big card for today's articles (subject-coloured glow)
 *   "row"     = a compact line for older articles
 */
import { router } from 'expo-router';
import { Pressable, View } from 'react-native';
import { twMerge } from 'tailwind-merge';

import { useColorScheme } from '@/hooks/useScheme';
import { articleHref } from '@/lib/routes';
import type { ArticleSummary, Category } from '@/lib/schema';
import { categoryTone, colors, withAlpha } from '@/theme';

import { CARD_CLASSES, CARD_PRESSABLE_CLASSES } from './Card';
import { CategoryIcon } from './CategoryIcon';
import { Icon } from './Icon';
import { Muted, Txt } from './Txt';

export function ArticleCard({
  article,
  category,
  read,
  variant = 'feature',
}: {
  article: ArticleSummary;
  category: Category;
  read: boolean;
  variant?: 'feature' | 'row';
}) {
  const dark = useColorScheme() === 'dark';
  const tone = categoryTone(category.color, dark);
  const label = `${category.name} article: ${article.title}. ${article.readingMinutes} minute read${read ? '. Read' : ''}`;
  const open = () => router.push(articleHref(article));

  if (variant === 'row') {
    return (
      <Pressable
        accessibilityRole="button"
        accessibilityLabel={label}
        onPress={open}
        className={twMerge(
          CARD_CLASSES,
          CARD_PRESSABLE_CLASSES,
          'mb-2 flex-row items-center gap-3.5 p-4',
        )}
      >
        <CategoryIcon category={category} size="sm" />
        <View className="flex-1">
          <Txt weight="semibold" className="text-[15px] leading-5" numberOfLines={2}>
            {article.title}
          </Txt>
          <Muted className="mt-0.5 text-[12px]">
            {category.name} · {article.readingMinutes} min read
          </Muted>
        </View>
        {read ? (
          <Icon name="check-circle" size={18} color={colors.success} />
        ) : (
          <Icon name="chevron-right" size={18} color={dark ? colors.mutedDark : colors.muted} />
        )}
      </Pressable>
    );
  }

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={label}
      onPress={open}
      className={twMerge(CARD_CLASSES, CARD_PRESSABLE_CLASSES, 'h-full overflow-hidden p-5')}
    >
      <View
        pointerEvents="none"
        className="absolute -right-12 -top-14 h-40 w-40 rounded-full"
        style={{ backgroundColor: withAlpha(category.color, dark ? 0.16 : 0.1) }}
      />
      <View className="flex-row items-center gap-2.5">
        <CategoryIcon category={category} size="sm" />
        <Txt weight="semibold" className="flex-1 text-[13px]" style={{ color: tone }}>
          {category.name}
        </Txt>
        {read ? (
          <View className="flex-row items-center gap-1 rounded-full bg-emerald-50 px-2.5 py-1 dark:bg-emerald-500/15">
            <Icon name="check" size={12} color={colors.success} strokeWidth={3} />
            <Txt weight="semibold" className="text-[11px] text-emerald-700 dark:text-emerald-300">
              Read
            </Txt>
          </View>
        ) : null}
      </View>
      <Txt weight="display" className="mt-4 text-[20px] leading-7" numberOfLines={3}>
        {article.title}
      </Txt>
      <Muted className="mt-2 text-[14px] leading-6" numberOfLines={3}>
        {article.summary}
      </Muted>
      <View className="flex-1" />
      <View className="mt-4 flex-row items-center gap-1.5">
        <Icon name="clock" size={14} color={dark ? colors.mutedDark : colors.muted} />
        <Muted className="text-[13px]">{article.readingMinutes} min read</Muted>
        <View className="flex-1" />
        <Txt weight="semibold" className="text-[13px] text-brand-700 dark:text-brand-300">
          {read ? 'Read again' : 'Read now'}
        </Txt>
        <Icon name="arrow-right" size={14} color={dark ? colors.brandOnDark : colors.brand} />
      </View>
    </Pressable>
  );
}
