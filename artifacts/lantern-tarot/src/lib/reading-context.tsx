import { createContext, useContext, useState, ReactNode } from "react";
import { DrawnCard, Spread, TarotCard } from "./reading-engine";

interface ReadingState {
  spread: Spread | null;
  question: string;
  focus: string;
  deckMode: string;
  includeReversed: boolean;
  drawnCards: DrawnCard[];
  synthesis: string;
  customDeckId: number | null;
  customDeckName: string;
  customCards: TarotCard[];
}

interface ReadingContextValue extends ReadingState {
  setSpread: (s: Spread) => void;
  setQuestion: (q: string) => void;
  setFocus: (f: string) => void;
  setDeckMode: (d: string) => void;
  setIncludeReversed: (r: boolean) => void;
  setDrawnCards: (cards: DrawnCard[]) => void;
  setSynthesis: (s: string) => void;
  setCustomDeck: (id: number | null, name: string, cards: TarotCard[]) => void;
  reset: () => void;
}

const defaultState: ReadingState = {
  spread: null,
  question: "",
  focus: "general",
  deckMode: "tarot",
  includeReversed: true,
  drawnCards: [],
  synthesis: "",
  customDeckId: null,
  customDeckName: "",
  customCards: [],
};

export const ReadingContext = createContext<ReadingContextValue>({
  ...defaultState,
  setSpread: () => {},
  setQuestion: () => {},
  setFocus: () => {},
  setDeckMode: () => {},
  setIncludeReversed: () => {},
  setDrawnCards: () => {},
  setSynthesis: () => {},
  setCustomDeck: () => {},
  reset: () => {},
});

export function ReadingProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<ReadingState>(defaultState);

  const setSpread = (spread: Spread) => setState((s) => ({ ...s, spread }));
  const setQuestion = (question: string) => setState((s) => ({ ...s, question }));
  const setFocus = (focus: string) => setState((s) => ({ ...s, focus }));
  const setDeckMode = (deckMode: string) => setState((s) => ({ ...s, deckMode }));
  const setIncludeReversed = (includeReversed: boolean) => setState((s) => ({ ...s, includeReversed }));
  const setDrawnCards = (drawnCards: DrawnCard[]) => setState((s) => ({ ...s, drawnCards }));
  const setSynthesis = (synthesis: string) => setState((s) => ({ ...s, synthesis }));
  const setCustomDeck = (id: number | null, name: string, cards: TarotCard[]) =>
    setState((s) => ({ ...s, customDeckId: id, customDeckName: name, customCards: cards }));
  const reset = () => setState(defaultState);

  return (
    <ReadingContext.Provider
      value={{
        ...state,
        setSpread,
        setQuestion,
        setFocus,
        setDeckMode,
        setIncludeReversed,
        setDrawnCards,
        setSynthesis,
        setCustomDeck,
        reset,
      }}
    >
      {children}
    </ReadingContext.Provider>
  );
}

export function useReading() {
  return useContext(ReadingContext);
}
