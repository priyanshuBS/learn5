/**
 * Welcome — the public home page for people who are not signed in.
 * Address: /welcome   (signed-out visitors to any app page land here)
 *
 * Explains Learn5, then sends people to sign up or log in. The quizzes open
 * only after signing in.
 */
import { router } from 'expo-router';
import { View } from 'react-native';
import Animated, { FadeIn } from 'react-native-reanimated';
import { twMerge } from 'tailwind-merge';

import categoriesFile from '../content/categories.json';
import { Button } from '@/components/Button';
import { CARD_CLASSES } from '@/components/Card';
import { CategoryIcon } from '@/components/CategoryIcon';
import { DifficultyBadge, Tag } from '@/components/DifficultyBadge';
import { Icon, type IconName } from '@/components/Icon';
import { Logo } from '@/components/Logo';
import { QuizProgress } from '@/components/ProgressBar';
import { Screen } from '@/components/Screen';
import { ThemeIconButton } from '@/components/ThemeToggle';
import { Muted, Txt } from '@/components/Txt';
import { useColorScheme } from '@/hooks/useScheme';
import { signInHref } from '@/lib/routes';
import { CategoriesFileSchema } from '@/lib/schema';
import { brandTone, colors } from '@/theme';

const categories = CategoriesFileSchema.parse(categoriesFile);

const FEATURES: { icon: IconName; title: string; text: string }[] = [
  {
    icon: 'lightbulb',
    title: 'Clear explanations',
    text: 'Every answer explains the “why” in plain English.',
  },
  {
    icon: 'calendar',
    title: 'Three drops a day',
    text: 'New questions every morning, afternoon and evening.',
  },
  {
    icon: 'review',
    title: 'Review mistakes',
    text: 'Replay the questions you got wrong until they stick.',
  },
  {
    icon: 'flashcards',
    title: 'Flashcards',
    text: 'Keep the facts you liked and flip through them any time.',
  },
  {
    icon: 'flame',
    title: 'Streaks and levels',
    text: 'Points, levels and badges that reward showing up.',
  },
  {
    icon: 'smartphone',
    title: 'Phone and web',
    text: 'Use it on Android, iPhone or in your browser.',
  },
];

const STEPS = [
  { title: 'Sign up with your email', text: 'No password. We email you a 6-digit code.' },
  { title: 'Play a 5-question drop', text: 'Pick any subject. Each drop takes about 5 minutes.' },
  { title: 'Come back tomorrow', text: 'Keep your streak, earn points and level up.' },
];

const goSignUp = () => router.push(signInHref('signup'));
const goLogIn = () => router.push(signInHref('login'));

export default function WelcomeScreen() {
  const dark = useColorScheme() === 'dark';
  const iconColor = brandTone(dark);

  return (
    <Screen contentClassName="pt-4 md:pt-6">
      <Animated.View entering={FadeIn.duration(250)}>
        {/* Top bar */}
        <View className="flex-row items-center justify-between">
          <Logo />
          <View className="flex-row items-center gap-1">
            <ThemeIconButton />
            <Button label="Log in" variant="ghost" size="sm" onPress={goLogIn} />
            <View className="hidden sm:flex">
              <Button label="Sign up" size="sm" onPress={goSignUp} />
            </View>
          </View>
        </View>

        {/* Hero */}
        <View className="mt-12 gap-12 md:mt-20 lg:flex-row lg:items-center">
          <View className="lg:flex-1">
            <Txt
              weight="bold"
              accessibilityRole="header"
              className="text-[38px] leading-[44px] md:text-[52px] md:leading-[58px]"
            >
              Learn something new in five minutes a day.
            </Txt>
            <Muted className="mt-5 max-w-lg text-[17px] leading-7">
              Short daily quizzes in {categories.length} school subjects, with a clear explanation
              after every answer. Free, and no password needed.
            </Muted>
            <View className="mt-8 gap-3 sm:flex-row">
              <Button label="Get started" variant="accent" onPress={goSignUp} />
              <Button label="I already have an account" variant="secondary" onPress={goLogIn} />
            </View>
            <View className="mt-8 flex-row flex-wrap gap-x-6 gap-y-2">
              <Fact text={`${categories.length} subjects`} />
              <Fact text={`${categories.length * 3} new drops a day`} />
              <Fact text="5 questions each" />
            </View>
          </View>

          <View className="lg:flex-1">
            <ProductPreview />
          </View>
        </View>

        {/* Subjects */}
        <Section
          title="Subjects"
          text="School-level topics from trusted textbooks, explained simply."
        />
        <View className={twMerge(CARD_CLASSES, 'overflow-hidden')}>
          {/* -1px: the card's edge hides the last row's divider line. */}
          <View className="flex-row flex-wrap" style={{ marginBottom: -1 }}>
            {categories.map((category) => (
              <View
                key={category.id}
                className="w-full flex-row items-center gap-3.5 border-b border-line p-4 dark:border-ink-line sm:w-1/2 lg:w-1/3"
              >
                <CategoryIcon category={category} size="md" />
                <View className="flex-1">
                  <Txt weight="semibold" className="text-[15px]">
                    {category.name}
                  </Txt>
                  <Muted className="text-[13px]" numberOfLines={1}>
                    {category.tagline}
                  </Muted>
                </View>
              </View>
            ))}
          </View>
        </View>

        {/* How it works */}
        <Section title="How it works" />
        <View className="gap-3 md:flex-row">
          {STEPS.map((step, i) => (
            <View key={step.title} className={twMerge(CARD_CLASSES, 'p-5 md:flex-1')}>
              <View className="h-7 w-7 items-center justify-center rounded-full bg-[#F1F0EC] dark:bg-ink-raised">
                <Txt weight="semibold" className="text-[13px]">
                  {i + 1}
                </Txt>
              </View>
              <Txt weight="semibold" className="mt-4 text-[16px]">
                {step.title}
              </Txt>
              <Muted className="mt-1 text-[14px] leading-6">{step.text}</Muted>
            </View>
          ))}
        </View>

        {/* Features */}
        <Section title="What you get" />
        <View className="-mx-2 flex-row flex-wrap">
          {FEATURES.map((f) => (
            <View key={f.title} className="w-full flex-row gap-3.5 px-2 py-3 sm:w-1/2 lg:w-1/3">
              <View className="h-9 w-9 items-center justify-center rounded-lg bg-brand-50 dark:bg-brand-500/15">
                <Icon name={f.icon} size={17} color={iconColor} />
              </View>
              <View className="flex-1">
                <Txt weight="semibold" className="text-[15px]">
                  {f.title}
                </Txt>
                <Muted className="mt-0.5 text-[14px] leading-6">{f.text}</Muted>
              </View>
            </View>
          ))}
        </View>

        {/* Final call to action */}
        <View
          className={twMerge(
            CARD_CLASSES,
            'mt-16 items-start gap-5 p-6 md:flex-row md:items-center md:justify-between md:p-8',
          )}
        >
          <View className="md:flex-1">
            <Txt weight="bold" className="text-[22px] leading-8">
              Start your first drop today
            </Txt>
            <Muted className="mt-1 text-[15px] leading-6">
              Create a free account with just your email.
            </Muted>
          </View>
          <Button label="Create free account" variant="accent" onPress={goSignUp} />
        </View>

        {/* Footer */}
        <View className="mt-12 flex-row flex-wrap items-center justify-between gap-4 border-t border-line pt-6 dark:border-ink-line">
          <Muted className="text-[13px]">© 2026 Learn5</Muted>
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
      </Animated.View>
    </Screen>
  );
}

function Fact({ text }: { text: string }) {
  return (
    <View className="flex-row items-center gap-1.5">
      <Icon name="check" size={14} color={colors.success} strokeWidth={2.5} />
      <Muted className="text-[14px]">{text}</Muted>
    </View>
  );
}

function Section({ title, text }: { title: string; text?: string }) {
  return (
    <View className="mb-5 mt-16 md:mt-20">
      <Txt
        weight="bold"
        accessibilityRole="header"
        className="text-[24px] leading-8 md:text-[28px]"
      >
        {title}
      </Txt>
      {text ? <Muted className="mt-1.5 text-[15px] leading-6">{text}</Muted> : null}
    </View>
  );
}

/** A static picture of a quiz question, so visitors see what the app looks like. */
function ProductPreview() {
  const math = categories.find((c) => c.id === 'math') ?? categories[0];
  const options = ['₹35', '₹45', '₹40', '₹54'];
  return (
    <View
      accessible
      accessibilityLabel="Preview of a Learn5 question"
      className={twMerge(CARD_CLASSES, 'p-5 md:p-6')}
    >
      <View className="flex-row items-center gap-4">
        <Icon name="x" size={16} color={colors.muted} />
        <QuizProgress segments={['correct', 'correct', 'current', 'todo', 'todo']} />
        <Muted className="text-[13px]">3/5</Muted>
      </View>
      <View className="mt-6 flex-row flex-wrap items-center gap-2">
        <Tag label={math.name} color={math.color} />
        <DifficultyBadge difficulty="medium" />
      </View>
      <Txt weight="semibold" className="mt-3 text-[19px] leading-7">
        A ₹450 shirt is 10% off. How much do you save?
      </Txt>
      <View className="mt-5 gap-2">
        {options.map((o, i) => {
          const correct = i === 1;
          return (
            <View
              key={o}
              className={twMerge(
                'flex-row items-center gap-3 rounded-xl border px-4 py-3',
                correct
                  ? 'border-green-600 bg-green-50 dark:border-green-500/70 dark:bg-green-500/10'
                  : 'border-line dark:border-ink-line',
              )}
            >
              <Txt
                weight="semibold"
                className={twMerge(
                  'w-4 text-[13px]',
                  correct ? 'text-green-700 dark:text-green-400' : 'text-zinc-400',
                )}
              >
                {String.fromCharCode(65 + i)}
              </Txt>
              <Txt weight="medium" className="flex-1 text-[15px]">
                {o}
              </Txt>
              {correct ? (
                <Icon name="check" size={16} color={colors.success} strokeWidth={2.5} />
              ) : null}
            </View>
          );
        })}
      </View>
      <View className="mt-4 rounded-xl bg-[#F4F4F1] p-3.5 dark:bg-ink-raised">
        <Txt weight="semibold" className="text-[13px]">
          Why
        </Txt>
        <Muted className="mt-0.5 text-[13px] leading-5">
          10% means moving the decimal point one place left: ₹450 becomes ₹45.
        </Muted>
      </View>
    </View>
  );
}
