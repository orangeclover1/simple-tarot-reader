from pathlib import Path
from kivy.core.text import LabelBase

FONT_PROFILES = {
    "Kivy Default": {
        "heading": "Roboto", "body": "Roboto", "label": "Roboto", "files": {},
    },
    "Editorial Serif": {
        "heading": "LanternEditorial", "body": "Roboto", "label": "Roboto",
        "files": {"LanternEditorial": "PlayfairDisplay-Regular.ttf"},
    },
    "Soft Rounded": {
        "heading": "LanternRounded", "body": "LanternRounded", "label": "LanternRounded",
        "files": {"LanternRounded": "Nunito-Regular.ttf"},
    },
    "Pixel Mystic": {
        "heading": "LanternPixel", "body": "Roboto", "label": "LanternPixel",
        "files": {"LanternPixel": "PixelOperator.ttf"},
    },
}

DEFAULT_FONT_PROFILE = "Kivy Default"
SYMBOL_FONT_ALIAS = "LanternSymbols"
SYMBOL_FONT_FILENAME = "NotoSansSymbols2-Regular.ttf"


def register_available_fonts(fonts_dir: Path) -> set[str]:
    available = {DEFAULT_FONT_PROFILE}
    for profile_name, profile in FONT_PROFILES.items():
        if profile_name == DEFAULT_FONT_PROFILE:
            continue
        required = [fonts_dir / filename for filename in profile["files"].values()]
        if required and all(path.exists() for path in required):
            for alias, filename in profile["files"].items():
                LabelBase.register(name=alias, fn_regular=str(fonts_dir / filename))
            available.add(profile_name)
    return available


def register_symbol_font(fonts_dir: Path) -> bool:
    """Register the optional user-supplied symbol font.

    Put NotoSansSymbols2-Regular.ttf in assets/fonts. The project deliberately
    does not redistribute the font file; the README points to the official
    Google/Noto download.
    """
    font_path = fonts_dir / SYMBOL_FONT_FILENAME
    if not font_path.exists():
        return False
    LabelBase.register(name=SYMBOL_FONT_ALIAS, fn_regular=str(font_path))
    return True


def profile_fonts(profile_name: str) -> dict[str, str]:
    return FONT_PROFILES.get(profile_name, FONT_PROFILES[DEFAULT_FONT_PROFILE])
