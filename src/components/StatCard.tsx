/**
 * StatCard — a small card: icon + label, then a big value (streak, points, level...).
 * StatStrip — several stats side by side in ONE card, split by thin lines.
 */
import { Fragment, type ReactNode } from 'react';
import { View } from 'react-native';
import { twMerge } from 'tailwind-merge';

import { withAlpha } from '@/theme';

import { CARD_CLASSES } from './Card';
import { Icon, type IconName } from './Icon';
import { Muted, Txt } from './Txt';

export function StatCard({
  icon,
  color,
  value,
  label,
  children,
  className,
}: {
  icon: IconName;
  color: string;
  value: string;
  label: string;
  /** Extra content under the value (e.g. a progress bar). */
  children?: ReactNode;
  className?: string;
}) {
  return (
    <View
      accessible
      accessibilityLabel={`${label}: ${value}`}
      className={twMerge(CARD_CLASSES, 'p-4', className)}
    >
      <View className="flex-row items-center gap-2">
        <View
          className="h-7 w-7 items-center justify-center rounded-lg"
          style={{ backgroundColor: withAlpha(color, 0.12) }}
        >
          <Icon name={icon} size={15} color={color} strokeWidth={2.25} />
        </View>
        <Muted className="flex-1 text-[13px]" numberOfLines={1}>
          {label}
        </Muted>
      </View>
      <Txt weight="display" className="mt-3 text-2xl tracking-tight" numberOfLines={1}>
        {value}
      </Txt>
      {children}
    </View>
  );
}

export interface StripStat {
  icon: IconName;
  color: string;
  value: string;
  label: string;
  /** Extra content under the label (e.g. a progress bar). */
  extra?: ReactNode;
}

export function StatStrip({ stats, className }: { stats: StripStat[]; className?: string }) {
  return (
    <View className={twMerge(CARD_CLASSES, 'flex-row', className)}>
      {stats.map((s, i) => (
        <Fragment key={s.label}>
          {i > 0 ? <View className="my-4 w-px bg-line dark:bg-ink-line" /> : null}
          <View
            accessible
            accessibilityLabel={`${s.label}: ${s.value}`}
            className="flex-1 px-4 py-4 md:px-5"
          >
            <View className="flex-row items-center gap-1.5">
              <Icon name={s.icon} size={15} color={s.color} strokeWidth={2.25} />
              <Muted className="text-[13px]" numberOfLines={1}>
                {s.label}
              </Muted>
            </View>
            <Txt weight="display" className="mt-1.5 text-xl tracking-tight" numberOfLines={1}>
              {s.value}
            </Txt>
            {s.extra}
          </View>
        </Fragment>
      ))}
    </View>
  );
}
