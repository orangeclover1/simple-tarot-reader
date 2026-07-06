import tarotCards from "@/data/cards.json";
import oracleCards from "@/data/oracle_cards.json";
import spreadsData from "@/data/spreads.json";

export interface TarotCard {
  id: string;
  name: string;
  arcana: string;
  suit?: string | null;
  rank?: string | null;
  number?: number | null;
  upright_keywords: string[];
  reversed_keywords: string[];
  upright_meaning: string;
  reversed_meaning: string;
  reflection: string;
  yes_no: string;
  element: string;
  astrology: string;
  symbolism: string[];
  yes_no_advice: string;
  glyph: string;
  deck_type: string;
  context_meanings: Record<string, Record<string, string>>;
  imageUrl?: string | null;
}

export interface SpreadPosition {
  name: string;
  prompt: string;
}

export interface Spread {
  id: string;
  name: string;
  icon: string;
  description: string;
  positions: SpreadPosition[];
}

export interface DrawnCard {
  card: TarotCard;
  isReversed: boolean;
  position: SpreadPosition;
}

export const TAROT_CARDS: TarotCard[] = tarotCards as TarotCard[];
export const ORACLE_CARDS: TarotCard[] = oracleCards as TarotCard[];
export const SPREADS: Spread[] = spreadsData as Spread[];

export const FOCUS_OPTIONS = {
  general: "General",
  love: "Love",
  work: "Work",
  spiritual: "Spiritual",
  health: "Health",
};

export const DECK_OPTIONS = {
  tarot: "Tarot",
  oracle: "Oracle",
  mixed: "Mixed",
  custom: "Custom",
};

export interface CustomCardData {
  id: number;
  deckId: number;
  name: string;
  glyph: string;
  imageUrl?: string | null;
  uprightMeaning: string;
  reversedMeaning: string;
  uprightKeywords: string[];
  reversedKeywords: string[];
  reflection?: string | null;
  position: number;
}

export function customCardToTarotCard(card: CustomCardData): TarotCard {
  return {
    id: `custom-${card.id}`,
    name: card.name,
    arcana: "custom",
    suit: null,
    rank: null,
    number: null,
    upright_keywords: card.uprightKeywords ?? [],
    reversed_keywords: card.reversedKeywords ?? [],
    upright_meaning: card.uprightMeaning,
    reversed_meaning: card.reversedMeaning,
    reflection: card.reflection ?? "",
    yes_no: "Maybe",
    element: "Custom",
    astrology: "",
    symbolism: [],
    yes_no_advice: "",
    glyph: card.glyph,
    deck_type: "custom",
    context_meanings: {},
    imageUrl: card.imageUrl ?? null,
  };
}

export function getDeckCards(deckMode: string, customCards?: TarotCard[]): TarotCard[] {
  if (deckMode === "custom") return (customCards && customCards.length > 0) ? customCards : TAROT_CARDS;
  if (deckMode === "oracle") return ORACLE_CARDS.length > 0 ? ORACLE_CARDS : TAROT_CARDS;
  if (deckMode === "mixed") return [...TAROT_CARDS, ...ORACLE_CARDS];
  return TAROT_CARDS;
}

export function drawReading(
  spread: Spread,
  deckMode: string,
  includeReversed: boolean,
  customCards?: TarotCard[]
): DrawnCard[] {
  const deck = getDeckCards(deckMode, customCards);
  const shuffled = [...deck].sort(() => Math.random() - 0.5);
  const chosen = shuffled.slice(0, spread.positions.length);
  return chosen.map((card, i) => ({
    card,
    isReversed:
      includeReversed &&
      (card.deck_type === "tarot" || card.deck_type === "custom") &&
      Math.random() > 0.5,
    position: spread.positions[i],
  }));
}

export function cardMeaning(card: TarotCard, isReversed: boolean, focus: string): string {
  const orientation = isReversed ? "reversed" : "upright";
  const focusKey = focus in FOCUS_OPTIONS ? focus : "general";
  const ctx = card.context_meanings ?? {};
  if (ctx[focusKey]?.[orientation]) return ctx[focusKey][orientation];
  if (ctx["general"]?.[orientation]) return ctx["general"][orientation];
  return isReversed ? card.reversed_meaning : card.upright_meaning;
}

export function cardKeywords(card: TarotCard, isReversed: boolean): string[] {
  return isReversed ? card.reversed_keywords : card.upright_keywords;
}

export function orientation(card: DrawnCard): string {
  if (card.card.deck_type === "oracle") return "Oracle";
  if (card.card.deck_type === "custom") return card.isReversed ? "Reversed" : "Custom";
  return card.isReversed ? "Reversed" : "Upright";
}

export function synthesize(
  cards: DrawnCard[],
  focus: string,
  deckMode: string,
  spreadId: string
): string {
  if (spreadId === "decision-maker") {
    const yesScores: Record<string, number> = { Yes: 1, Maybe: 0, No: -1 };
    const total = cards.reduce(
      (sum, c) => sum + (yesScores[c.card.yes_no] ?? 0) * (c.isReversed ? -1 : 1),
      0
    );
    const tendency = total >= 2 ? "leans yes" : total <= -2 ? "leans no" : "leans maybe or needs more information";
    const support = cards.filter((c) => !c.isReversed && c.card.yes_no === "Yes").map((c) => c.card.name);
    const caution = cards.filter((c) => c.isReversed || c.card.yes_no === "No").map((c) => c.card.name);
    const parts = [`Decision tendency: ${tendency}.`];
    if (support.length) parts.push("Support appears through " + support.slice(0, 3).join(", ") + ".");
    if (caution.length) parts.push("Caution appears through " + caution.slice(0, 3).join(", ") + ".");
    parts.push("Use this as a reflective decision aid, not a substitute for your judgment.");
    return parts.join(" ");
  }

  const majorCount = cards.filter((c) => c.card.arcana === "major").length;
  const oracleCount = cards.filter((c) => c.card.deck_type === "oracle").length;
  const customCount = cards.filter((c) => c.card.deck_type === "custom").length;
  const reversedCount = cards.filter((c) => c.isReversed).length;
  const suits: Record<string, number> = {};
  for (const { card } of cards) {
    if (card.suit) suits[card.suit] = (suits[card.suit] ?? 0) + 1;
  }

  const parts: string[] = [];
  if (customCount) parts.push(`${customCount} custom card${customCount !== 1 ? "s" : ""} appear from your personal deck.`);
  if (oracleCount) parts.push(`${oracleCount} oracle card${oracleCount !== 1 ? "s" : ""} appear, adding intuitive theme-language.`);
  if (majorCount >= Math.max(2, Math.floor(cards.length / 2))) {
    parts.push("Major Arcana are prominent, suggesting a larger developmental theme is at work.");
  }
  if (reversedCount > cards.length / 2) {
    parts.push("Most cards are reversed — the strongest movement may be internal, delayed, or still being integrated.");
  }
  const topSuit = Object.entries(suits).sort((a, b) => b[1] - a[1])[0];
  if (topSuit && topSuit[1] >= 2) {
    const suitMeaning: Record<string, string> = {
      wands: "initiative and creative energy",
      cups: "emotion and relationship",
      swords: "thought and communication",
      pentacles: "practical life and resources",
    };
    parts.push(`The repeated ${topSuit[0]} energy emphasizes ${suitMeaning[topSuit[0]] ?? topSuit[0]}.`);
  }
  if (focus === "health") {
    parts.push("Keep this as a reflection prompt for wellbeing — consult a professional for medical concerns.");
  } else {
    parts.push(`The ${FOCUS_OPTIONS[focus as keyof typeof FOCUS_OPTIONS] ?? "General"} focus lens shapes the primary meaning.`);
  }
  parts.push("Use the cards as prompts rather than fixed predictions.");
  return parts.join(" ");
}

export function getCardGradient(card: TarotCard): string {
  if (card.deck_type === "custom") return "from-rose-950 via-pink-900 to-rose-950";
  if (card.deck_type === "oracle") return "from-indigo-950 via-violet-900 to-indigo-950";
  if (card.arcana === "major") return "from-purple-950 via-violet-900 to-slate-900";
  switch (card.suit?.toLowerCase()) {
    case "wands": return "from-amber-950 via-orange-900 to-amber-950";
    case "cups": return "from-blue-950 via-cyan-900 to-blue-950";
    case "swords": return "from-slate-900 via-gray-800 to-slate-950";
    case "pentacles": return "from-emerald-950 via-green-900 to-emerald-950";
    default: return "from-gray-900 via-slate-800 to-gray-900";
  }
}

export function getCardAccent(card: TarotCard): string {
  if (card.deck_type === "custom") return "text-rose-300";
  if (card.deck_type === "oracle") return "text-violet-300";
  if (card.arcana === "major") return "text-yellow-300";
  switch (card.suit?.toLowerCase()) {
    case "wands": return "text-amber-300";
    case "cups": return "text-cyan-300";
    case "swords": return "text-slate-300";
    case "pentacles": return "text-emerald-300";
    default: return "text-gray-300";
  }
}

export const FEELINGS = [
  "Calm", "Hopeful", "Curious", "Validated", "Inspired", "Clear",
  "Uncertain", "Challenged", "Sad", "Anxious", "Frustrated", "Surprised",
];
