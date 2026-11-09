/**
 * Welcome — the public home page for people who are not signed in.
 * Address: /welcome   (signed-out visitors to any app page land here)
 *
 * Explains Learn5, then sends people to sign up or log in. The quizzes open
 * only after signing in.
 */
import { router } from 'expo-router';
import { View } from 'react-native';
import Animated, { FadeIn, FadeInDown } from 'react-native-reanimated';
import { twMerge } from 'tailwind-merge';

import categoriesFile from '../content/categories.json';
import { Button } from '@/components/Button';
import { Card, CARD_CLASSES } from '@/components/Card';
import { CategoryIcon } from '@/components/CategoryIcon';
import { DifficultyBadge, Tag } from '@/components/DifficultyBadge';
import { Gradient } from '@/components/Gradient';
import { Icon, type IconName } from '@/components/Icon';
import { Logo } from '@/components/Logo';
import { QuizProgress } from '@/components/ProgressBar';
import { Screen } from '@/components/Screen';
import { ThemeIconButton } from '@/components/ThemeToggle';
import { Muted, Txt } from '@/components/Txt';
import { useColorScheme } from '@/hooks/useScheme';
import { signInHref } from '@/lib/routes';
import { CategoriesFileSchema } from '@/lib/schema';
import { colors, HERO_GRADIENT } from '@/theme';

const categories = CategoriesFileSchema.parse(categoriesFile);

const FEATURES: { icon: IconName; title: string; text: string }[] = [
  {
    icon: 'lightbulb',
    title: 'Simple explanations',
    text: 'Every answer explains the “why” in plain, easy English.',
  },
  {
    icon: 'calendar',
    title: '3 new drops a day',
    text: 'Fresh questions every morning, afternoon and evening.',
  },
  {
    icon: 'review',
    title: 'Review your mistakes',
    text: 'Replay the questions you got wrong until you get them right.',
  },
  {
    icon: 'flashcards',
    title: 'Flashcards',
    text: 'Collect surprising facts and flip through them any time.',
  },
  {
    icon: 'flame',
    title: 'Streaks and badges',
    text: 'Small daily wins, points and levels that keep you going.',
  },
  {
    icon: 'smartphone',
    title: 'Phone and web',
    text: 'Learn on Android, iPhone or in your browser.',
  },
];

const STEPS = [
  { title: 'Sign up with your email', text: 'No password. We email you a 6-digit code.' },
  { title: 'Play a 5-question drop', text: 'Pick a subject. Each drop takes about 5 minutes.' },
  { title: 'Grow a little every day', text: 'Earn points, keep your streak, collect badges.' },
];

const goSignUp = () => router.push(signInHref('signup'));
const goLogIn = () => router.push(signInHref('login'));

export default function WelcomeScreen() {
  const scheme = useColorScheme();
  const check = scheme === 'dark' ? colors.brandOnDark : colors.brand;

  return (
    <Screen contentClassName="pt-4 md:pt-6">
      <Animated.View entering={FadeIn.duration(250)}>
        {/* Top bar */}
        <View className="flex-row items-center justify-between">
          <Logo />
          <View className="flex-row items-center gap-1.5">
            <ThemeIconButton />
            <Button label="Log in" variant="ghost" size="sm" onPress={goLogIn} />
            <Button label="Get started" size="sm" onPress={goSignUp} />
          </View>
        </View>

        {/* Hero */}
        <View className="mt-12 gap-12 md:mt-20 lg:flex-row lg:items-center">
          <View className="lg:flex-1">
            <View className="flex-row items-center gap-2 self-start rounded-full border border-line bg-white px-3 py-1.5 dark:border-ink-line dark:bg-ink-card">
              <Icon name="sparkles" size={13} color={colors.brand} />
              <Txt weight="medium" className="text-[13px] text-slate-600 dark:text-zinc-300">
                Daily micro-learning · 6 subjects
              </Txt>
            </View>
            <Txt
              weight="heavy"
              accessibilityRole="header"
              className="mt-6 text-[42px] leading-[48px] tracking-tighter md:text-[60px] md:leading-[64px]"
            >
              5 questions.{'\n'}5 minutes.{'\n'}
              <Txt
                weight="heavy"
                className="text-[42px] leading-[48px] tracking-tighter text-brand-600 dark:text-brand-400 md:text-[60px] md:leading-[64px]"
              >
                Smarter every day.
              </Txt>
            </Txt>
            <Muted className="mt-6 max-w-lg text-[17px] leading-7">
              Bite-size quizzes in English, Math, Reasoning, Physics, Chemistry and Biology —
              written in simple English, with a clear explanation after every answer.
            </Muted>
            <View className="mt-8 gap-3 sm:flex-row">
              <Button
                label="Get started — it’s free"
                icon="arrow-right"
                iconRight
                onPress={goSignUp}
              />
              <Button label="I already have an account" variant="secondary" onPress={goLogIn} />
            </View>
            <View className="mt-6 flex-row flex-wrap gap-x-5 gap-y-2">
              {['Free forever', 'No password', 'About 5 minutes a drop'].map((t) => (
                <View key={t} className="flex-row items-center gap-1.5">
                  <Icon name="check" size={15} color={check} strokeWidth={2.5} />
                  <Muted className="text-[13px]">{t}</Muted>
                </View>
              ))}
            </View>
          </View>

          {/* Layout classes on a plain View: Animated.View doesn't apply responsive classes. */}
          <View className="pb-4 lg:flex-1">
            <Animated.View entering={FadeInDown.delay(120).duration(400)}>
              <ProductPreview />
            </Animated.View>
          </View>
        </View>

        {/* Subjects */}
        <SectionHeading
          eyebrow="Subjects"
          title="Six subjects. One habit."
          text="School-level facts from trusted textbooks, explained simply."
        />
        <View className="-m-1.5 flex-row flex-wrap">
          {categories.map((category) => (
            <View key={category.id} className="w-1/2 p-1.5 md:w-1/3 lg:w-1/6">
              <Card className="h-full p-4">
                <CategoryIcon category={category} />
                <Txt weight="semibold" className="mt-3 text-[15px]">
                  {category.name}
                </Txt>
                <Muted className="mt-0.5 text-[13px] leading-5" numberOfLines={2}>
                  {category.tagline}
                </Muted>
              </Card>
            </View>
          ))}
        </View>

        {/* Features */}
        <SectionHeading
          eyebrow="Features"
          title="Everything you need to learn daily"
          text="Short, focused and rewarding — built to fit into any day."
        />
        <View className={twMerge(CARD_CLASSES, 'flex-row flex-wrap overflow-hidden')}>
          {FEATURES.map((f) => (
            <View key={f.title} className="w-full p-6 sm:w-1/2 lg:w-1/3">
              <View className="h-10 w-10 items-center justify-center rounded-xl border border-brand-100 bg-brand-50 dark:border-brand-500/20 dark:bg-brand-500/10">
                <Icon name={f.icon} size={19} color={check} />
              </View>
              <Txt weight="semibold" className="mt-4 text-[15px]">
                {f.title}
              </Txt>
              <Muted className="mt-1 leading-5">{f.text}</Muted>
            </View>
          ))}
        </View>

        {/* How it works */}
        <SectionHeading eyebrow="How it works" title="Start in under a minute" />
        <View className="gap-3 md:flex-row">
          {STEPS.map((step, i) => (
            <Card key={step.title} className="flex-row gap-4 md:flex-1">
              <View className="h-8 w-8 items-center justify-center rounded-full bg-slate-900 dark:bg-white">
                <Txt weight="bold" className="text-sm text-white dark:text-slate-900">
                  {i + 1}
                </Txt>
              </View>
              <View className="flex-1">
                <Txt weight="semibold" className="text-[15px]">
                  {step.title}
                </Txt>
                <Muted className="mt-1 leading-5">{step.text}</Muted>
              </View>
            </Card>
          ))}
        </View>

        {/* Final call to action */}
        <Gradient
          colors={HERO_GRADIENT}
          className="mt-16 items-center rounded-3xl px-6 py-14 md:py-16"
        >
          <Txt
            weight="bold"
            className="text-center text-[28px] leading-9 tracking-tight text-white dark:text-white md:text-4xl md:leading-[48px]"
          >
            Ready for your first 5 minutes?
          </Txt>
          <Txt className="mt-3 max-w-md text-center text-[15px] leading-6 text-brand-100 dark:text-brand-100">
            Create your free account with just your email. No password to remember.
          </Txt>
          <View className="mt-8">
            <Button
              label="Create free account"
              variant="inverse"
              icon="arrow-right"
              iconRight
              onPress={goSignUp}
            />
          </View>
        </Gradient>

        {/* Footer */}
        <View className="mt-12 flex-row flex-wrap items-center justify-between gap-4 border-t border-line pt-6 dark:border-ink-line">
          <Logo />
          <Muted className="text-[13px]">School-level facts, explained simply.</Muted>
        </View>
      </Animated.View>
    </Screen>
  );
}

function SectionHeading({
  eyebrow,
  title,
  text,
}: {
  eyebrow: string;
  title: string;
  text?: string;
}) {
  return (
    <View className="mb-6 mt-20 md:mt-28">
      <Txt
        weight="semibold"
        className="text-[13px] uppercase tracking-widest text-brand-600 dark:text-brand-400"
      >
        {eyebrow}
      </Txt>
      <Txt
        weight="bold"
        accessibilityRole="header"
        className="mt-2 text-[28px] leading-9 tracking-tight md:text-4xl md:leading-[44px]"
      >
        {title}
      </Txt>
      {text ? <Muted className="mt-2 max-w-xl text-[15px] leading-6">{text}</Muted> : null}
    </View>
  );
}

/** A static picture of a quiz question, so visitors see what the app looks like. */
function ProductPreview() {
  const math = categories.find((c) => c.id === 'math') ?? categories[0];
  const options = ['₹35', '₹45', '₹40', '₹54'];
  return (
    <View accessible accessibilityLabel="Preview of a Learn5 question" className="relative">
      <Gradient
        colors={['#C7D2FE', '#E0E7FF', '#F5F3FF']}
        className="absolute -inset-3 rounded-[32px] opacity-60 dark:opacity-15 md:-inset-5"
      />
      <View className={twMerge(CARD_CLASSES, 'p-5 web:shadow-xl md:p-6')}>
        <View className="flex-row items-center gap-4">
          <View className="h-8 w-8 items-center justify-center rounded-lg border border-line dark:border-ink-line">
            <Icon name="x" size={15} />
          </View>
          <QuizProgress segments={['correct', 'correct', 'current', 'todo', 'todo']} />
          <Muted className="text-[13px]">3/5</Muted>
        </View>
        <View className="mt-6 flex-row flex-wrap items-center gap-2">
          <Tag label={math.name} color={math.color} />
          <DifficultyBadge difficulty="medium" />
        </View>
        <Txt weight="semibold" className="mt-3 text-xl leading-8 tracking-tight">
          A ₹450 shirt is 10% off. How much do you save?
        </Txt>
        <View className="mt-5 gap-2">
          {options.map((o, i) => {
            const correct = i === 1;
            return (
              <View
                key={o}
                className={twMerge(
                  'flex-row items-center gap-3 rounded-xl border px-3.5 py-2.5',
                  correct
                    ? 'border-emerald-500 bg-emerald-50 dark:border-emerald-500/70 dark:bg-emerald-500/10'
                    : 'border-line dark:border-ink-line',
                  !correct && i > 1 && 'opacity-50',
                )}
              >
                <View
                  className={twMerge(
                    'h-6 w-6 items-center justify-center rounded-md border',
                    correct
                      ? 'border-emerald-500 bg-emerald-500'
                      : 'border-line bg-slate-50 dark:border-ink-line dark:bg-white/5',
                  )}
                >
                  {correct ? (
                    <Icon name="check" size={13} color={colors.white} strokeWidth={3} />
                  ) : (
                    <Txt
                      weight="semibold"
                      className="text-[11px] text-slate-500 dark:text-zinc-400"
                    >
                      {String.fromCharCode(65 + i)}
                    </Txt>
                  )}
                </View>
                <Txt weight="medium" className="text-[15px]">
                  {o}
                </Txt>
              </View>
            );
          })}
        </View>
        <View className="mt-4 flex-row items-start gap-2.5 rounded-xl bg-emerald-50 p-3 dark:bg-emerald-500/10">
          <Icon name="check-circle" size={16} color={colors.success} />
          <Txt className="flex-1 text-[13px] leading-5 text-emerald-900 dark:text-emerald-100">
            <Txt weight="semibold" className="text-[13px] text-emerald-900 dark:text-emerald-100">
              Spot on.{' '}
            </Txt>
            10% means move the decimal one place left: ₹450 → ₹45.
          </Txt>
        </View>
      </View>

      {/* Floating streak chip */}
      <View className="absolute -bottom-4 -left-2 flex-row items-center gap-2 rounded-2xl border border-line bg-white px-3.5 py-2.5 web:shadow-lg dark:border-ink-line dark:bg-ink-raised md:-left-6">
        <View className="h-8 w-8 items-center justify-center rounded-lg bg-orange-50 dark:bg-orange-500/15">
          <Icon name="flame" size={16} color={colors.streak} filled />
        </View>
        <View>
          <Txt weight="bold" className="text-sm">
            7-day streak
          </Txt>
          <Muted className="text-xs">Keep it going</Muted>
        </View>
      </View>
    </View>
  );
}
