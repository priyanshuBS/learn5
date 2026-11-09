/**
 * storage.ts — a safe wrapper around AsyncStorage (device storage).
 *
 * On phones it saves to the device. On the website it uses the browser's
 * localStorage. While the website is being pre-built there is no browser,
 * so we quietly do nothing instead of crashing. Errors never crash the app.
 */
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Platform } from 'react-native';

const available = Platform.OS !== 'web' || typeof window !== 'undefined';

export const storage = {
  async getItem(key: string): Promise<string | null> {
    if (!available) return null;
    try {
      return await AsyncStorage.getItem(key);
    } catch {
      return null;
    }
  },
  async setItem(key: string, value: string): Promise<void> {
    if (!available) return;
    try {
      await AsyncStorage.setItem(key, value);
    } catch {
      // Storage full or blocked: the app keeps working, it just won't remember this.
    }
  },
  async removeItem(key: string): Promise<void> {
    if (!available) return;
    try {
      await AsyncStorage.removeItem(key);
    } catch {
      // ignore
    }
  },
};
