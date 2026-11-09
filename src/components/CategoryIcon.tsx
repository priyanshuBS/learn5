/**
 * CategoryIcon — a soft tinted tile with the category's line icon.
 */
import { View } from 'react-native';
import { twMerge } from 'tailwind-merge';

import type { Category } from '@/lib/schema';
import { useColorScheme } from '@/hooks/useScheme';
import { CATEGORY_ICONS, categoryTone, withAlpha } from '@/theme';

import { Icon } from './Icon';
import { Txt } from './Txt';

const SIZES = {
  sm: { box: 'h-8 w-8 rounded-lg', icon: 16, emoji: 'text-sm' },
  md: { box: 'h-10 w-10 rounded-xl', icon: 20, emoji: 'text-lg' },
  lg: { box: 'h-14 w-14 rounded-2xl', icon: 26, emoji: 'text-2xl' },
} as const;

export function CategoryIcon({
  category,
  size = 'md',
}: {
  category: Pick<Category, 'id' | 'color' | 'emoji'>;
  size?: keyof typeof SIZES;
}) {
  const dark = useColorScheme() === 'dark';
  const s = SIZES[size];
  const icon = CATEGORY_ICONS[category.id];
  const color = categoryTone(category.color, dark);
  return (
    <View
      className={twMerge('items-center justify-center', s.box)}
      style={{ backgroundColor: withAlpha(color, dark ? 0.14 : 0.1) }}
    >
      {icon ? (
        <Icon name={icon} size={s.icon} color={color} strokeWidth={2} />
      ) : (
        <Txt className={s.emoji}>{category.emoji}</Txt>
      )}
    </View>
  );
}
