/**
 * check.ts — answer checking helpers for the quiz player.
 */
import type { FillBlankItem, Item } from '@/lib/schema';

/**
 * Makes typed answers comparable, so small differences don't count as wrong:
 * "  Joule. " → "joule",  "H₂O" → "h2o",  "₹1,020" → "1020",  "25%" → "25".
 */
export function normalizeAnswer(text: string): string {
  return text
    .replace(/[₀-₉]/g, (c) => String(c.charCodeAt(0) - 0x2080)) // ₂ → 2
    .toLowerCase()
    .replace(/[₹,%]/g, '')
    .replace(/[^a-z0-9.À-ɏ]+/g, ' ') // keep letters, numbers and dots
    .replace(/\s+/g, ' ')
    .trim()
    .replace(/\.+$/, ''); // drop a full stop at the end (after trimming spaces)
}

/** True when the typed answer matches the answer or one of the accepted spellings. */
export function isFillBlankCorrect(item: FillBlankItem, typed: string): boolean {
  const given = normalizeAnswer(typed);
  if (!given) return false;
  return [item.answer, ...(item.acceptedAnswers ?? [])].some((a) => normalizeAnswer(a) === given);
}

/** The right answer as text, to show after the user answers. */
export function correctAnswerText(item: Item): string {
  switch (item.type) {
    case 'mcq':
    case 'true_false':
      return item.options[item.answerIndex];
    case 'fill_blank':
      return item.answer;
    case 'fact_card':
      return '';
  }
}

/** The main text of an item (fact cards use "fact" instead of "question"). */
export function itemText(item: Item): string {
  return item.type === 'fact_card' ? item.fact : item.question;
}
