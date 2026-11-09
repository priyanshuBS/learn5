/**
 * Loading and message screens, so the user never sees a blank page.
 */
import { ActivityIndicator, View } from 'react-native';
import { twMerge } from 'tailwind-merge';

import { colors } from '@/theme';

import { Button } from './Button';
import { Icon, type IconName } from './Icon';
import { Muted, Txt } from './Txt';

export function LoadingView({ label = 'Loading…' }: { label?: string }) {
  return (
    <View className="flex-1 items-center justify-center py-24" accessibilityLabel={label}>
      <ActivityIndicator color={colors.brand} />
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
  const toneColor =
    tone === 'success' ? colors.success : tone === 'warning' ? colors.warning : colors.brand;
  return (
    <View className="items-center px-6 py-16">
      <View
        className={twMerge(
          'h-14 w-14 items-center justify-center rounded-2xl border',
          tone === 'success' &&
            'border-emerald-100 bg-emerald-50 dark:border-emerald-500/20 dark:bg-emerald-500/10',
          tone === 'warning' &&
            'border-amber-100 bg-amber-50 dark:border-amber-500/20 dark:bg-amber-500/10',
          tone === 'brand' &&
            'border-brand-100 bg-brand-50 dark:border-brand-500/20 dark:bg-brand-500/10',
        )}
      >
        <Icon name={icon} size={24} color={toneColor} />
      </View>
      <Txt
        weight="bold"
        accessibilityRole="header"
        className="mt-5 text-center text-xl tracking-tight"
      >
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
  return <View className={twMerge('rounded-2xl bg-zinc-200/60 dark:bg-white/5', className)} />;
}
