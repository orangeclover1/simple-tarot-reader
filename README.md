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


## Theme card backs and typography

Each of the eight color themes now selects its own bundled pixel-art card back:

- Midnight Plum — lantern
- Moonlit Blue — moon
- Desert Dawn — star
- Forest Oracle — leaf
- Crimson Noir — eye
- Silver Frost — ice
- Rose Quartz — heart
- Golden Hour — potion

Card symbols are displayed as tintable monochrome Unicode emoji-style glyphs. The app strips the color-emoji presentation selector before rendering, allowing the active theme color to be applied where the platform font supports it.

See `TYPOGRAPHY.md` for the optional font-profile system.

## Build in GitHub instead of locally

The project includes GitHub Actions workflows that can generate a test APK and a signed Play Store AAB on a cloud Linux runner. See `GITHUB_ANDROID_BUILD.md`.


## GitHub Actions update

v9 updates the Android cloud build workflows to Node 24-compatible GitHub Actions versions and adds `GITHUB_ACTIONS_TROUBLESHOOTING.md`.
