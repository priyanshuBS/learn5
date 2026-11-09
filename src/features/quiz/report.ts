/**
 * report.ts — "Report wrong answer": saves the report on the device and,
 * if a report email is set in app.json, opens the user's email app.
 */
import { Linking } from 'react-native';

import { REPORT_EMAIL } from '@/config';
import type { Drop, Item } from '@/lib/schema';

import { dropKey } from '../drops/status';
import { useProgress } from '../progress/store';
import { itemText } from './check';

export async function reportWrongAnswer(drop: Drop, item: Item): Promise<void> {
  useProgress.getState().addReport({
    itemId: item.id,
    dropKey: dropKey(drop),
    reportedAt: new Date().toISOString(),
  });

  if (!REPORT_EMAIL) return;
  const subject = `Learn5: possible wrong answer (${item.id})`;
  const body = [
    `Item: ${item.id}`,
    `Drop: ${drop.category} ${drop.date} drop ${drop.drop} — ${drop.title}`,
    `Question: ${itemText(item)}`,
    '',
    'What looks wrong (please describe):',
    '',
  ].join('\n');
  const url = `mailto:${REPORT_EMAIL}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
  try {
    await Linking.openURL(url);
  } catch {
    // No email app: the report is still saved on the device.
  }
}
