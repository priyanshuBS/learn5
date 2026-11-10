/**
 * Logo — the Learn5 brand mark: a forest-green tile with "5", and the wordmark.
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
        <Txt
          weight="display"
          className={twMerge('text-[#F4F1E8] dark:text-[#F4F1E8]', lg ? 'text-xl' : 'text-[16px]')}
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
