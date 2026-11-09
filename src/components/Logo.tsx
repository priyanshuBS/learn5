/**
 * Logo — the Learn5 brand mark: a blue tile with "5", and the wordmark.
 */
import { View } from 'react-native';
import { twMerge } from 'tailwind-merge';

import { Txt } from './Txt';

export function Logo({
  showWordmark = true,
  size = 'md',
}: {
  showWordmark?: boolean;
  size?: 'md' | 'lg';
}) {
  const lg = size === 'lg';
  return (
    <View
      className="flex-row items-center gap-2"
      accessible
      accessibilityRole="header"
      accessibilityLabel="Learn5"
    >
      <View
        className={twMerge(
          'items-center justify-center bg-brand-600',
          lg ? 'h-10 w-10 rounded-xl' : 'h-7 w-7 rounded-lg',
        )}
      >
        <Txt weight="bold" className={lg ? 'text-lg text-white' : 'text-[15px] text-white'}>
          5
        </Txt>
      </View>
      {showWordmark ? (
        <Txt weight="bold" className={lg ? 'text-2xl' : 'text-[17px]'}>
          Learn5
        </Txt>
      ) : null}
    </View>
  );
}
