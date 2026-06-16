# Lantern Tarot v3 — Code Changes

## 1. Asset loading

`tarot_journal/app.py` now imports `importlib.resources.files` and resolves packaged files through:

```python
def asset_path(self, filename: str) -> str:
    return str(files("tarot_journal.assets").joinpath(filename))
```

This is used for both `app_icon.png` and `card_back.png`, so it works from source and when packaged.

## 2. Application icon

During startup:

```python
self.icon = self.asset_path("app_icon.png")
```

`buildozer.spec` also includes:

```ini
source.include_exts = py,json,txt,md,png,ttf
icon.filename = tarot_journal/assets/app_icon.png
```

## 3. Face-down card reveal flow

Drawing no longer jumps directly to the interpretation. `perform_draw()` now creates the reading and opens `show_draw_preview()`.

The preview screen:

- lays out one card back per spread position;
- shows each position name;
- provides **Reveal reading** and **Shuffle again** actions.

## 4. Emoji card markers

All places that previously displayed `card.glyph` now display `card.symbol`:

```python
f"{item.card.symbol}  {item.card.name} · {orientation(item)}"
```

The library also uses:

```python
f"{card.symbol}  {card.name}"
```

All 78 cards retain an emoji in the `symbol` field of `cards.json`.

## 5. Theme expansion

`tarot_journal/theme.py` now contains eight palettes:

1. Midnight Plum
2. Moonlit Blue
3. Desert Dawn
4. Forest Oracle
5. Crimson Noir
6. Silver Frost
7. Rose Quartz
8. Golden Hour

Each palette defines:

```python
background
surface
surface_alt
primary
secondary
text
muted
danger
success
border
text_on_primary
```

The user's selection is still saved locally in SQLite through the existing settings table.

## 6. Style-guide UI updates

- Gold or light-toned headings use `primary`.
- Main call-to-action buttons use `secondary`.
- Card surfaces now have themed outlines.
- Navigation uses emoji icons.
- The home screen includes a branded hero section and deck preview.
- The card-back graphic appears during spread setup and before card reveal.

## 7. Surface borders

`tarot_journal/widgets.py` now gives every `Surface` a themed border with a Kivy `Line` instruction:

```python
with self.canvas.after:
    self._border_color = Color(1, 1, 1, 1)
    self._border = Line(...)
```

It updates with position, size, radius, and selected theme.

## 8. Bold-markup fix retained

The label helper automatically enables Kivy markup when embedded formatting is detected:

```python
markup=(bold or "[b]" in text or "[i]" in text)
```

This fixes labels such as:

```python
"[b]Guidance:[/b] ..."
```

## Verification performed

- All Python files pass `py_compile`.
- `cards.json` contains 78 cards.
- All 78 cards contain an emoji `symbol`.
- Eight themes load from `theme.py`.
- Both packaged PNG assets are present.
