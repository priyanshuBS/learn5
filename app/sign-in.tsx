/**
 * Sign up / Log in — step 1: enter your email. Step 2: type the 6-digit code we emailed you.
 * After that you stay signed in for 7 days.
 * Address: /sign-in?mode=signup  or  /sign-in?mode=login
 *
 * Sign-up and log-in are the same steps (a new email gets an account automatically);
 * only the wording changes.
 */
import { router, useLocalSearchParams } from 'expo-router';
import { useEffect, useRef, useState } from 'react';
import {
  KeyboardAvoidingView,
  Platform,
  Pressable,
  TextInput,
  View,
  type TextInputInstance,
} from 'react-native';
import { twMerge } from 'tailwind-merge';

import { Button, IconButton } from '@/components/Button';
import { Card } from '@/components/Card';
import { Icon } from '@/components/Icon';
import { Logo } from '@/components/Logo';
import { Screen } from '@/components/Screen';
import { ThemeIconButton } from '@/components/ThemeToggle';
import { Muted, Txt } from '@/components/Txt';
import { ApiError } from '@/features/auth/api';
import { EmailSchema, OTP_LENGTH, OtpCodeSchema, SESSION_DAYS } from '@/features/auth/rules';
import { useAuth } from '@/features/auth/store';
import { useColorScheme } from '@/hooks/useScheme';
import { haptics } from '@/lib/haptics';
import { WELCOME_HREF } from '@/lib/routes';
import { colors } from '@/theme';

const INPUT_CLASSES =
  'min-h-12 flex-1 font-body-medium text-base text-zinc-900 web:outline-none dark:text-zinc-100';

const messageOf = (err: unknown) =>
  err instanceof Error ? err.message : 'Something went wrong. Please try again.';

/** Back to the welcome page (or wherever the visitor came from). */
function goBack() {
  if (router.canGoBack()) router.back();
  else router.replace(WELCOME_HREF);
}

export default function SignInScreen() {
  const scheme = useColorScheme();
  const params = useLocalSearchParams<{ mode?: string }>();
  const [mode, setMode] = useState<'signup' | 'login'>(
    params.mode === 'signup' ? 'signup' : 'login',
  );
  const requestOtp = useAuth((s) => s.requestOtp);
  const verifyOtp = useAuth((s) => s.verifyOtp);

  const [step, setStep] = useState<'email' | 'code'>('email');
  const [email, setEmail] = useState('');
  const [code, setCode] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);
  const [resendIn, setResendIn] = useState(0);
  const [emailFocused, setEmailFocused] = useState(false);
  const [codeFocused, setCodeFocused] = useState(false);
  const codeInput = useRef<TextInputInstance>(null);

  // "Resend code in 42s" countdown.
  useEffect(() => {
    if (resendIn <= 0) return;
    const timer = setTimeout(() => setResendIn((s) => s - 1), 1000);
    return () => clearTimeout(timer);
  }, [resendIn]);

  const sendCode = async (isResend = false) => {
    const parsed = EmailSchema.safeParse(email);
    if (!parsed.success) {
      setError(parsed.error.issues[0]?.message ?? 'Please enter a valid email address');
      return;
    }
    setBusy(true);
    setError(null);
    setNotice(null);
    try {
      const wait = await requestOtp(parsed.data);
      setEmail(parsed.data);
      setCode('');
      setStep('code');
      setResendIn(wait);
      setNotice(isResend ? 'We sent you a new code.' : null);
      setTimeout(() => codeInput.current?.focus(), 50);
    } catch (err) {
      if (err instanceof ApiError && err.retryAfterSec && err.retryAfterSec < 3600) {
        setResendIn(err.retryAfterSec);
        // A code was sent a moment ago: let the person type it.
        if (!isResend) {
          setEmail(parsed.data);
          setStep('code');
        }
      }
      setError(messageOf(err));
    } finally {
      setBusy(false);
    }
  };

  const checkCode = async (value = code) => {
    if (!OtpCodeSchema.safeParse(value).success || busy) return;
    setBusy(true);
    setError(null);
    try {
      await verifyOtp(email, value.trim());
      haptics.success();
      // The layout now opens the app automatically.
    } catch (err) {
      haptics.error();
      setError(messageOf(err));
      setCode('');
      codeInput.current?.focus();
    } finally {
      setBusy(false);
    }
  };

  const onCodeChange = (text: string) => {
    const digits = text.replace(/\D/g, '').slice(0, OTP_LENGTH);
    setCode(digits);
    if (error) setError(null);
    if (digits.length === OTP_LENGTH) void checkCode(digits);
  };

  const dark = scheme === 'dark';
  const mutedIcon = dark ? colors.mutedDark : colors.muted;

  return (
    <KeyboardAvoidingView
      className="flex-1"
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <Screen width="narrow" fill contentClassName="max-w-[500px] pt-4 md:pt-6">
        <View className="flex-row items-center justify-between">
          <IconButton icon="arrow-left" label="Back to home page" onPress={goBack} />
          <ThemeIconButton />
        </View>

        <View className="flex-1 justify-center py-6">
          <View className="relative">
            <Card className="p-6 md:p-8">
              <View className="mb-7 items-center">
                <Logo showWordmark={false} size="lg" />
                <Txt
                  weight="display"
                  accessibilityRole="header"
                  className="mt-5 text-center text-[26px] leading-[32px]"
                >
                  {step === 'code'
                    ? 'Check your email'
                    : mode === 'signup'
                      ? 'Create your account'
                      : 'Welcome back'}
                </Txt>
                <Muted className="mt-2 text-center text-[15px] leading-6">
                  {step === 'email' ? (
                    mode === 'signup' ? (
                      'We’ll email you a code — no password needed.'
                    ) : (
                      'We’ll email you a code to sign in.'
                    )
                  ) : (
                    <>
                      We sent a {OTP_LENGTH}-digit code to{'\n'}
                      <Txt weight="semibold" className="text-[15px]">
                        {email}
                      </Txt>
                    </>
                  )}
                </Muted>
              </View>
              {step === 'email' ? (
                <>
                  <Txt weight="medium" className="mb-2 text-sm">
                    Email address
                  </Txt>
                  <View
                    className={twMerge(
                      'flex-row items-center gap-2.5 rounded-2xl border bg-white px-4 dark:bg-ink',
                      emailFocused
                        ? 'border-brand-500 web:ring-4 web:ring-brand-500/15'
                        : 'border-line dark:border-ink-line',
                    )}
                  >
                    <Icon name="mail" size={17} color={mutedIcon} />
                    <TextInput
                      value={email}
                      onChangeText={(t) => {
                        setEmail(t);
                        if (error) setError(null);
                      }}
                      onFocus={() => setEmailFocused(true)}
                      onBlur={() => setEmailFocused(false)}
                      onSubmitEditing={() => void sendCode()}
                      placeholder="you@example.com"
                      placeholderTextColor={colors.mutedDark}
                      accessibilityLabel="Email address"
                      keyboardType="email-address"
                      autoCapitalize="none"
                      autoCorrect={false}
                      autoComplete="email"
                      textContentType="emailAddress"
                      inputMode="email"
                      returnKeyType="send"
                      editable={!busy}
                      autoFocus
                      className={INPUT_CLASSES}
                    />
                  </View>
                  <Button
                    label="Continue with email"
                    icon="arrow-right"
                    iconRight
                    onPress={() => void sendCode()}
                    loading={busy}
                    disabled={!email.trim()}
                    className="mt-4"
                  />
                </>
              ) : (
                <>
                  <Txt weight="medium" className="mb-2 text-sm">
                    Sign-in code
                  </Txt>
                  {/* 6 boxes on top of one invisible input (keeps paste and SMS/email autofill working) */}
                  <Pressable
                    accessible={false}
                    onPress={() => codeInput.current?.focus()}
                    className="relative"
                  >
                    <View className="flex-row gap-2">
                      {Array.from({ length: OTP_LENGTH }, (_, i) => {
                        const digit = code[i];
                        const active = codeFocused && i === Math.min(code.length, OTP_LENGTH - 1);
                        return (
                          <View
                            key={i}
                            className={twMerge(
                              'h-16 flex-1 items-center justify-center rounded-2xl border bg-white dark:bg-ink',
                              active
                                ? 'border-brand-500 web:ring-4 web:ring-brand-500/15'
                                : digit
                                  ? 'border-zinc-300 dark:border-zinc-600'
                                  : 'border-line dark:border-ink-line',
                              error && 'border-rose-400 dark:border-rose-500/60',
                            )}
                          >
                            <Txt weight="bold" className="text-[26px]">
                              {digit ?? ''}
                            </Txt>
                          </View>
                        );
                      })}
                    </View>
                    <TextInput
                      ref={codeInput}
                      value={code}
                      onChangeText={onCodeChange}
                      onFocus={() => setCodeFocused(true)}
                      onBlur={() => setCodeFocused(false)}
                      onSubmitEditing={() => void checkCode()}
                      accessibilityLabel={`${OTP_LENGTH}-digit code`}
                      keyboardType="number-pad"
                      inputMode="numeric"
                      autoComplete="one-time-code"
                      textContentType="oneTimeCode"
                      maxLength={OTP_LENGTH}
                      editable={!busy}
                      caretHidden
                      autoFocus
                      className="absolute inset-0 text-transparent opacity-[0.02] web:outline-none"
                    />
                  </Pressable>
                  <Button
                    label="Verify and continue"
                    onPress={() => void checkCode()}
                    loading={busy}
                    disabled={code.length !== OTP_LENGTH}
                    className="mt-4"
                  />
                  <View className="mt-4 flex-row items-center justify-between">
                    <Pressable
                      accessibilityRole="button"
                      onPress={() => {
                        setStep('email');
                        setError(null);
                        setNotice(null);
                      }}
                      hitSlop={8}
                      className="flex-row items-center gap-1"
                    >
                      <Icon name="arrow-left" size={14} color={mutedIcon} />
                      <Txt weight="medium" className="text-sm text-zinc-600 dark:text-zinc-400">
                        Change email
                      </Txt>
                    </Pressable>
                    <Pressable
                      accessibilityRole="button"
                      accessibilityState={{ disabled: resendIn > 0 || busy }}
                      disabled={resendIn > 0 || busy}
                      onPress={() => void sendCode(true)}
                      hitSlop={8}
                    >
                      <Txt
                        weight="medium"
                        className={twMerge(
                          'text-sm',
                          resendIn > 0 || busy
                            ? 'text-zinc-400 dark:text-zinc-500'
                            : 'text-brand-700 dark:text-brand-300',
                        )}
                      >
                        {resendIn > 0 ? `Resend in ${resendIn}s` : 'Resend code'}
                      </Txt>
                    </Pressable>
                  </View>
                </>
              )}

              {error ? (
                <View
                  accessibilityLiveRegion="polite"
                  className="mt-4 flex-row items-start gap-2 rounded-xl border border-rose-100 bg-rose-50 px-3 py-2.5 dark:border-rose-500/20 dark:bg-rose-500/10"
                >
                  <Icon name="alert" size={16} color={colors.danger} />
                  <Txt className="flex-1 text-[13px] leading-5 text-rose-700 dark:text-rose-300">
                    {error}
                  </Txt>
                </View>
              ) : notice ? (
                <View className="mt-4 flex-row items-start gap-2 rounded-xl border border-emerald-100 bg-emerald-50 px-3 py-2.5 dark:border-emerald-500/20 dark:bg-emerald-500/10">
                  <Icon name="check-circle" size={16} color={colors.success} />
                  <Txt className="flex-1 text-[13px] leading-5 text-emerald-700 dark:text-emerald-300">
                    {notice}
                  </Txt>
                </View>
              ) : null}

              <View className="mt-7 border-t border-line pt-5 dark:border-ink-line">
                {step === 'email' ? (
                  <View className="mb-3 flex-row flex-wrap items-center justify-center gap-1">
                    <Muted>
                      {mode === 'signup' ? 'Already have an account?' : 'New to Learn5?'}
                    </Muted>
                    <Pressable
                      accessibilityRole="button"
                      onPress={() => {
                        setMode(mode === 'signup' ? 'login' : 'signup');
                        setError(null);
                      }}
                      hitSlop={8}
                    >
                      <Txt weight="semibold" className="text-sm text-brand-700 dark:text-brand-300">
                        {mode === 'signup' ? 'Log in' : 'Create an account'}
                      </Txt>
                    </Pressable>
                  </View>
                ) : null}
                <View className="flex-row items-center justify-center gap-1.5">
                  <Icon name="lock" size={12} color={colors.mutedDark} />
                  <Muted className="text-xs">
                    No password needed · You stay signed in for {SESSION_DAYS} days
                  </Muted>
                </View>
                <Muted className="mt-2 text-center text-xs leading-5">
                  By continuing you agree to our{' '}
                  <Txt
                    accessibilityRole="link"
                    onPress={() => router.push('/terms')}
                    className="text-xs text-zinc-600 underline dark:text-zinc-300"
                  >
                    Terms
                  </Txt>{' '}
                  and{' '}
                  <Txt
                    accessibilityRole="link"
                    onPress={() => router.push('/privacy')}
                    className="text-xs text-zinc-600 underline dark:text-zinc-300"
                  >
                    Privacy Policy
                  </Txt>
                  .
                </Muted>
              </View>
            </Card>
          </View>
        </View>
        {/* Same height as the top bar, so the card is centred on the whole screen. */}
        <View className="h-10" />
      </Screen>
    </KeyboardAvoidingView>
  );
}
