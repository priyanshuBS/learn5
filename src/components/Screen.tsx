/**
 * Screen — page wrapper: safe area (avoids the notch), background colour,
 * scrolling, and a centred column that looks good on phones and wide screens.
 */
import type { ReactNode } from 'react';
import { ScrollView, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { twMerge } from 'tailwind-merge';

interface ScreenProps {
  children: ReactNode;
  /** Content pinned to the bottom (e.g. a "Next" button). */
  footer?: ReactNode;
  /** Add the bottom safe area under the footer (off inside the tab layout). */
  footerSafeArea?: boolean;
  contentClassName?: string;
  /** Max width of the centred column. */
  width?: 'narrow' | 'wide';
}

export function Screen({
  children,
  footer,
  footerSafeArea = true,
  contentClassName,
  width = 'wide',
}: ScreenProps) {
  const maxWidth = width === 'narrow' ? 'max-w-2xl' : 'max-w-6xl';
  return (
    <SafeAreaView edges={['top', 'left', 'right']} className="flex-1 bg-canvas dark:bg-ink">
      <ScrollView
        className="flex-1"
        contentContainerClassName={twMerge(
          'w-full self-center px-4 pb-16 pt-4 md:px-8 md:pt-8 xl:px-10',
          maxWidth,
          contentClassName,
        )}
        keyboardShouldPersistTaps="handled"
      >
        {children}
      </ScrollView>
      {footer ? (
        <SafeAreaView
          edges={footerSafeArea ? ['bottom'] : []}
          className="border-t border-line bg-white/95 dark:border-ink-line dark:bg-ink-soft"
        >
          <View className={twMerge('w-full self-center px-4 py-3 md:px-8', maxWidth)}>
            {footer}
          </View>
        </SafeAreaView>
      ) : null}
    </SafeAreaView>
  );
}
