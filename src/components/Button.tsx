/**
 * Button — consistent, accessible buttons.
 *   primary   = solid indigo (main action on a screen)
 *   secondary = white with a hairline border (other actions)
 *   soft      = light indigo tint (secondary action that should still stand out)
 *   ghost     = text only
 *   inverse   = white button on dark/coloured backgrounds
 */
import { ActivityIndicator, Pressable, View } from 'react-native';
import { twMerge } from 'tailwind-merge';

import { useColorScheme } from '@/hooks/useScheme';
import { colors } from '@/theme';

import { Icon, type IconName } from './Icon';
import { Txt } from './Txt';

type Variant = 'primary' | 'secondary' | 'soft' | 'ghost' | 'inverse';
type Size = 'sm' | 'md' | 'lg';

interface ButtonProps {
  label: string;
  onPress: () => void;
  variant?: Variant;
  size?: Size;
  icon?: IconName;
  /** Icon after the label instead of before. */
  iconRight?: boolean;
  disabled?: boolean;
  loading?: boolean;
  accessibilityHint?: string;
  className?: string;
  /** Extra classes for the label text (e.g. white text on a dark background). */
  labelClassName?: string;
}

const CONTAINER: Record<Variant, string> = {
  primary: 'bg-brand-600 active:bg-brand-700 web:hover:bg-brand-700',
  secondary:
    'border border-line bg-white active:bg-slate-50 web:hover:bg-slate-50 dark:border-ink-line dark:bg-ink-card dark:active:bg-ink-raised dark:web:hover:bg-ink-raised',
  soft: 'bg-brand-50 active:bg-brand-100 web:hover:bg-brand-100 dark:bg-brand-500/15 dark:active:bg-brand-500/25 dark:web:hover:bg-brand-500/25',
  ghost:
    'bg-transparent active:bg-slate-100 web:hover:bg-slate-100 dark:active:bg-white/5 dark:web:hover:bg-white/5',
  inverse: 'bg-white active:bg-brand-50 web:hover:bg-brand-50',
};

const LABEL: Record<Variant, string> = {
  primary: 'text-white dark:text-white',
  secondary: 'text-slate-900 dark:text-zinc-100',
  soft: 'text-brand-700 dark:text-brand-200',
  ghost: 'text-slate-700 dark:text-zinc-300',
  inverse: 'text-brand-800 dark:text-brand-800',
};

const SIZE: Record<Size, { box: string; text: string; icon: number }> = {
  sm: { box: 'min-h-9 rounded-lg px-3', text: 'text-sm', icon: 15 },
  md: { box: 'min-h-11 rounded-xl px-4', text: 'text-[15px]', icon: 17 },
  lg: { box: 'min-h-12 rounded-xl px-5', text: 'text-base', icon: 18 },
};

export function Button({
  label,
  onPress,
  variant = 'primary',
  size = 'lg',
  icon,
  iconRight,
  disabled,
  loading,
  accessibilityHint,
  className,
  labelClassName,
}: ButtonProps) {
  const scheme = useColorScheme();
  const dark = scheme === 'dark';
  const iconColor = {
    primary: colors.white,
    inverse: colors.brandDark,
    soft: dark ? colors.brandOnDark : colors.brandDark,
    ghost: dark ? colors.mutedDark : colors.muted,
    secondary: dark ? colors.textDark : colors.text,
  }[variant];
  const s = SIZE[size];
  const iconEl = icon ? <Icon name={icon} size={s.icon} color={iconColor} /> : null;

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={label}
      accessibilityHint={accessibilityHint}
      accessibilityState={{ disabled: !!disabled, busy: !!loading }}
      disabled={disabled || loading}
      onPress={onPress}
      className={twMerge(
        'flex-row items-center justify-center web:transition-colors',
        s.box,
        CONTAINER[variant],
        disabled && 'opacity-40',
        className,
      )}
    >
      {loading ? (
        <ActivityIndicator color={iconColor} />
      ) : (
        <View className="flex-row items-center gap-2">
          {!iconRight && iconEl}
          <Txt weight="semibold" className={twMerge(s.text, LABEL[variant], labelClassName)}>
            {label}
          </Txt>
          {iconRight && iconEl}
        </View>
      )}
    </Pressable>
  );
}

/** A square icon-only button (close, back, shuffle). */
export function IconButton({
  icon,
  label,
  onPress,
  className,
  onDark,
  variant = 'outline',
}: {
  icon: IconName;
  label: string;
  onPress: () => void;
  className?: string;
  /** Use on coloured/dark backgrounds. */
  onDark?: boolean;
  variant?: 'outline' | 'ghost';
}) {
  const scheme = useColorScheme();
  const color = onDark ? colors.white : scheme === 'dark' ? colors.textDark : colors.text;
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={label}
      onPress={onPress}
      hitSlop={6}
      className={twMerge(
        'h-10 w-10 items-center justify-center rounded-xl web:transition-colors',
        onDark
          ? 'bg-white/10 active:bg-white/20 web:hover:bg-white/20'
          : variant === 'ghost'
            ? 'active:bg-slate-100 web:hover:bg-slate-100 dark:active:bg-white/5 dark:web:hover:bg-white/5'
            : 'border border-line bg-white active:bg-slate-50 web:hover:bg-slate-50 dark:border-ink-line dark:bg-ink-card dark:web:hover:bg-ink-raised',
        className,
      )}
    >
      <Icon name={icon} size={18} color={color} />
    </Pressable>
  );
}
