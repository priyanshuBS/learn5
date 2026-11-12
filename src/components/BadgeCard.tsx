/**
 * BadgeCard — one badge: a coloured 3D icon when earned; grey, faded and with a
 * progress bar when not.
 */
import { View } from 'react-native';
import { twMerge } from 'tailwind-merge';

import type { BadgeStatus } from '@/features/badges/badges';
import { useColorScheme } from '@/hooks/useScheme';
import { BADGE_COLORS, BADGE_ICONS, colors } from '@/theme';

import { CARD_CLASSES } from './Card';
import { Icon } from './Icon';
import { Icon3D } from './Icon3D';
import { ProgressBar } from './ProgressBar';
import { Muted, Txt } from './Txt';

export function BadgeCard({ badge }: { badge: BadgeStatus }) {
  const scheme = useColorScheme();
  return (
    <View
      accessible
      accessibilityLabel={`${badge.name} badge. ${badge.description} ${
        badge.earned ? 'Earned.' : `Progress ${badge.progressLabel}.`
      }`}
      // A fixed height (not "stretch to fill") keeps every badge the same size on
      // phones and the web without the layout bugs stretching causes on phones.
      className={twMerge(CARD_CLASSES, 'h-[232px] justify-between p-4')}
    >
      <View>
        <View className="flex-row items-start justify-between">
          <View style={{ opacity: badge.earned ? 1 : 0.45 }}>
            <Icon3D
              icon={BADGE_ICONS[badge.id] ?? 'medal'}
              color={badge.earned ? (BADGE_COLORS[badge.id] ?? colors.points) : '#8A8D9A'}
              size={48}
              filled={badge.id.startsWith('streak-7')}
            />
          </View>
          {badge.earned ? (
            <Icon name="badge-check" size={18} color={colors.success} />
          ) : (
            <Icon name="lock" size={14} color={scheme === 'dark' ? '#3A3C48' : '#CFD0D9'} />
          )}
        </View>
        <Txt weight="semibold" className="mt-3.5 text-[15px]">
          {badge.name}
        </Txt>
        <Muted className="mt-0.5 text-[13px] leading-5" numberOfLines={3}>
          {badge.description}
        </Muted>
      </View>
      {badge.earned ? (
        <Txt weight="semibold" className="text-xs text-emerald-700 dark:text-emerald-300">
          Earned
        </Txt>
      ) : (
        <View>
          <ProgressBar value={badge.progress} label={`${badge.name} progress`} />
          <Muted className="mt-1.5 text-xs">{badge.progressLabel}</Muted>
        </View>
      )}
    </View>
  );
}
