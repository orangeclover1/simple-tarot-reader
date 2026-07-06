import { Layout } from "@/components/layout";
import { useParams, useLocation } from "wouter";
import { useReading } from "@/lib/reading-context";
import { SPREADS, FOCUS_OPTIONS, drawReading, synthesize, customCardToTarotCard } from "@/lib/reading-engine";
import { useListCustomDecks, useGetCustomDeck } from "@workspace/api-client-react";
import { cn } from "@/lib/utils";
import { ChevronLeft, Shuffle, Plus } from "lucide-react";
import { Link } from "wouter";
import { useState } from "react";

export default function ConfigureSpread() {
  const { spreadId } = useParams<{ spreadId: string }>();
  const [, navigate] = useLocation();
  const ctx = useReading();

  const spread = SPREADS.find((s) => s.id === spreadId);

  const { data: customDecks = [] } = useListCustomDecks();
  const [pickedDeckId, setPickedDeckId] = useState<number | null>(ctx.customDeckId);
  const { data: pickedDeckDetail } = useGetCustomDeck(pickedDeckId ?? 0);

  if (!spread) {
    return (
      <Layout>
        <div className="p-6 space-y-4 pt-12">
          <p className="text-muted-foreground text-center">Spread not found.</p>
          <Link href="/read" className="block text-center text-primary">← Back to spreads</Link>
        </div>
      </Layout>
    );
  }

  const handleDraw = () => {
    let customCards = ctx.customCards;
    let customDeckName = ctx.customDeckName;

    if (ctx.deckMode === "custom" && pickedDeckId !== null && pickedDeckDetail) {
      customCards = pickedDeckDetail.cards.map(customCardToTarotCard);
      customDeckName = pickedDeckDetail.name;
      ctx.setCustomDeck(pickedDeckId, customDeckName, customCards);
    }

    ctx.setSpread(spread);
    const drawn = drawReading(spread, ctx.deckMode, ctx.includeReversed, customCards);
    ctx.setDrawnCards(drawn);
    const syn = synthesize(drawn, ctx.focus, ctx.deckMode, spread.id);
    ctx.setSynthesis(syn);
    navigate("/draw");
  };

  const canDraw =
    ctx.deckMode !== "custom" ||
    (pickedDeckId !== null && (pickedDeckDetail?.cards.length ?? 0) >= 2);

  const deckModes: [string, string][] = [
    ["tarot", "Tarot"],
    ["oracle", "Oracle"],
    ["mixed", "Mixed"],
    ["custom", "My Deck"],
  ];

  return (
    <Layout hideNav>
      <div className="flex flex-col min-h-[100dvh] p-5 gap-5">
        {/* Back + title */}
        <div className="pt-6 flex items-center gap-3">
          <Link href="/read" className="text-muted-foreground hover:text-foreground transition-colors">
            <ChevronLeft className="w-5 h-5" />
          </Link>
          <div>
            <div className="text-xs text-muted-foreground uppercase tracking-widest">{spread.icon} {spread.name}</div>
            <h1 className="text-lg font-semibold">Set Your Intention</h1>
          </div>
        </div>

        {/* Spread positions preview */}
        <div className="flex gap-1.5 flex-wrap">
          {spread.positions.map((pos, i) => (
            <div key={i} className="text-xs bg-muted text-muted-foreground px-2.5 py-1 rounded-full">
              {pos.name}
            </div>
          ))}
        </div>

        {/* Question */}
        <div className="space-y-2">
          <label className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">
            Question or intention
          </label>
          <textarea
            value={ctx.question}
            onChange={(e) => ctx.setQuestion(e.target.value)}
            className="w-full bg-card border border-border rounded-xl p-4 text-sm text-foreground placeholder:text-muted-foreground/60 focus:outline-none focus:ring-1 focus:ring-primary resize-none"
            placeholder="Hold a question in mind, or leave it open…"
            rows={3}
          />
        </div>

        {/* Focus lens */}
        <div className="space-y-2">
          <label className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">
            Focus lens
          </label>
          <div className="flex flex-wrap gap-2">
            {Object.entries(FOCUS_OPTIONS).map(([key, label]) => (
              <button
                key={key}
                onClick={() => ctx.setFocus(key)}
                className={cn(
                  "px-3 py-1.5 rounded-full text-sm border transition-colors",
                  ctx.focus === key
                    ? "bg-primary text-primary-foreground border-primary"
                    : "bg-card border-border text-muted-foreground hover:border-primary/50 hover:text-foreground"
                )}
              >
                {label}
              </button>
            ))}
          </div>
        </div>

        {/* Deck mode */}
        <div className="space-y-2">
          <label className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">
            Deck
          </label>
          <div className="flex gap-2 flex-wrap">
            {deckModes.map(([k, l]) => (
              <button
                key={k}
                onClick={() => ctx.setDeckMode(k)}
                className={cn(
                  "flex-1 py-2 rounded-xl text-sm border transition-colors min-w-[4rem]",
                  ctx.deckMode === k
                    ? "bg-primary text-primary-foreground border-primary"
                    : "bg-card border-border text-muted-foreground hover:border-primary/50"
                )}
              >
                {l}
              </button>
            ))}
          </div>

          {/* Custom deck selector */}
          {ctx.deckMode === "custom" && (
            <div className="mt-2 space-y-2">
              {customDecks.length === 0 ? (
                <div className="bg-muted/60 rounded-xl px-4 py-3 flex items-center justify-between gap-3">
                  <p className="text-xs text-muted-foreground">No custom decks yet.</p>
                  <Link
                    href="/custom-decks"
                    className="flex items-center gap-1 text-xs text-primary hover:underline flex-shrink-0"
                  >
                    <Plus className="w-3 h-3" />
                    Create one
                  </Link>
                </div>
              ) : (
                <>
                  <p className="text-xs text-muted-foreground">Pick a deck to read from:</p>
                  <div className="space-y-1.5">
                    {customDecks.map((deck) => (
                      <button
                        key={deck.id}
                        onClick={() => setPickedDeckId(deck.id)}
                        className={cn(
                          "w-full flex items-center gap-3 px-3 py-2.5 rounded-xl border text-left transition-colors",
                          pickedDeckId === deck.id
                            ? "border-primary bg-primary/10"
                            : "border-border bg-card hover:border-primary/50"
                        )}
                      >
                        <span className="text-xl">🃏</span>
                        <div className="flex-1 min-w-0">
                          <div className="text-sm font-medium truncate">{deck.name}</div>
                          <div className="text-xs text-muted-foreground">
                            {deck.cardCount} {deck.cardCount === 1 ? "card" : "cards"}
                            {deck.cardCount < 2 && " — needs at least 2"}
                          </div>
                        </div>
                        {pickedDeckId === deck.id && (
                          <div className="w-2 h-2 rounded-full bg-primary flex-shrink-0" />
                        )}
                      </button>
                    ))}
                  </div>
                  <Link
                    href="/custom-decks"
                    className="flex items-center gap-1 text-xs text-muted-foreground hover:text-primary transition-colors"
                  >
                    <Plus className="w-3 h-3" />
                    Manage decks
                  </Link>
                </>
              )}
            </div>
          )}
        </div>

        {/* Reversed toggle */}
        <div className="flex items-center justify-between bg-card border border-border rounded-xl px-4 py-3">
          <div>
            <div className="text-sm font-medium">Include reversed cards</div>
            <div className="text-xs text-muted-foreground">Adds shadow &amp; complexity to readings</div>
          </div>
          <button
            onClick={() => ctx.setIncludeReversed(!ctx.includeReversed)}
            className={cn(
              "relative w-11 h-6 rounded-full transition-colors flex-shrink-0",
              ctx.includeReversed ? "bg-primary" : "bg-muted"
            )}
          >
            <span
              className={cn(
                "absolute top-0.5 left-0.5 w-5 h-5 rounded-full bg-white shadow transition-transform",
                ctx.includeReversed && "translate-x-5"
              )}
            />
          </button>
        </div>

        <div className="flex-1" />

        <button
          onClick={handleDraw}
          disabled={!canDraw}
          className={cn(
            "w-full font-semibold py-4 rounded-xl flex items-center justify-center gap-2 transition-all",
            canDraw
              ? "bg-primary text-primary-foreground hover:opacity-90 active:scale-[0.98]"
              : "bg-muted text-muted-foreground cursor-not-allowed"
          )}
        >
          <Shuffle className="w-4 h-4" />
          Shuffle &amp; Draw
        </button>
      </div>
    </Layout>
  );
}
