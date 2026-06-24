from dataclasses import dataclass
from typing import Optional


@dataclass(frozen=True)
class TarotCard:
    id: str
    name: str
    arcana: str
    symbol: str
    suit: Optional[str]
    rank: Optional[str]
    number: Optional[int]
    upright_keywords: list[str]
    reversed_keywords: list[str]
    upright_meaning: str
    reversed_meaning: str
    reflection: str
    yes_no: str
    element: str
    astrology: str
    symbolism: list[str]
    yes_no_advice: str
    glyph: str


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
