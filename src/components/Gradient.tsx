/**
 * Gradient — a View with a colourful gradient background.
 */
import { LinearGradient } from 'expo-linear-gradient';
import type { ReactNode } from 'react';
import { StyleSheet, View } from 'react-native';
import { twMerge } from 'tailwind-merge';

interface GradientProps {
  colors: readonly [string, string, ...string[]];
  className?: string;
  children?: ReactNode;
}

export function Gradient({ colors, className, children }: GradientProps) {
  return (
    <View className={twMerge('overflow-hidden', className)}>
      <LinearGradient
        colors={colors}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={StyleSheet.absoluteFill}
      />
      {children}
    </View>
  );
}
