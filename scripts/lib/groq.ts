/// <reference types="node" />
/**
 * groq.ts — a tiny client for the Groq chat API (OpenAI-compatible). Always asks for JSON.
 *
 * Built to make as FEW calls as possible:
 *   - each call asks for only as many tokens as it needs (`maxTokens`), so it does not
 *     reserve a huge slice of the per-minute token budget and trigger 429s;
 *   - it reads Groq's rate-limit headers after every reply and, when the budget is
 *     nearly used up, waits for the reset BEFORE the next call instead of failing;
 *   - after a 429 it waits exactly as long as Groq says (retry-after / reset headers);
 *   - it counts calls and tokens, so every run logs what it used (groqUsageSummary).
 *
 * Two API keys:
 *   GROQ_API_KEY    "groq-1", used first
 *   GROQ_API_KEY_2  "groq-2", the fallback
 * When a key's limit is used up (or the key is refused), we email an alert
 * (scripts/lib/alerts.ts, once per key per day) and carry on with the next key.
 * Only when every key is used up does the run stop (the next cron run continues).
 */
import { notifyKeyLimit } from './alerts';

const ENDPOINT = 'https://api.groq.com/openai/v1/chat/completions';
export const GROQ_MODEL = process.env.GROQ_MODEL?.trim() || 'openai/gpt-oss-120b';

const MAX_TRIES = 5;
/** Longer waits than this mean the key's limit is used up: switch keys (or stop). */
const MAX_WAIT_SEC = 120;
const TIMEOUT_MS = 120_000;
/** Default reply budget (a drop is ~2-3k tokens including reasoning). */
const DEFAULT_MAX_TOKENS = 4000;

export interface ChatMessage {
  role: 'system' | 'user' | 'assistant';
  content: string;
}

/** Every Groq key's limit is used up — no point trying more items in this run. */
export class RateLimitExhaustedError extends Error {}

const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));

interface GroqKey {
  label: string;
  value: string;
}

/** The keys in order of use, e.g. [groq-1, groq-2]. */
export function groqKeys(env: Record<string, string | undefined> = process.env): GroqKey[] {
  return [env.GROQ_API_KEY, env.GROQ_API_KEY_2]
    .map((v, i) => ({ label: `groq-${i + 1}`, value: v?.trim() ?? '' }))
    .filter((k) => k.value.length > 0);
}

/**
 * Groq's reset durations look like "7.66s", "2m59.56s", "1h2m3s" or "420ms".
 * Returns seconds (0 when missing or unreadable).
 */
export function parseGroqDuration(value: string | null | undefined): number {
  if (!value) return 0;
  const text = value.trim();
  if (/^\d+(\.\d+)?$/.test(text)) return Number(text); // plain seconds (retry-after)
  let total = 0;
  let matched = false;
  for (const [, num, unit] of text.matchAll(/(\d+(?:\.\d+)?)(ms|h|m|s)/g)) {
    matched = true;
    const n = Number(num);
    total += unit === 'h' ? n * 3600 : unit === 'm' ? n * 60 : unit === 's' ? n : n / 1000;
  }
  return matched ? total : 0;
}

let keys: GroqKey[] | null = null;
/** Which key this run is using now (moves forward when one runs out). */
let current = 0;
/** Don't send the next call before this time (ms) — set from rate-limit headers. */
let pauseUntil = 0;

const usage = { calls: 0, retries: 0, promptTokens: 0, completionTokens: 0, waitedSec: 0 };

/** One line for the end of a run, e.g. "Groq: 10 calls, 0 retries, 41,200 tokens". */
export function groqUsageSummary(): string {
  const tokens = usage.promptTokens + usage.completionTokens;
  return `Groq: ${usage.calls} call(s), ${usage.retries} retried, ${tokens.toLocaleString('en-IN')} tokens (${usage.promptTokens.toLocaleString('en-IN')} in / ${usage.completionTokens.toLocaleString('en-IN')} out), waited ${Math.round(usage.waitedSec)}s for rate limits`;
}

function activeKey(): GroqKey {
  keys ??= groqKeys();
  if (keys.length === 0) {
    throw new Error(
      'GROQ_API_KEY is not set (add it to .env.local or the cron secrets; GROQ_API_KEY_2 is the fallback).',
    );
  }
  const key = keys[current];
  if (!key) throw new RateLimitExhaustedError('Every Groq API key has reached its limit');
  return key;
}

/** The current key ran out: alert, then move to the next one. Throws when none are left. */
async function switchKey(reason: string): Promise<void> {
  const used = activeKey();
  const next = keys?.[current + 1];
  console.log(`    … ${used.label} ${reason}${next ? `; switching to ${next.label}` : ''}`);
  await notifyKeyLimit(used.label, reason, next?.label ?? null);
  current++;
  pauseUntil = 0; // a new key has its own budget
  if (!next)
    throw new RateLimitExhaustedError(`Every Groq API key has reached its limit (${reason})`);
}

async function waitSeconds(sec: number, why: string): Promise<void> {
  if (sec <= 0) return;
  console.log(`    … waiting ${Math.ceil(sec)}s (${why})`);
  usage.waitedSec += sec;
  await sleep(Math.ceil(sec * 1000));
}

/**
 * After a successful reply: if the per-minute budget left is smaller than the next
 * call may need, wait for the reset before calling again (prevents 429s).
 */
function planPause(headers: Headers, nextBudget: number): void {
  const remainingTokens = Number(headers.get('x-ratelimit-remaining-tokens'));
  const remainingRequests = Number(headers.get('x-ratelimit-remaining-requests'));
  let wait = 0;
  if (Number.isFinite(remainingTokens) && headers.has('x-ratelimit-remaining-tokens')) {
    if (remainingTokens < nextBudget) {
      wait = Math.max(wait, parseGroqDuration(headers.get('x-ratelimit-reset-tokens')));
    }
  }
  if (Number.isFinite(remainingRequests) && headers.has('x-ratelimit-remaining-requests')) {
    if (remainingRequests < 1) {
      wait = Math.max(wait, parseGroqDuration(headers.get('x-ratelimit-reset-requests')));
    }
  }
  if (wait > 0) pauseUntil = Date.now() + Math.min(wait, MAX_WAIT_SEC) * 1000;
}

/** Sends a chat and returns the model's reply (a JSON string). */
export async function chatJson(
  messages: ChatMessage[],
  opts: { temperature?: number; maxTokens?: number } = {},
): Promise<string> {
  const maxTokens = opts.maxTokens ?? DEFAULT_MAX_TOKENS;
  for (let attempt = 1; attempt <= MAX_TRIES; attempt++) {
    const key = activeKey();
    // Respect the budget learned from the last reply.
    if (pauseUntil > Date.now())
      await waitSeconds((pauseUntil - Date.now()) / 1000, 'token budget');

    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), TIMEOUT_MS);
    let response: Response;
    try {
      usage.calls++;
      if (attempt > 1) usage.retries++;
      response = await fetch(ENDPOINT, {
        method: 'POST',
        signal: controller.signal,
        headers: { Authorization: `Bearer ${key.value}`, 'Content-Type': 'application/json' },
        body: JSON.stringify({
          model: GROQ_MODEL,
          messages,
          temperature: opts.temperature ?? 0.7,
          max_completion_tokens: maxTokens,
          response_format: { type: 'json_object' },
          ...(GROQ_MODEL.startsWith('openai/gpt-oss') ? { reasoning_effort: 'medium' } : {}),
        }),
      });
    } catch (err) {
      if (attempt === MAX_TRIES) throw new Error(`Groq unreachable: ${(err as Error).message}`);
      await waitSeconds(2 * attempt, 'network error');
      continue;
    } finally {
      clearTimeout(timer);
    }

    // The key is wrong or blocked: treat it like a used-up key.
    if (response.status === 401 || response.status === 403) {
      await switchKey(`was refused (error ${response.status})`);
      attempt--; // the new key gets a full set of tries
      continue;
    }

    if (response.status === 429 || response.status >= 500) {
      // Wait exactly as long as Groq asks, not a guess.
      const wait =
        parseGroqDuration(response.headers.get('retry-after')) ||
        Math.max(
          parseGroqDuration(response.headers.get('x-ratelimit-reset-tokens')),
          parseGroqDuration(response.headers.get('x-ratelimit-reset-requests')),
        ) ||
        2 ** attempt;
      if (response.status === 429 && wait > MAX_WAIT_SEC) {
        await switchKey(`limit has been reached (retry after ${Math.round(wait)}s)`);
        attempt--;
        continue;
      }
      if (attempt === MAX_TRIES) throw new Error(`Groq error ${response.status} after retries`);
      await waitSeconds(wait, `Groq ${response.status} on ${key.label}`);
      continue;
    }

    const data = (await response.json().catch(() => null)) as {
      choices?: { message?: { content?: string } }[];
      usage?: { prompt_tokens?: number; completion_tokens?: number };
      error?: { message?: string };
    } | null;
    if (!response.ok) {
      throw new Error(`Groq error ${response.status}: ${data?.error?.message ?? 'unknown'}`);
    }
    usage.promptTokens += data?.usage?.prompt_tokens ?? 0;
    usage.completionTokens += data?.usage?.completion_tokens ?? 0;
    planPause(response.headers, maxTokens);
    const content = data?.choices?.[0]?.message?.content;
    if (!content) throw new Error('Groq returned an empty reply');
    return content;
  }
  throw new Error('Groq: too many retries');
}
