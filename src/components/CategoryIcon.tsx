/**
 * CategoryIcon — the subject's 3D icon (see Icon3D) in the subject's colour.
 * Falls back to the subject's emoji if it has no line icon.
 */
import { View } from 'react-native';

import type { Category } from '@/lib/schema';
import { CATEGORY_ICONS } from '@/theme';

import { Icon3D } from './Icon3D';
import { Txt } from './Txt';

const SIZES = {
  sm: { box: 34, emoji: 'text-base' },
  md: { box: 48, emoji: 'text-xl' },
  lg: { box: 64, emoji: 'text-3xl' },
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
  if (icon) return <Icon3D icon={icon} color={category.color} size={s.box} />;
  return (
    <View style={{ width: s.box, height: s.box }} className="items-center justify-center">
      <Txt className={s.emoji}>{category.emoji}</Txt>
    </View>
  );
}
