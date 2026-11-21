/**
 * Loading and message screens, so the user never sees a blank page.
 */
import { ActivityIndicator, View } from 'react-native';
import { twMerge } from 'tailwind-merge';

import { useColorScheme } from '@/hooks/useScheme';
import { brandTone, colors } from '@/theme';

import { Button } from './Button';
import { Icon, type IconName } from './Icon';
import { Muted, Txt } from './Txt';

export function LoadingView({ label = 'Loading…' }: { label?: string }) {
  return (
    <View className="flex-1 items-center justify-center py-24" accessibilityLabel={label}>
      <ActivityIndicator color={colors.muted} />
      <Muted className="mt-3">{label}</Muted>
    </View>
  );
}

export function MessageView({
  icon,
  tone = 'brand',
  title,
  message,
  actionLabel,
  onAction,
  secondaryLabel,
  onSecondary,
}: {
  icon: IconName;
  tone?: 'brand' | 'success' | 'warning';
  title: string;
  message: string;
  actionLabel?: string;
  onAction?: () => void;
  secondaryLabel?: string;
  onSecondary?: () => void;
}) {
  const dark = useColorScheme() === 'dark';
  const toneColor =
    tone === 'success' ? colors.success : tone === 'warning' ? colors.warning : brandTone(dark);
  return (
    <View className="items-center px-6 py-16">
      <View
        className={twMerge(
          'h-12 w-12 items-center justify-center rounded-xl border border-line dark:border-ink-line',
        )}
      >
        <Icon name={icon} size={20} color={toneColor} strokeWidth={1.75} />
      </View>
      <Txt weight="semibold" accessibilityRole="header" className="mt-5 text-center text-[18px]">
        {title}
      </Txt>
      <Muted className="mt-2 max-w-sm text-center text-[15px] leading-6">{message}</Muted>
      {actionLabel && onAction ? (
        <Button label={actionLabel} onPress={onAction} size="md" className="mt-6 min-w-44" />
      ) : null}
      {secondaryLabel && onSecondary ? (
        <Button
          label={secondaryLabel}
          onPress={onSecondary}
          variant="ghost"
          size="md"
          className="mt-2 min-w-44"
        />
      ) : null}
    </View>
  );
}

/** Grey placeholder blocks while a page loads. */
export function SkeletonBlock({ className }: { className: string }) {
  return <View className={twMerge('rounded-xl bg-zinc-100 dark:bg-ink-raised', className)} />;
}
