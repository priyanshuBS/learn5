/**
 * CategoryIcon — a gradient tile in the subject's colour with a white line icon.
 */
import { LinearGradient } from 'expo-linear-gradient';

import type { Category } from '@/lib/schema';
import { CATEGORY_ICONS, categoryGradient } from '@/theme';

import { Icon } from './Icon';
import { Txt } from './Txt';

const SIZES = {
  sm: { box: 32, radius: 10, icon: 16, emoji: 'text-sm' },
  md: { box: 46, radius: 15, icon: 22, emoji: 'text-lg' },
  lg: { box: 60, radius: 20, icon: 28, emoji: 'text-2xl' },
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
    <LinearGradient
      colors={categoryGradient(category.color)}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
      style={{
        width: s.box,
        height: s.box,
        borderRadius: s.radius,
        alignItems: 'center',
        justifyContent: 'center',
      }}
    >
      {icon ? (
        <Icon name={icon} size={s.icon} color="#FFFFFF" strokeWidth={2.25} />
      ) : (
        <Txt className={s.emoji}>{category.emoji}</Txt>
      )}
    </LinearGradient>
  );
}
