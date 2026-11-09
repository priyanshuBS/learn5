/**
 * PageHeader — the title at the top of a page: a small mono label, a big display
 * heading, an optional back button and something on the right.
 * SectionTitle — the same idea for sections inside a page.
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
  /** Small uppercase label above the title. */
  eyebrow?: string;
  back?: boolean;
  right?: ReactNode;
}) {
  return (
    <View className="mb-8 md:mb-10">
      <View className="flex-row items-center gap-3">
        {back ? <IconButton icon="arrow-left" label="Go back" onPress={goBack} /> : null}
        <View className="flex-1">{eyebrow ? <Eyebrow>{eyebrow}</Eyebrow> : null}</View>
        {right}
      </View>
      <Txt
        weight="heavy"
        accessibilityRole="header"
        className="mt-3 text-[36px] leading-[40px] md:text-[48px] md:leading-[52px]"
        numberOfLines={2}
      >
        {title}
      </Txt>
      {subtitle ? <Muted className="mt-2 text-[15px] leading-6">{subtitle}</Muted> : null}
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
  /** Small uppercase label above the title. */
  eyebrow?: string;
  right?: ReactNode;
}) {
  return (
    <View className="mb-5 mt-14 flex-row items-end justify-between gap-4">
      <View className="flex-1">
        {eyebrow ? <Eyebrow className="mb-2">{eyebrow}</Eyebrow> : null}
        <Txt weight="bold" accessibilityRole="header" className="text-[24px] leading-8">
          {title}
        </Txt>
        {subtitle ? <Muted className="mt-1">{subtitle}</Muted> : null}
      </View>
      {right}
    </View>
  );
}
