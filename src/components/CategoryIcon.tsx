/**
 * CategoryIcon — a solid tile in the subject's colour with a white line icon.
 */
import { View } from 'react-native';
import { twMerge } from 'tailwind-merge';

import type { Category } from '@/lib/schema';
import { CATEGORY_ICONS } from '@/theme';

import { Icon } from './Icon';
import { Txt } from './Txt';

const SIZES = {
  sm: { box: 'h-8 w-8 rounded-lg', icon: 16, emoji: 'text-sm' },
  md: { box: 'h-11 w-11 rounded-xl', icon: 21, emoji: 'text-lg' },
  lg: { box: 'h-14 w-14 rounded-2xl', icon: 27, emoji: 'text-2xl' },
} as const;

export function CategoryIcon({
  category,
  size = 'md',
}: {
  category: Pick<Category, 'id' | 'color' | 'emoji'>;
  size?: keyof typeof SIZES;
}) {
  const s = SIZES[size];
  const icon = CATEGORY_ICONS[category.id];
  return (
    <View
      className={twMerge('items-center justify-center', s.box)}
      style={{ backgroundColor: category.color }}
    >
      {icon ? (
        <Icon name={icon} size={s.icon} color="#FFFFFF" strokeWidth={2.25} />
      ) : (
        <Txt className={s.emoji}>{category.emoji}</Txt>
      )}
    </View>
  );
}
