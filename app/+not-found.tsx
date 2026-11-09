/**
 * Shown for any unknown address.
 */

import { Screen } from '@/components/Screen';
import { MessageView } from '@/components/StateViews';
import { goHome } from '@/lib/routes';

export default function NotFoundScreen() {
  return (
    <Screen width="narrow">
      <MessageView
        icon="compass"
        title="Page not found"
        message="This page doesn't exist. Let's get you back to learning."
        actionLabel="Go to Home"
        onAction={goHome}
      />
    </Screen>
  );
}
