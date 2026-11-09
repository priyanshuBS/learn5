/**
 * +html.tsx — the HTML page wrapper for the WEBSITE only (runs at build time).
 * Sets the page title, description, theme colour and mobile viewport.
 */
import { ScrollViewStyleReset, useServerDocumentContext } from 'expo-router/html';
import type { PropsWithChildren } from 'react';

const DESCRIPTION =
  'Learn5: 5 questions, 5 minutes. Daily bite-size drops in English, Math, Reasoning, Physics, Chemistry and Biology.';

// Page background before the app loads (avoids a white flash in dark mode).
const BACKGROUND_CSS = `
body { background-color: #F7F7FA; -webkit-font-smoothing: antialiased; -moz-osx-font-smoothing: grayscale; }
html.dark body { background-color: #09090B; }
`;

// Dark mode for the website, BEFORE the app loads (so the page never flashes):
// use the user's saved choice (Light / Dark / System — src/features/theme/store.ts,
// key "learn5:theme"); on System, follow the computer and keep following it.
// (Tailwind is set to darkMode: 'class' — see tailwind.config.js.)
const THEME_SCRIPT = `
(function () {
  try {
    var query = window.matchMedia('(prefers-color-scheme: dark)');
    var apply = function () {
      // Read the choice each time: the user may have changed it in the app.
      var pref = 'system';
      try {
        var saved = JSON.parse(localStorage.getItem('learn5:theme') || 'null');
        if (saved && saved.state && saved.state.preference) pref = saved.state.preference;
      } catch (e) {}
      var dark = pref === 'dark' || (pref === 'system' && query.matches);
      document.documentElement.classList.toggle('dark', dark);
      document.documentElement.style.colorScheme = dark ? 'dark' : 'light';
    };
    apply();
    if (query.addEventListener) query.addEventListener('change', apply);
    else if (query.addListener) query.addListener(apply);
  } catch (e) {}
})();
`;

export default function Root({ children }: PropsWithChildren) {
  const { htmlAttributes, bodyAttributes, headNodes, bodyNodes } = useServerDocumentContext();
  return (
    // suppressHydrationWarning: the theme script may add class="dark" before React loads.
    <html lang="en" {...htmlAttributes} suppressHydrationWarning>
      <head>
        <meta charSet="utf-8" />
        <script dangerouslySetInnerHTML={{ __html: THEME_SCRIPT }} />
        <meta httpEquiv="X-UA-Compatible" content="IE=edge" />
        <meta name="viewport" content="width=device-width, initial-scale=1, shrink-to-fit=no" />
        <meta name="description" content={DESCRIPTION} />
        <meta name="theme-color" content="#4F46E5" />
        <title>Learn5 — 5 questions. 5 minutes.</title>
        <ScrollViewStyleReset />
        <style dangerouslySetInnerHTML={{ __html: BACKGROUND_CSS }} />
        {headNodes}
      </head>
      <body {...bodyAttributes}>
        {children}
        {bodyNodes}
      </body>
    </html>
  );
}
