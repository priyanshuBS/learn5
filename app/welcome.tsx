/**
 * Welcome — the public landing page (minimal).
 * Address: /welcome   (signed-out visitors to any app page land here)
 *
 * One idea per section: the promise, a real sample question, how a day works,
 * and a quiet footer. The quizzes open only after signing in.
 */
import { router } from 'expo-router';
import { Linking, View } from 'react-native';
import { twMerge } from 'tailwind-merge';

import categoriesFile from '../content/categories.json';
import { Button } from '@/components/Button';
import { Icon } from '@/components/Icon';
import { Logo } from '@/components/Logo';
import { Screen } from '@/components/Screen';
import { ThemeIconButton } from '@/components/ThemeToggle';
import { Muted, Txt } from '@/components/Txt';
import { signInHref } from '@/lib/routes';
import { CategoriesFileSchema } from '@/lib/schema';
import { colors } from '@/theme';

const categories = CategoriesFileSchema.parse(categoriesFile);

const goSignUp = () => router.push(signInHref('signup'));
const goLogIn = () => router.push(signInHref('login'));

const DAY = [
  { time: '4:00 AM', text: 'Four new drops arrive: one per subject, five questions each.' },
  { time: 'any time', text: 'Play one in five minutes. Every answer explains the why.' },
  { time: 'tomorrow', text: 'Come back, keep your streak, and learn a little more.' },
];

export default function WelcomeScreen() {
  return (
    <Screen width="narrow" contentClassName="pt-4 md:pt-6">
      {/* Top bar */}
      <View className="flex-row items-center justify-between">
        <Logo />
        <View className="flex-row items-center gap-1">
          <ThemeIconButton />
          <Button label="Log in" variant="ghost" size="sm" onPress={goLogIn} />
        </View>
      </View>

      {/* The promise */}
      <View className="mt-20 md:mt-28">
        <Txt
          weight="script"
          className="text-[26px] leading-[30px] text-brand-600 dark:text-brand-300"
        >
          five minutes a day
        </Txt>
        <Txt
          weight="display"
          accessibilityRole="header"
          className="mt-3 text-[52px] leading-[54px] md:text-[76px] md:leading-[76px]"
        >
          Learn a little,{'\n'}
          <Txt
            weight="italic"
            className="text-[52px] leading-[54px] md:text-[76px] md:leading-[76px]"
          >
            every day.
          </Txt>
        </Txt>
        <Muted className="mt-6 max-w-md text-[17px] leading-7">
          Short daily quizzes in{' '}
          {categories
            .map((c) => c.name)
            .join(', ')
            .replace(/, ([^,]*)$/, ' and $1')}
          , with a clear explanation after every answer.
        </Muted>
        <View className="mt-9 flex-row flex-wrap items-center gap-5">
          <Button label="Start learning" icon="arrow-right" iconRight onPress={goSignUp} />
          <Txt
            accessibilityRole="link"
            onPress={goLogIn}
            className="text-[14px] text-zinc-600 underline dark:text-zinc-400"
          >
            I already have an account
          </Txt>
        </View>
      </View>

      {/* A real question */}
      <View className="mt-24">
        <Txt weight="italic" className="text-[22px] leading-7">
          A question from today
        </Txt>
        <SampleQuestion />
      </View>

      {/* How a day works */}
      <View className="mt-20">
        <Txt weight="italic" className="text-[22px] leading-7">
          How a day works
        </Txt>
        <View className="mt-2 border-t border-zinc-900 dark:border-zinc-300">
          {DAY.map((d, i) => (
            <View
              key={d.time}
              className={twMerge(
                'flex-row gap-6 py-5',
                i > 0 && 'border-t border-line dark:border-ink-line',
              )}
            >
              <Txt weight="mono" className="w-20 pt-1 text-[12px] text-zinc-500">
                {d.time}
              </Txt>
              <Txt className="flex-1 text-[16px] leading-6">{d.text}</Txt>
            </View>
          ))}
        </View>
      </View>

      {/* Closing line */}
      <View className="mt-24 items-start">
        <Txt weight="display" className="text-[40px] leading-[44px]">
          Free. No password.{'\n'}
          <Txt
            weight="italic"
            className="text-[40px] leading-[44px] text-brand-600 dark:text-brand-300"
          >
            Just start.
          </Txt>
        </Txt>
        <Button label="Create your account" onPress={goSignUp} className="mt-7" />
      </View>

      {/* Footer */}
      <View className="mt-24 flex-row flex-wrap items-center justify-between gap-4 border-t border-line pt-6 dark:border-ink-line">
        <Txt className="text-[13px] text-zinc-500 dark:text-zinc-400">
          Made by{' '}
          <Txt
            accessibilityRole="link"
            onPress={() => void Linking.openURL('https://priyanshusingh.co.in')}
            className="text-[13px] text-zinc-900 underline dark:text-zinc-200"
          >
            Priyanshu Singh
          </Txt>
        </Txt>
        <View className="flex-row items-center gap-5">
          <Txt
            accessibilityRole="link"
            onPress={() => router.push('/privacy')}
            className="text-[13px] text-zinc-500 dark:text-zinc-400"
          >
            Privacy
          </Txt>
          <Txt
            accessibilityRole="link"
            onPress={() => router.push('/terms')}
            className="text-[13px] text-zinc-500 dark:text-zinc-400"
          >
            Terms
          </Txt>
        </View>
      </View>
    </Screen>
  );
}

/** A static sample question, answered, so visitors see exactly what a drop feels like. */
function SampleQuestion() {
  const options = ['30', '32', '36', '40'];
  return (
    <View
      accessible
      accessibilityLabel="Sample question: What comes next: 2, 6, 12, 20? Answer: 30"
      className="mt-2 border-t border-zinc-900 pt-6 dark:border-zinc-300"
    >
      <Txt weight="mono" className="text-[11.5px] uppercase tracking-[1px] text-zinc-500">
        Reasoning · question 3 of 5
      </Txt>
      <Txt weight="display" className="mt-3 text-[30px] leading-[34px]">
        What comes next: 2, 6, 12, 20, ?
      </Txt>
      <View className="mt-6 flex-row flex-wrap gap-2">
        {options.map((o, i) => {
          const correct = i === 0;
          return (
            <View
              key={o}
              className={twMerge(
                'h-12 min-w-16 flex-row items-center justify-center gap-1.5 rounded-full border px-5',
                correct
                  ? 'border-emerald-600 dark:border-emerald-500'
                  : 'border-line dark:border-ink-line',
              )}
            >
              {correct ? (
                <Icon name="check" size={14} color={colors.success} strokeWidth={2.5} />
              ) : null}
              <Txt weight="medium" className="text-[16px]">
                {o}
              </Txt>
            </View>
          );
        })}
      </View>
      <View className="mt-6 flex-row gap-3">
        <Txt weight="script" className="text-[22px] leading-6 text-brand-600 dark:text-brand-300">
          why?
        </Txt>
        <Txt className="flex-1 text-[15px] leading-6 text-zinc-600 dark:text-zinc-400">
          The gaps grow by 2 each time: +4, +6, +8. So the next gap is +10, and 20 + 10 = 30.
        </Txt>
      </View>
    </View>
  );
}
