/**
 * BadgeCard — one badge: a solid icon tile when earned; a quiet outline and a
 * progress bar when not.
 */
import { View } from 'react-native';
import { twMerge } from 'tailwind-merge';

import type { BadgeStatus } from '@/features/badges/badges';
import { useColorScheme } from '@/hooks/useScheme';
import { BADGE_ICONS, colors } from '@/theme';

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
              muted={!badge.earned}
              solid={badge.earned}
              size={36}
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
        <Txt weight="mono" className="text-[11px] uppercase tracking-[1px] text-zinc-500">
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
