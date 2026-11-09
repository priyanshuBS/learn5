/**
 * Theme controls.
 *   ThemeToggle     — segmented control: System / Light / Dark (settings, sidebar)
 *   ThemeIconButton — one round button that flips light ↔ dark (phone header)
 */
import { Pressable, View } from 'react-native';
import { twMerge } from 'tailwind-merge';

import { useTheme, type ThemePreference } from '@/features/theme/store';
import { useColorScheme } from '@/hooks/useScheme';
import { colors } from '@/theme';

import { IconButton } from './Button';
import { Icon, type IconName } from './Icon';
import { Txt } from './Txt';

const OPTIONS: { value: ThemePreference; label: string; icon: IconName }[] = [
  { value: 'system', label: 'System', icon: 'monitor' },
  { value: 'light', label: 'Light', icon: 'sun' },
  { value: 'dark', label: 'Dark', icon: 'moon' },
];

export function ThemeToggle({
  compact = false,
  className,
}: {
  /** Icons only (for narrow places like the sidebar). */
  compact?: boolean;
  className?: string;
}) {
  const preference = useTheme((s) => s.preference);
  const setPreference = useTheme((s) => s.setPreference);
  const dark = useColorScheme() === 'dark';

  return (
    <View
      accessibilityRole="radiogroup"
      accessibilityLabel="Appearance"
      className={twMerge(
        'flex-row rounded-2xl border border-line bg-zinc-100/70 p-1 dark:border-ink-line dark:bg-ink-card',
        className,
      )}
    >
      {OPTIONS.map((o) => {
        const active = preference === o.value;
        return (
          <Pressable
            key={o.value}
            accessibilityRole="radio"
            accessibilityLabel={`${o.label} theme`}
            accessibilityState={{ checked: active }}
            onPress={() => setPreference(o.value)}
            className={twMerge(
              'min-h-8 flex-1 flex-row items-center justify-center gap-1.5 rounded-lg px-2.5 web:transition-colors',
              active
                ? ' border-zinc-300 bg-white dark:border-black/50 dark:bg-ink-raised'
                : 'web:hover:bg-white/60 dark:web:hover:bg-white/5',
            )}
          >
            <Icon
              name={o.icon}
              size={14}
              color={
                active
                  ? dark
                    ? colors.textDark
                    : colors.text
                  : dark
                    ? colors.mutedDark
                    : colors.muted
              }
            />
            {compact ? null : (
              <Txt
                weight={active ? 'semibold' : 'medium'}
                className={twMerge(
                  'text-[13px]',
                  active ? 'text-zinc-900 dark:text-zinc-100' : 'text-zinc-500 dark:text-zinc-400',
                )}
              >
                {o.label}
              </Txt>
            )}
          </Pressable>
        );
      })}
    </View>
  );
}

export function ThemeIconButton() {
  const dark = useColorScheme() === 'dark';
  const setPreference = useTheme((s) => s.setPreference);
  return (
    <IconButton
      icon={dark ? 'sun' : 'moon'}
      label={dark ? 'Switch to light theme' : 'Switch to dark theme'}
      onPress={() => setPreference(dark ? 'light' : 'dark')}
      variant="ghost"
    />
  );
}
