/**
 * Small labels.
 *   Pill            — rounded label with an optional icon, in a colour tone
 *   DifficultyBadge — "Easy · 10 pts", "Medium · 20 pts", "Hard · 30 pts"
 *   Tag             — neutral label (category name, topic), optionally tinted
 */
import { View } from 'react-native';
import { twMerge } from 'tailwind-merge';

import { POINTS_BY_DIFFICULTY } from '@/features/points/points';
import type { Difficulty } from '@/lib/schema';
import { colors } from '@/theme';

import { Icon, type IconName } from './Icon';
import { Txt } from './Txt';

export type Tone = 'neutral' | 'brand' | 'success' | 'warning' | 'danger';

const TONES: Record<Tone, { box: string; text: string; icon: string }> = {
  neutral: {
    box: 'bg-zinc-100 dark:bg-ink-raised',
    text: 'text-zinc-600 dark:text-zinc-300',
    icon: colors.muted,
  },
  brand: {
    box: 'bg-brand-50 dark:bg-brand-400/15',
    text: 'text-brand-700 dark:text-brand-300',
    icon: colors.brand,
  },
  success: {
    box: 'bg-emerald-50 dark:bg-emerald-500/10',
    text: 'text-emerald-700 dark:text-emerald-300',
    icon: colors.success,
  },
  warning: {
    box: 'bg-zinc-100 dark:bg-white/[0.05]',
    text: 'text-zinc-700 dark:text-zinc-300',
    icon: colors.warning,
  },
  danger: {
    box: 'bg-rose-50 dark:bg-rose-500/10',
    text: 'text-rose-700 dark:text-rose-300',
    icon: colors.danger,
  },
};

export function Pill({
  label,
  icon,
  tone = 'neutral',
  className,
}: {
  label: string;
  icon?: IconName;
  tone?: Tone;
  className?: string;
}) {
  const t = TONES[tone];
  return (
    <View
      className={twMerge(
        'flex-row items-center gap-1 self-start rounded-lg px-2.5 py-1',
        t.box,
        className,
      )}
    >
      {icon ? <Icon name={icon} size={13} color={t.icon} strokeWidth={2.25} /> : null}
      <Txt weight="medium" className={twMerge('text-xs', t.text)} numberOfLines={1}>
        {label}
      </Txt>
    </View>
  );
}

const DIFFICULTY: Record<Difficulty, { dot: string; label: string }> = {
  easy: { dot: 'bg-emerald-500', label: 'Easy' },
  medium: { dot: 'bg-amber-500', label: 'Medium' },
  hard: { dot: 'bg-rose-500', label: 'Hard' },
};

export function DifficultyBadge({ difficulty }: { difficulty: Difficulty }) {
  const s = DIFFICULTY[difficulty];
  return (
    <View
      accessible
      accessibilityLabel={`${s.label} question, worth ${POINTS_BY_DIFFICULTY[difficulty]} points`}
      className="flex-row items-center gap-1.5 rounded-full border border-line px-2.5 py-1 dark:border-ink-line"
    >
      <View className={twMerge('h-1.5 w-1.5 rounded-full', s.dot)} />
      <Txt weight="medium" className="text-xs text-zinc-600 dark:text-zinc-400">
        {s.label} · {POINTS_BY_DIFFICULTY[difficulty]} pts
      </Txt>
    </View>
  );
}

export function Tag({ label }: { label: string; color?: string }) {
  return (
    <View className="rounded-full border border-line px-2.5 py-1 dark:border-ink-line">
      <Txt weight="medium" className="text-xs text-zinc-600 dark:text-zinc-400" numberOfLines={1}>
        {label}
      </Txt>
    </View>
  );
}
