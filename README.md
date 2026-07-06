# Lantern Tarot

A mobile-first tarot reading app with all 78 tarot + 36 oracle cards, 7 spreads, 5 focus lenses, 8 visual themes, journal, and insights. Built with React + Vite, packaged as an Android APK via Capacitor.

> *A candlelit room in your pocket.*

---

## Features

- **78 tarot + 36 oracle cards** — full card library with search, suit and arcana filters, and detailed meanings
- **7 spreads** — One Card, Decision Maker, Past·Present·Future, Situation·Action·Outcome, Mind·Body·Spirit, Celtic Cross, Relationship Mirror
- **5 focus lenses** — General, Love, Work, Spiritual, Health
- **8 visual themes** — Desert Dawn, Midnight Plum, Forest Oracle, and more, switchable from the home screen
- **Full reading flow** — configure spread → draw cards (tap to reveal) → add feelings & notes → save to journal
- **Journal** — full reading history with delete
- **Insights** — charts and visualisations of your reading patterns

---

## Building the APK

APKs are built automatically via GitHub Actions using Capacitor.

### Automatic build (on push)

Any push to `main` that touches `artifacts/lantern-tarot/**`, `lib/**`, or `.github/workflows/android-build.yml` triggers a build.

### Manual build

1. Go to **Actions → Build Android APK** in this repo
2. Click **Run workflow**
3. Optionally enter a production API base URL (e.g. `https://your-app.replit.app`)
4. The debug APK is uploaded as a workflow artifact — download it from the Actions run page

### Workflow overview

| Step | Tool |
|---|---|
| Node 22 + pnpm 10 | `pnpm/action-setup@v4` |
| JDK 21 (Temurin) | `actions/setup-java@v4` |
| Android SDK | `android-actions/setup-android@v3` |
| Web build | `pnpm run build` (Vite) |
| Capacitor sync | `pnpm exec cap sync android` |
| APK | `./gradlew assembleDebug` |

The APK is retained for **30 days** per run under the artifact name `lantern-tarot-<run_number>`.

---

## Repository structure

```
.
├── .github/workflows/android-build.yml   # CI build
├── artifacts/
│   └── lantern-tarot/                    # React + Vite frontend
│       ├── src/
│       │   ├── pages/                    # 9 pages
│       │   ├── lib/                      # reading engine, themes, context
│       │   └── data/                     # cards.json, spreads.json
│       ├── android/                      # Capacitor Android project
│       └── capacitor.config.ts
├── lib/
│   ├── api-spec/openapi.yaml             # OpenAPI contract
│   ├── api-client-react/                 # Generated React Query hooks
│   └── db/                              # Drizzle ORM schema + migrations
└── artifacts/api-server/                 # Express 5 API
```

---

## Tech stack

- **Frontend** — React 19, Vite, Tailwind CSS v4, Framer Motion, Wouter, Recharts
- **API** — Express 5, Drizzle ORM, PostgreSQL
- **Mobile** — Capacitor 8 (Android)
- **Validation** — Zod v4, drizzle-zod
- **Monorepo** — pnpm workspaces, TypeScript 5.9

---

## Running locally (web)

```bash
# API server (port 8080)
pnpm --filter @workspace/api-server run dev

# Frontend (port 18243)
pnpm --filter @workspace/lantern-tarot run dev
```

Requires: `DATABASE_URL` (PostgreSQL) and `SESSION_SECRET` environment variables.
