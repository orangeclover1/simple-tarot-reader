import { Layout } from "@/components/layout";
import { useLocation, Link } from "wouter";
import { useReading } from "@/lib/reading-context";
import { cardMeaning, cardKeywords, orientation, getCardGradient, getCardAccent, FEELINGS } from "@/lib/reading-engine";
import { useCreateReading } from "@workspace/api-client-react";
import { useState, useMemo } from "react";
import { cn } from "@/lib/utils";
import { ChevronLeft, Save, RefreshCw, Check } from "lucide-react";

function decisionVerdict(cards: any[]): { label: string; icon: string; color: string; sub: string } {
  const yesScores: Record<string, number> = { Yes: 1, Maybe: 0, No: -1 };
  const total = cards.reduce(
    (sum, c) => sum + (yesScores[c.card.yes_no] ?? 0) * (c.isReversed ? -1 : 1),
    0
  );
  if (total >= 2) return { label: "Yes", icon: "✦", color: "text-emerald-400", sub: "Energy supports moving forward" };
  if (total <= -2) return { label: "No", icon: "◇", color: "text-rose-400", sub: "Energy suggests caution or waiting" };
  return { label: "Maybe", icon: "◈", color: "text-amber-400", sub: "Mixed signals — trust your deeper instinct" };
}

export default function Result() {
  const [, navigate] = useLocation();
  const ctx = useReading();
  const createReading = useCreateReading();
  const [selectedFeelings, setSelectedFeelings] = useState<string[]>([]);
  const [notes, setNotes] = useState("");
  const [saved, setSaved] = useState(false);
  const [saving, setSaving] = useState(false);

  const cards = ctx.drawnCards;
  const spread = ctx.spread;

  const verdict = useMemo(
    () => (spread?.id === "decision-maker" ? decisionVerdict(cards) : null),
    [spread, cards]
  );

  if (!cards.length || !spread) {
    navigate("/read");
    return null;
  }

  const toggleFeeling = (f: string) => {
    setSelectedFeelings((prev) =>
      prev.includes(f) ? prev.filter((x) => x !== f) : [...prev, f]
    );
  };

  const handleSave = async () => {
    if (saved) return;
    setSaving(true);
    try {
      await createReading.mutateAsync({
        data: {
          spreadId: spread.id,
          spreadName: spread.name,
          ...(ctx.question ? { question: ctx.question } : {}),
          focus: ctx.focus,
          deckMode: ctx.deckMode,
          synthesis: ctx.synthesis || undefined,
          feelings: selectedFeelings,
          ...(notes ? { notes } : {}),
          cards: cards.map((dc) => ({
            cardId: dc.card.id,
            cardName: dc.card.name,
            positionName: dc.position.name,
            reversed: dc.isReversed,
          })),
        },
      });
      setSaved(true);
    } catch (e) {
      console.error(e);
    } finally {
      setSaving(false);
    }
  };

  const handleNewReading = () => {
    ctx.reset();
    navigate("/read");
  };

  return (
    <Layout hideNav>
      <div className="flex flex-col p-5 gap-5 pb-8">
        {/* Header */}
        <div className="pt-6 flex items-center gap-3">
          <button onClick={() => navigate(-1 as any)} className="text-muted-foreground hover:text-foreground transition-colors">
            <ChevronLeft className="w-5 h-5" />
          </button>
          <div>
            <div className="text-xs text-muted-foreground uppercase tracking-widest">{spread.icon} {spread.name}</div>
            <h1 className="text-lg font-semibold">Your Reading</h1>
          </div>
        </div>

        {/* Question */}
        {ctx.question && (
          <div className="bg-card border border-border rounded-xl px-4 py-3">
            <p className="text-xs text-muted-foreground mb-1">Question</p>
            <p className="text-sm italic">{ctx.question}</p>
          </div>
        )}

        {/* Decision Maker verdict banner */}
        {verdict && (
          <div className="bg-card border border-border rounded-2xl overflow-hidden">
            <div className="flex flex-col items-center justify-center gap-2 py-7 px-4">
              <div className={cn("text-6xl font-bold tracking-tight", verdict.color)}>
                {verdict.icon} {verdict.label}
              </div>
              <p className="text-sm text-muted-foreground text-center">{verdict.sub}</p>
            </div>
            <div className="border-t border-border px-4 py-3 bg-muted/30">
              <p className="text-[11px] text-muted-foreground text-center italic">
                This is a reflective aid — use it alongside your own judgment.
              </p>
            </div>
          </div>
        )}

        {/* Cards */}
        <div className="space-y-4">
          {cards.map((dc, i) => {
            const meaning = cardMeaning(dc.card, dc.isReversed, ctx.focus);
            const keywords = cardKeywords(dc.card, dc.isReversed);
            const orient = orientation(dc);
            return (
              <div key={i} className="bg-card border border-border rounded-xl overflow-hidden">
                <div className={cn("flex items-center gap-4 p-4 bg-gradient-to-r", getCardGradient(dc.card))}>
                  <div className="w-14 h-20 rounded-lg border border-white/10 flex flex-col items-center justify-center gap-1 bg-black/20 flex-shrink-0">
                    <span className={cn("text-2xl", dc.isReversed && "rotate-180 inline-block")}>{dc.card.glyph || "✦"}</span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="text-[10px] text-white/60 uppercase tracking-widest mb-0.5">{dc.position.name}</div>
                    <div className={cn("font-semibold text-base leading-tight", getCardAccent(dc.card))}>{dc.card.name}</div>
                    <div className="text-xs text-white/60 mt-0.5">{orient}</div>
                    {dc.card.arcana && (
                      <div className="text-[10px] text-white/40 mt-0.5 capitalize">
                        {dc.card.arcana === "major" ? "Major Arcana" : `${dc.card.suit ? dc.card.suit.charAt(0).toUpperCase() + dc.card.suit.slice(1) : ""} · Minor Arcana`}
                      </div>
                    )}
                  </div>
                  <Link href={`/card/${dc.card.id}`} className="text-[10px] text-white/40 hover:text-white/70 transition-colors flex-shrink-0">
                    Details →
                  </Link>
                </div>
                <div className="px-4 pt-3">
                  <p className="text-[11px] text-muted-foreground italic">"{dc.position.prompt}"</p>
                </div>
                {keywords.length > 0 && (
                  <div className="px-4 pt-2 flex flex-wrap gap-1.5">
                    {keywords.slice(0, 5).map((kw) => (
                      <span key={kw} className="text-[10px] bg-muted text-muted-foreground px-2 py-0.5 rounded-full">{kw}</span>
                    ))}
                  </div>
                )}
                <div className="px-4 pt-3 pb-4">
                  <p className="text-sm text-foreground leading-relaxed">{meaning}</p>
                </div>
              </div>
            );
          })}
        </div>

        {/* Synthesis */}
        {ctx.synthesis && (
          <div className="bg-card border border-primary/30 rounded-xl p-4 space-y-2">
            <h3 className="text-xs font-semibold uppercase tracking-widest text-primary">Overall Reading</h3>
            <p className="text-sm text-foreground leading-relaxed">{ctx.synthesis}</p>
          </div>
        )}

        {/* How do you feel? */}
        <div className="space-y-3">
          <h3 className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">How does this reading feel?</h3>
          <div className="flex flex-wrap gap-2">
            {FEELINGS.map((f) => (
              <button
                key={f}
                onClick={() => toggleFeeling(f)}
                className={cn(
                  "px-3 py-1.5 rounded-full text-xs border transition-colors",
                  selectedFeelings.includes(f)
                    ? "bg-primary text-primary-foreground border-primary"
                    : "bg-card border-border text-muted-foreground hover:border-primary/50"
                )}
              >
                {f}
              </button>
            ))}
          </div>
        </div>

        {/* Notes */}
        <div className="space-y-2">
          <h3 className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">Notes</h3>
          <textarea
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            className="w-full bg-card border border-border rounded-xl p-4 text-sm text-foreground placeholder:text-muted-foreground/60 focus:outline-none focus:ring-1 focus:ring-primary resize-none"
            placeholder="What insight is the reading prompting you to explore?"
            rows={3}
          />
        </div>

        {/* Actions */}
        <div className="flex flex-col gap-2">
          <button
            onClick={handleSave}
            disabled={saved || saving}
            className={cn(
              "w-full flex items-center justify-center gap-2 py-4 rounded-xl font-semibold text-sm transition-all",
              saved
                ? "bg-green-900/50 text-green-300 border border-green-800 cursor-default"
                : "bg-primary text-primary-foreground hover:opacity-90 active:scale-[0.98]"
            )}
          >
            {saved ? <><Check className="w-4 h-4" /> Saved to Journal</> : <><Save className="w-4 h-4" /> {saving ? "Saving…" : "Save to Journal"}</>}
          </button>
          <button
            onClick={handleNewReading}
            className="w-full flex items-center justify-center gap-2 py-3 rounded-xl border border-border text-sm text-muted-foreground hover:text-foreground hover:border-primary/40 transition-colors"
          >
            <RefreshCw className="w-4 h-4" />
            New Reading
          </button>
        </div>
      </div>
    </Layout>
  );
}
