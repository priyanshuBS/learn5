/**
 * LegalPage — a simple, readable layout for the Privacy Policy and Terms pages.
 * Open to everyone (signed in or not), and linked from Welcome, Sign in and Progress.
 */
import { View } from 'react-native';

import { goBack } from '@/lib/routes';

import { IconButton } from './Button';
import { CARD_CLASSES } from './Card';
import { Logo } from './Logo';
import { Screen } from './Screen';
import { ThemeIconButton } from './ThemeToggle';
import { Eyebrow, Muted, Txt } from './Txt';

export interface LegalSection {
  title: string;
  /** Paragraphs; lines starting with "• " show as bullet points. */
  body: string[];
}

export function LegalPage({
  eyebrow,
  title,
  updated,
  intro,
  sections,
}: {
  eyebrow: string;
  title: string;
  /** e.g. "9 November 2026" */
  updated: string;
  intro: string;
  sections: LegalSection[];
}) {
  return (
    <Screen width="narrow">
      <View className="flex-row items-center justify-between">
        <IconButton icon="arrow-left" label="Go back" onPress={goBack} />
        <Logo />
        <ThemeIconButton />
      </View>

      <Eyebrow className="mt-12">{eyebrow}</Eyebrow>
      <Txt
        weight="heavy"
        accessibilityRole="header"
        className="mt-3 text-[38px] leading-[42px] md:text-[52px] md:leading-[56px]"
      >
        {title}
      </Txt>
      <Muted className="mt-3">Last updated {updated}</Muted>
      <Txt className="mt-6 text-[16px] leading-7 text-zinc-700 dark:text-zinc-300">{intro}</Txt>

      <View className={`${CARD_CLASSES} mt-10 gap-8 p-6 md:p-8`}>
        {sections.map((section, i) => (
          <View key={section.title}>
            <Eyebrow>{String(i + 1).padStart(2, '0')}</Eyebrow>
            <Txt weight="bold" accessibilityRole="header" className="mt-2 text-[20px] leading-7">
              {section.title}
            </Txt>
            <View className="mt-3 gap-2.5">
              {section.body.map((line) =>
                line.startsWith('• ') ? (
                  <View key={line} className="flex-row gap-2.5 pl-1">
                    <Txt className="text-[15px] leading-6 text-brand-500">•</Txt>
                    <Txt className="flex-1 text-[15px] leading-6 text-zinc-700 dark:text-zinc-300">
                      {line.slice(2)}
                    </Txt>
                  </View>
                ) : (
                  <Txt
                    key={line}
                    className="text-[15px] leading-6 text-zinc-700 dark:text-zinc-300"
                  >
                    {line}
                  </Txt>
                ),
              )}
            </View>
          </View>
        ))}
      </View>
    </Screen>
  );
}
