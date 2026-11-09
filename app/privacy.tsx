/**
 * Privacy Policy — address: /privacy (open to everyone).
 *
 * Written from what the app really does (see src/server/*, src/features/*).
 * If you change what data is collected or which services are used, update this
 * page too. Have it reviewed before launch — this is not legal advice.
 */
import { LegalPage } from '@/components/LegalPage';
import { SUPPORT_EMAIL } from '@/config';

export default function PrivacyScreen() {
  return (
    <LegalPage
      eyebrow="Legal"
      title="Privacy Policy"
      updated="9 November 2026"
      intro="Learn5 is built to collect as little as possible. This page explains, in plain English, what we store, why, who helps us run the service, and how you can delete everything."
      sections={[
        {
          title: 'What we collect',
          body: [
            '• Your email address — to create your account and send your sign-in codes.',
            '• Your learning progress — the drops you finish, your answers, scores, mistakes you fixed in Review, and “report a wrong answer” reports. This lets your streak, points and badges follow you to any device.',
            '• Sign-in data — we store only scrambled (hashed) versions of your sign-in codes and session, never the codes themselves. Codes expire after 10 minutes and are deleted within a day.',
          ],
        },
        {
          title: 'What we do not collect',
          body: [
            '• No passwords, no phone number, no location, no contacts, no photos.',
            '• No advertising and no ad tracking. We never sell or rent your data.',
          ],
        },
        {
          title: 'On your device',
          body: [
            'The app keeps a copy of your progress and your theme choice (light or dark) on your phone or in your browser, so it opens quickly and works offline. Your sign-in session is kept in the phone’s secure storage.',
          ],
        },
        {
          title: 'Services that help us run Learn5',
          body: [
            '• Neon — our database (stores your account and progress).',
            '• Resend — sends the sign-in code emails.',
            '• Our hosting provider — runs the website and app server.',
            '• Groq — an AI service that helps write the daily questions. It never receives any information about you.',
            'These services only process data to provide Learn5 and are not allowed to use it for anything else.',
          ],
        },
        {
          title: 'How long we keep it',
          body: [
            'We keep your account and progress until you delete your account. Sign-in sessions end after 7 days, and old sign-in codes are removed automatically.',
          ],
        },
        {
          title: 'Delete your account',
          body: [
            'Open Progress → Account → “Delete account”. This immediately and permanently deletes your account and all your progress from our servers and from that device. You can also email us and we will do it for you.',
          ],
        },
        {
          title: 'Children',
          body: [
            'Learn5 is made for a general audience. If you are under 13 (or the minimum age in your country), please use Learn5 with a parent’s or guardian’s permission.',
          ],
        },
        {
          title: 'Changes and contact',
          body: [
            `If this policy changes, we will update this page and the date above. Questions or requests? Email ${SUPPORT_EMAIL}.`,
          ],
        },
      ]}
    />
  );
}
