import json
import random
from importlib.resources import files

from .models import DrawnCard, Spread, SpreadPosition, TarotCard


FOCUS_OPTIONS = {
    "general": "General",
    "love": "Love",
    "work": "Work",
    "spiritual": "Spiritual",
    "health": "Health",
}

DECK_OPTIONS = {
    "tarot": "Tarot",
    "oracle": "Oracle",
    "mixed": "Mixed",
}


def _read_json(filename: str):
    path = files("tarot_journal.data").joinpath(filename)
    return json.loads(path.read_text(encoding="utf-8"))


def _card_from_dict(item: dict) -> TarotCard:
    allowed = TarotCard.__dataclass_fields__.keys()
    cleaned = {key: value for key, value in item.items() if key in allowed}
    return TarotCard(**cleaned)


def load_cards() -> list[TarotCard]:
    return [_card_from_dict(item) for item in _read_json("cards.json")]


def load_oracle_cards() -> list[TarotCard]:
    try:
        return [_card_from_dict(item) for item in _read_json("oracle_cards.json")]
    except FileNotFoundError:
        return []


def load_all_cards() -> list[TarotCard]:
    return load_cards() + load_oracle_cards()


def load_spreads() -> list[Spread]:
    result = []
    for item in _read_json("spreads.json"):
        positions = [SpreadPosition(**p) for p in item["positions"]]
        result.append(Spread(
            id=item["id"], name=item["name"], icon=item["icon"],
            description=item["description"], positions=positions
        ))
    return result


def cards_for_deck(deck_mode: str, tarot_cards: list[TarotCard], oracle_cards: list[TarotCard]) -> list[TarotCard]:
    if deck_mode == "oracle":
        return oracle_cards or tarot_cards
    if deck_mode == "mixed":
        return tarot_cards + oracle_cards
    return tarot_cards


def draw_reading(cards: list[TarotCard], spread: Spread, reversals: bool = True) -> list[DrawnCard]:
    if not cards:
        raise ValueError("No cards available for this deck selection.")
    if len(cards) < len(spread.positions):
        raise ValueError("Not enough cards available for this spread.")
    chosen = random.SystemRandom().sample(cards, len(spread.positions))
    return [
        DrawnCard(
            card=card,
            reversed=(reversals and card.deck_type == "tarot" and bool(random.SystemRandom().getrandbits(1))),
            position=position,
        )
        for card, position in zip(chosen, spread.positions)
    ]


def orientation(card: DrawnCard) -> str:
    if card.card.deck_type == "oracle":
        return "Oracle"
    return "Reversed" if card.reversed else "Upright"


def card_keywords(card: DrawnCard) -> list[str]:
    return card.card.reversed_keywords if card.reversed else card.card.upright_keywords


def card_meaning(card: DrawnCard, focus: str = "general") -> str:
    focus = focus if focus in FOCUS_OPTIONS else "general"
    orientation_key = "reversed" if card.reversed else "upright"
    contexts = card.card.context_meanings or {}
    if focus in contexts and orientation_key in contexts[focus]:
        return contexts[focus][orientation_key]
    if "general" in contexts and orientation_key in contexts["general"]:
        return contexts["general"][orientation_key]
    return card.card.reversed_meaning if card.reversed else card.card.upright_meaning


def deck_label(deck_mode: str) -> str:
    return DECK_OPTIONS.get(deck_mode, "Tarot")


def focus_label(focus: str) -> str:
    return FOCUS_OPTIONS.get(focus, "General")


def decision_summary(reading: list[DrawnCard]) -> str:
    yes_scores = {"Yes": 1, "Maybe": 0, "No": -1}
    total = sum(yes_scores.get(item.card.yes_no, 0) * (-1 if item.reversed else 1) for item in reading)
    if total >= 2:
        tendency = "leans yes"
    elif total <= -2:
        tendency = "leans no"
    else:
        tendency = "leans maybe or needs more information"

    caution_cards = [item.card.name for item in reading if item.reversed or item.card.yes_no == "No"]
    support_cards = [item.card.name for item in reading if not item.reversed and item.card.yes_no == "Yes"]
    parts = [f"Decision tendency: {tendency}."]
    if support_cards:
        parts.append("Support appears through " + ", ".join(support_cards[:3]) + ".")
    if caution_cards:
        parts.append("Caution appears through " + ", ".join(caution_cards[:3]) + ".")
    parts.append("Use this as a reflective decision aid, not as a substitute for your judgment or professional advice.")
    return " ".join(parts)


def synthesize(reading: list[DrawnCard], focus: str = "general", deck_mode: str = "tarot", spread_id: str = "") -> str:
    if spread_id == "decision-maker":
        return decision_summary(reading)

    major_count = sum(1 for item in reading if item.card.arcana == "major")
    oracle_count = sum(1 for item in reading if item.card.deck_type == "oracle")
    reversed_count = sum(1 for item in reading if item.reversed)
    suits = {}
    for item in reading:
        if item.card.suit:
            suits[item.card.suit] = suits.get(item.card.suit, 0) + 1

    parts = []
    if oracle_count:
        parts.append(f"{oracle_count} oracle card{'s' if oracle_count != 1 else ''} appear, adding intuitive theme-language to the reading.")
    if major_count >= max(2, len(reading) // 2):
        parts.append("Major Arcana are prominent, suggesting that the reading centers on a larger developmental theme rather than only a passing detail.")
    if reversed_count > len(reading) / 2:
        parts.append("Most tarot cards are reversed, so the strongest movement may be internal, delayed, resisted, or still being integrated.")
    if suits:
        top_suit, count = max(suits.items(), key=lambda pair: pair[1])
        if count >= 2:
            focus_text = {
                "wands": "initiative and creative energy",
                "cups": "emotion and relationship",
                "swords": "thought and communication",
                "pentacles": "practical life and resources",
            }[top_suit]
            parts.append(f"The repeated {top_suit.title()} energy emphasizes {focus_text}.")
    if focus == "health":
        parts.append("For health and wellbeing, keep this as a reflection prompt and consult a professional for medical concerns.")
    else:
        parts.append(f"The focus lens is {focus_label(focus)}, so prioritize meanings that speak to that area.")
    parts.append("Use the cards as prompts rather than fixed predictions.")
    return " ".join(parts)
