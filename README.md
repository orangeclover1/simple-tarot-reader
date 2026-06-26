# Lantern Tarot — Offline Python Mobile App

Lantern Tarot is a text-first, offline tarot journal written in Python with Kivy.

## Included

- Complete 78-card Rider–Waite–Smith-style reference deck
- Upright and reversed meanings
- One-card, three-card, situation/action/outcome, relationship, mind/body/spirit, and Celtic Cross spreads
- Optional question or intention
- Feeling tags and free-text journal notes
- Fully local SQLite reading history
- Frequent-card, suit, orientation, feeling, and monthly activity insights
- Four selectable color themes
- No account, server, analytics, advertisements, or internet connection
- Android packaging configuration

## Project structure

```text
tarot_journal_app/
├── main.py
├── requirements.txt
├── buildozer.spec
├── pyproject.toml
├── README.md
├── LICENSE
└── tarot_journal/
    ├── __init__.py
    ├── app.py
    ├── database.py
    ├── models.py
    ├── reading_engine.py
    ├── theme.py
    ├── widgets.py
    └── data/
        ├── cards.json
        └── spreads.json
```

## Run on a computer

Python 3.11 or 3.12 is recommended.

```bash
python -m venv .venv
```

Activate the environment:

**Windows**

```bash
.venv\Scripts\activate
```

**macOS/Linux**

```bash
source .venv/bin/activate
```

Install and run:

```bash
pip install -r requirements.txt
python main.py
```

## Build an Android APK

Buildozer works most reliably on Linux. Windows users can use WSL2 with Ubuntu.

```bash
pip install buildozer
buildozer android debug
```

The APK will appear in `bin/`.

Install it on an Android phone by transferring the APK to the phone, allowing installation from that source, and opening it. For Play Store distribution, create a signed release bundle and follow current Google Play signing requirements.

## Build for iPhone/iPad

Kivy supports iOS, but the final build requires macOS, Xcode, and the Kivy iOS toolchain. This starter intentionally avoids heavy binary dependencies to make mobile packaging easier.

## Privacy

All readings are stored only in the app's local SQLite database. Deleting the app may delete its data. A future version could add encrypted JSON export/import for backups.

## Content model

Card meanings are stored in `tarot_journal/data/cards.json`. You can edit them without changing application logic. Spreads work the same way in `spreads.json`.

## Adding a spread

Add an object to `spreads.json`:

```json
{
  "id": "decision",
  "name": "Decision",
  "icon": "⚖",
  "description": "Compare the energies surrounding a choice.",
  "positions": [
    {"name": "The choice", "prompt": "What is the heart of the decision?"},
    {"name": "Path A", "prompt": "What energy follows the first path?"},
    {"name": "Path B", "prompt": "What energy follows the second path?"}
  ]
}
```

## Important note

This app presents tarot as a reflective and journaling practice. It should not claim to replace medical, legal, financial, or mental-health professionals.


## Version 6 rendering fixes

- Card backs are precomposited onto the exact theme background color, so generated checkerboards are no longer visible.
- The in-app lantern icon also gets a theme-matched background. The installed OS launcher icon remains a single static icon.
- Face-down cards are tappable; tapping any card reveals the reading.
- Card symbols are now drawn as small Kivy pixel graphics instead of font glyphs. This completely avoids missing-glyph boxes on Android/iOS.
- No emoji or symbol font is required for card icons.


## v11 focus, oracle, and decision-maker update

This build adds love/work/spiritual/health focus meanings for every tarot card, a 36-card oracle deck, a Tarot/Oracle/Mixed deck selector, and a Decision Maker spread with a decision-tendency synthesis. Saved readings now also store the selected deck and focus lens.


## v12 mobile navigation update

The app navigation now sits at the top of the screen instead of the bottom, avoiding Android's gesture/home-button area. Scroll pages also include extra bottom padding so final buttons and inputs remain clickable.


## v13 sidebar and rounded mobile UI

The app now uses a left sidebar navigation rail with extra safe padding, plus rounder surfaces and buttons. This avoids both Android's top status bar and bottom home/gesture area.
