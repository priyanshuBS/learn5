/**
 * StatCard — a label and a big number, flat (streak, points, time…).
 * StatStrip — several stats side by side in ONE bordered row, split by hairlines.
 */
import { Fragment, type ReactNode } from 'react';
import { View } from 'react-native';
import { twMerge } from 'tailwind-merge';

import { CARD_CLASSES } from './Card';
import type { IconName } from './Icon';
import { Muted, Txt } from './Txt';

export function StatCard({
  value,
  label,
  children,
  className,
}: {
  icon?: IconName;
  color?: string;
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
      className={twMerge(CARD_CLASSES, 'px-4 py-4', className)}
    >
      <Muted className="text-[13px]" numberOfLines={1}>
        {label}
      </Muted>
      <Txt weight="display" className="mt-1 text-[26px] leading-8" numberOfLines={1}>
        {value}
      </Txt>
      {children}
    </View>
  );
}

export interface StripStat {
  icon?: IconName;
  color?: string;
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
          {i > 0 ? <View className="w-px bg-line dark:bg-ink-line" /> : null}
          <View
            accessible
            accessibilityLabel={`${s.label}: ${s.value}`}
            className="flex-1 px-4 py-4 md:px-5"
          >
            <Muted className="text-[12.5px]" numberOfLines={1}>
              {s.label}
            </Muted>
            <Txt weight="display" className="mt-1 text-[22px] leading-7" numberOfLines={1}>
              {s.value}
            </Txt>
            {s.extra}
          </View>
        </Fragment>
      ))}
    </View>
  );
}
