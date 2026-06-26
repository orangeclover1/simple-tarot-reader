# Lantern Tarot v11 Features

## Added in this build

### Focus-specific meanings

The reading setup screen now includes a focus selector:

- General
- Love
- Work
- Spiritual
- Health

Every tarot card now has a `context_meanings` block in `tarot_journal/data/cards.json`:

```json
"context_meanings": {
  "love": {
    "upright": "...",
    "reversed": "..."
  },
  "work": {
    "upright": "...",
    "reversed": "..."
  },
  "spiritual": {
    "upright": "...",
    "reversed": "..."
  },
  "health": {
    "upright": "...",
    "reversed": "..."
  }
}
```

The Health focus is written as reflective wellbeing guidance only, not medical advice.

### Oracle deck

A starter 36-card oracle deck was added:

```text
tarot_journal/data/oracle_cards.json
```

The oracle deck uses the same app systems as tarot:

- Spread selection
- Card draw preview
- Journal notes
- Feeling tags
- Insights
- Pixel symbols
- Focus-specific meanings

The reading setup screen now includes a deck selector:

- Tarot
- Oracle
- Mixed

Oracle cards do not reverse by default. In Mixed mode, tarot cards can reverse but oracle cards stay upright.

### Decision Maker

A new spread was added:

```text
Decision Maker
```

Positions:

1. The decision
2. What supports yes
3. What supports no
4. Hidden factor
5. Best next step

The synthesis engine now recognizes this spread and produces a simple decision tendency:

```text
Decision tendency: leans yes / leans no / leans maybe or needs more information.
```

This is framed as a reflective decision aid rather than a command.

### Journal persistence

Saved readings now remember:

- Deck mode
- Focus lens

The Journal screen displays entries like:

```text
Decision Maker · Tarot · Work · 2026-06-26 15:30
```

Existing local databases are migrated automatically with two new columns:

```sql
deck_mode TEXT NOT NULL DEFAULT 'tarot'
focus TEXT NOT NULL DEFAULT 'general'
```

### Android workflow retained

This build keeps the Java 17 GitHub Actions fix:

```yaml
actions/setup-java@v5
java-version: '17'
```

It also sets the Android architecture to:

```ini
android.archs = arm64-v8a
```

That should make GitHub builds faster than compiling both 64-bit and old 32-bit Android targets.
