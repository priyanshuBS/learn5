# Learn5

**5 questions. 5 minutes. Get smarter every day.**

Learn5 is a daily micro-learning app for **English, Reasoning, Puzzles and Computer Science**.
Twice a day every subject gets a fresh 5-question drop that climbs from easy to hard, and every
morning a short, easy-to-read article. One Expo codebase ships as an **Android app**, an
**iOS app** and a **website**.

---

## Contents

- [Features](#features)
- [Tech stack](#tech-stack)
- [Getting started](#getting-started)
- [Configuration](#configuration)
- [Content pipeline](#content-pipeline)
- [Architecture](#architecture)
- [Scripts](#scripts)
- [Deployment](#deployment)
- [Quality](#quality)
- [Launch checklist](#launch-checklist)

---

## Features

| Area             | What it does                                                                                                       |
| ---------------- | ------------------------------------------------------------------------------------------------------------------ |
| **Daily drops**  | 2 drops per subject per day (04:00 and 16:00 IST), 5 questions each, from easy to hard, each from a different area |
| **Daily reads**  | One short article per subject every morning at 04:00, in simple English, with key points and "words to know"       |
| **Explanations** | Every answer explains the "why"; fact cards collect into a Flashcards deck                                         |
| **Review**       | Wrong answers can be replayed until they are answered correctly                                                    |
| **Progress**     | Points, levels, streaks and badges, synced to the user's account across devices                                    |
| **Accounts**     | Passwordless sign-in with a 6-digit email code; account deletion; privacy and terms pages                          |
| **Offline**      | The app opens instantly from a local copy and keeps working offline                                                |
| **Reminders**    | Optional daily local notification (phones)                                                                         |
| **Design**       | Light and dark themes, 3D subject and badge icons, and motion only in response to taps                             |

## Tech stack

- **App:** Expo SDK 58, React Native, Expo Router, NativeWind (Tailwind), Reanimated, Zustand
- **Server:** Expo Router API routes, hosted on EAS Hosting
- **Database:** Neon (serverless Postgres)
- **Content generation:** Groq (`openai/gpt-oss-120b`), run on a schedule by GitHub Actions
- **Email:** Resend (sign-in codes and owner alerts)
- **Validation:** Zod schemas shared by the app, the server and the scripts
- **Tests:** Jest (`jest-expo`)

## Getting started

**Requirements:** Node.js 24 LTS and npm.

```bash
npm install                 # install dependencies
cp .env.example .env.local  # then fill in the values (see Configuration)
npm run db:migrate          # create or update the database tables
npm start                   # dev server: press w for the website, scan the QR code with Expo Go
```

Without `RESEND_API_KEY` in development, sign-in codes are printed in the terminal instead of
being emailed.

## Configuration

All settings live in `.env.local` (git-ignored; template: `.env.example`).

| Variable                   | Used by         | Purpose                                                         |
| -------------------------- | --------------- | --------------------------------------------------------------- |
| `DATABASE_URL`             | server, scripts | Neon Postgres connection string                                 |
| `AUTH_SECRET`              | server          | Random secret used to hash sign-in codes and session tokens     |
| `RESEND_API_KEY`           | server, scripts | Sends sign-in codes and alert emails                            |
| `EMAIL_FROM`               | server, scripts | Sender address on a verified Resend domain                      |
| `GROQ_API_KEY`             | scripts         | Groq key for the content generators                             |
| `GROQ_API_KEY_2`           | scripts         | _Optional._ Fallback key; must be from a different Groq account |
| `GROQ_MODEL`               | scripts         | _Optional._ Model name (default `openai/gpt-oss-120b`)          |
| `ALERT_EMAIL`              | scripts         | Where problem alerts are sent                                   |
| `EXPO_PUBLIC_APP_URL`      | app             | Live website; production phone builds call its API              |
| `EXPO_PUBLIC_REPORT_EMAIL` | app             | Where "Report wrong answer" emails go                           |

> `EXPO_PUBLIC_*` values are bundled into the app, so they must never contain secrets.

## Content pipeline

All learning content lives in the database and reaches the app through the API, so new
content appears without an app update.

### Daily drops

- **Schedule:** `.github/workflows/generate-drops.yml` runs at **04:00 and 16:00 IST** and
  fills any missing drops for today and tomorrow. Existing drops are skipped, so every run is
  safe to repeat and a failed run is finished by the next one.
- **Shape:** 5 items per drop (3 multiple choice, 1 true/false, 1 fill-in-the-blank or fact
  card) on a difficulty ladder: 1 easy, 2 medium, 2 hard.
- **Coverage:** each question comes from a different area of its subject, and the areas
  rotate with every drop (`CATEGORY_AREAS` in `scripts/lib/prompt.ts`).
- **Checks:** every drop is validated against `src/lib/schema.ts`, checked for repeated topics
  (30 days) and questions (60 days), then fact-checked by a second AI pass. Drops that fail are
  retried with feedback and never saved.
- **Serving:** `GET /api/content` (list) and `GET /api/content/drop?path=…` (one drop). A drop
  is only served after its opening time.

### Daily articles

- **Schedule:** `.github/workflows/generate-articles.yml` runs at **04:00 IST** (a 05:00 run
  retries anything that failed).
- **Writing:** for each subject the AI chooses a topic not covered in the last 90 days and
  writes a 300–800 word article.
- **Checks:** `ArticleSchema`, a simple-English check (no sentence over 25 words, average
  under 15; `src/features/articles/readability.ts`) and an AI fact-check.
- **Serving:** `GET /api/articles` and `GET /api/articles/article?category=…&date=…`.

### Budget and alerts

- A normal day is **8 drops (40 questions) + 4 articles**, about 24 Groq requests.
- If `GROQ_API_KEY` reaches its limit, the generators switch to `GROQ_API_KEY_2` when one is set.
- **Alerts** are emailed to `ALERT_EMAIL` when a key's limit is reached or a key is refused,
  when drops or articles could not be written, or when a generator crashes. Each alert is sent
  at most once per run (`scripts/lib/alerts.ts`).

Writing rules for people and for the AI are in [`CONTENT_GUIDE.md`](CONTENT_GUIDE.md).

## Architecture

```
app/                    Screens and API routes (Expo Router: every file is a route)
  (tabs)/               Home, Read, Review, Flashcards, Progress, subject pages
  api/                  auth, content, articles, progress, account
src/
  components/           UI building blocks (Card, Button, Icon3D, CategoryCard, …)
  features/             App logic: auth, content, articles, progress sync, badges, streaks
  lib/                  Shared helpers; schema.ts is the single source of truth for content
  server/               Server-only code: database, auth, drops, articles, email
scripts/                Generators, validators, migrations (sql/) and their AI prompts (lib/)
content/                Seed content bundled for offline use, categories.json, index.json
schedule.config.json    Drop and article times
```

**Progress sync.** Results, fixed mistakes and answer reports are stored per user
(`drop_results`, `fixed_mistakes`, `answer_reports`) through `POST /api/progress/sync`.
The device keeps a local copy and sends pending changes on the next sync; only changes since
the last sync are downloaded. The first play of a drop wins, and points are recalculated on
the server.

**Security.** Only hashes of sign-in codes and session tokens are stored. Sign-in codes are
rate-limited (1 per minute and 5 per hour per email, 20 per hour per network). Deleting an
account removes all of the user's data.

## Scripts

| Command                     | Description                                          |
| --------------------------- | ---------------------------------------------------- |
| `npm start`                 | Start the dev server (app and website)               |
| `npm run web`               | Start the dev server and open the website            |
| `npm run db:migrate`        | Create or update the database tables                 |
| `npm run generate-drops`    | Write missing drops for today and tomorrow           |
| `npm run generate-articles` | Write today's articles                               |
| `npm run validate-content`  | Validate the files in `content/`                     |
| `npm run build-index`       | Rebuild `content/index.json`                         |
| `npm run bundle-content`    | Pack the newest content into the app for offline use |
| `npm run seed-drops`        | Copy the files in `content/` into the database       |
| `npm run cleanup`           | Delete expired sign-in codes and sessions            |
| `npm test`                  | Run the test suite                                   |
| `npm run typecheck`         | Type-check the project                               |
| `npm run lint`              | Lint the project                                     |
| `npm run format`            | Format the project with Prettier                     |

Generator options: `--date=YYYY-MM-DD`, `--category=<id>`, `--dry-run`.

## Deployment

**Website and API** (EAS Hosting; `app.json` uses `"web": { "output": "server" }`):

```bash
npx expo export --platform web       # build dist/ (EXPO_PUBLIC_* values are baked in)
npx eas-cli@latest deploy --prod     # publish to production
```

Server secrets (`DATABASE_URL`, `AUTH_SECRET`, `RESEND_API_KEY`, `EMAIL_FROM`) are stored in the
EAS `production` environment (`npx eas-cli@latest env:create`).

**Phone apps** (EAS Build):

```bash
npx eas-cli@latest build -p android --profile preview      # installable test APK
npx eas-cli@latest build --profile production              # store builds
npx eas-cli@latest submit                                  # upload to the stores
```

**Scheduled jobs** need these GitHub Actions secrets: `DATABASE_URL`, `GROQ_API_KEY`,
`RESEND_API_KEY`, `EMAIL_FROM` and `ALERT_EMAIL`.

## Quality

Run before every commit:

```bash
npm run typecheck && npm run lint && npm test
```

## Launch checklist

- [ ] GitHub Actions secrets set (see [Deployment](#deployment))
- [ ] Latest website and API deployed with `eas deploy --prod`
- [ ] Custom domain pointed at the deployment; `EXPO_PUBLIC_APP_URL` updated in `.env.local` and `eas.json`
- [ ] Support inbox (`EXPO_PUBLIC_REPORT_EMAIL`) receives email
- [ ] Final app icon and splash artwork in `assets/images/`
- [ ] Legal pages (`/privacy`, `/terms`) reviewed
- [ ] Store listings: screenshots, description, privacy policy URL and data-safety form
