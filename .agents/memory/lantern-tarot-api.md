---
name: Lantern Tarot API schema gotchas
description: Field naming and nullability quirks in the generated ReadingInput / DrawnCardInput types
---

**DrawnCardInput** uses `reversed: boolean` — NOT `isReversed`. Using `isReversed` causes a TS2322 error.

**ReadingInput** fields `question` and `notes` are `string | undefined` (optional), not `string | null`. Passing `null` causes TS2322.

**Why:** Orval codegen reflects the OpenAPI spec. The spec declared these as optional without `nullable: true`, so null is rejected by the generated type even though Drizzle/Postgres accepts it.

**How to apply:** Use spread syntax to conditionally include the key: `...(value ? { key: value } : {})` rather than `key: value || null`.
