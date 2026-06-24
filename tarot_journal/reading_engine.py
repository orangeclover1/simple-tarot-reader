import json
import random
from importlib.resources import files

from .models import DrawnCard, Spread, SpreadPosition, TarotCard


def _read_json(filename: str):
    path = files("tarot_journal.data").joinpath(filename)
    return json.loads(path.read_text(encoding="utf-8"))


def load_cards() -> list[TarotCard]:
    result = []
    for item in _read_json("cards.json"):
        result.append(TarotCard(**item))
    return result


def load_spreads() -> list[Spread]:
    result = []
    for item in _read_json("spreads.json"):
        positions = [SpreadPosition(**p) for p in item["positions"]]
        result.append(Spread(
            id=item["id"], name=item["name"], icon=item["icon"],
            description=item["description"], positions=positions
        ))
    return result


def draw_reading(cards: list[TarotCard], spread: Spread, reversals: bool = True) -> list[DrawnCard]:
    chosen = random.SystemRandom().sample(cards, len(spread.positions))
    return [
        DrawnCard(card=card, reversed=(reversals and bool(random.SystemRandom().getrandbits(1))), position=position)
        for card, position in zip(chosen, spread.positions)
    ]


def orientation(card: DrawnCard) -> str:
    return "Reversed" if card.reversed else "Upright"


def card_keywords(card: DrawnCard) -> list[str]:
    return card.card.reversed_keywords if card.reversed else card.card.upright_keywords


def card_meaning(card: DrawnCard) -> str:
    return card.card.reversed_meaning if card.reversed else card.card.upright_meaning


def synthesize(reading: list[DrawnCard]) -> str:
    major_count = sum(1 for item in reading if item.card.arcana == "major")
    reversed_count = sum(1 for item in reading if item.reversed)
    suits = {}
    for item in reading:
        if item.card.suit:
            suits[item.card.suit] = suits.get(item.card.suit, 0) + 1

    parts = []
    if major_count >= max(2, len(reading) // 2):
        parts.append("Major Arcana are prominent, suggesting that the reading centers on a larger developmental theme rather than only a passing detail.")
    if reversed_count > len(reading) / 2:
        parts.append("Most cards are reversed, so the strongest movement may be internal, delayed, resisted, or still being integrated.")
    if suits:
        top_suit, count = max(suits.items(), key=lambda pair: pair[1])
        if count >= 2:
            focus = {
                "wands": "initiative and creative energy",
                "cups": "emotion and relationship",
                "swords": "thought and communication",
                "pentacles": "practical life and resources",
            }[top_suit]
            parts.append(f"The repeated {top_suit.title()} energy emphasizes {focus}.")
    parts.append("Use the cards as prompts rather than fixed predictions: notice which language creates recognition, resistance, or a useful next question.")
    return " ".join(parts)
