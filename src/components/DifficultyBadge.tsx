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
import { useColorScheme } from '@/hooks/useScheme';
import { categoryTone, colors, withAlpha } from '@/theme';

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
    box: 'bg-brand-50 dark:bg-brand-500/15',
    text: 'text-brand-700 dark:text-brand-200',
    icon: colors.brand,
  },
  success: {
    box: 'bg-emerald-50 dark:bg-emerald-500/10',
    text: 'text-emerald-700 dark:text-emerald-300',
    icon: colors.success,
  },
  warning: {
    box: 'bg-amber-50 dark:bg-amber-500/10',
    text: 'text-amber-700 dark:text-amber-300',
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
        'flex-row items-center gap-1 self-start rounded-full px-3 py-1.5',
        t.box,
        className,
      )}
    >
      {icon ? <Icon name={icon} size={13} color={t.icon} strokeWidth={2.25} /> : null}
      <Txt weight="semibold" className={twMerge('text-xs', t.text)} numberOfLines={1}>
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
      <Txt weight="medium" className="text-xs text-zinc-600 dark:text-zinc-300">
        {s.label} · {POINTS_BY_DIFFICULTY[difficulty]} pts
      </Txt>
    </View>
  );
}

export function Tag({ label, color: base }: { label: string; color?: string }) {
  const dark = useColorScheme() === 'dark';
  const color = base ? categoryTone(base, dark) : undefined;
  return (
    <View
      className={twMerge('rounded-full px-2.5 py-1', !color && 'bg-zinc-100 dark:bg-ink-raised')}
      style={color ? { backgroundColor: withAlpha(color, dark ? 0.14 : 0.1) } : undefined}
    >
      <Txt
        weight="semibold"
        className="text-xs text-zinc-600 dark:text-zinc-300"
        style={color ? { color } : undefined}
        numberOfLines={1}
      >
        {label}
      </Txt>
    </View>
  );
}
