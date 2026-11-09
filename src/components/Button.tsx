/**
 * Button — pill buttons in the priyanshusingh.co.in style. They squish slightly when pressed.
 *
 *   primary   = "light" pill: white on the dark background (black on light mode)
 *   accent    = violet → cyan gradient with a glow (special moments)
 *   secondary = glass pill: faint fill + thin border
 *   soft      = violet tint
 *   success   = green, danger = red (quiz feedback)
 *   inverse   = white pill, for coloured / gradient backgrounds
 *   ghost     = text only
 */
import { LinearGradient } from 'expo-linear-gradient';
import { ActivityIndicator, Pressable, StyleSheet, View } from 'react-native';
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
      return dark
        ? {
            box: 'bg-[#F2F2F5] web:hover:bg-white web:shadow-[0_10px_40px_-12px_rgba(139,92,246,0.7)]',
            text: '#050508',
          }
        : { box: 'bg-[#0B0B12] web:hover:bg-black', text: '#FFFFFF' };
    case 'accent':
      return { box: 'web:shadow-[0_10px_40px_-10px_rgba(139,92,246,0.9)]', text: '#FFFFFF' };
    case 'secondary':
      return dark
        ? {
            box: 'border border-white/15 bg-white/[0.04] web:hover:border-white/30 web:hover:bg-white/[0.08]',
            text: colors.textDark,
          }
        : { box: 'border border-line bg-white web:hover:border-zinc-300', text: colors.text };
    case 'soft':
      return dark
        ? {
            box: 'border border-brand-500/30 bg-brand-500/15 web:hover:bg-brand-500/25',
            text: '#C4B5FD',
          }
        : { box: 'bg-brand-50 web:hover:bg-brand-100', text: '#6D28D9' };
    case 'success':
      return { box: 'bg-emerald-500 web:hover:bg-emerald-600', text: '#FFFFFF' };
    case 'danger':
      return { box: 'bg-rose-500 web:hover:bg-rose-600', text: '#FFFFFF' };
    case 'inverse':
      return { box: 'bg-white web:hover:bg-zinc-100', text: '#050508' };
    case 'ghost':
      return dark
        ? { box: 'web:hover:bg-white/5', text: '#D4D4DE' }
        : { box: 'web:hover:bg-zinc-100', text: '#3F3F50' };
  }
}

const SIZE: Record<Size, { height: number; pad: string; text: string; icon: number }> = {
  sm: { height: 36, pad: 'px-4', text: 'text-[13px]', icon: 15 },
  md: { height: 44, pad: 'px-5', text: 'text-[14px]', icon: 16 },
  lg: { height: 52, pad: 'px-6', text: 'text-[15px]', icon: 17 },
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
  const iconEl = icon ? <Icon name={icon} size={s.icon} color={v.text} strokeWidth={2.25} /> : null;

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
            'flex-row items-center justify-center overflow-hidden rounded-full web:transition-all web:duration-200',
            s.pad,
            v.box,
          )}
          style={{ minHeight: s.height }}
        >
          {variant === 'accent' ? (
            <LinearGradient
              colors={['#8B5CF6', '#6366F1', '#06B6D4']}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={StyleSheet.absoluteFill}
            />
          ) : null}
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

/** A round glass icon-only button (close, back, shuffle, theme). */
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
            'h-10 w-10 items-center justify-center rounded-full web:transition-colors',
            onDark
              ? 'border border-white/20 bg-white/10 web:hover:bg-white/20'
              : variant === 'ghost'
                ? 'web:hover:bg-zinc-100 dark:web:hover:bg-white/5'
                : 'border border-line bg-white web:hover:border-zinc-300 dark:border-white/15 dark:bg-white/[0.04] dark:web:hover:bg-white/10',
          )}
        >
          <Icon name={icon} size={18} color={color} strokeWidth={2} />
        </View>
      </Animated.View>
    </Pressable>
  );
}
