/**
 * Visual effects borrowed from priyanshusingh.co.in.
 *   Glow         — a soft, blurred-looking orb of colour (a radial gradient, so it
 *                  looks the same on phones and on the website)
 *   Aurora       — the page background: violet and cyan glows (dark mode only)
 *   GradientText — violet → cyan text on the website; lilac on phones
 *   GradientLine — a thin violet → cyan hairline
 */
import { LinearGradient } from 'expo-linear-gradient';
import { useId } from 'react';
import { Platform, StyleSheet, View, type TextProps, type ViewStyle } from 'react-native';
import Svg, { Circle, Defs, RadialGradient, Stop } from 'react-native-svg';
import { twMerge } from 'tailwind-merge';

import { useColorScheme } from '@/hooks/useScheme';
import { GLOW } from '@/theme';

import { Txt, type TxtWeight } from './Txt';

export function Glow({
  color,
  size,
  opacity = 0.35,
  style,
}: {
  color: string;
  size: number;
  /** Strength at the centre (0–1). */
  opacity?: number;
  style?: ViewStyle;
}) {
  // A unique gradient id per orb (several can be on one screen).
  const id = `glow${useId().replace(/[^a-zA-Z0-9]/g, '')}`;
  return (
    <View pointerEvents="none" style={[{ position: 'absolute', width: size, height: size }, style]}>
      <Svg width={size} height={size}>
        <Defs>
          <RadialGradient id={id} cx="50%" cy="50%" r="50%">
            <Stop offset="0%" stopColor={color} stopOpacity={opacity} />
            <Stop offset="45%" stopColor={color} stopOpacity={opacity * 0.45} />
            <Stop offset="100%" stopColor={color} stopOpacity={0} />
          </RadialGradient>
        </Defs>
        <Circle cx={size / 2} cy={size / 2} r={size / 2} fill={`url(#${id})`} />
      </Svg>
    </View>
  );
}

/** Page background glows. Subtle in dark mode, barely-there in light mode. */
export function Aurora() {
  const dark = useColorScheme() === 'dark';
  return (
    <View pointerEvents="none" style={StyleSheet.absoluteFill} className="overflow-hidden">
      <Glow
        color={GLOW.violet}
        size={560}
        opacity={dark ? 0.22 : 0.16}
        style={{ top: -180, left: -220 }}
      />
      <Glow
        color={GLOW.cyan}
        size={520}
        opacity={dark ? 0.14 : 0.12}
        style={{ top: -120, right: -240 }}
      />
      <Glow
        color={GLOW.violet}
        size={480}
        opacity={dark ? 0.1 : 0.08}
        style={{ top: 620, right: -200 }}
      />
    </View>
  );
}

const isWeb = Platform.OS === 'web';

/** Violet → cyan gradient text (website). Phones show it in lilac/violet. */
export function GradientText({
  className,
  weight = 'heavy',
  style,
  ...rest
}: TextProps & { weight?: TxtWeight }) {
  const dark = useColorScheme() === 'dark';
  if (isWeb) {
    return (
      <Txt
        weight={weight}
        className={className}
        style={[
          {
            // CSS-only text gradient (React Native Web passes these through).
            backgroundImage: 'linear-gradient(100deg, #C4B5FD 0%, #8B5CF6 35%, #22D3EE 100%)',
            WebkitBackgroundClip: 'text',
            backgroundClip: 'text',
            color: 'transparent',
          } as unknown as ViewStyle,
          style,
        ]}
        {...rest}
      />
    );
  }
  return (
    <Txt
      weight={weight}
      className={twMerge(className)}
      style={[{ color: dark ? '#C4B5FD' : '#7C3AED' }, style]}
      {...rest}
    />
  );
}

export function GradientLine({ className }: { className?: string }) {
  return (
    <View className={twMerge('h-px overflow-hidden', className)}>
      <LinearGradient
        colors={['#8B5CF6', '#22D3EE']}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 0 }}
        style={StyleSheet.absoluteFill}
      />
    </View>
  );
}

/** A small glowing status dot (e.g. "live", "up next"). */
export function GlowDot({ color = '#34D399' }: { color?: string }) {
  return (
    <View className="h-2 w-2 items-center justify-center">
      <View
        className="absolute h-4 w-4 rounded-full"
        style={{ backgroundColor: color, opacity: 0.25 }}
      />
      <View className="h-2 w-2 rounded-full" style={{ backgroundColor: color }} />
    </View>
  );
}
