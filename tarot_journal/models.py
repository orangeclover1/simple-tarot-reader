from dataclasses import dataclass, field
from typing import Optional


@dataclass(frozen=True)
class TarotCard:
    id: str
    name: str
    arcana: str
    symbol: str = ""
    suit: Optional[str] = None
    rank: Optional[str] = None
    number: Optional[int] = None
    upright_keywords: list[str] = field(default_factory=list)
    reversed_keywords: list[str] = field(default_factory=list)
    upright_meaning: str = ""
    reversed_meaning: str = ""
    reflection: str = ""
    yes_no: str = "Maybe"
    element: str = ""
    astrology: str = ""
    symbolism: list[str] = field(default_factory=list)
    yes_no_advice: str = ""
    glyph: str = "star"
    deck_type: str = "tarot"
    context_meanings: dict[str, dict[str, str]] = field(default_factory=dict)


@dataclass(frozen=True)
class SpreadPosition:
    name: str
    prompt: str


@dataclass(frozen=True)
class Spread:
    id: str
    name: str
    icon: str
    description: str
    positions: list[SpreadPosition]


@dataclass(frozen=True)
class DrawnCard:
    card: TarotCard
    reversed: bool
    position: SpreadPosition
