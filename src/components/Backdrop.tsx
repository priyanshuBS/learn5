/**
 * Backdrop — one soft, STILL indigo light at the top of every screen, fading out
 * as you scroll down. Gives the studio-black theme a little depth. Nothing moves.
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
      className="opacity-60 dark:opacity-100"
    >
      <Svg width="100%" height={720} style={{ position: 'absolute', top: 0, left: 0 }}>
        <Defs>
          <RadialGradient id="bd-indigo" cx="50%" cy="0%" rx="70%" ry="60%">
            <Stop offset="0" stopColor="#6E78FF" stopOpacity={0.14} />
            <Stop offset="1" stopColor="#6E78FF" stopOpacity={0} />
          </RadialGradient>
        </Defs>
        <Rect width="100%" height="100%" fill="url(#bd-indigo)" />
      </Svg>
    </View>
  );
}
