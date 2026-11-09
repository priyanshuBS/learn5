/**
 * Welcome — the public home page for people who are not signed in.
 * Address: /welcome   (signed-out visitors to any app page land here)
 *
 * Explains Learn5, then sends people to sign up or log in. The quizzes open
 * only after signing in. Styled after priyanshusingh.co.in: near-black, glass,
 * violet → cyan glows, big display type and small mono labels.
 */
import { router } from 'expo-router';
import { useEffect, type ReactNode } from 'react';
import { useWindowDimensions, View } from 'react-native';
import Animated, {
  Easing,
  FadeIn,
  FadeInDown,
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withTiming,
} from 'react-native-reanimated';
import { twMerge } from 'tailwind-merge';

import categoriesFile from '../content/categories.json';
import { Button } from '@/components/Button';
import { CARD_CLASSES, CARD_PRESSABLE_CLASSES } from '@/components/Card';
import { CategoryIcon } from '@/components/CategoryIcon';
import { DifficultyBadge, Tag } from '@/components/DifficultyBadge';
import { Glow, GlowDot, GradientLine, GradientText } from '@/components/Glow';
import { Icon, type IconName } from '@/components/Icon';
import { Logo } from '@/components/Logo';
import { QuizProgress } from '@/components/ProgressBar';
import { Screen } from '@/components/Screen';
import { ThemeIconButton } from '@/components/ThemeToggle';
import { Eyebrow, Muted, Txt } from '@/components/Txt';
import { useColorScheme } from '@/hooks/useScheme';
import { signInHref } from '@/lib/routes';
import { CategoriesFileSchema } from '@/lib/schema';
import { categoryTone, colors, GLOW } from '@/theme';

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
  const dark = useColorScheme() === 'dark';
  const lilac = dark ? '#C4B5FD' : colors.brandDark;

  return (
    <Screen contentClassName="pt-4 md:pt-6">
      <Animated.View entering={FadeIn.duration(300)}>
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
        <View className="mt-16 gap-14 md:mt-24 lg:flex-row lg:items-center">
          <View className="lg:flex-1">
            <View className="flex-row items-center gap-2.5 self-start rounded-full border border-line bg-white px-3.5 py-1.5 dark:border-white/10 dark:bg-white/[0.035]">
              <GlowDot />
              <Eyebrow>New drops every day</Eyebrow>
            </View>
            <Txt
              weight="heavy"
              accessibilityRole="header"
              className="mt-8 text-[48px] leading-[50px] md:text-[76px] md:leading-[76px]"
            >
              Learn a little.{'\n'}
              <GradientText className="text-[48px] leading-[50px] md:text-[76px] md:leading-[76px]">
                Every single day.
              </GradientText>
            </Txt>
            <Muted className="mt-7 max-w-lg text-[17px] leading-7">
              5 questions. 5 minutes. Bite-size drops in English, Math, Reasoning, Physics,
              Chemistry and Biology — in simple English, with a clear “why” after every answer.
            </Muted>
            <View className="mt-10 gap-3 sm:flex-row">
              <Button
                label="Start learning — free"
                icon="arrow-right"
                iconRight
                onPress={goSignUp}
              />
              <Button label="I have an account" variant="secondary" onPress={goLogIn} />
            </View>
            <View className="mt-10 flex-row flex-wrap gap-x-8 gap-y-4">
              <HeroStat value="6" label="Subjects" />
              <HeroStat value="18" label="Drops a day" />
              <HeroStat value="5 min" label="Each drop" />
            </View>
          </View>

          {/* Layout classes on a plain View: Animated.View doesn't apply responsive classes. */}
          <View className="pb-6 lg:flex-1">
            <Animated.View entering={FadeInDown.delay(150).duration(500)}>
              <ProductPreview />
            </Animated.View>
          </View>
        </View>

        {/* Subjects marquee */}
        <View className="-mx-4 mt-20 md:-mx-8 xl:-mx-10">
          <GradientLine className="opacity-40" />
          <Marquee>
            {categories.map((c) => (
              <View key={c.id} className="flex-row items-center gap-3 px-6 py-5">
                <CategoryIcon category={c} size="sm" />
                <Txt weight="bold" className="text-xl">
                  {c.name}
                </Txt>
                <Txt className="text-xl" style={{ color: categoryTone(c.color, dark) }}>
                  ✦
                </Txt>
              </View>
            ))}
          </Marquee>
          <GradientLine className="opacity-40" />
        </View>

        {/* Subjects */}
        <SectionHeading
          eyebrow="01 · Subjects"
          title="Six subjects."
          accent="One daily habit."
          text="School-level facts from trusted textbooks, explained simply."
        />
        <View className="-m-2 flex-row flex-wrap">
          {categories.map((category) => (
            <View key={category.id} className="w-1/2 p-2 md:w-1/3">
              <View
                className={twMerge(
                  CARD_CLASSES,
                  CARD_PRESSABLE_CLASSES,
                  'h-full overflow-hidden p-6',
                )}
              >
                <Glow
                  color={category.color}
                  size={220}
                  opacity={dark ? 0.3 : 0.14}
                  style={{ top: -110, left: -100 }}
                />
                <CategoryIcon category={category} size="md" />
                <Txt weight="bold" className="mt-6 text-xl">
                  {category.name}
                </Txt>
                <Muted className="mt-1 leading-5" numberOfLines={2}>
                  {category.tagline}
                </Muted>
              </View>
            </View>
          ))}
        </View>

        {/* Features */}
        <SectionHeading
          eyebrow="02 · Features"
          title="Everything you need"
          accent="to learn daily."
          text="Short, focused and rewarding — built to fit into any day."
        />
        <View className="-m-2 flex-row flex-wrap">
          {FEATURES.map((f) => (
            <View key={f.title} className="w-full p-2 sm:w-1/2 lg:w-1/3">
              <View className={twMerge(CARD_CLASSES, CARD_PRESSABLE_CLASSES, 'h-full p-7')}>
                <View className="h-11 w-11 items-center justify-center rounded-2xl border border-line bg-zinc-50 dark:border-white/10 dark:bg-white/5">
                  <Icon name={f.icon} size={19} color={lilac} />
                </View>
                <Txt weight="bold" className="mt-6 text-xl">
                  {f.title}
                </Txt>
                <Muted className="mt-2 text-[15px] leading-6">{f.text}</Muted>
              </View>
            </View>
          ))}
        </View>

        {/* How it works */}
        <SectionHeading eyebrow="03 · How it works" title="Start in" accent="under a minute." />
        <View className="gap-4 md:flex-row">
          {STEPS.map((step, i) => (
            <View key={step.title} className={twMerge(CARD_CLASSES, 'p-7 md:flex-1')}>
              <Txt
                weight="heavy"
                className="text-[44px] leading-[48px] text-zinc-200 dark:text-white/10"
              >
                0{i + 1}
              </Txt>
              <GradientLine className="mt-4 w-12" />
              <Txt weight="bold" className="mt-5 text-xl">
                {step.title}
              </Txt>
              <Muted className="mt-2 text-[15px] leading-6">{step.text}</Muted>
            </View>
          ))}
        </View>

        {/* Final call to action */}
        <View
          className={twMerge(
            CARD_CLASSES,
            'mt-24 items-center overflow-hidden px-6 py-16 md:py-24',
          )}
        >
          <Glow
            color={GLOW.violet}
            size={520}
            opacity={dark ? 0.35 : 0.15}
            style={{ top: -260, left: -180 }}
          />
          <Glow
            color={GLOW.cyan}
            size={460}
            opacity={dark ? 0.25 : 0.1}
            style={{ bottom: -240, right: -160 }}
          />
          <Eyebrow>Ready when you are</Eyebrow>
          <Txt
            weight="heavy"
            className="mt-5 text-center text-[40px] leading-[44px] md:text-[64px] md:leading-[66px]"
          >
            Your first 5 minutes{'\n'}
            <GradientText className="text-center text-[40px] leading-[44px] md:text-[64px] md:leading-[66px]">
              start now.
            </GradientText>
          </Txt>
          <Muted className="mt-5 max-w-md text-center text-[15px] leading-6">
            Create your free account with just your email. No password to remember.
          </Muted>
          <View className="mt-10">
            <Button
              label="Create free account"
              variant="accent"
              icon="arrow-right"
              iconRight
              onPress={goSignUp}
            />
          </View>
        </View>

        {/* Footer + giant faint wordmark */}
        <View className="mt-16 flex-row flex-wrap items-center justify-between gap-4">
          <Logo />
          <View className="flex-row flex-wrap items-center gap-5">
            <Txt
              accessibilityRole="link"
              onPress={() => router.push('/privacy')}
              className="text-[13px] text-zinc-500 dark:text-[#8E8EA3]"
            >
              Privacy
            </Txt>
            <Txt
              accessibilityRole="link"
              onPress={() => router.push('/terms')}
              className="text-[13px] text-zinc-500 dark:text-[#8E8EA3]"
            >
              Terms
            </Txt>
            <Eyebrow>© 2026 Learn5</Eyebrow>
          </View>
        </View>
        <Wordmark />
      </Animated.View>
    </Screen>
  );
}

function HeroStat({ value, label }: { value: string; label: string }) {
  return (
    <View>
      <Txt weight="heavy" className="text-[28px] leading-8">
        {value}
      </Txt>
      <Eyebrow className="mt-1">{label}</Eyebrow>
    </View>
  );
}

function SectionHeading({
  eyebrow,
  title,
  accent,
  text,
}: {
  eyebrow: string;
  title: string;
  accent: string;
  text?: string;
}) {
  return (
    <View className="mb-8 mt-24 md:mt-32">
      <Eyebrow className="text-brand-700 dark:text-[#C4B5FD]">{eyebrow}</Eyebrow>
      <Txt
        weight="heavy"
        accessibilityRole="header"
        className="mt-4 text-[36px] leading-[40px] md:text-[56px] md:leading-[58px]"
      >
        {title}{' '}
        <GradientText className="text-[36px] leading-[40px] md:text-[56px] md:leading-[58px]">
          {accent}
        </GradientText>
      </Txt>
      {text ? <Muted className="mt-4 max-w-xl text-[16px] leading-7">{text}</Muted> : null}
    </View>
  );
}

/** A row of items that scrolls sideways forever (like the site's marquee). */
function Marquee({ children }: { children: ReactNode }) {
  const { width } = useWindowDimensions();
  const x = useSharedValue(0);
  // One copy is roughly this wide; we slide by exactly one copy, then repeat.
  const copyWidth = Math.max(width, 1100);
  useEffect(() => {
    x.set(
      withRepeat(withTiming(-copyWidth, { duration: 28000, easing: Easing.linear }), -1, false),
    );
  }, [x, copyWidth]);
  const style = useAnimatedStyle(() => ({ transform: [{ translateX: x.get() }] }));
  return (
    <View
      className="overflow-hidden"
      accessibilityElementsHidden
      importantForAccessibility="no-hide-descendants"
    >
      <Animated.View style={[{ flexDirection: 'row' }, style]}>
        <View style={{ width: copyWidth, flexDirection: 'row', justifyContent: 'space-around' }}>
          {children}
        </View>
        <View style={{ width: copyWidth, flexDirection: 'row', justifyContent: 'space-around' }}>
          {children}
        </View>
      </Animated.View>
    </View>
  );
}

/** The giant, barely-visible "Learn5" at the very bottom of the page. */
function Wordmark() {
  const { width } = useWindowDimensions();
  const size = Math.min(Math.max(width * 0.19, 72), 260);
  return (
    <View pointerEvents="none" className="mt-6 items-center overflow-hidden">
      <Txt
        weight="heavy"
        accessibilityElementsHidden
        importantForAccessibility="no-hide-descendants"
        className="text-zinc-900/[0.05] dark:text-white/[0.04]"
        style={{ fontSize: size, lineHeight: size * 1.05, letterSpacing: -size * 0.06 }}
      >
        Learn5
      </Txt>
    </View>
  );
}

/** A static picture of a quiz question, so visitors see what the app looks like. */
function ProductPreview() {
  const dark = useColorScheme() === 'dark';
  const math = categories.find((c) => c.id === 'math') ?? categories[0];
  const options = ['₹35', '₹45', '₹40', '₹54'];
  return (
    <View accessible accessibilityLabel="Preview of a Learn5 question" className="relative">
      <Glow
        color={GLOW.violet}
        size={520}
        opacity={dark ? 0.35 : 0.18}
        style={{ top: -140, left: -120 }}
      />
      <Glow
        color={GLOW.cyan}
        size={420}
        opacity={dark ? 0.22 : 0.1}
        style={{ bottom: -140, right: -110 }}
      />
      <View className={twMerge(CARD_CLASSES, 'p-6 web:shadow-2xl md:p-7')}>
        <View className="flex-row items-center gap-4">
          <View className="h-8 w-8 items-center justify-center rounded-full border border-line dark:border-white/15">
            <Icon name="x" size={14} />
          </View>
          <QuizProgress segments={['correct', 'correct', 'current', 'todo', 'todo']} />
          <Eyebrow>3/5</Eyebrow>
        </View>
        <View className="mt-7 flex-row flex-wrap items-center gap-2">
          <Tag label={math.name} color={math.color} />
          <DifficultyBadge difficulty="medium" />
        </View>
        <Txt weight="bold" className="mt-4 text-[22px] leading-8">
          A ₹450 shirt is 10% off. How much do you save?
        </Txt>
        <View className="mt-6 gap-2.5">
          {options.map((o, i) => {
            const correct = i === 1;
            return (
              <View
                key={o}
                className={twMerge(
                  'flex-row items-center gap-3 rounded-2xl border px-4 py-3',
                  correct
                    ? 'border-emerald-500 bg-emerald-50 dark:border-emerald-400/70 dark:bg-emerald-500/10'
                    : 'border-line dark:border-white/10',
                  !correct && i > 1 && 'opacity-40',
                )}
              >
                <View
                  className={twMerge(
                    'h-7 w-7 items-center justify-center rounded-full border',
                    correct
                      ? 'border-emerald-500 bg-emerald-500'
                      : 'border-line dark:border-white/15',
                  )}
                >
                  {correct ? (
                    <Icon name="check" size={13} color={colors.white} strokeWidth={3} />
                  ) : (
                    <Txt
                      weight="semibold"
                      className="text-[11px] text-zinc-500 dark:text-[#8E8EA3]"
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
        <View className="mt-5 flex-row items-start gap-2.5 rounded-2xl border border-emerald-500/25 bg-emerald-500/10 p-3.5">
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
      <View className="absolute -bottom-5 -left-2 flex-row items-center gap-2.5 rounded-2xl border border-line bg-white px-4 py-3 web:shadow-xl dark:border-white/15 dark:bg-[#0E0E15] md:-left-6">
        <View className="h-8 w-8 items-center justify-center rounded-full bg-orange-500/15">
          <Icon name="flame" size={16} color={colors.streak} filled />
        </View>
        <View>
          <Txt weight="bold" className="text-[15px]">
            7-day streak
          </Txt>
          <Eyebrow className="text-[10px]">Keep it going</Eyebrow>
        </View>
      </View>
    </View>
  );
}
