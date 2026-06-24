from pathlib import Path
from kivy.core.text import LabelBase

# Kivy ships with Roboto. Other profiles become available after the user drops
# matching .ttf/.otf files into tarot_journal/assets/fonts.
FONT_PROFILES = {
    "Kivy Default": {
        "heading": "Roboto",
        "body": "Roboto",
        "label": "Roboto",
        "files": {},
    },
    "Editorial Serif": {
        "heading": "LanternEditorial",
        "body": "Roboto",
        "label": "Roboto",
        "files": {"LanternEditorial": "PlayfairDisplay-Regular.ttf"},
    },
    "Soft Rounded": {
        "heading": "LanternRounded",
        "body": "LanternRounded",
        "label": "LanternRounded",
        "files": {"LanternRounded": "Nunito-Regular.ttf"},
    },
    "Pixel Mystic": {
        "heading": "LanternPixel",
        "body": "Roboto",
        "label": "LanternPixel",
        "files": {"LanternPixel": "PixelOperator.ttf"},
    },
}

DEFAULT_FONT_PROFILE = "Kivy Default"


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


def profile_fonts(profile_name: str) -> dict[str, str]:
    return FONT_PROFILES.get(profile_name, FONT_PROFILES[DEFAULT_FONT_PROFILE])
