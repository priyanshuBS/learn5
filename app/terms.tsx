/**
 * Terms of Use — address: /terms (open to everyone).
 * Have it reviewed before launch — this is not legal advice.
 */
import { LegalPage } from '@/components/LegalPage';
import { SUPPORT_EMAIL } from '@/config';

export default function TermsScreen() {
  return (
    <LegalPage
      eyebrow="Legal"
      title="Terms of Use"
      updated="9 November 2026"
      intro="By creating an account or using Learn5 you agree to these terms. We have kept them short and simple."
      sections={[
        {
          title: 'Using Learn5',
          body: [
            'Learn5 gives you short daily quizzes (“drops”) to learn school-level facts. It is free to use. You need an email address to sign in, and you are responsible for keeping access to that email safe.',
          ],
        },
        {
          title: 'Learning content',
          body: [
            'Our questions are written with the help of AI and checked automatically, but mistakes can still happen. Learn5 is for general learning only — it is not professional, medical, legal or exam-board advice.',
            'If you spot a mistake, please use “Report an error” after the question. Thank you for helping everyone learn better.',
          ],
        },
        {
          title: 'Fair use',
          body: [
            '• Do not try to break, overload or misuse the service, or access other people’s accounts.',
            '• Do not copy or resell our content as your own.',
            'We may suspend accounts that misuse the service.',
          ],
        },
        {
          title: 'Your account',
          body: [
            'You can delete your account at any time from Progress → Account → “Delete account”. We may stop offering Learn5, or parts of it, with reasonable notice.',
          ],
        },
        {
          title: 'No guarantees',
          body: [
            'Learn5 is provided “as is”. We work hard to keep it accurate and available, but we cannot promise it will always be error-free or online. To the extent the law allows, we are not responsible for losses caused by using it.',
          ],
        },
        {
          title: 'Changes and contact',
          body: [
            'We may update these terms; the date above shows the latest version. These terms are governed by the laws of India.',
            `Questions? Email ${SUPPORT_EMAIL}.`,
          ],
        },
      ]}
    />
  );
}
