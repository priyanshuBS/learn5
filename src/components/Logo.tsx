/**
 * Logo — the Learn5 brand mark: a gradient tile with "5" and the wordmark.
 */
import { View } from 'react-native';

import { BRAND_GRADIENT } from '@/theme';

import { Gradient } from './Gradient';
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
      className="flex-row items-center gap-2.5"
      accessible
      accessibilityRole="header"
      accessibilityLabel="Learn5"
    >
      <Gradient
        colors={BRAND_GRADIENT}
        className={
          lg
            ? 'h-11 w-11 items-center justify-center rounded-xl'
            : 'h-8 w-8 items-center justify-center rounded-[10px]'
        }
      >
        <Txt weight="heavy" className={lg ? 'text-xl text-white' : 'text-base text-white'}>
          5
        </Txt>
      </Gradient>
      {showWordmark ? (
        <Txt weight="bold" className={lg ? 'text-2xl tracking-tight' : 'text-lg tracking-tight'}>
          Learn
          <Txt
            weight="bold"
            className={
              lg
                ? 'text-2xl text-brand-600 dark:text-brand-400'
                : 'text-lg text-brand-600 dark:text-brand-400'
            }
          >
            5
          </Txt>
        </Txt>
      ) : null}
    </View>
  );
}
