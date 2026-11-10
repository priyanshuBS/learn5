/**
 * WeekStreak — the last 7 days as circles: filled = you played that day.
 * Today shows a dashed ring until you play.
 */
import { View } from 'react-native';
import { twMerge } from 'tailwind-merge';

import { addDays } from '@/lib/dates';
import { colors } from '@/theme';

import { CARD_CLASSES } from './Card';
import { Icon } from './Icon';
import { Muted, Txt } from './Txt';

const LETTERS = ['S', 'M', 'T', 'W', 'T', 'F', 'S'];

function weekday(date: string): number {
  const [y, m, d] = date.split('-').map(Number);
  return new Date(Date.UTC(y, m - 1, d)).getUTCDay();
}

export function WeekStreak({
  playedDays,
  today,
  current,
  best,
  className,
}: {
  playedDays: Set<string>;
  today: string;
  current: number;
  best: number;
  className?: string;
}) {
  const days = Array.from({ length: 7 }, (_, i) => addDays(today, i - 6));
  return (
    <View
      accessible
      accessibilityLabel={`${current} day streak. Best ${best}. Played ${
        days.filter((d) => playedDays.has(d)).length
      } of the last 7 days.`}
      className={twMerge(CARD_CLASSES, 'p-5', className)}
    >
      <View className="flex-row items-center justify-between">
        <View className="flex-row items-center gap-3">
          <View className="h-10 w-10 items-center justify-center rounded-xl bg-orange-50 dark:bg-orange-500/15">
            <Icon name="flame" size={20} color={colors.streak} filled />
          </View>
          <View>
            <Txt weight="display" className="text-lg">
              {current} day{current === 1 ? '' : 's'}
            </Txt>
            <Muted className="text-xs">Current streak</Muted>
          </View>
        </View>
        <View className="items-end">
          <Txt weight="semibold" className="text-sm">
            {best}
          </Txt>
          <Muted className="text-xs">Best</Muted>
        </View>
      </View>

      <View className="mt-5 flex-row justify-between">
        {days.map((day) => {
          const played = playedDays.has(day);
          const isToday = day === today;
          return (
            <View key={day} className="items-center gap-1.5">
              <View
                className={twMerge(
                  'h-9 w-9 items-center justify-center rounded-full',
                  played && 'bg-orange-500',
                  !played && isToday && 'border border-dashed border-zinc-400 dark:border-zinc-500',
                  !played && !isToday && 'bg-[#FCE8ED] dark:bg-ink-raised',
                )}
              >
                {played ? (
                  <Icon name="flame" size={16} color={colors.white} filled />
                ) : isToday ? (
                  <View className="h-1.5 w-1.5 rounded-full bg-zinc-400 dark:bg-zinc-500" />
                ) : null}
              </View>
              <Txt
                weight={isToday ? 'bold' : 'medium'}
                className={twMerge(
                  'text-[11px]',
                  isToday ? 'text-zinc-900 dark:text-zinc-100' : 'text-zinc-400 dark:text-zinc-500',
                )}
              >
                {LETTERS[weekday(day)]}
              </Txt>
            </View>
          );
        })}
      </View>
    </View>
  );
}
