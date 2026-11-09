/**
 * PageHeader — title row at the top of a page, with optional back button
 * and something on the right (e.g. a shuffle button).
 */
import type { ReactNode } from 'react';
import { View } from 'react-native';

import { goBack } from '@/lib/routes';

import { IconButton } from './Button';
import { Muted, Txt } from './Txt';

export function PageHeader({
  title,
  subtitle,
  back,
  right,
}: {
  title: string;
  subtitle?: string;
  back?: boolean;
  right?: ReactNode;
}) {
  return (
    <View className="mb-6 flex-row items-center gap-3 md:mb-8">
      {back ? <IconButton icon="arrow-left" label="Go back" onPress={goBack} /> : null}
      <View className="flex-1">
        <Txt
          weight="bold"
          accessibilityRole="header"
          className="text-2xl tracking-tight md:text-[28px] md:leading-9"
          numberOfLines={2}
        >
          {title}
        </Txt>
        {subtitle ? <Muted className="mt-0.5 text-[15px]">{subtitle}</Muted> : null}
      </View>
      {right}
    </View>
  );
}

/** Section title inside a page. */
export function SectionTitle({
  title,
  subtitle,
  right,
}: {
  title: string;
  subtitle?: string;
  right?: ReactNode;
}) {
  return (
    <View className="mb-3 mt-10 flex-row items-end justify-between gap-4">
      <View className="flex-1">
        <Txt weight="semibold" accessibilityRole="header" className="text-[17px] tracking-tight">
          {title}
        </Txt>
        {subtitle ? <Muted className="mt-0.5">{subtitle}</Muted> : null}
      </View>
      {right}
    </View>
  );
}
