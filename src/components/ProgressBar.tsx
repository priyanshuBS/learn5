/**
 * ProgressBar  — a thin rounded bar that fills from 0 to 100%.
 * ProgressRing — a circular progress ring with content in the middle.
 * QuizProgress — one segment per question that turns green/red as you answer.
 */
import type { ReactNode } from 'react';
import { View } from 'react-native';
import Svg, { Circle } from 'react-native-svg';
import { twMerge } from 'tailwind-merge';

import { useColorScheme } from '@/hooks/useScheme';
import { brandTone, colors } from '@/theme';

export function ProgressBar({
  value,
  color,
  className,
  label,
}: {
  /** 0 to 1 */
  value: number;
  color?: string;
  className?: string;
  label: string;
}) {
  const dark = useColorScheme() === 'dark';
  const percent = Math.round(Math.min(1, Math.max(0, value)) * 100);
  return (
    <View
      accessible
      accessibilityRole="progressbar"
      accessibilityLabel={label}
      accessibilityValue={{ min: 0, max: 100, now: percent }}
      className={twMerge(
        'h-2 overflow-hidden rounded-full bg-[#E4F0E8] dark:bg-ink-line',
        className,
      )}
    >
      <View
        className="h-full rounded-full"
        style={{ width: `${percent}%`, backgroundColor: color ?? brandTone(dark) }}
      />
    </View>
  );
}

export function ProgressRing({
  value,
  size = 64,
  strokeWidth = 6,
  color,
  trackColor,
  label,
  children,
}: {
  /** 0 to 1 */
  value: number;
  size?: number;
  strokeWidth?: number;
  color?: string;
  /** Colour of the empty part (defaults to a light/dark grey). */
  trackColor?: string;
  label: string;
  children?: ReactNode;
}) {
  const scheme = useColorScheme();
  const clamped = Math.min(1, Math.max(0, value));
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const track = trackColor ?? (scheme === 'dark' ? colors.trackDark : colors.track);
  return (
    <View
      accessible
      accessibilityRole="progressbar"
      accessibilityLabel={label}
      accessibilityValue={{ min: 0, max: 100, now: Math.round(clamped * 100) }}
      style={{ width: size, height: size }}
      className="items-center justify-center"
    >
      <Svg
        width={size}
        height={size}
        style={{ position: 'absolute', transform: [{ rotate: '-90deg' }] }}
      >
        <Circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke={track}
          strokeWidth={strokeWidth}
          fill="none"
        />
        {clamped > 0 ? (
          <Circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            stroke={color ?? brandTone(scheme === 'dark')}
            strokeWidth={strokeWidth}
            fill="none"
            strokeLinecap="round"
            strokeDasharray={`${circumference} ${circumference}`}
            strokeDashoffset={circumference * (1 - clamped)}
          />
        ) : null}
      </Svg>
      {children}
    </View>
  );
}

export type SegmentState = 'correct' | 'wrong' | 'current' | 'todo';

export function QuizProgress({ segments }: { segments: SegmentState[] }) {
  const done = segments.filter((s) => s === 'correct' || s === 'wrong').length;
  return (
    <View
      accessible
      accessibilityRole="progressbar"
      accessibilityLabel={`Question ${Math.min(done + 1, segments.length)} of ${segments.length}`}
      className="flex-1 flex-row gap-1.5"
    >
      {segments.map((state, i) => (
        <View
          key={i}
          className={twMerge(
            'h-1.5 flex-1 overflow-hidden rounded-full',
            state === 'todo' && 'bg-[#E4F0E8] dark:bg-ink-line',
            state === 'current' && 'bg-brand-600 dark:bg-brand-400',
            state === 'correct' && 'bg-green-600',
            state === 'wrong' && 'bg-red-500',
          )}
        />
      ))}
    </View>
  );
}
