/**
 * Backdrop — a soft, STILL light at the top of every screen: a warm orange glow
 * on one side and a cool violet one on the other, fading out as you scroll down.
 * Gives the dark theme depth. Nothing moves.
 */
import { StyleSheet, View } from 'react-native';
import Svg, { Defs, RadialGradient, Rect, Stop } from 'react-native-svg';

export function Backdrop() {
  // Light/dark switch through a class (not code), so the website's pre-built page
  // and the live page draw exactly the same thing.
  return (
    <View
      pointerEvents="none"
      style={[StyleSheet.absoluteFill, { overflow: 'hidden' }]}
      className="opacity-40 dark:opacity-100"
    >
      <Svg width="100%" height={720} style={{ position: 'absolute', top: 0, left: 0 }}>
        <Defs>
          <RadialGradient id="bd-warm" cx="88%" cy="0%" rx="55%" ry="70%">
            <Stop offset="0" stopColor="#FF6A1A" stopOpacity={0.16} />
            <Stop offset="1" stopColor="#FF6A1A" stopOpacity={0} />
          </RadialGradient>
          <RadialGradient id="bd-cool" cx="8%" cy="0%" rx="50%" ry="60%">
            <Stop offset="0" stopColor="#7C5CFF" stopOpacity={0.13} />
            <Stop offset="1" stopColor="#7C5CFF" stopOpacity={0} />
          </RadialGradient>
        </Defs>
        <Rect width="100%" height="100%" fill="url(#bd-warm)" />
        <Rect width="100%" height="100%" fill="url(#bd-cool)" />
      </Svg>
    </View>
  );
}
