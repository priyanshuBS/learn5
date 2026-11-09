/**
 * Gradient — a View with a gradient background (hero slabs, flashcards).
 * In dark mode it gets the thin glass border used across the app.
 */
import { LinearGradient } from 'expo-linear-gradient';
import type { ReactNode } from 'react';
import { StyleSheet, View } from 'react-native';
import { twMerge } from 'tailwind-merge';

interface GradientProps {
  colors: readonly [string, string, ...string[]];
  className?: string;
  children?: ReactNode;
  /** Corner radius. */
  radius?: number;
  /** Old 3D-edge options, ignored now (kept so callers don't break). */
  lip?: string;
  lipHeight?: number;
}

export function Gradient({ colors, className, children, radius }: GradientProps) {
  return (
    <View
      className={twMerge('overflow-hidden border border-white/10', className)}
      style={radius !== undefined ? { borderRadius: radius } : undefined}
    >
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
