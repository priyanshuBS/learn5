/**
 * BadgeCard — one badge: a coloured icon tile when earned; a quiet grey tile and a
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
      className={twMerge(CARD_CLASSES, 'h-[180px] justify-between p-4')}
    >
      <View>
        <View className="flex-row items-start justify-between">
          <View>
            <Icon3D
              icon={BADGE_ICONS[badge.id] ?? 'medal'}
              color={BADGE_COLORS[badge.id] ?? colors.brand}
              muted={!badge.earned}
              size={40}
              filled={badge.id.startsWith('streak-7')}
            />
          </View>
          {badge.earned ? (
            <Icon name="check" size={15} color={colors.success} strokeWidth={2.5} />
          ) : (
            <Icon name="lock" size={14} color={scheme === 'dark' ? '#404040' : '#D4D4D4'} />
          )}
        </View>
        <Txt weight="medium" className="mt-4 text-[15px]">
          {badge.name}
        </Txt>
        <Muted className="mt-0.5 text-[13px] leading-5" numberOfLines={3}>
          {badge.description}
        </Muted>
      </View>
      {badge.earned ? (
        <View className="flex-row items-center gap-1.5">
          <Icon name="check-circle" size={14} color={colors.success} />
          <Txt weight="semibold" className="text-[12px] text-emerald-700 dark:text-emerald-400">
            Earned
          </Txt>
        </View>
      ) : (
        <View>
          <ProgressBar value={badge.progress} label={`${badge.name} progress`} />
          <Muted className="mt-1.5 text-xs">{badge.progressLabel}</Muted>
        </View>
      )}
    </View>
  );
}
