/**
 * apiUrl.ts — where the app's API requests go.
 *   - website: the same site ("/api/...")
 *   - phones in development: the Expo dev server (Expo fills in the address)
 *   - phone production builds: EXPO_PUBLIC_APP_URL + "/api/..."
 */
import { Platform } from 'react-native';

import { APP_URL } from '@/config';

const usesAppUrl = Platform.OS !== 'web' && !__DEV__ && APP_URL.length > 0;

export const apiUrl = (path: string) => (usesAppUrl ? `${APP_URL}${path}` : path);

/**
 * False while the website is pre-rendered (no browser yet) and in phone builds
 * without EXPO_PUBLIC_APP_URL. Then only saved/bundled content is used.
 */
export const canReachApi =
  Platform.OS === 'web' ? typeof window !== 'undefined' : __DEV__ || usesAppUrl;
