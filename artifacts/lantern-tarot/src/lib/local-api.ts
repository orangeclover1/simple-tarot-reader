import { useEffect, useState } from "react";

const SETTINGS_KEY = "lantern-tarot:settings";
const READINGS_KEY = "lantern-tarot:readings";
const CUSTOM_DECKS_KEY = "lantern-tarot:custom-decks";
const EVENT_NAME = "lantern-tarot:data-changed";

export interface Settings {
  theme: string;
}

export interface DrawnCardInput {
  cardId: string;
  cardName: string;
  positionName: string;
  reversed: boolean;
}

export interface DrawnCardRecord extends DrawnCardInput {
  id: number;
  isReversed: boolean;
  meaning?: string;
}

export interface ReadingInput {
  spreadId: string;
  spreadName: string;
  question?: string;
  notes?: string;
  synthesis?: string;
  deckMode: string;
  focus: string;
  feelings?: string[];
  cards: DrawnCardInput[];
}

export interface Reading {
  id: number;
  spreadId: string;
  spreadName: string;
  question?: string | null;
  notes?: string | null;
  synthesis?: string | null;
  deckMode: string;
  focus: string;
  feelings: string[];
  cardNames: string[];
  createdAt: string;
  cards: DrawnCardRecord[];
}

export interface CustomDeckInput {
  name: string;
  description?: string;
}

export interface CustomCardInput {
  name: string;
  glyph?: string;
  imageUrl?: string;
  uprightMeaning?: string;
  reversedMeaning?: string;
  uprightKeywords?: string[];
  reversedKeywords?: string[];
  reflection?: string;
}

export interface CustomCard {
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

export interface CustomDeck {
  id: number;
  name: string;
  description?: string | null;
  cardCount: number;
  createdAt: string;
}

export interface CustomDeckDetail extends CustomDeck {
  cards: CustomCard[];
}

type MutationResult<TArgs, TResult> = {
  mutate: (args: TArgs) => void;
  mutateAsync: (args: TArgs) => Promise<TResult>;
  isPending: boolean;
};

function canUseStorage() {
  return typeof window !== "undefined" && typeof window.localStorage !== "undefined";
}

function readJson<T>(key: string, fallback: T): T {
  if (!canUseStorage()) return fallback;
  try {
    const raw = window.localStorage.getItem(key);
    return raw ? (JSON.parse(raw) as T) : fallback;
  } catch {
    return fallback;
  }
}

function writeJson<T>(key: string, value: T) {
  if (!canUseStorage()) return;
  window.localStorage.setItem(key, JSON.stringify(value));
  window.dispatchEvent(new CustomEvent(EVENT_NAME));
}

function subscribe(callback: () => void) {
  if (!canUseStorage()) return () => undefined;
  window.addEventListener(EVENT_NAME, callback);
  window.addEventListener("storage", callback);
  return () => {
    window.removeEventListener(EVENT_NAME, callback);
    window.removeEventListener("storage", callback);
  };
}

function useLocalValue<T>(getSnapshot: () => T, deps: unknown[] = []): T {
  const [value, setValue] = useState<T>(() => getSnapshot());

  useEffect(() => {
    const update = () => setValue(getSnapshot());
    update();
    return subscribe(update);
    // This hook intentionally uses caller-provided dependencies so inline selectors
    // do not cause a render loop by changing identity on every render.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, deps);

  return value;
}

function asQuery<T>(data: T) {
  return {
    data,
    isLoading: false,
    isError: false,
    error: null,
    refetch: async () => ({ data }),
  };
}

function asMutation<TArgs, TResult>(handler: (args: TArgs) => TResult): MutationResult<TArgs, TResult> {
  return {
    isPending: false,
    mutate: (args: TArgs) => {
      void Promise.resolve(handler(args));
    },
    mutateAsync: async (args: TArgs) => handler(args),
  };
}

function getSettings(): Settings {
  return readJson<Settings>(SETTINGS_KEY, { theme: "Midnight Plum" });
}

function saveSettings(settings: Settings) {
  writeJson(SETTINGS_KEY, settings);
}

function getReadings(): Reading[] {
  return readJson<Reading[]>(READINGS_KEY, []).sort(
    (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
  );
}

function saveReadings(readings: Reading[]) {
  writeJson(READINGS_KEY, readings);
}

function getDecks(): CustomDeckDetail[] {
  return readJson<CustomDeckDetail[]>(CUSTOM_DECKS_KEY, []).map((deck) => ({
    ...deck,
    cardCount: deck.cards?.length ?? 0,
    cards: (deck.cards ?? []).map((card, index) => ({
      ...card,
      glyph: card.glyph || "✨",
      uprightMeaning: card.uprightMeaning ?? "",
      reversedMeaning: card.reversedMeaning ?? "",
      uprightKeywords: card.uprightKeywords ?? [],
      reversedKeywords: card.reversedKeywords ?? [],
      position: card.position ?? index,
    })),
  }));
}

function saveDecks(decks: CustomDeckDetail[]) {
  writeJson(
    CUSTOM_DECKS_KEY,
    decks.map((deck) => ({ ...deck, cardCount: deck.cards.length })),
  );
}

function nextId(items: { id: number }[]) {
  return Math.max(0, ...items.map((item) => item.id)) + 1;
}

function publicDeck(deck: CustomDeckDetail): CustomDeck {
  return {
    id: deck.id,
    name: deck.name,
    description: deck.description ?? null,
    cardCount: deck.cards.length,
    createdAt: deck.createdAt,
  };
}

export function useGetSettings() {
  const data = useLocalValue(getSettings);
  return asQuery(data);
}

export function useUpdateSettings() {
  return asMutation<{ data: Partial<Settings> }, Settings>(({ data }) => {
    const next = { ...getSettings(), ...data };
    saveSettings(next);
    return next;
  });
}

export function useListReadings() {
  const data = useLocalValue(getReadings);
  return asQuery(data);
}

export function useListRecentReadings() {
  const data = useLocalValue(() => getReadings().slice(0, 5), []);
  return asQuery(data);
}

export function useCreateReading() {
  return asMutation<{ data: ReadingInput }, Reading>(({ data }) => {
    const readings = getReadings();
    const id = nextId(readings);
    const cards: DrawnCardRecord[] = data.cards.map((card, index) => ({
      id: index + 1,
      ...card,
      isReversed: card.reversed,
    }));
    const reading: Reading = {
      id,
      spreadId: data.spreadId,
      spreadName: data.spreadName,
      question: data.question ?? null,
      notes: data.notes ?? null,
      synthesis: data.synthesis ?? null,
      deckMode: data.deckMode,
      focus: data.focus,
      feelings: data.feelings ?? [],
      cardNames: cards.map((card) => card.cardName),
      createdAt: new Date().toISOString(),
      cards,
    };
    saveReadings([reading, ...readings]);
    return reading;
  });
}

export function useDeleteReading() {
  return asMutation<{ id: number }, void>(({ id }) => {
    saveReadings(getReadings().filter((reading) => reading.id !== id));
  });
}

export function useListCustomDecks() {
  const data = useLocalValue(() => getDecks().map(publicDeck), []);
  return asQuery(data);
}

export function useGetCustomDeck(id: number) {
  const data = useLocalValue(() => getDecks().find((deck) => deck.id === id), [id]);
  return asQuery(data);
}

export function useCreateCustomDeck() {
  return asMutation<{ data: CustomDeckInput }, CustomDeck>(({ data }) => {
    const decks = getDecks();
    const deck: CustomDeckDetail = {
      id: nextId(decks),
      name: data.name,
      description: data.description ?? null,
      cardCount: 0,
      createdAt: new Date().toISOString(),
      cards: [],
    };
    saveDecks([deck, ...decks]);
    return publicDeck(deck);
  });
}

export function useUpdateCustomDeck() {
  return asMutation<{ id: number; data: Partial<CustomDeckInput> }, CustomDeckDetail | undefined>(({ id, data }) => {
    const decks = getDecks();
    const nextDecks = decks.map((deck) =>
      deck.id === id
        ? { ...deck, name: data.name ?? deck.name, description: data.description ?? deck.description }
        : deck,
    );
    saveDecks(nextDecks);
    return nextDecks.find((deck) => deck.id === id);
  });
}

export function useDeleteCustomDeck() {
  return asMutation<{ id: number }, void>(({ id }) => {
    saveDecks(getDecks().filter((deck) => deck.id !== id));
  });
}

export function useCreateCustomCard() {
  return asMutation<{ id: number; data: CustomCardInput }, CustomCard | undefined>(({ id, data }) => {
    const decks = getDecks();
    let created: CustomCard | undefined;
    const nextDecks = decks.map((deck) => {
      if (deck.id !== id) return deck;
      created = {
        id: nextId(deck.cards),
        deckId: id,
        name: data.name,
        glyph: data.glyph || "✨",
        imageUrl: data.imageUrl ?? null,
        uprightMeaning: data.uprightMeaning ?? "",
        reversedMeaning: data.reversedMeaning ?? "",
        uprightKeywords: data.uprightKeywords ?? [],
        reversedKeywords: data.reversedKeywords ?? [],
        reflection: data.reflection ?? null,
        position: deck.cards.length,
      };
      return { ...deck, cards: [...deck.cards, created] };
    });
    saveDecks(nextDecks);
    return created;
  });
}

export function useUpdateCustomCard() {
  return asMutation<{ id: number; cardId: number; data: CustomCardInput }, CustomCard | undefined>(({ id, cardId, data }) => {
    const decks = getDecks();
    let updated: CustomCard | undefined;
    const nextDecks = decks.map((deck) => {
      if (deck.id !== id) return deck;
      return {
        ...deck,
        cards: deck.cards.map((card) => {
          if (card.id !== cardId) return card;
          updated = {
            ...card,
            name: data.name,
            glyph: data.glyph || "✨",
            imageUrl: data.imageUrl ?? null,
            uprightMeaning: data.uprightMeaning ?? "",
            reversedMeaning: data.reversedMeaning ?? "",
            uprightKeywords: data.uprightKeywords ?? [],
            reversedKeywords: data.reversedKeywords ?? [],
            reflection: data.reflection ?? null,
          };
          return updated;
        }),
      };
    });
    saveDecks(nextDecks);
    return updated;
  });
}

export function useDeleteCustomCard() {
  return asMutation<{ id: number; cardId: number }, void>(({ id, cardId }) => {
    const nextDecks = getDecks().map((deck) =>
      deck.id === id
        ? {
            ...deck,
            cards: deck.cards
              .filter((card) => card.id !== cardId)
              .map((card, index) => ({ ...card, position: index })),
          }
        : deck,
    );
    saveDecks(nextDecks);
  });
}
