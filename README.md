# Learn5

**5 questions. 5 minutes. Get smarter every day.**

A gamified micro-learning app for English, Reasoning, Puzzles and Computer Science.
One Expo codebase ships as an Android app, an iOS app and a website.

> Status: feature-complete for launch — see the **Launch checklist** below for the remaining setup steps.

## Quick start

You need Node.js LTS (v24 works) and npm.

```bash
npm install            # once, downloads all packages
npm run web            # opens the app in your browser
npm start              # shows a QR code: scan it with the Expo Go app on your phone
```

## Sign-in (email + one-time code)

People sign in with their email: we email a 6-digit code (valid 10 minutes, 5 tries),
and after verifying it they stay signed in for **7 days** on that device.

User journey: **Welcome page** (`/welcome`, public) → **Sign up / Log in** (`/sign-in`) →
the app (Home, quizzes, progress…). Signed-out visitors to any app page land on Welcome;
signed-in visitors to Welcome or Sign in land on Home. Sign out returns to Welcome.

- Server code: `app/api/auth/*+api.ts` (Expo Router API routes) → `src/server/` (Neon Postgres).
- App code: `src/features/auth/` (store, API client, rules), `app/welcome.tsx`, `app/sign-in.tsx`.
- The root layout (`app/_layout.tsx`) uses `Stack.Protected` to choose public vs app screens.
- Only hashes of codes and session tokens are stored in the database.

## Daily questions (cron job + Groq)

Questions live in the database (table `drops`), not on your laptop.

- `.github/workflows/generate-drops.yml` runs **twice a day in GitHub's cloud**
  (04:00 and 16:00 IST). Each run calls `npm run generate-drops`, which fills any missing
  drops for **today and tomorrow** and skips existing ones. A failed run is finished by
  the next one.
- For each drop the AI (Groq, `openai/gpt-oss-120b`) writes 5 items. The code then checks
  them with `src/lib/schema.ts` (5 items, type and difficulty mix, ids, no topic repeated
  within 30 days, no question repeated within 60 days). A second AI pass fact-checks every
  answer. Bad drops are retried with feedback and never saved.
- The app reads `GET /api/content` (the list) and `GET /api/content/drop?path=…` (one
  drop). A drop is only returned after its opening time. Responses are cached because drops
  never change.
- Setup: push the repo to GitHub and add the secrets `DATABASE_URL` and `GROQ_API_KEY`
  (Settings → Secrets and variables → Actions). Run it by hand from the Actions tab.
- Locally: `npm run generate-drops` (options: `--date=YYYY-MM-DD --category=english --tier=2 --dry-run`).
- **Question tiers.** Every drop is written at 3 tiers: Basic, Intermediate and Advanced.
  Tiers 2 and 3 cover the same topics as tier 1, with harder questions. Each player has
  their own tier **per subject** (`src/features/tiers/tiers.ts`, worked out from their
  results). 3 strong drops in a row (at most 1 wrong) moves them up; 3 tough drops in a
  row (3+ wrong) moves them down. The generator writes all tier-1 drops first, so if the
  Groq limit runs out, the API serves a lower tier until the next run. Tier files use paths
  like `english/2026-11-08/drop-1-t2.json`. This means about 3× more AI calls per day.
- `npm run seed-drops` copies the hand-written files in `content/` into the database.
  The newest files are also packed into the app for offline use (`npm run bundle-content`).
- The AI instructions are in `scripts/lib/prompt.ts`, a short version of `CONTENT_GUIDE.md`.

## Daily articles (04:00 cron job + Groq)

- `.github/workflows/generate-articles.yml` runs **every day at 04:00 IST** (with a 05:00
  back-up run). For each subject the AI picks one topic itself and writes a short article
  (350–750 words) in simple English: sections, key points and "words to know".
- The code checks it with `ArticleSchema` (`src/lib/schema.ts`) and for simple English
  (`src/features/articles/readability.ts`: no sentence over 25 words, average under 15).
  A second AI pass fact-checks it. Topics are not repeated within 90 days.
- Saved in the `articles` table. The app reads `GET /api/articles` (the list) and
  `GET /api/articles/article?category=…&date=…` (one article), shown in the **Read** tab and on Home.
  An article is only returned after 04:00 on its day.
- Locally: `npm run generate-articles` (options: `--date=YYYY-MM-DD --category=english --dry-run`).
- The AI instructions are in `scripts/lib/article-prompt.ts`.

## Progress is saved to your account

Results, fixed mistakes and "wrong answer" reports are stored per user in Neon
(`drop_results`, `fixed_mistakes`, `answer_reports`) through `POST /api/progress/sync`.

- The phone keeps a local copy, so the app opens instantly and works offline. New
  changes wait as "pending" and are sent on the next sync (sign-in, app open, after
  each drop, before sign-out).
- A new phone downloads the user's progress on first sign-in. Only changes since the
  last sync are downloaded after that.
- The first play of a drop wins, even across devices, and points are recalculated on the server.
- Signing out removes progress from the device once it is saved. Another person
  signing in on the same phone starts clean.
- Code: `src/features/progress/` (store, sync, merge, schema) and `src/server/progress.ts`.

## Accounts, privacy and safety

- **Delete account** (Progress → Account): `POST /api/account/delete` removes the user and
  all their data (progress, reports, sessions, sign-in codes). Required by the App Store
  and Google Play.
- **Legal pages**: `/privacy` and `/terms` (open to everyone, linked from Welcome, Sign in
  and Progress). Written from what the app really does; have them reviewed before launch.
- **Rate limits** on sign-in codes: 1 per minute and 5 per hour per email, plus 20 per hour
  per network (IP address).
- **Clean-up**: `npm run cleanup` deletes old sign-in codes and ended sessions. The cron job
  runs it after generating drops.

## Daily reminders

Phones only (`expo-notifications`, local notifications — works in Expo Go). Off until the
user turns it on in Progress → Reminders, or from the prompt after their first drop. The
reminder repeats daily at the chosen time and is re-created on app start if the phone lost it.

## Launch checklist (things only you can do)

1. **Rotate the Groq key** (it was shared in chat) and add GitHub secrets `DATABASE_URL`
   and `GROQ_API_KEY` (Settings → Secrets and variables → Actions → New repository secret).
2. **Deploy the website + API** (e.g. `npx eas-cli@latest deploy`) and set the server
   secrets there: `DATABASE_URL`, `AUTH_SECRET`, `RESEND_API_KEY`, `EMAIL_FROM`.
3. Point `learn5.priyanshusingh.co.in` at it, then check `EXPO_PUBLIC_APP_URL` in
   `.env.local` and `eas.json`.
4. Make sure `support@priyanshusingh.co.in` receives email (reports and privacy requests).
5. **App icon and splash**: replace the images in `assets/images/` with your Learn5 artwork.
6. Phone builds: `npx eas-cli@latest build --profile preview` to test, then
   `--profile production` and `npx eas-cli@latest submit`. App IDs: `in.priyanshusingh.learn5`.
   iOS needs an Apple Developer account; Android needs a Google Play Console account.
7. Store listings: screenshots, description, the privacy policy URL
   (`https://learn5.expo.app/privacy`) and the data-safety form (email +
   learning progress, no ads, no tracking).

## Deploy

Website + API (EAS Hosting) — `app.json` uses `"web": { "output": "server" }` so API routes deploy:

```bash
npx eas-cli@latest login
npx expo export --platform web            # builds dist/ (EXPO_PUBLIC_* are baked in here)
npx eas-cli@latest deploy                 # preview URL
npx eas-cli@latest deploy --prod --environment production   # production URL + server secrets
```

Server secrets (`DATABASE_URL`, `AUTH_SECRET`, `RESEND_API_KEY`, `EMAIL_FROM`) live in the EAS
`production` environment (`eas env:set … --environment production`). Phone apps:
`npx eas-cli@latest build --platform android --profile preview` (test APK), then
`--profile production` and `npx eas-cli@latest submit`.

## Environment variables

All settings live in `.env.local` (gitignored; template: `.env.example`). None may be empty.

| Name                       | Where used  | What it is                                                  |
| -------------------------- | ----------- | ----------------------------------------------------------- |
| `DATABASE_URL`             | server only | Neon Postgres connection string                             |
| `AUTH_SECRET`              | server only | Long random string used to hash sign-in codes               |
| `RESEND_API_KEY`           | server only | Resend key for sending the code emails                      |
| `EMAIL_FROM`               | server only | Sender, on the verified domain `email.priyanshusingh.co.in` |
| `GROQ_API_KEY`             | cron only   | Groq key used by the daily question generator               |
| `EXPO_PUBLIC_APP_URL`      | app         | Live website; phone production builds call its `/api`       |
| `EXPO_PUBLIC_REPORT_EMAIL` | app         | Where "Report wrong answer" emails go                       |

`EXPO_PUBLIC_*` values are copied into the app, so they must never be secrets.
The `EXPO_PUBLIC_*` values are placeholders until deployment.

Setup: fill in `.env.local`, then run `npm run db:migrate` (creates the sign-in and
progress tables; safe to run again after updates). For production, deploy the API (e.g. EAS Hosting,
`npx eas-cli@latest deploy`) and set the same variables in the hosting/build environment.

## Useful commands

| Command                     | What it does                                        |
| --------------------------- | --------------------------------------------------- |
| `npm run validate-content`  | Checks every drop file against the rules            |
| `npm run build-index`       | Re-creates `content/index.json` (list of all drops) |
| `npm run db:migrate`        | Creates/updates the database tables (Neon)          |
| `npm run generate-drops`    | Writes missing drops (all 3 tiers) with the AI      |
| `npm run generate-articles` | Writes today's articles with the AI                 |
| `npm test`                  | Runs the automatic tests                            |
| `npm run typecheck`         | Checks TypeScript types                             |
| `npm run lint`              | Finds likely bugs                                   |
| `npm run format`            | Tidies code formatting                              |

## Where things live

| Path                   | What it is                                                          |
| ---------------------- | ------------------------------------------------------------------- |
| `app/`                 | Screens (Expo Router: each file is a screen)                        |
| `src/lib/schema.ts`    | **The rulebook** for content (Zod). Single source of truth          |
| `src/lib/dates.ts`     | Date helpers shared by app and scripts                              |
| `content/`             | All learning content (`<category>/<YYYY-MM-DD>/drop-<n>.json`)      |
| `content/index.json`   | Auto-generated list of drops. Never edit by hand                    |
| `schedule.config.json` | All drop/task times in one place                                    |
| `CONTENT_GUIDE.md`     | Writing rules for people, scheduled tasks and the future API script |
| `scripts/`             | `validate-content.ts`, `build-index.ts`                             |
