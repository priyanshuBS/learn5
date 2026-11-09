/**
 * routes.ts — links between screens, in one place.
 * Quiz and results use "?category=…&date=…&drop=…" so any new drop works
 * on the website without rebuilding it.
 */
import { router, type Href } from 'expo-router';

import type { DropRef } from '@/features/drops/status';

export function quizHref(ref: DropRef) {
  return {
    pathname: '/quiz' as const,
    params: { category: ref.category, date: ref.date, drop: String(ref.drop) },
  };
}

export function resultsHref(ref: DropRef) {
  return {
    pathname: '/results' as const,
    params: { category: ref.category, date: ref.date, drop: String(ref.drop) },
  };
}

/** Sign-in screen. "signup" and "login" use the same email-code steps, only the wording differs. */
export function signInHref(mode: 'signup' | 'login' = 'login') {
  return { pathname: '/sign-in' as const, params: { mode } };
}

/** The public home page for signed-out visitors. */
export const WELCOME_HREF = '/welcome' as const;

export function categoryHref(id: string) {
  return { pathname: '/category/[id]' as const, params: { id } };
}

/**
 * The Home page address. (Expo's generated route types list a grouped index
 * page as "/index", but the real address is "/".)
 */
export const HOME_HREF = '/' as Href;

/** Go to Home, replacing the current screen (used after quiz, results, errors). */
export function goHome(): void {
  router.replace(HOME_HREF);
}

/** Go back, or Home when there is nothing to go back to (e.g. a website link opened directly). */
export function goBack(): void {
  if (router.canGoBack()) router.back();
  else goHome();
}

/** Reads "category", "date" and "drop" from the address. Null if anything is wrong. */
export function parseDropParams(params: {
  category?: string | string[];
  date?: string | string[];
  drop?: string | string[];
}): DropRef | null {
  const one = (v?: string | string[]) => (Array.isArray(v) ? v[0] : v);
  const category = one(params.category);
  const date = one(params.date);
  const drop = Number(one(params.drop));
  if (!category || !date || !/^\d{4}-\d{2}-\d{2}$/.test(date)) return null;
  if (!Number.isInteger(drop) || drop < 1 || drop > 3) return null;
  return { category, date, drop };
}
