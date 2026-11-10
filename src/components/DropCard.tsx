/**
 * Drop status UI.
 *   StatusChip — small coloured label: Start / 4/5 / Opens 1:00 PM / Locked / Running late
 *   SlotTile   — one of today's 3 drops inside a Home category card
 *   DropCard   — full-width row card on the Category screen
 */
import { Pressable, View } from 'react-native';
import { twMerge } from 'tailwind-merge';

import type { SlotStatus } from '@/features/drops/status';
import { useColorScheme } from '@/hooks/useScheme';
import { colors, SLOT_ICONS } from '@/theme';

import { CARD_CLASSES, CARD_PRESSABLE_CLASSES } from './Card';
import { Pill, type Tone } from './DifficultyBadge';
import { Icon, type IconName } from './Icon';
import { Muted, Txt } from './Txt';

const CHIP: Record<SlotStatus, { tone: Tone; icon: IconName }> = {
  available: { tone: 'brand', icon: 'play' },
  done: { tone: 'success', icon: 'check' },
  upcoming: { tone: 'neutral', icon: 'clock' },
  locked: { tone: 'neutral', icon: 'lock' },
  missing: { tone: 'warning', icon: 'hourglass' },
};

function chipLabel(status: SlotStatus, timeLabel: string, scoreLabel?: string): string {
  switch (status) {
    case 'available':
      return 'Start';
    case 'done':
      return scoreLabel ?? 'Done';
    case 'upcoming':
      return timeLabel ? `Opens ${timeLabel}` : 'Soon';
    case 'locked':
      return timeLabel || 'Locked';
    case 'missing':
      return 'Running late';
  }
}

export function StatusChip({
  status,
  timeLabel,
  scoreLabel,
}: {
  status: SlotStatus;
  timeLabel: string;
  scoreLabel?: string;
}) {
  const c = CHIP[status];
  return <Pill tone={c.tone} icon={c.icon} label={chipLabel(status, timeLabel, scoreLabel)} />;
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
      return 'Running late, tap to see the latest drop';
  }
}

/** One of today's 3 drops, as a small tile (Home category cards). */
export function SlotTile({
  name,
  drop,
  timeLabel,
  status,
  scoreLabel,
  onPress,
}: {
  name: string;
  /** 1, 2 or 3 (picks the sunrise / sun / moon icon). */
  drop: number;
  timeLabel: string;
  status: SlotStatus;
  scoreLabel?: string;
  onPress?: () => void;
}) {
  const scheme = useColorScheme();
  const dark = scheme === 'dark';
  const available = status === 'available';
  const done = status === 'done';
  const waiting = status === 'upcoming' || status === 'locked';

  const value =
    status === 'available'
      ? 'Start'
      : status === 'done'
        ? (scoreLabel ?? 'Done')
        : status === 'missing'
          ? 'Late'
          : timeLabel;
  const valueIcon: IconName | null = available
    ? 'arrow-right'
    : done
      ? 'check'
      : status === 'locked'
        ? 'lock'
        : status === 'missing'
          ? 'hourglass'
          : null;
  const iconColor = available
    ? dark
      ? colors.black
      : colors.white
    : done
      ? colors.success
      : status === 'missing'
        ? colors.warning
        : dark
          ? colors.mutedDark
          : colors.muted;

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={`${name} drop at ${timeLabel}: ${a11yStatus(status, timeLabel, scoreLabel)}`}
      accessibilityState={{ disabled: !onPress }}
      disabled={!onPress}
      onPress={onPress}
      className={twMerge(
        'min-h-16 flex-1 justify-between rounded-xl border px-3 py-2.5 web:transition-colors',
        available &&
          'border-[#0A0A0A] bg-[#0A0A0A] active:opacity-90 web:hover:bg-[#262626] dark:border-white dark:bg-white dark:web:hover:bg-zinc-200',
        done &&
          'border-emerald-100 bg-emerald-50/70 dark:border-emerald-500/15 dark:bg-emerald-500/10',
        waiting && 'border-dashed border-line dark:border-ink-line',
        status === 'missing' &&
          'border-amber-100 bg-amber-50/70 dark:border-amber-500/15 dark:bg-amber-500/10',
      )}
    >
      <View className="flex-row items-center gap-1.5">
        <Icon
          name={SLOT_ICONS[drop - 1] ?? 'clock'}
          size={13}
          color={
            available
              ? dark
                ? 'rgba(10,10,10,0.7)'
                : 'rgba(255,255,255,0.75)'
              : dark
                ? colors.mutedDark
                : colors.muted
          }
        />
        <Txt
          className={twMerge(
            'text-xs',
            available ? 'text-white/75 dark:text-[#0A0A0A]/70' : 'text-zinc-500 dark:text-zinc-400',
          )}
          numberOfLines={1}
        >
          {name}
        </Txt>
      </View>
      <View className="mt-1.5 flex-row items-center gap-1">
        {valueIcon && !available ? (
          <Icon name={valueIcon} size={13} color={iconColor} strokeWidth={2.5} />
        ) : null}
        <Txt
          weight="semibold"
          numberOfLines={1}
          className={twMerge(
            'text-[13px]',
            available && 'text-white dark:text-[#0A0A0A]',
            done && 'text-emerald-700 dark:text-emerald-300',
            waiting && 'text-zinc-500 dark:text-zinc-400',
            status === 'missing' && 'text-amber-700 dark:text-amber-300',
          )}
        >
          {value}
        </Txt>
        {available && valueIcon ? (
          <Icon name={valueIcon} size={13} color={iconColor} strokeWidth={2.5} />
        ) : null}
      </View>
    </Pressable>
  );
}

/** Full-width row card used on the Category screen. */
export function DropCard({
  status,
  title,
  meta,
  drop,
  timeLabel,
  scoreLabel,
  onPress,
}: {
  status: SlotStatus;
  title: string;
  /** e.g. "Morning · 7:00 AM" */
  meta: string;
  /** 1, 2 or 3 (picks the sunrise / sun / moon icon). */
  drop: number;
  timeLabel: string;
  scoreLabel?: string;
  onPress?: () => void;
}) {
  const scheme = useColorScheme();
  const muted = status === 'upcoming' || status === 'locked';
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={`${title}. ${meta}. ${a11yStatus(status, timeLabel, scoreLabel)}`}
      accessibilityState={{ disabled: !onPress }}
      disabled={!onPress}
      onPress={onPress}
      className={twMerge(
        CARD_CLASSES,
        onPress && CARD_PRESSABLE_CLASSES,
        'mb-2 min-h-16 flex-row items-center gap-3.5 px-4 py-3.5',
      )}
    >
      <View className="h-10 w-10 items-center justify-center rounded-xl bg-zinc-100 dark:bg-ink-raised">
        <Icon
          name={SLOT_ICONS[drop - 1] ?? 'clock'}
          size={18}
          color={scheme === 'dark' ? colors.mutedDark : colors.muted}
        />
      </View>
      <View className="flex-1">
        <Txt
          weight="semibold"
          className={twMerge('text-[15px]', muted && 'text-zinc-500 dark:text-zinc-400')}
          numberOfLines={2}
        >
          {title}
        </Txt>
        <Muted className="mt-0.5 text-[13px]">{meta}</Muted>
      </View>
      <StatusChip status={status} timeLabel={timeLabel} scoreLabel={scoreLabel} />
    </Pressable>
  );
}

/** One of today's drops on a vertical timeline (Category screen): morning → afternoon → evening. */
export function TimelineDrop({
  drop,
  name,
  time,
  status,
  title,
  scoreLabel,
  onPress,
  last,
}: {
  drop: number;
  name: string;
  time: string;
  status: SlotStatus;
  title: string;
  scoreLabel?: string;
  onPress?: () => void;
  /** No connecting line below the last item. */
  last?: boolean;
}) {
  const dark = useColorScheme() === 'dark';
  const done = status === 'done';
  const available = status === 'available';
  const waiting = status === 'upcoming' || status === 'locked';
  const nodeIcon: IconName = done ? 'check' : (SLOT_ICONS[drop - 1] ?? 'clock');
  const nodeColor = done
    ? colors.white
    : available
      ? colors.black
      : status === 'missing'
        ? colors.warning
        : dark
          ? colors.mutedDark
          : colors.muted;

  return (
    <View className="flex-row gap-4">
      <View className="items-center">
        <View
          className={twMerge(
            'h-12 w-12 items-center justify-center rounded-full',
            done && 'bg-emerald-500',
            available && 'bg-[#0A0A0A] dark:bg-white',
            status === 'missing' && 'bg-amber-50 dark:bg-amber-500/10',
            waiting && 'border border-line bg-white dark:border-ink-line dark:bg-ink-card',
          )}
        >
          <Icon name={nodeIcon} size={18} color={nodeColor} strokeWidth={done ? 3 : 2} />
        </View>
        {!last ? (
          <View className="my-1.5 w-0.5 flex-1 rounded-full bg-line dark:bg-ink-line" />
        ) : null}
      </View>
      <Pressable
        accessibilityRole="button"
        accessibilityLabel={`${name} drop at ${time}. ${title}. ${a11yStatus(status, time, scoreLabel)}`}
        accessibilityState={{ disabled: !onPress }}
        disabled={!onPress}
        onPress={onPress}
        className={twMerge(
          CARD_CLASSES,
          onPress && CARD_PRESSABLE_CLASSES,
          'mb-4 flex-1 flex-row items-center gap-3 px-4 py-4',
          available && 'border-brand-200 dark:border-brand-400/30',
        )}
      >
        <View className="flex-1">
          <Muted className="text-xs">
            {name} · {time}
          </Muted>
          <Txt
            weight="semibold"
            numberOfLines={2}
            className={twMerge('mt-0.5 text-[15px]', waiting && 'text-zinc-500 dark:text-zinc-400')}
          >
            {title}
          </Txt>
        </View>
        <StatusChip status={status} timeLabel={time} scoreLabel={scoreLabel} />
      </Pressable>
    </View>
  );
}
