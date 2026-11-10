/**
 * +html.tsx — the HTML page wrapper for the WEBSITE only (runs at build time).
 * Sets the page title, description, theme colour and mobile viewport.
 */
import { ScrollViewStyleReset, useServerDocumentContext } from 'expo-router/html';
import type { PropsWithChildren } from 'react';

const TITLE = 'Learn5 — 5 questions. 5 minutes. Get smarter every day.';

const DESCRIPTION =
  'Learn5: 5 questions, 5 minutes. Daily bite-size drops in English, Math, Reasoning, Computer Science, Physics, Chemistry and Biology.';

// Page background before the app loads (avoids a white flash in dark mode).
// --css-interop-darkMode: tells NativeWind "dark mode = the dark class" before its
// own CSS arrives, so it reads the right theme at start instead of switching
// later (same value Tailwind writes for darkMode: 'class').
const BACKGROUND_CSS = `
:root { --css-interop-darkMode: class dark; }
body { background-color: #F6FBF8; -webkit-font-smoothing: antialiased; -moz-osx-font-smoothing: grayscale; }
html.dark body { background-color: #0F1A15; }
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
      var pref = 'dark';
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
        <meta name="theme-color" content="#0F1A15" />
        <meta name="color-scheme" content="dark light" />
        <meta name="apple-mobile-web-app-title" content="Learn5" />
        {/* Tab icon. A new file name (and ?v=) makes browsers drop any old cached icon;
            change both when the icon changes. Source: assets/images/favicon.png. */}
        <link rel="icon" type="image/png" href="/learn5-icon.png?v=5" />
        <link rel="apple-touch-icon" href="/learn5-icon.png?v=5" />
        {/* Link previews (WhatsApp, X, LinkedIn, iMessage…) */}
        <meta property="og:type" content="website" />
        <meta property="og:site_name" content="Learn5" />
        <meta property="og:title" content={TITLE} />
        <meta property="og:description" content={DESCRIPTION} />
        <meta name="twitter:card" content="summary" />
        <meta name="twitter:title" content={TITLE} />
        <meta name="twitter:description" content={DESCRIPTION} />
        <title>{TITLE}</title>
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
