/**
 * SubjectTint — a soft, still wash of a subject's colour across the top of a card,
 * fading out towards the bottom. Gives every subject its own identity.
 * Put it first inside a card that has `overflow-hidden`.
 */
import { LinearGradient } from 'expo-linear-gradient';
import { StyleSheet } from 'react-native';

import { useColorScheme } from '@/hooks/useScheme';
import { withAlpha } from '@/theme';

export function SubjectTint({ color, strength = 1 }: { color: string; strength?: number }) {
  const dark = useColorScheme() === 'dark';
  const top = (dark ? 0.2 : 0.1) * strength;
  return (
    <LinearGradient
      pointerEvents="none"
      colors={[withAlpha(color, top), withAlpha(color, top * 0.35), withAlpha(color, 0)]}
      locations={[0, 0.45, 1]}
      start={{ x: 0, y: 0 }}
      end={{ x: 0.6, y: 1 }}
      style={StyleSheet.absoluteFill}
    />
  );
}
