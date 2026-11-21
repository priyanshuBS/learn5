/**
 * Welcome — the public landing page for people who are not signed in.
 * Address: /welcome   (signed-out visitors to any app page land here)
 *
 * Explains Learn5 ("Scholar" theme), then sends people to sign up or log in.
 * The quizzes open only after signing in.
 */
import { router } from 'expo-router';
import { Linking, View } from 'react-native';
import { twMerge } from 'tailwind-merge';

import categoriesFile from '../content/categories.json';
import { Button } from '@/components/Button';
import { CARD_CLASSES } from '@/components/Card';
import { CategoryIcon } from '@/components/CategoryIcon';
import { DifficultyBadge, Tag } from '@/components/DifficultyBadge';
import { Icon, type IconName } from '@/components/Icon';
import { Icon3D } from '@/components/Icon3D';
import { Logo } from '@/components/Logo';
import { QuizProgress } from '@/components/ProgressBar';
import { Screen } from '@/components/Screen';
import { ThemeIconButton } from '@/components/ThemeToggle';
import { Muted, Txt } from '@/components/Txt';
import { useColorScheme } from '@/hooks/useScheme';
import { signInHref } from '@/lib/routes';
import { CategoriesFileSchema, DROPS_PER_DAY } from '@/lib/schema';
import { categoryTone, colors } from '@/theme';

const categories = CategoriesFileSchema.parse(categoriesFile);

const FEATURES: { icon: IconName; color: string; filled?: boolean; title: string; text: string }[] =
  [
    {
      icon: 'lightbulb',
      color: '#F59E0B',
      filled: true,
      title: 'Clear explanations',
      text: 'Every answer explains the “why” in plain English.',
    },
    {
      icon: 'calendar',
      color: '#4338CA',
      title: 'One drop per subject',
      text: 'Five new questions in every subject at 4 AM, from easy to hard.',
    },
    {
      icon: 'articles',
      color: '#8B5CF6',
      title: 'A daily read',
      text: 'One short, easy article every morning, on a new subject each day.',
    },
    {
      icon: 'review',
      color: '#EC4899',
      title: 'Review mistakes',
      text: 'Replay the questions you got wrong until they stick.',
    },
    {
      icon: 'flashcards',
      color: '#0EA5E9',
      title: 'Flashcards',
      text: 'Keep the facts you liked and flip through them any time.',
    },
    {
      icon: 'flame',
      color: '#F59E0B',
      filled: true,
      title: 'Streaks and levels',
      text: 'Points, levels and badges that reward showing up.',
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
  return (
    <Screen contentClassName="pt-4 md:pt-6">
      {/* Top bar */}
      <View className="flex-row items-center justify-between">
        <Logo />
        <View className="flex-row items-center gap-1.5">
          <ThemeIconButton />
          <Button label="Log in" variant="ghost" size="sm" onPress={goLogIn} />
          <View className="hidden sm:flex">
            <Button label="Sign up free" size="sm" onPress={goSignUp} />
          </View>
        </View>
      </View>

      {/* Hero */}
      <View className="mt-12 gap-12 md:mt-20 lg:flex-row lg:items-center">
        <View className="lg:flex-1">
          <View className="flex-row items-center gap-2 self-start rounded-full bg-brand-50 px-3 py-1.5 dark:bg-brand-400/15">
            <Icon name="sparkles" size={13} color={dark ? colors.brandOnDark : colors.brand} />
            <Txt weight="semibold" className="text-[12.5px] text-brand-700 dark:text-brand-300">
              New questions every morning at 4 AM
            </Txt>
          </View>
          <Txt
            weight="display"
            accessibilityRole="header"
            className="mt-5 text-[40px] leading-[46px] tracking-[-1.2px] md:text-[54px] md:leading-[60px] md:tracking-[-1.6px]"
          >
            Learn something new in{' '}
            <Txt
              weight="display"
              className="text-[40px] leading-[46px] tracking-[-1.2px] text-brand-600 dark:text-brand-400 md:text-[54px] md:leading-[60px] md:tracking-[-1.6px]"
            >
              five minutes
            </Txt>{' '}
            a day.
          </Txt>
          <Muted className="mt-5 max-w-lg text-[17px] leading-7">
            Short daily quizzes in Math, Reasoning, English and Computer Science, with a clear
            explanation after every answer. Free, and no password needed.
          </Muted>
          <View className="mt-8 gap-3 sm:flex-row">
            <Button label="Start learning free" icon="arrow-right" iconRight onPress={goSignUp} />
            <Button label="I have an account" variant="secondary" onPress={goLogIn} />
          </View>
          <View className="mt-10 flex-row flex-wrap gap-x-10 gap-y-4">
            <Fact value={`${categories.length}`} text="subjects" />
            <Fact value={`${categories.length * DROPS_PER_DAY}`} text="drops a day" />
            <Fact value="5 min" text="per drop" />
          </View>
        </View>

        {/* The product, on a soft blue panel */}
        <View className="rounded-3xl bg-brand-50 p-4 dark:bg-brand-400/10 md:p-8 lg:flex-1">
          <ProductPreview />
        </View>
      </View>

      {/* Subjects */}
      <Section
        eyebrow="Subjects"
        title="Four skills that matter every day"
        text="Numbers, logic, language and how computers work — explained simply."
      />
      <View className="-m-1.5 flex-row flex-wrap">
        {categories.map((category) => (
          <View key={category.id} className="w-full p-1.5 sm:w-1/2 lg:w-1/4">
            <View className={twMerge(CARD_CLASSES, 'h-full p-5')}>
              <CategoryIcon category={category} size="lg" />
              <Txt weight="semibold" className="mt-4 text-[17px]">
                {category.name}
              </Txt>
              <Muted className="mt-1 text-[14px] leading-6">{category.tagline}</Muted>
              <Txt
                weight="semibold"
                className="mt-4 text-[12.5px]"
                style={{ color: categoryTone(category.color, dark) }}
              >
                1 drop a day · 5 questions
              </Txt>
            </View>
          </View>
        ))}
      </View>

      {/* How it works */}
      <Section eyebrow="How it works" title="Three steps to a daily habit" />
      <View className="gap-3 md:flex-row">
        {STEPS.map((step, i) => (
          <View key={step.title} className={twMerge(CARD_CLASSES, 'p-6 md:flex-1')}>
            <View className="h-9 w-9 items-center justify-center rounded-full bg-brand-600 dark:bg-brand-500">
              <Txt weight="bold" className="text-[15px] text-white dark:text-white">
                {i + 1}
              </Txt>
            </View>
            <Txt weight="semibold" className="mt-5 text-[17px]">
              {step.title}
            </Txt>
            <Muted className="mt-1 text-[14px] leading-6">{step.text}</Muted>
          </View>
        ))}
      </View>

      {/* Features */}
      <Section eyebrow="What you get" title="Everything you need to keep learning" />
      <View className="-m-1.5 flex-row flex-wrap">
        {FEATURES.map((f) => (
          <View key={f.title} className="w-full p-1.5 sm:w-1/2 lg:w-1/3">
            <View className={twMerge(CARD_CLASSES, 'h-full flex-row gap-4 p-5')}>
              <Icon3D icon={f.icon} color={f.color} size={42} filled={f.filled} />
              <View className="flex-1">
                <Txt weight="semibold" className="text-[15px]">
                  {f.title}
                </Txt>
                <Muted className="mt-1 text-[14px] leading-6">{f.text}</Muted>
              </View>
            </View>
          </View>
        ))}
      </View>

      {/* Call to action */}
      <View className="mt-20 overflow-hidden rounded-3xl bg-brand-900 p-8 dark:bg-[#272366] md:flex-row md:items-center md:justify-between md:p-12">
        <View
          pointerEvents="none"
          className="absolute -right-16 -top-20 h-64 w-64 rounded-full bg-white/[0.07]"
        />
        <View className="md:flex-1">
          <Txt
            weight="display"
            className="text-[30px] leading-9 tracking-[-0.8px] text-white dark:text-white md:text-[36px] md:leading-[42px]"
          >
            Start your first drop today.
          </Txt>
          <Txt className="mt-2 text-[16px] leading-6 text-white/80 dark:text-white/80">
            Free forever. Just your email — no password.
          </Txt>
        </View>
        <View className="mt-6 md:mt-0">
          <Button label="Create free account" variant="gold" onPress={goSignUp} />
        </View>
      </View>

      {/* Footer */}
      <View className="mt-14 flex-row flex-wrap items-center justify-between gap-4 border-t border-line pt-6 dark:border-ink-line">
        <Txt className="text-[13px] text-zinc-500 dark:text-zinc-400">
          © 2026 Learn5 · Made by{' '}
          <Txt
            accessibilityRole="link"
            onPress={() => void Linking.openURL('https://priyanshusingh.co.in')}
            className="font-body-semibold text-[13px] text-brand-700 dark:text-brand-300"
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

function Fact({ value, text }: { value: string; text: string }) {
  return (
    <View>
      <Txt weight="display" className="text-[24px] leading-8">
        {value}
      </Txt>
      <Muted className="text-[13px]">{text}</Muted>
    </View>
  );
}

function Section({ eyebrow, title, text }: { eyebrow: string; title: string; text?: string }) {
  return (
    <View className="mb-6 mt-20 md:mt-24">
      <Txt
        weight="semibold"
        className="text-[13px] uppercase tracking-[1px] text-brand-600 dark:text-brand-400"
      >
        {eyebrow}
      </Txt>
      <Txt
        weight="display"
        accessibilityRole="header"
        className="mt-2 text-[28px] leading-9 tracking-[-0.7px] md:text-[34px] md:leading-[42px]"
      >
        {title}
      </Txt>
      {text ? <Muted className="mt-2 text-[16px] leading-6">{text}</Muted> : null}
    </View>
  );
}

/** A static picture of a quiz question, so visitors see what the app looks like. */
function ProductPreview() {
  const reasoning = categories.find((c) => c.id === 'reasoning') ?? categories[0];
  const options = ['30', '32', '36', '40'];
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
        <Tag label={reasoning.name} color={reasoning.color} />
        <DifficultyBadge difficulty="medium" />
      </View>
      <Txt weight="display" className="mt-4 text-[20px] leading-7">
        What comes next: 2, 6, 12, 20, ?
      </Txt>
      <View className="mt-5 gap-2">
        {options.map((o, i) => {
          const correct = i === 0;
          return (
            <View
              key={o}
              className={twMerge(
                'flex-row items-center gap-3 rounded-xl border px-3.5 py-3',
                correct
                  ? 'border-emerald-500 bg-emerald-50 dark:border-emerald-500/70 dark:bg-emerald-500/10'
                  : 'border-line dark:border-ink-line',
              )}
            >
              <View
                className={twMerge(
                  'h-7 w-7 items-center justify-center rounded-lg',
                  correct ? 'bg-emerald-600' : 'bg-zinc-100 dark:bg-ink-raised',
                )}
              >
                {correct ? (
                  <Icon name="check" size={14} color={colors.white} strokeWidth={3} />
                ) : (
                  <Txt weight="semibold" className="text-[12px] text-zinc-500">
                    {String.fromCharCode(65 + i)}
                  </Txt>
                )}
              </View>
              <Txt weight="medium" className="flex-1 text-[15px]">
                {o}
              </Txt>
            </View>
          );
        })}
      </View>
      <View className="mt-4 rounded-xl bg-amber-50 p-3.5 dark:bg-amber-500/10">
        <Txt weight="semibold" className="text-[13px] text-amber-800 dark:text-amber-200">
          Why
        </Txt>
        <Txt className="mt-0.5 text-[13px] leading-5 text-amber-900/80 dark:text-amber-100/80">
          The gaps grow by 2 each time: +4, +6, +8, so the next gap is +10. 20 + 10 = 30.
        </Txt>
      </View>
    </View>
  );
}
