/**
 * secureStorage.ts — where the sign-in session token is kept.
 *
 * Phones: the encrypted Keychain (iOS) / Keystore (Android) via expo-secure-store.
 * Website: SecureStore doesn't exist there, so we fall back to normal browser storage.
 * Errors never crash the app (you'd just be asked to sign in again).
 */
import * as SecureStore from 'expo-secure-store';
import { Platform } from 'react-native';

import { storage } from './storage';

const native = Platform.OS === 'ios' || Platform.OS === 'android';

export const secureStorage = {
  async getItem(key: string): Promise<string | null> {
    if (!native) return storage.getItem(key);
    try {
      return await SecureStore.getItemAsync(key);
    } catch {
      return null;
    }
  },
  async setItem(key: string, value: string): Promise<void> {
    if (!native) return storage.setItem(key, value);
    try {
      await SecureStore.setItemAsync(key, value);
    } catch {
      // ignore: the session just won't survive an app restart
    }
  },
  async removeItem(key: string): Promise<void> {
    if (!native) return storage.removeItem(key);
    try {
      await SecureStore.deleteItemAsync(key);
    } catch {
      // ignore
    }
  },
};
