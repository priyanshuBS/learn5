/// <reference types="node" />
/**
 * groq.ts — a tiny client for the Groq chat API (OpenAI-compatible).
 * Waits and retries on short rate limits / server hiccups. Always asks for JSON back.
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

let keys: GroqKey[] | null = null;
/** Which key this run is using now (moves forward when one runs out). */
let current = 0;

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
  if (!next)
    throw new RateLimitExhaustedError(`Every Groq API key has reached its limit (${reason})`);
}

/** Sends a chat and returns the model's reply (a JSON string). */
export async function chatJson(
  messages: ChatMessage[],
  opts: { temperature?: number; maxTokens?: number } = {},
): Promise<string> {
  for (let attempt = 1; attempt <= MAX_TRIES; attempt++) {
    const key = activeKey();
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), TIMEOUT_MS);
    let response: Response;
    try {
      response = await fetch(ENDPOINT, {
        method: 'POST',
        signal: controller.signal,
        headers: { Authorization: `Bearer ${key.value}`, 'Content-Type': 'application/json' },
        body: JSON.stringify({
          model: GROQ_MODEL,
          messages,
          temperature: opts.temperature ?? 0.7,
          max_completion_tokens: opts.maxTokens ?? 8000,
          response_format: { type: 'json_object' },
          ...(GROQ_MODEL.startsWith('openai/gpt-oss') ? { reasoning_effort: 'medium' } : {}),
        }),
      });
    } catch (err) {
      if (attempt === MAX_TRIES) throw new Error(`Groq unreachable: ${(err as Error).message}`);
      await sleep(2000 * attempt);
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
      const retryAfter = Number(response.headers.get('retry-after')) || 2 ** attempt;
      if (response.status === 429 && retryAfter > MAX_WAIT_SEC) {
        await switchKey(`limit has been reached (retry after ${retryAfter}s)`);
        attempt--;
        continue;
      }
      if (attempt === MAX_TRIES) throw new Error(`Groq error ${response.status} after retries`);
      console.log(`    … Groq ${response.status} on ${key.label}, waiting ${retryAfter}s`);
      await sleep(retryAfter * 1000);
      continue;
    }

    const data = (await response.json().catch(() => null)) as {
      choices?: { message?: { content?: string } }[];
      error?: { message?: string };
    } | null;
    if (!response.ok) {
      throw new Error(`Groq error ${response.status}: ${data?.error?.message ?? 'unknown'}`);
    }
    const content = data?.choices?.[0]?.message?.content;
    if (!content) throw new Error('Groq returned an empty reply');
    return content;
  }
  throw new Error('Groq: too many retries');
}
