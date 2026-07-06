import { Layout } from "@/components/layout";
import { useLocation } from "wouter";
import { useReading } from "@/lib/reading-context";
import { getCardGradient, getCardAccent } from "@/lib/reading-engine";
import { useTheme } from "@/lib/theme-context";
import { getCardBack } from "@/lib/card-backs";
import { useState } from "react";
import { cn } from "@/lib/utils";
import { Eye, ArrowRight } from "lucide-react";

function CardTile({
  dc,
  index,
  isRevealed,
  onReveal,
  compact,
  cardBackUrl,
}: {
  dc: any;
  index: number;
  isRevealed: boolean;
  onReveal: (i: number) => void;
  compact?: boolean;
  cardBackUrl: string;
}) {
  return (
    <div className="flex flex-col items-center gap-1">
      <span
        className={cn(
          "text-muted-foreground text-center leading-tight px-0.5",
          compact ? "text-[9px]" : "text-[10px]"
        )}
      >
        {dc.position.name}
      </span>

      {/* Flip card container */}
      <div
        className="relative w-full aspect-[2/3] cursor-pointer"
        style={{ perspective: "800px", minHeight: compact ? 56 : 72 }}
        onClick={() => !isRevealed && onReveal(index)}
      >
        <div
          className="relative w-full h-full transition-transform duration-700"
          style={{
            transformStyle: "preserve-3d",
            transform: isRevealed ? "rotateY(180deg)" : "rotateY(0deg)",
          }}
        >
          {/* Back face — pixel card art */}
          <div
            className="absolute inset-0 rounded-xl overflow-hidden border border-border/60"
            style={{ backfaceVisibility: "hidden" }}
          >
            <img
              src={cardBackUrl}
              alt="Card back"
              className="w-full h-full object-cover"
              style={{ imageRendering: "pixelated" }}
              draggable={false}
            />
            {/* Subtle hover shimmer */}
            {!isRevealed && (
              <div className="absolute inset-0 bg-white/0 hover:bg-white/5 transition-colors rounded-xl" />
            )}
          </div>

          {/* Front face — card identity */}
          <div
            className={cn(
              "absolute inset-0 rounded-xl border border-primary/50 bg-gradient-to-b flex flex-col items-center justify-center gap-1 p-1.5",
              getCardGradient(dc.card)
            )}
            style={{ backfaceVisibility: "hidden", transform: "rotateY(180deg)" }}
          >
            <span
              className={cn(
                dc.isReversed && "rotate-180 inline-block",
                compact ? "text-lg" : "text-2xl"
              )}
            >
              {dc.card.glyph || "✦"}
            </span>
            <span
              className={cn(
                "font-medium text-center leading-tight",
                getCardAccent(dc.card),
                compact ? "text-[8px]" : "text-[10px]"
              )}
            >
              {dc.card.name}
            </span>
            {dc.isReversed && (
              <span className="text-[7px] text-white/40">rev.</span>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

// Celtic Cross special layout (10 cards)
function CelticCrossLayout({
  cards,
  revealed,
  onReveal,
  cardBackUrl,
}: {
  cards: any[];
  revealed: Set<number>;
  onReveal: (i: number) => void;
  cardBackUrl: string;
}) {
  const crossSlots: (number | null)[] = [
    null, 4, null, null,
    3,    0, 5,    null,
    null, 2, null, null,
  ];

  return (
    <div className="flex gap-3 flex-1">
      {/* Cross (3 cols × 4 rows) */}
      <div
        className="grid grid-cols-3 gap-1.5 flex-1"
        style={{ gridTemplateRows: "repeat(4, 1fr)" }}
      >
        {crossSlots.map((idx, slot) => {
          if (idx === null) return <div key={slot} />;
          if (idx === 0) {
            return (
              <div key={slot} className="relative">
                <CardTile
                  dc={cards[0]}
                  index={0}
                  isRevealed={revealed.has(0)}
                  onReveal={onReveal}
                  compact
                  cardBackUrl={cardBackUrl}
                />
                {/* Challenge card rotated 90° on top */}
                <div
                  className="absolute inset-0 flex items-center justify-center"
                  style={{ pointerEvents: revealed.has(1) ? "none" : "auto" }}
                  onClick={() => !revealed.has(1) && onReveal(1)}
                >
                  <div
                    className="w-[85%] h-[85%] rounded-xl overflow-hidden border border-secondary/60"
                    style={{
                      transform: "rotate(90deg)",
                      opacity: revealed.has(1) ? 0 : 0.92,
                      imageRendering: "pixelated",
                    }}
                  >
                    <img
                      src={cardBackUrl}
                      alt="Challenge card"
                      className="w-full h-full object-cover"
                      style={{ imageRendering: "pixelated" }}
                      draggable={false}
                    />
                  </div>
                  {revealed.has(1) && (
                    <div
                      className={cn(
                        "absolute w-[85%] h-[85%] rounded-xl border border-secondary/50 bg-gradient-to-b flex items-center justify-center",
                        getCardGradient(cards[1].card)
                      )}
                      style={{ transform: "rotate(90deg)" }}
                    >
                      <span
                        className="text-[8px] font-medium text-center leading-none px-1"
                        style={{ transform: "rotate(-90deg)" }}
                      >
                        {cards[1].card.name}
                      </span>
                    </div>
                  )}
                </div>
              </div>
            );
          }
          return (
            <CardTile
              key={slot}
              dc={cards[idx]}
              index={idx}
              isRevealed={revealed.has(idx)}
              onReveal={onReveal}
              compact
              cardBackUrl={cardBackUrl}
            />
          );
        })}
      </div>

      {/* Staff (4 cards vertical) */}
      <div className="flex flex-col gap-1.5 w-[28%]">
        {[9, 8, 7, 6].map((idx) => (
          <CardTile
            key={idx}
            dc={cards[idx]}
            index={idx}
            isRevealed={revealed.has(idx)}
            onReveal={onReveal}
            compact
            cardBackUrl={cardBackUrl}
          />
        ))}
      </div>
    </div>
  );
}

function standardGrid(count: number) {
  if (count === 1) return "grid-cols-1 max-w-[160px] mx-auto";
  if (count <= 3) return "grid-cols-3";
  if (count === 4) return "grid-cols-2";
  return "grid-cols-3";
}

export default function Draw() {
  const [, navigate] = useLocation();
  const ctx = useReading();
  const { theme } = useTheme();
  const [revealed, setRevealed] = useState<Set<number>>(new Set());

  const cards = ctx.drawnCards;
  const allRevealed = revealed.size === cards.length;
  const cardBackUrl = getCardBack(theme);

  if (!cards.length) {
    navigate("/read");
    return null;
  }

  const revealCard = (i: number) => {
    setRevealed((prev) => new Set([...prev, i]));
  };

  const revealAll = () => {
    setRevealed(new Set(cards.map((_, i) => i)));
  };

  const isCeltic = ctx.spread?.id === "celtic";

  return (
    <Layout hideNav>
      <div className="flex flex-col min-h-[100dvh] p-4 gap-3">
        {/* Header */}
        <div className="pt-5 flex items-center gap-3">
          <button
            onClick={() => navigate(-1 as any)}
            className="text-muted-foreground hover:text-foreground transition-colors text-sm"
          >
            ←
          </button>
          <div>
            <div className="text-xs text-muted-foreground uppercase tracking-widest">
              {ctx.spread?.icon} {ctx.spread?.name}
            </div>
            <h1 className="text-base font-semibold">Your Cards</h1>
          </div>
          <div className="ml-auto text-xs text-muted-foreground tabular-nums">
            {revealed.size}/{cards.length} revealed
          </div>
        </div>

        {ctx.question && (
          <div className="bg-card border border-border rounded-xl px-3 py-2">
            <p className="text-xs text-muted-foreground italic line-clamp-2">
              {ctx.question}
            </p>
          </div>
        )}

        <p className="text-xs text-muted-foreground text-center">
          {!allRevealed ? "Tap a card to flip it" : "All revealed — read your cards below"}
        </p>

        {/* Card layout */}
        {isCeltic ? (
          <CelticCrossLayout
            cards={cards}
            revealed={revealed}
            onReveal={revealCard}
            cardBackUrl={cardBackUrl}
          />
        ) : (
          <div className={cn("grid gap-2 flex-1 content-start", standardGrid(cards.length))}>
            {cards.map((dc, i) => (
              <CardTile
                key={i}
                dc={dc}
                index={i}
                isRevealed={revealed.has(i)}
                onReveal={revealCard}
                cardBackUrl={cardBackUrl}
              />
            ))}
          </div>
        )}

        {/* Actions */}
        <div className="flex flex-col gap-2 pb-2">
          {!allRevealed && (
            <button
              onClick={revealAll}
              className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl border border-border text-sm text-muted-foreground hover:text-foreground hover:border-primary/40 transition-colors"
            >
              <Eye className="w-4 h-4" />
              Reveal all
            </button>
          )}
          <button
            onClick={() => navigate("/result")}
            disabled={!allRevealed}
            className={cn(
              "w-full flex items-center justify-center gap-2 py-4 rounded-xl font-semibold text-sm transition-all",
              allRevealed
                ? "bg-primary text-primary-foreground hover:opacity-90 active:scale-[0.98]"
                : "bg-muted text-muted-foreground cursor-not-allowed"
            )}
          >
            Read the Cards
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </Layout>
  );
}
