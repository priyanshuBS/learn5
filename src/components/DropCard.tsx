/**
 * Drop rows (flat, black and white).
 *   StatusChip   — the right-hand status: Start / 4/5 ✓ / Opens 4:00 AM / Late
 *   DropCard     — one drop as a row inside a bordered list (archive)
 *   TimelineDrop — today's drop as a bordered row (subject page)
 */
import { Pressable, View } from 'react-native';
import { twMerge } from 'tailwind-merge';

import type { SlotStatus } from '@/features/drops/status';
import { useColorScheme } from '@/hooks/useScheme';
import { colors } from '@/theme';

import { CARD_CLASSES, CARD_PRESSABLE_CLASSES } from './Card';
import { Icon } from './Icon';
import { Muted, Txt } from './Txt';

export function StatusChip({
  status,
  timeLabel,
  scoreLabel,
}: {
  status: SlotStatus;
  timeLabel: string;
  scoreLabel?: string;
}) {
  const dark = useColorScheme() === 'dark';
  if (status === 'available') {
    return (
      <View className="h-8 flex-row items-center rounded-md bg-brand-600 px-3 dark:bg-brand-500">
        <Txt weight="medium" className="text-[13px] text-white dark:text-white">
          Start
        </Txt>
      </View>
    );
  }
  if (status === 'done') {
    return (
      <View className="flex-row items-center gap-1.5">
        <Icon name="check" size={14} color={colors.success} strokeWidth={2.5} />
        <Txt weight="mono" className="text-[13px]">
          {scoreLabel ?? 'Done'}
        </Txt>
      </View>
    );
  }
  return (
    <View className="flex-row items-center gap-1.5">
      <Icon
        name={status === 'missing' ? 'hourglass' : 'lock'}
        size={12}
        color={dark ? '#737373' : '#A3A3A3'}
      />
      <Txt weight="mono" className="text-[12.5px] text-zinc-500">
        {status === 'missing' ? 'Late' : timeLabel || 'Soon'}
      </Txt>
    </View>
  );
}

function a11yStatus(status: SlotStatus, time: string, score?: string): string {
  switch (status) {
    case 'done':
      return `Done, score ${score ?? ''}`;
    case 'available':
      return 'Available, tap to start';
    case 'upcoming':
      return `Opens at ${time}`;
    case 'locked':
      return `Locked until ${time}`;
    case 'missing':
      return 'Running late';
  }
}

/** One drop as a row inside a bordered list. */
export function DropCard({
  status,
  title,
  meta,
  timeLabel,
  scoreLabel,
  onPress,
  divider,
}: {
  status: SlotStatus;
  title: string;
  /** e.g. "Today's drop" */
  meta: string;
  /** Kept for older callers. */
  drop?: number;
  timeLabel: string;
  scoreLabel?: string;
  onPress?: () => void;
  /** Hairline above the row (every row but the first). */
  divider?: boolean;
}) {
  const muted = status === 'upcoming' || status === 'locked';
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={`${title}. ${meta}. ${a11yStatus(status, timeLabel, scoreLabel)}`}
      accessibilityState={{ disabled: !onPress }}
      disabled={!onPress}
      onPress={onPress}
      className={twMerge(
        'min-h-14 flex-row items-center gap-4 px-4 py-3.5 md:px-5',
        onPress && CARD_PRESSABLE_CLASSES,
        divider && 'border-t border-line dark:border-ink-line',
      )}
    >
      <View className="flex-1">
        <Txt
          weight="medium"
          className={twMerge('text-[15px] leading-[22px]', muted && 'text-zinc-500')}
          numberOfLines={2}
        >
          {title}
        </Txt>
        {meta ? <Muted className="mt-0.5 text-[13px]">{meta}</Muted> : null}
      </View>
      <StatusChip status={status} timeLabel={timeLabel} scoreLabel={scoreLabel} />
    </Pressable>
  );
}

/** Today's drop as a single bordered row (subject page). */
export function TimelineDrop({
  name,
  time,
  status,
  title,
  scoreLabel,
  onPress,
}: {
  drop?: number;
  name: string;
  time: string;
  status: SlotStatus;
  title: string;
  scoreLabel?: string;
  onPress?: () => void;
  last?: boolean;
}) {
  const waiting = status === 'upcoming' || status === 'locked';
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={`${name} at ${time}. ${title}. ${a11yStatus(status, time, scoreLabel)}`}
      accessibilityState={{ disabled: !onPress }}
      disabled={!onPress}
      onPress={onPress}
      className={twMerge(
        CARD_CLASSES,
        onPress && CARD_PRESSABLE_CLASSES,
        'mb-3 flex-row items-center gap-4 px-4 py-4 md:px-5',
      )}
    >
      <View className="flex-1">
        <Muted className="text-[13px]">
          {name} · {time}
        </Muted>
        <Txt
          weight="medium"
          numberOfLines={2}
          className={twMerge('mt-0.5 text-[16px] leading-6', waiting && 'text-zinc-500')}
        >
          {title}
        </Txt>
      </View>
      <StatusChip status={status} timeLabel={time} scoreLabel={scoreLabel} />
    </Pressable>
  );
}
