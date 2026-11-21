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
import { Icon } from '@/components/Icon';
import { Logo } from '@/components/Logo';
import { Screen } from '@/components/Screen';
import { ThemeIconButton } from '@/components/ThemeToggle';
import { Muted, Txt } from '@/components/Txt';
import { ApiError } from '@/features/auth/api';
import { EmailSchema, OTP_LENGTH, OtpCodeSchema } from '@/features/auth/rules';
import { useAuth } from '@/features/auth/store';
import { haptics } from '@/lib/haptics';
import { WELCOME_HREF } from '@/lib/routes';
import { colors } from '@/theme';

const INPUT_CLASSES = 'font-body text-[15px] text-zinc-900 web:outline-none dark:text-zinc-100';

const messageOf = (err: unknown) =>
  err instanceof Error ? err.message : 'Something went wrong. Please try again.';

/** Back to the welcome page (or wherever the visitor came from). */
function goBack() {
  if (router.canGoBack()) router.back();
  else router.replace(WELCOME_HREF);
}

export default function SignInScreen() {
  const params = useLocalSearchParams<{ mode?: string }>();
  const [mode] = useState<'signup' | 'login'>(params.mode === 'signup' ? 'signup' : 'login');
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

  return (
    <KeyboardAvoidingView
      className="flex-1"
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <Screen width="narrow" fill contentClassName="max-w-[400px] pt-4 md:pt-6">
        <View className="flex-row items-center justify-between">
          <IconButton
            icon="arrow-left"
            label="Back to home page"
            onPress={goBack}
            variant="ghost"
          />
          <ThemeIconButton />
        </View>

        {/* Three zones: heading above, the input in the exact middle, actions below. */}
        <View className="flex-1">
          <View className="flex-1 items-center justify-end pb-8">
            <Logo />
            <Txt
              weight="display"
              accessibilityRole="header"
              className="mt-8 text-center text-[28px] leading-[34px] tracking-[-0.8px]"
            >
              {step === 'code'
                ? 'Check your email'
                : mode === 'signup'
                  ? 'Create your account'
                  : 'Welcome back'}
            </Txt>
            <Muted className="mt-2 text-center text-[15px] leading-6">
              {step === 'email' ? (
                'Enter your email and we’ll send you a sign-in code.'
              ) : (
                <>
                  Enter the {OTP_LENGTH}-digit code we sent to{' '}
                  <Txt weight="semibold" className="text-[15px]">
                    {email}
                  </Txt>
                </>
              )}
            </Muted>
          </View>

          {/* The middle */}
          <View className="w-full">
            {step === 'email' ? (
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
                className={twMerge(
                  INPUT_CLASSES,
                  'h-12 w-full rounded-xl border bg-zinc-100 px-4 text-center dark:bg-ink-raised',
                  emailFocused
                    ? 'border-brand-500 bg-white dark:border-brand-400 dark:bg-ink-card'
                    : 'border-transparent',
                  error && 'border-rose-400 dark:border-rose-500/70',
                )}
              />
            ) : (
              <>
                {/* 6 boxes on top of one invisible input (keeps paste and email autofill working) */}
                <Pressable
                  accessible={false}
                  onPress={() => codeInput.current?.focus()}
                  className="relative w-full"
                >
                  <View className="flex-row gap-2">
                    {Array.from({ length: OTP_LENGTH }, (_, i) => {
                      const digit = code[i];
                      const active = codeFocused && i === Math.min(code.length, OTP_LENGTH - 1);
                      return (
                        <View
                          key={i}
                          className={twMerge(
                            'h-14 flex-1 items-center justify-center rounded-xl border bg-zinc-100 dark:bg-ink-raised',
                            active
                              ? 'border-brand-500 bg-white dark:border-brand-400 dark:bg-ink-card'
                              : 'border-transparent',
                            error && 'border-rose-400 dark:border-rose-500/70',
                          )}
                        >
                          <Txt weight="display" className="text-[24px]">
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
              </>
            )}
          </View>

          <View className="flex-1 items-center pt-3">
            {step === 'email' ? (
              <Button
                label="Continue"
                onPress={() => void sendCode()}
                loading={busy}
                disabled={!email.trim()}
                className="w-full"
              />
            ) : (
              <>
                <Button
                  label="Verify"
                  onPress={() => void checkCode()}
                  loading={busy}
                  disabled={code.length !== OTP_LENGTH}
                  className="w-full"
                />
                <View className="mt-5 w-full flex-row items-center justify-between">
                  <Pressable
                    accessibilityRole="button"
                    onPress={() => {
                      setStep('email');
                      setError(null);
                      setNotice(null);
                    }}
                    hitSlop={8}
                  >
                    <Txt weight="medium" className="text-[14px] text-zinc-600 dark:text-zinc-400">
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
                        'text-[14px]',
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
              <View accessibilityLiveRegion="polite" className="mt-4 flex-row items-start gap-2">
                <Icon name="alert" size={15} color={colors.danger} />
                <Txt className="flex-1 text-[13.5px] leading-5 text-rose-600 dark:text-rose-400">
                  {error}
                </Txt>
              </View>
            ) : notice ? (
              <View className="mt-4 flex-row items-start gap-2">
                <Icon name="check-circle" size={15} color={colors.success} />
                <Txt className="flex-1 text-[13.5px] leading-5 text-emerald-700 dark:text-emerald-400">
                  {notice}
                </Txt>
              </View>
            ) : null}

            <Muted className="mt-8 text-center text-[12.5px] leading-5">
              No password needed. By continuing you agree to our{' '}
              <Txt
                accessibilityRole="link"
                onPress={() => router.push('/terms')}
                className="text-[12.5px] text-zinc-600 underline dark:text-zinc-300"
              >
                Terms
              </Txt>{' '}
              and{' '}
              <Txt
                accessibilityRole="link"
                onPress={() => router.push('/privacy')}
                className="text-[12.5px] text-zinc-600 underline dark:text-zinc-300"
              >
                Privacy Policy
              </Txt>
              .
            </Muted>
          </View>
        </View>
        {/* Same height as the top bar, so the middle of the page really is the middle. */}
        <View className="h-9" />
      </Screen>
    </KeyboardAvoidingView>
  );
}
