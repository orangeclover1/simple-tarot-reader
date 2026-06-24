"""Font-independent card symbol definitions.

Kivy mobile builds do not consistently provide Unicode font fallback. These keys
are rendered by PixelGlyph in widgets.py, so every card gets a visible symbol
without depending on an emoji font.
"""
MAJOR_GLYPHS = {
    "the-fool": "star", "the-magician": "wand", "the-high-priestess": "moon",
    "the-empress": "leaf", "the-emperor": "crown", "the-hierophant": "book",
    "the-lovers": "heart", "the-chariot": "arrow", "strength": "lion",
    "the-hermit": "lantern", "wheel-of-fortune": "wheel", "justice": "scales",
    "the-hanged-man": "hanged", "death": "butterfly", "temperance": "cup",
    "the-devil": "chain", "the-tower": "bolt", "the-star": "star",
    "the-moon": "moon", "the-sun": "sun", "judgement": "bell",
    "the-world": "world",
}

SUIT_GLYPHS = {
    "wands": "wand", "cups": "cup", "swords": "sword", "pentacles": "coin",
}

RANK_SHORT = {
    "Ace": "A", "Two": "2", "Three": "3", "Four": "4", "Five": "5",
    "Six": "6", "Seven": "7", "Eight": "8", "Nine": "9", "Ten": "10",
    "Page": "P", "Knight": "N", "Queen": "Q", "King": "K",
}


def card_glyph(card) -> tuple[str, str]:
    if card.arcana == "major":
        return MAJOR_GLYPHS.get(card.id, "star"), ""
    return SUIT_GLYPHS.get(card.suit or "", "star"), RANK_SHORT.get(card.rank or "", "")
