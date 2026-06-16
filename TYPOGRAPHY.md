# Typography in Lantern Tarot / Kivy

## What Kivy can use

Kivy can render TrueType (`.ttf`) and OpenType (`.otf`) fonts through its text providers. For a dependable mobile build, bundle fonts with the app rather than relying on fonts installed on a phone.

The app now has a font-profile system in `tarot_journal/fonts.py`.

Built-in profile:

- **Kivy Default** — Kivy's bundled Roboto

Optional profiles become visible automatically when their expected files are placed in `tarot_journal/assets/fonts/`:

- **Editorial Serif** — `PlayfairDisplay-Regular.ttf`
- **Soft Rounded** — `Nunito-Regular.ttf`
- **Pixel Mystic** — `PixelOperator.ttf`

Font files are intentionally not included. Verify each font's license before distributing it.

## Adding another profile

Add an entry to `FONT_PROFILES`:

```python
"My Theme": {
    "heading": "MyHeadingAlias",
    "body": "MyBodyAlias",
    "label": "MyBodyAlias",
    "files": {
        "MyHeadingAlias": "MyHeading.ttf",
        "MyBodyAlias": "MyBody.ttf",
    },
},
```

Place both files in `tarot_journal/assets/fonts/`. The app registers them at startup and adds the profile to the Typography selector.

## What can be changed

- Heading, body, and compact-label font families independently
- Font size and line height
- Weight by registering separate regular/bold files
- Italic faces
- Letter spacing through Kivy markup or custom widgets
- Uppercase labels and small caps styling
- Theme-specific font profiles

## Emoji caveat

Color emoji fonts are not reliably tintable. This app removes the emoji presentation selector (`U+FE0F`) before display so symbols prefer monochrome text rendering and inherit the active theme color. Actual appearance still depends on glyph coverage in the selected font and platform text provider.
