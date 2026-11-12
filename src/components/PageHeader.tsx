/**
 * PageHeader — the title at the top of a page: a small label, a clear heading, an optional back button and something on the right.
 * SectionTitle — the same idea for sections inside a page.
 */
import type { ReactNode } from 'react';
import { LinearGradient } from 'expo-linear-gradient';
import { View } from 'react-native';
import Animated, { FadeInDown } from 'react-native-reanimated';

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
    <Animated.View entering={FadeInDown.duration(420)}>
      <View className="mb-6 md:mb-8">
        <View className="flex-row items-center gap-3">
          {back ? <IconButton icon="arrow-left" label="Go back" onPress={goBack} /> : null}
          <View className="flex-1">{eyebrow ? <Eyebrow>{eyebrow}</Eyebrow> : null}</View>
          {right}
        </View>
        <Txt
          weight="display"
          accessibilityRole="header"
          className="mt-2 text-[28px] leading-[34px] md:text-[34px] md:leading-[40px]"
          numberOfLines={2}
        >
          {title}
        </Txt>
        {subtitle ? <Muted className="mt-2 text-[15px] leading-6">{subtitle}</Muted> : null}
        {/* A short glowing accent line under the title */}
        <LinearGradient
          colors={['#FF5A1F', '#FFB347', 'rgba(124,92,255,0)']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 0 }}
          style={{ marginTop: 14, height: 3, width: 72, borderRadius: 3 }}
        />
      </View>
    </Animated.View>
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
    <View className="mb-4 mt-10 flex-row items-end justify-between gap-4">
      <View className="flex-1">
        {eyebrow ? <Eyebrow className="mb-1">{eyebrow}</Eyebrow> : null}
        <Txt weight="display" accessibilityRole="header" className="text-[21px] leading-7">
          {title}
        </Txt>
        {subtitle ? <Muted className="mt-1">{subtitle}</Muted> : null}
      </View>
      {right}
    </View>
  );
}
