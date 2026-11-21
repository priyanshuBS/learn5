/**
 * Welcome — the public home page for people who are not signed in.
 * Address: /welcome   (signed-out visitors to any app page land here)
 *
 * Explains Learn5, then sends people to sign up or log in. The quizzes open
 * only after signing in.
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
import { Eyebrow, Muted, Txt } from '@/components/Txt';
import { signInHref } from '@/lib/routes';
import { CategoriesFileSchema, DROPS_PER_DAY } from '@/lib/schema';
import { colors } from '@/theme';

const categories = CategoriesFileSchema.parse(categoriesFile);

const FEATURES: { icon: IconName; color: string; filled?: boolean; title: string; text: string }[] =
  [
    {
      icon: 'lightbulb',
      color: '#F5B70A',
      filled: true,
      title: 'Clear explanations',
      text: 'Every answer explains the “why” in plain English.',
    },
    {
      icon: 'calendar',
      color: '#0EA5E9',
      title: 'One drop per subject',
      text: 'Five new questions in every subject at 4 AM, from easy to hard.',
    },
    {
      icon: 'articles',
      color: '#8B5CF6',
      title: 'A daily read',
      text: 'One fresh, easy-to-read article every morning, a new subject each day.',
    },
    {
      icon: 'review',
      color: '#F43F5E',
      title: 'Review mistakes',
      text: 'Replay the questions you got wrong until they stick.',
    },
    {
      icon: 'flashcards',
      color: '#16A594',
      title: 'Flashcards',
      text: 'Keep the facts you liked and flip through them any time.',
    },
    {
      icon: 'flame',
      color: '#FF7A2E',
      filled: true,
      title: 'Streaks and levels',
      text: 'Points, levels and badges that reward showing up.',
    },
    {
      icon: 'smartphone',
      color: '#64748B',
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
  return (
    <Screen contentClassName="pt-4 md:pt-6">
      <View>
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
            <Eyebrow>Daily micro-learning</Eyebrow>
            <Txt
              weight="display"
              accessibilityRole="header"
              className="mt-4 text-[40px] leading-[44px] tracking-[-1.2px] md:text-[56px] md:leading-[60px] md:tracking-[-1.8px]"
            >
              Learn something new in five minutes a day.
            </Txt>
            <Muted className="mt-5 max-w-lg text-[17px] leading-7">
              Short daily quizzes in Math, Reasoning, English and Computer Science, with a clear
              explanation after every answer. Free, and no password needed.
            </Muted>
            <View className="mt-8 gap-3 sm:flex-row">
              <Button label="Get started" icon="arrow-right" iconRight onPress={goSignUp} />
              <Button label="I have an account" variant="secondary" onPress={goLogIn} />
            </View>
            <View className="mt-10 flex-row flex-wrap gap-x-8 gap-y-4 border-t border-line pt-6 dark:border-ink-line">
              <Fact value={`${categories.length}`} text="subjects" />
              <Fact value={`${categories.length * DROPS_PER_DAY}`} text="drops a day" />
              <Fact value="4 AM" text="new every day" />
            </View>
          </View>

          {/* The product: a clean framed preview */}
          <View className="lg:flex-1">
            <ProductPreview />
          </View>
        </View>

        {/* Subjects */}
        <Section
          title="Subjects"
          text="Four core skills, explained simply: numbers, logic, language and how computers work."
        />
        <View className={twMerge(CARD_CLASSES, 'overflow-hidden')}>
          {/* -1px: the card's edge hides the last row's divider line. */}
          <View className="flex-row flex-wrap" style={{ marginBottom: -1 }}>
            {categories.map((category) => (
              <View
                key={category.id}
                className="w-full flex-row items-center gap-3.5 border-b border-line p-4 dark:border-ink-line sm:w-1/2"
              >
                <CategoryIcon category={category} size="md" />
                <View className="flex-1">
                  <Txt weight="medium" className="text-[15px]">
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
        <View className={twMerge(CARD_CLASSES, 'overflow-hidden md:flex-row')}>
          {STEPS.map((step, i) => (
            <View
              key={step.title}
              className={twMerge(
                'p-5 md:flex-1 md:p-6',
                i > 0 && 'border-t border-line dark:border-ink-line md:border-l md:border-t-0',
              )}
            >
              <Txt weight="mono" className="text-[12px] text-zinc-400 dark:text-zinc-500">
                {String(i + 1).padStart(2, '0')}
              </Txt>
              <Txt weight="medium" className="mt-6 text-[16px]">
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
              <Icon3D icon={f.icon} size={36} />
              <View className="flex-1">
                <Txt weight="medium" className="text-[15px]">
                  {f.title}
                </Txt>
                <Muted className="mt-0.5 text-[14px] leading-6">{f.text}</Muted>
              </View>
            </View>
          ))}
        </View>

        {/* Final call to action */}
        <View className="mt-20 items-start gap-6 border-t border-line pt-12 dark:border-ink-line md:flex-row md:items-end md:justify-between">
          <View className="md:flex-1">
            <Txt
              weight="display"
              className="text-[30px] leading-9 tracking-[-0.8px] md:text-[36px] md:leading-[42px]"
            >
              Start your first drop today.
            </Txt>
            <Muted className="mt-2 text-[15px] leading-6">
              Free. Just your email, no password.
            </Muted>
          </View>
          <Button label="Create free account" onPress={goSignUp} />
        </View>

        {/* Footer */}
        <View className="mt-12 flex-row flex-wrap items-center justify-between gap-4 border-t border-line pt-6 dark:border-ink-line">
          <Txt className="text-[13px] text-zinc-500 dark:text-zinc-400">
            © 2026 Learn5 · Made by{' '}
            <Txt
              accessibilityRole="link"
              onPress={() => void Linking.openURL('https://priyanshusingh.co.in')}
              className="text-[13px] text-zinc-950 underline dark:text-[#EDEDED]"
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
      </View>
    </Screen>
  );
}

function Fact({ value, text }: { value: string; text: string }) {
  return (
    <View>
      <Txt weight="display" className="text-[22px] leading-7">
        {value}
      </Txt>
      <Muted className="text-[13px]">{text}</Muted>
    </View>
  );
}

function Section({ title, text }: { title: string; text?: string }) {
  return (
    <View className="mb-5 mt-20 md:mt-24">
      <Txt
        weight="display"
        accessibilityRole="header"
        className="text-[24px] leading-8 tracking-[-0.6px] md:text-[28px]"
      >
        {title}
      </Txt>
      {text ? <Muted className="mt-1.5 text-[15px] leading-6">{text}</Muted> : null}
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
                'flex-row items-center gap-3 rounded-lg border px-3.5 py-3',
                correct
                  ? 'border-emerald-600 bg-emerald-50/60 dark:border-emerald-500/70 dark:bg-emerald-500/[0.08]'
                  : 'border-line dark:border-ink-line',
              )}
            >
              <Txt
                weight="mono"
                className={twMerge(
                  'w-4 text-[12px]',
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
      <View className="mt-4 border-l-2 border-zinc-200 pl-3.5 dark:border-zinc-700">
        <Txt weight="medium" className="text-[13px]">
          Why
        </Txt>
        <Muted className="mt-0.5 text-[13px] leading-5">
          The gaps grow by 2 each time: +4, +6, +8, so the next gap is +10. 20 + 10 = 30.
        </Muted>
      </View>
    </View>
  );
}
