/**
 * Logo — the Learn5 brand mark: a black tile (lime in dark mode) with "5", and the wordmark.
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
          'items-center justify-center bg-[#0A0A0A] dark:bg-volt',
          lg ? 'h-10 w-10 rounded-xl' : 'h-7 w-7 rounded-lg',
        )}
      >
        <Txt
          weight="display"
          className={twMerge('text-volt dark:text-[#0A0A0A]', lg ? 'text-xl' : 'text-[16px]')}
        >
          5
        </Txt>
      </View>
      {showWordmark ? (
        <Txt weight="display" className={lg ? 'text-[26px]' : 'text-[19px]'}>
          Learn5
        </Txt>
      ) : null}
    </View>
  );
}
