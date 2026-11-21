/**
 * WeekStreak — the last 7 days as squares: filled = you played that day,
 * outlined = today (not played yet). Current and best streak on top.
 */
import { View } from 'react-native';
import { twMerge } from 'tailwind-merge';

import { addDays } from '@/lib/dates';

import { CARD_CLASSES } from './Card';
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
      <View className="flex-row items-end justify-between">
        <View>
          <Muted className="text-[13px]">Streak</Muted>
          <Txt weight="display" className="mt-1 text-[26px] leading-8">
            {current} {current === 1 ? 'day' : 'days'}
          </Txt>
        </View>
        <Muted className="text-[13px]">Best {best}</Muted>
      </View>

      <View className="mt-5 flex-row gap-1.5">
        {days.map((day) => {
          const played = playedDays.has(day);
          const isToday = day === today;
          return (
            <View key={day} className="flex-1 items-center gap-2">
              <View
                className={twMerge(
                  'h-8 w-full rounded-md',
                  played && 'bg-zinc-950 dark:bg-[#EDEDED]',
                  !played && isToday && 'border border-zinc-950 dark:border-[#EDEDED]',
                  !played && !isToday && 'bg-zinc-100 dark:bg-ink-raised',
                )}
              />
              <Txt
                weight="mono"
                className={twMerge(
                  'text-[11px]',
                  isToday
                    ? 'text-zinc-950 dark:text-[#EDEDED]'
                    : 'text-zinc-400 dark:text-zinc-500',
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
