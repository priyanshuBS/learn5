/**
 * reminders.ts — one gentle daily notification: "Your 5 minutes are ready".
 *
 * Phones only (the website has no notifications). The reminder is scheduled on
 * the phone itself (no server needed) and repeats every day at the chosen time.
 * Off until the user turns it on (Progress → Reminders, or the prompt on Results).
 *
 * expo-notifications is loaded only on phones, so the website never imports it.
 */
import { useEffect } from 'react';
import { Platform } from 'react-native';
import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';

import { storage } from '@/lib/storage';

export const remindersSupported = Platform.OS === 'ios' || Platform.OS === 'android';

const CHANNEL_ID = 'daily-reminder';

/** Times the user can pick (their own clock). Drops open from 7:00 AM to 9:30 PM IST. */
export const REMINDER_TIMES = [
  { hour: 8, minute: 0, label: '8:00 AM' },
  { hour: 13, minute: 30, label: '1:30 PM' },
  { hour: 18, minute: 0, label: '6:00 PM' },
  { hour: 20, minute: 30, label: '8:30 PM' },
] as const;

interface ReminderState {
  enabled: boolean;
  hour: number;
  minute: number;
  /** The user dismissed the "turn on reminders?" prompt. */
  promptDismissed: boolean;
}

export const useReminders = create<ReminderState>()(
  persist((): ReminderState => ({ enabled: false, hour: 8, minute: 0, promptDismissed: false }), {
    name: 'learn5:reminders',
    storage: createJSONStorage(() => storage),
  }),
);

type NotificationsModule = typeof import('expo-notifications');
let modulePromise: Promise<NotificationsModule> | null = null;

/** Loads expo-notifications (phones only) and sets how notifications show. */
function notifications(): Promise<NotificationsModule> {
  if (!modulePromise) {
    modulePromise = import('expo-notifications').then((N) => {
      N.setNotificationHandler({
        handleNotification: async () => ({
          shouldShowBanner: true,
          shouldShowList: true,
          shouldPlaySound: false,
          shouldSetBadge: false,
        }),
      });
      return N;
    });
  }
  return modulePromise;
}

async function schedule(hour: number, minute: number): Promise<void> {
  const N = await notifications();
  if (Platform.OS === 'android') {
    await N.setNotificationChannelAsync(CHANNEL_ID, {
      name: 'Daily reminder',
      importance: N.AndroidImportance.DEFAULT,
    });
  }
  await N.cancelAllScheduledNotificationsAsync();
  await N.scheduleNotificationAsync({
    content: {
      title: 'Your 5 minutes are ready',
      body: 'Fresh drops are open in every subject. Keep your streak going!',
    },
    trigger: {
      type: N.SchedulableTriggerInputTypes.DAILY,
      hour,
      minute,
      channelId: CHANNEL_ID,
    },
  });
}

/**
 * Turns the daily reminder on (asks for permission first).
 * Returns false if the user didn't allow notifications.
 */
export async function enableReminders(hour?: number, minute?: number): Promise<boolean> {
  if (!remindersSupported) return false;
  const N = await notifications();
  let permission = await N.getPermissionsAsync();
  if (!permission.granted) {
    permission = await N.requestPermissionsAsync({
      ios: { allowAlert: true, allowBadge: false, allowSound: true },
    });
  }
  const granted =
    permission.granted ||
    permission.ios?.status === N.IosAuthorizationStatus.PROVISIONAL ||
    permission.ios?.status === N.IosAuthorizationStatus.EPHEMERAL;
  if (!granted) return false;
  const s = useReminders.getState();
  const h = hour ?? s.hour;
  const m = minute ?? s.minute;
  await schedule(h, m);
  useReminders.setState({ enabled: true, hour: h, minute: m, promptDismissed: true });
  return true;
}

export async function disableReminders(): Promise<void> {
  useReminders.setState({ enabled: false });
  if (!remindersSupported) return;
  const N = await notifications();
  await N.cancelAllScheduledNotificationsAsync();
}

/** Changes the reminder time (re-schedules if reminders are on). */
export async function setReminderTime(hour: number, minute: number): Promise<void> {
  useReminders.setState({ hour, minute });
  if (useReminders.getState().enabled) await enableReminders(hour, minute);
}

export function dismissReminderPrompt(): void {
  useReminders.setState({ promptDismissed: true });
}

/**
 * On app start: if reminders are on, make sure one is still scheduled (phones can
 * lose scheduled notifications after a reinstall or restore). Use once, in the root layout.
 */
export function useRemindersBootstrap(): void {
  useEffect(() => {
    if (!remindersSupported) return;
    const check = async () => {
      const { enabled, hour, minute } = useReminders.getState();
      if (!enabled) return;
      try {
        const N = await notifications();
        const scheduled = await N.getAllScheduledNotificationsAsync();
        if (scheduled.length === 0) await schedule(hour, minute);
      } catch {
        // Never block the app because of a reminder.
      }
    };
    if (useReminders.persist.hasHydrated()) void check();
    return useReminders.persist.onFinishHydration(() => void check());
  }, []);
}
