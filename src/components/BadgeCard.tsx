/**
 * BadgeCard — one badge: coloured when earned, grey with a progress bar when not.
 */
import { View } from 'react-native';
import { twMerge } from 'tailwind-merge';

import type { BadgeStatus } from '@/features/badges/badges';
import { useColorScheme } from '@/hooks/useScheme';
import { BADGE_ICONS, colors } from '@/theme';

import { CARD_CLASSES } from './Card';
import { Icon } from './Icon';
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
          <View
            className={twMerge(
              'h-12 w-12 items-center justify-center rounded-2xl border',
              badge.earned
                ? 'border-amber-200 bg-amber-50 dark:border-amber-500/25 dark:bg-amber-500/10'
                : 'border-line bg-zinc-50 dark:border-ink-line dark:bg-ink-card',
            )}
          >
            <Icon
              name={BADGE_ICONS[badge.id] ?? 'medal'}
              size={20}
              color={badge.earned ? colors.points : scheme === 'dark' ? '#404040' : '#D4D4D0'}
            />
          </View>
          {badge.earned ? (
            <Icon name="badge-check" size={18} color={colors.success} />
          ) : (
            <Icon name="lock" size={14} color={scheme === 'dark' ? '#404040' : '#D4D4D0'} />
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
