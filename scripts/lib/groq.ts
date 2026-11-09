/// <reference types="node" />
/**
 * groq.ts — a tiny client for the Groq chat API (OpenAI-compatible).
 * Waits and retries on rate limits / server hiccups. Always asks for JSON back.
 */

const ENDPOINT = 'https://api.groq.com/openai/v1/chat/completions';
export const GROQ_MODEL = process.env.GROQ_MODEL?.trim() || 'openai/gpt-oss-120b';

const MAX_TRIES = 5;
/** Longer waits than this mean the daily limit is used up: stop, the next run continues. */
const MAX_WAIT_SEC = 120;
const TIMEOUT_MS = 120_000;

export interface ChatMessage {
  role: 'system' | 'user' | 'assistant';
  content: string;
}

/** The Groq limit for today is used up — no point trying more drops in this run. */
export class RateLimitExhaustedError extends Error {}

const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));

function apiKey(): string {
  const key = process.env.GROQ_API_KEY?.trim();
  if (!key) throw new Error('GROQ_API_KEY is not set (add it to .env.local or the cron secrets).');
  return key;
}

/** Sends a chat and returns the model's reply (a JSON string). */
export async function chatJson(
  messages: ChatMessage[],
  opts: { temperature?: number; maxTokens?: number } = {},
): Promise<string> {
  for (let attempt = 1; attempt <= MAX_TRIES; attempt++) {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), TIMEOUT_MS);
    let response: Response;
    try {
      response = await fetch(ENDPOINT, {
        method: 'POST',
        signal: controller.signal,
        headers: { Authorization: `Bearer ${apiKey()}`, 'Content-Type': 'application/json' },
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

    if (response.status === 429 || response.status >= 500) {
      const retryAfter = Number(response.headers.get('retry-after')) || 2 ** attempt;
      if (response.status === 429 && retryAfter > MAX_WAIT_SEC) {
        throw new RateLimitExhaustedError(`Groq rate limit: retry after ${retryAfter}s`);
      }
      if (attempt === MAX_TRIES) throw new Error(`Groq error ${response.status} after retries`);
      console.log(`    … Groq ${response.status}, waiting ${retryAfter}s`);
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
