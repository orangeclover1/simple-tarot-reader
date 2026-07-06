---
name: Lantern Tarot spread IDs
description: The actual IDs in spreads.json — not the display names or slug-ified versions
---

The spreads.json uses these exact IDs. Any route or filter referencing a spread must use these:

| id | name | cards |
|----|------|-------|
| single | One Card | 1 |
| decision-maker | Decision Maker | 5 |
| three-time | Past · Present · Future | 3 |
| sao | Situation · Action · Outcome | 3 |
| mbs | Mind · Body · Spirit | 3 |
| relationship | Relationship Mirror | 4 |
| celtic | Celtic Cross | 10 |

**Why:** The home page had `past-present-future` hardcoded in QUICK_SPREADS which doesn't match `three-time`, so that spread silently disappeared from the home screen.

**How to apply:** When adding a new spread link anywhere in the app, always cross-check the exact `id` field in spreads.json rather than inventing a slug from the display name.
