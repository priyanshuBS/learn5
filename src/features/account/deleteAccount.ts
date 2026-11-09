/**
 * deleteAccount.ts — "Delete my account" (required by the App Store and Google Play).
 *
 * 1. the server deletes the user and ALL their data (progress, reports, sessions)
 * 2. this device forgets their progress and the sign-in session
 * The app then returns to the Welcome page. Throws ApiError if the server says no
 * (e.g. offline), and then nothing is deleted.
 */
import { authApi } from '../auth/api';
import { useAuth } from '../auth/store';
import { useProgress } from '../progress/store';

export async function deleteMyAccount(): Promise<void> {
  const { token } = useAuth.getState();
  if (!token) return;
  await authApi.deleteAccount(token);
  useProgress.getState().clearAll();
  await useAuth.getState().forgetSession();
}
