# Lantern Tarot

A mobile-first tarot reading web app rebuilt from a Kivy/Python v14 original. All 78 tarot + oracle cards, 7 spreads, 8 themes, journal/history, insights, and 5 focus lenses.

## Run & Operate

- `pnpm --filter @workspace/api-server run dev` — run the API server (port 8080, path `/api`)
- `pnpm --filter @workspace/lantern-tarot run dev` — run the frontend (port 18243, path `/`)
- `pnpm run typecheck` — full typecheck across all packages
- `pnpm run build` — typecheck + build all packages
- `pnpm --filter @workspace/api-spec run codegen` — regenerate API hooks and Zod schemas from the OpenAPI spec
- `pnpm --filter @workspace/db run push` — push DB schema changes (dev only)
- Required env: `DATABASE_URL` — Postgres connection string, `SESSION_SECRET`

## Stack

- pnpm workspaces, Node.js 24, TypeScript 5.9
- Frontend: React + Vite + Tailwind CSS v4 + Framer Motion + Wouter + Recharts
- API: Express 5
- DB: PostgreSQL + Drizzle ORM
- Validation: Zod (`zod/v4`), `drizzle-zod`
- API codegen: Orval (from OpenAPI spec)
- Build: esbuild (CJS bundle)

## Where things live

- `artifacts/lantern-tarot/src/` — React app
  - `pages/` — all 9 pages (home, read, configure-spread, draw, result, library, card-detail, journal, insights)
  - `lib/reading-engine.ts` — card draw logic, synthesize, types
  - `lib/reading-context.tsx` — cross-page reading session state (React context)
  - `lib/themes.ts` — 8 theme color definitions (HSL values for CSS vars)
  - `data/cards.json` — 78 tarot cards
  - `data/oracle_cards.json` — oracle cards
  - `data/spreads.json` — 7 spread definitions
- `artifacts/api-server/src/routes/readings.ts` — CRUD for readings
- `lib/db/src/schema/readings.ts` — DB schema (readings + reading_cards + settings)
- `lib/api-spec/openapi.yaml` — OpenAPI source of truth
- `lib/api-client-react/src/generated/` — generated hooks + types (do not edit)

## Architecture decisions

- Reading state flows page-to-page via `ReadingContext` (not URL params/localStorage)
- Theme colors applied as CSS custom properties at runtime via `ThemeProvider`; 8 themes stored in `themes.ts`
- Card meanings resolved client-side from JSON data; API only persists completed readings
- `DrawnCardInput.reversed` (not `isReversed`) — matches OpenAPI schema field name
- Card gradients driven by arcana/suit for visual differentiation without images

## Product

All 78 tarot + 36 oracle cards browsable with search and suit/arcana filters. 7 spreads (One Card, Decision Maker, Past·Present·Future, Situation·Action·Outcome, Mind·Body·Spirit, Celtic Cross, Relationship Mirror). 5 focus lenses (General, Love, Work, Spiritual, Health). 8 visual themes switchable from home screen. Full reading flow: configure → draw (tap-to-reveal) → result with feelings + notes → save to journal. Journal with full reading history and delete. Insights page with Recharts visualizations.

## User preferences

_Populate as you build — explicit user instructions worth remembering across sessions._

## Gotchas

- Do NOT call `pnpm dev` at the workspace root — no root dev script exists
- After changing OpenAPI spec, always run codegen: `pnpm --filter @workspace/api-spec run codegen`
- `DrawnCardInput` uses `reversed: boolean` (not `isReversed`)
- The `navigate(-1)` workaround for wouter back navigation: cast as `navigate(-1 as any)`
- `ReadingContext` is session-only (no persistence) — navigating away from `/draw` without completing loses the drawn cards

## Pointers

- See the `pnpm-workspace` skill for workspace structure, TypeScript setup, and package details
