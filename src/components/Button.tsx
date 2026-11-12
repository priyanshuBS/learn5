/**
 * Button — the app's buttons. They squish slightly when pressed.
 *
 *   primary   = solid indigo with white text: the main action
 *   accent    = the same as primary (older name)
 *   secondary = outlined
 *   soft      = light grey tint
 *   success   = green, danger = red (quiz feedback)
 *   inverse   = white, for coloured panels
 *   ghost     = text only
 */
import { ActivityIndicator, Pressable, View } from 'react-native';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSpring,
  withTiming,
} from 'react-native-reanimated';
import { twMerge } from 'tailwind-merge';

import { useColorScheme } from '@/hooks/useScheme';
import { haptics } from '@/lib/haptics';
import { colors } from '@/theme';

import { Icon, type IconName } from './Icon';
import { Txt } from './Txt';

export type ButtonVariant =
  'primary' | 'accent' | 'secondary' | 'soft' | 'success' | 'danger' | 'inverse' | 'ghost';
type Size = 'sm' | 'md' | 'lg';

function styles(variant: ButtonVariant, dark: boolean): { box: string; text: string } {
  switch (variant) {
    case 'primary':
    case 'accent':
      return dark
        ? {
            box: 'bg-brand-600 web:shadow-[0_8px_28px_-12px_rgba(110,120,255,0.75)] web:hover:bg-brand-500',
            text: '#FFFFFF',
          }
        : {
            box: 'bg-brand-600 web:shadow-[0_8px_24px_-14px_rgba(79,91,255,0.6)] web:hover:bg-brand-700',
            text: '#FFFFFF',
          };
    case 'secondary':
      return dark
        ? {
            box: 'border border-ink-line bg-ink-raised web:hover:border-zinc-600',
            text: colors.textDark,
          }
        : {
            box: 'border border-line bg-white web:hover:border-zinc-300 web:hover:bg-zinc-50',
            text: colors.text,
          };
    case 'soft':
      return dark
        ? { box: 'bg-brand-400/15 web:hover:bg-brand-400/25', text: colors.brandOnDark }
        : { box: 'bg-brand-50 web:hover:bg-brand-100', text: colors.brandDark };
    case 'success':
      return { box: 'bg-green-600 web:hover:bg-green-700', text: '#FFFFFF' };
    case 'danger':
      return { box: 'bg-red-600 web:hover:bg-red-700', text: '#FFFFFF' };
    case 'inverse':
      return { box: 'bg-white web:hover:bg-brand-50', text: '#0E0F14' };
    case 'ghost':
      return dark
        ? { box: 'web:hover:bg-white/5', text: '#CFD0D9' }
        : { box: 'web:hover:bg-black/5', text: '#3A3C48' };
  }
}

const SIZE: Record<Size, { height: number; pad: string; text: string; icon: number }> = {
  sm: { height: 38, pad: 'px-4', text: 'text-[13px]', icon: 15 },
  md: { height: 46, pad: 'px-5', text: 'text-[14px]', icon: 16 },
  lg: { height: 54, pad: 'px-6', text: 'text-[16px]', icon: 18 },
};

/** A gentle squish when pressed (shared by buttons and tappable cards). */
export function usePress(amount = 0.97) {
  const pressed = useSharedValue(0);
  const style = useAnimatedStyle(() => ({
    transform: [{ scale: 1 - pressed.get() * (1 - amount) }],
  }));
  return {
    style,
    onPressIn: () => pressed.set(withTiming(1, { duration: 90 })),
    onPressOut: () => pressed.set(withSpring(0, { damping: 14, stiffness: 260 })),
  };
}

interface ButtonProps {
  label: string;
  onPress: () => void;
  variant?: ButtonVariant;
  size?: Size;
  icon?: IconName;
  /** Icon after the label instead of before. */
  iconRight?: boolean;
  disabled?: boolean;
  loading?: boolean;
  accessibilityHint?: string;
  className?: string;
  /** Extra classes for the label text. */
  labelClassName?: string;
}

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
  const dark = useColorScheme() === 'dark';
  const v = styles(variant, dark);
  const s = SIZE[size];
  const press = usePress();
  const iconEl = icon ? <Icon name={icon} size={s.icon} color={v.text} strokeWidth={2} /> : null;

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={label}
      accessibilityHint={accessibilityHint}
      accessibilityState={{ disabled: !!disabled, busy: !!loading }}
      disabled={disabled || loading}
      onPress={() => {
        haptics.tap();
        onPress();
      }}
      onPressIn={press.onPressIn}
      onPressOut={press.onPressOut}
      className={twMerge(disabled && 'opacity-40', className)}
    >
      <Animated.View style={press.style}>
        <View
          className={twMerge(
            'flex-row items-center justify-center overflow-hidden rounded-xl web:transition-colors web:duration-150',
            s.pad,
            v.box,
          )}
          style={{ minHeight: s.height }}
        >
          {loading ? (
            <ActivityIndicator color={v.text} />
          ) : (
            <View className="flex-row items-center gap-2">
              {!iconRight && iconEl}
              <Txt
                weight="semibold"
                className={twMerge(s.text, labelClassName)}
                style={{ color: v.text }}
              >
                {label}
              </Txt>
              {iconRight && iconEl}
            </View>
          )}
        </View>
      </Animated.View>
    </Pressable>
  );
}

/** A square icon-only button (close, back, shuffle, theme). */
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
  const dark = useColorScheme() === 'dark';
  const press = usePress(0.92);
  const color = onDark || dark ? colors.textDark : colors.text;
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={label}
      onPress={onPress}
      onPressIn={press.onPressIn}
      onPressOut={press.onPressOut}
      hitSlop={6}
      className={className}
    >
      <Animated.View style={press.style}>
        <View
          className={twMerge(
            'h-10 w-10 items-center justify-center rounded-xl web:transition-colors',
            onDark
              ? 'border border-white/25 bg-white/10 web:hover:bg-white/20'
              : variant === 'ghost'
                ? 'web:hover:bg-black/5 dark:web:hover:bg-white/5'
                : 'border border-line bg-white web:hover:border-zinc-300 dark:border-ink-line dark:bg-ink-card dark:web:hover:border-zinc-600',
          )}
        >
          <Icon name={icon} size={18} color={color} strokeWidth={2} />
        </View>
      </Animated.View>
    </Pressable>
  );
}
