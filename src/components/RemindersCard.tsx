/**
 * Reminder controls.
 *   RemindersSettings — on/off switch + time choices (Progress page)
 *   ReminderPrompt    — a one-time "Want a daily nudge?" card (Results page)
 * Phones only; on the website the settings explain that reminders live in the app.
 */
import { useState } from 'react';
import { Pressable, View } from 'react-native';
import { twMerge } from 'tailwind-merge';

import {
  disableReminders,
  dismissReminderPrompt,
  enableReminders,
  REMINDER_TIMES,
  remindersSupported,
  setReminderTime,
  useReminders,
} from '@/features/reminders/reminders';
import { useColorScheme } from '@/hooks/useScheme';
import { notify } from '@/lib/confirm';
import { colors } from '@/theme';

import { Button } from './Button';
import { CARD_CLASSES } from './Card';
import { Icon } from './Icon';
import { Muted, Txt } from './Txt';

const DENIED_MESSAGE =
  'Notifications are turned off for Learn5. You can allow them in your phone’s Settings, then try again.';

export function RemindersSettings() {
  const dark = useColorScheme() === 'dark';
  const { enabled, hour, minute } = useReminders();
  const [busy, setBusy] = useState(false);

  if (!remindersSupported) {
    return (
      <View className={twMerge(CARD_CLASSES, 'flex-row items-center gap-4 p-5')}>
        <IconTile icon="smartphone" />
        <View className="flex-1">
          <Txt weight="semibold">Daily reminders</Txt>
          <Muted className="mt-0.5">
            Get the Learn5 app on your phone to turn on daily reminders.
          </Muted>
        </View>
      </View>
    );
  }

  const toggle = async () => {
    setBusy(true);
    try {
      if (enabled) await disableReminders();
      else if (!(await enableReminders())) notify('Allow notifications', DENIED_MESSAGE);
    } finally {
      setBusy(false);
    }
  };

  return (
    <View className={twMerge(CARD_CLASSES, 'p-5')}>
      <View className="flex-row items-center gap-4">
        <IconTile icon={enabled ? 'bell' : 'bell-off'} active={enabled} />
        <View className="flex-1">
          <Txt weight="semibold">Daily reminder</Txt>
          <Muted className="mt-0.5">
            {enabled ? 'We’ll nudge you once a day.' : 'A gentle nudge to keep your streak.'}
          </Muted>
        </View>
        <Switch value={enabled} disabled={busy} onPress={() => void toggle()} />
      </View>

      {enabled ? (
        <View className="mt-5 flex-row flex-wrap gap-2">
          {REMINDER_TIMES.map((t) => {
            const active = t.hour === hour && t.minute === minute;
            return (
              <Pressable
                key={t.label}
                accessibilityRole="radio"
                accessibilityState={{ checked: active }}
                accessibilityLabel={`Remind me at ${t.label}`}
                onPress={() => void setReminderTime(t.hour, t.minute)}
                className={twMerge(
                  'rounded-full border px-4 py-2',
                  active
                    ? 'border-brand-500 bg-brand-500/15 dark:border-brand-400 dark:bg-brand-400/10'
                    : 'border-line dark:border-ink-line',
                )}
              >
                <Txt
                  weight="semibold"
                  className="text-[13px]"
                  style={
                    active ? { color: dark ? colors.brandOnDark : colors.brandDark } : undefined
                  }
                >
                  {t.label}
                </Txt>
              </Pressable>
            );
          })}
        </View>
      ) : null}
    </View>
  );
}

/** Shown once (e.g. after the first finished drop) until turned on or dismissed. */
export function ReminderPrompt() {
  const { enabled, promptDismissed } = useReminders();
  const [busy, setBusy] = useState(false);
  if (!remindersSupported || enabled || promptDismissed) return null;

  return (
    <View className={twMerge(CARD_CLASSES, 'mt-4 flex-row items-center gap-4 p-5')}>
      <IconTile icon="bell" active />
      <View className="flex-1">
        <Txt weight="semibold">Want a daily nudge?</Txt>
        <Muted className="mt-0.5">We’ll remind you at 8:00 AM. Change it any time.</Muted>
        <View className="mt-3 flex-row gap-2">
          <Button
            label="Turn on"
            size="sm"
            loading={busy}
            onPress={() => {
              setBusy(true);
              void enableReminders()
                .then((ok) => {
                  if (!ok) notify('Allow notifications', DENIED_MESSAGE);
                })
                .finally(() => setBusy(false));
            }}
          />
          <Button label="Not now" size="sm" variant="ghost" onPress={dismissReminderPrompt} />
        </View>
      </View>
    </View>
  );
}

function IconTile({
  icon,
  active,
}: {
  icon: 'bell' | 'bell-off' | 'smartphone';
  active?: boolean;
}) {
  const dark = useColorScheme() === 'dark';
  return (
    <View
      className={twMerge(
        'h-11 w-11 items-center justify-center rounded-2xl border',
        active
          ? 'border-brand-500/30 bg-brand-500/15'
          : 'border-line bg-zinc-50 dark:border-ink-line dark:bg-ink-raised',
      )}
    >
      <Icon
        name={icon}
        size={19}
        color={
          active
            ? dark
              ? colors.brandOnDark
              : colors.brandDark
            : dark
              ? colors.mutedDark
              : colors.muted
        }
      />
    </View>
  );
}

/** A simple on/off switch in the app's style. */
function Switch({
  value,
  disabled,
  onPress,
}: {
  value: boolean;
  disabled?: boolean;
  onPress: () => void;
}) {
  return (
    <Pressable
      accessibilityRole="switch"
      accessibilityLabel="Daily reminder"
      accessibilityState={{ checked: value, disabled }}
      disabled={disabled}
      onPress={onPress}
      hitSlop={8}
      className={twMerge(
        'h-8 w-14 justify-center rounded-full px-1',
        value ? 'bg-emerald-500' : 'bg-zinc-200 dark:bg-ink-line',
        disabled && 'opacity-60',
      )}
    >
      <View
        className={twMerge(
          'h-6 w-6 rounded-full bg-white web:shadow-sm',
          value ? 'self-end' : 'self-start',
        )}
      />
    </Pressable>
  );
}
