/**
 * Screen — page wrapper: safe area (avoids the notch), the glowing Aurora
 * background, scrolling, and a centred column for phones and wide screens.
 */
import type { ReactNode } from 'react';
import { ScrollView, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { twMerge } from 'tailwind-merge';

import { Aurora } from './Aurora';

interface ScreenProps {
  children: ReactNode;
  /** Content pinned to the bottom (e.g. a "Next" button). */
  footer?: ReactNode;
  /** Add the bottom safe area under the footer (off inside the tab layout). */
  footerSafeArea?: boolean;
  contentClassName?: string;
  /** Max width of the centred column. */
  width?: 'narrow' | 'wide';
  /**
   * Fill the screen height so a child with "flex-1 justify-center" sits in the
   * vertical middle (sign-in, empty states). Still scrolls when content is taller.
   */
  fill?: boolean;
}

export function Screen({
  children,
  footer,
  footerSafeArea = true,
  contentClassName,
  width = 'wide',
  fill = false,
}: ScreenProps) {
  const maxWidth = width === 'narrow' ? 'max-w-2xl' : 'max-w-6xl';
  return (
    <SafeAreaView edges={['top', 'left', 'right']} className="flex-1 bg-canvas dark:bg-ink">
      <Aurora />
      <ScrollView
        className="flex-1"
        contentContainerClassName={twMerge(
          'w-full self-center px-4 pb-16 pt-4 md:px-8 md:pt-8 xl:px-10',
          maxWidth,
          fill && 'flex-grow pb-8',
          contentClassName,
        )}
        // flexGrow as a style too: the most reliable way to let content fill the
        // screen height on phones and the web (used to centre sign-in vertically).
        contentContainerStyle={fill ? { flexGrow: 1 } : undefined}
        keyboardShouldPersistTaps="handled"
      >
        {children}
      </ScrollView>
      {footer ? (
        <SafeAreaView
          edges={footerSafeArea ? ['bottom'] : []}
          className="border-t border-line bg-white/85 web:backdrop-blur-xl dark:border-ink-line dark:bg-ink-soft"
        >
          <View className={twMerge('w-full self-center px-4 py-3 md:px-8', maxWidth)}>
            {footer}
          </View>
        </SafeAreaView>
      ) : null}
    </SafeAreaView>
  );
}
