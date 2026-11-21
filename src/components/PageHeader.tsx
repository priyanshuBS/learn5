/**
 * PageHeader — the title at the top of a page: optional back button, a clear
 * heading, a short muted line and something on the right.
 * SectionTitle — a small heading for sections inside a page, with an optional
 * muted line and an action on the right.
 */
import type { ReactNode } from 'react';
import { View } from 'react-native';

import { goBack } from '@/lib/routes';

import { IconButton } from './Button';
import { Eyebrow, Muted, Txt } from './Txt';

export function PageHeader({
  title,
  subtitle,
  eyebrow,
  back,
  right,
}: {
  title: string;
  subtitle?: string;
  /** Small label above the title. */
  eyebrow?: string;
  back?: boolean;
  right?: ReactNode;
}) {
  return (
    <View className="mb-8">
      {back ? (
        <View className="mb-6 flex-row">
          <IconButton icon="arrow-left" label="Go back" onPress={goBack} />
        </View>
      ) : null}
      <View className="flex-row items-end justify-between gap-4">
        <View className="flex-1">
          {eyebrow ? <Eyebrow className="mb-2">{eyebrow}</Eyebrow> : null}
          <Txt
            weight="display"
            accessibilityRole="header"
            className="text-[28px] leading-[34px] md:text-[32px] md:leading-[38px]"
            numberOfLines={2}
          >
            {title}
          </Txt>
          {subtitle ? <Muted className="mt-2 text-[15px] leading-6">{subtitle}</Muted> : null}
        </View>
        {right}
      </View>
    </View>
  );
}

/** Section title inside a page. */
export function SectionTitle({
  title,
  subtitle,
  eyebrow,
  right,
}: {
  title: string;
  subtitle?: string;
  /** Small label above the title. */
  eyebrow?: string;
  right?: ReactNode;
}) {
  return (
    <View className="mb-3 mt-12 flex-row items-end justify-between gap-4">
      <View className="flex-1">
        {eyebrow ? <Eyebrow className="mb-1">{eyebrow}</Eyebrow> : null}
        <Txt weight="semibold" accessibilityRole="header" className="text-[15px] leading-6">
          {title}
        </Txt>
        {subtitle ? <Muted className="mt-0.5 text-[13px]">{subtitle}</Muted> : null}
      </View>
      {right}
    </View>
  );
}
