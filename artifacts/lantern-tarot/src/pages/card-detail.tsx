import { Layout } from "@/components/layout";
import { useParams } from "wouter";
import { Link } from "wouter";
import { TAROT_CARDS, ORACLE_CARDS, getCardGradient, getCardAccent } from "@/lib/reading-engine";
import { cn } from "@/lib/utils";
import { ChevronLeft } from "lucide-react";

function InfoRow({ label, value }: { label: string; value?: string | null }) {
  if (!value) return null;
  return (
    <div className="flex items-start gap-3 py-3 border-b border-border last:border-none">
      <span className="text-xs text-muted-foreground w-20 flex-shrink-0 pt-0.5 uppercase tracking-wide">{label}</span>
      <span className="text-sm capitalize">{value}</span>
    </div>
  );
}

export default function CardDetail() {
  const { id } = useParams<{ id: string }>();
  const card = [...TAROT_CARDS, ...ORACLE_CARDS].find((c) => c.id === id);

  if (!card) {
    return (
      <Layout>
        <div className="p-6 pt-12 space-y-4 text-center">
          <p className="text-muted-foreground">Card not found.</p>
          <Link href="/library" className="text-primary text-sm">← Back to Library</Link>
        </div>
      </Layout>
    );
  }

  return (
    <Layout hideNav>
      <div className="flex flex-col pb-8">
        {/* Hero */}
        <div className={cn("relative p-6 pt-12 pb-8 flex flex-col items-center gap-3 bg-gradient-to-b", getCardGradient(card))}>
          <Link href="/library" className="absolute top-6 left-5 text-white/60 hover:text-white transition-colors">
            <ChevronLeft className="w-5 h-5" />
          </Link>
          <div className="w-24 h-36 rounded-xl border border-white/10 bg-black/20 flex items-center justify-center">
            <span className="text-5xl">{card.glyph || "✦"}</span>
          </div>
          <h1 className={cn("text-2xl font-semibold text-center", getCardAccent(card))}>{card.name}</h1>
          <div className="flex gap-2 flex-wrap justify-center">
            {card.arcana && (
              <span className="text-xs bg-black/20 text-white/70 px-3 py-1 rounded-full capitalize">
                {card.arcana === "major" ? "Major Arcana" : "Minor Arcana"}
              </span>
            )}
            {card.suit && (
              <span className="text-xs bg-black/20 text-white/70 px-3 py-1 rounded-full capitalize">{card.suit}</span>
            )}
            {card.element && (
              <span className="text-xs bg-black/20 text-white/70 px-3 py-1 rounded-full">{card.element}</span>
            )}
          </div>
        </div>

        <div className="p-5 space-y-6">
          {/* Upright */}
          <section className="space-y-3">
            <h2 className="text-xs font-semibold uppercase tracking-widest text-primary">Upright</h2>
            {card.upright_keywords?.length > 0 && (
              <div className="flex flex-wrap gap-1.5">
                {card.upright_keywords.map((kw) => (
                  <span key={kw} className="text-xs bg-muted text-muted-foreground px-2.5 py-1 rounded-full">{kw}</span>
                ))}
              </div>
            )}
            <p className="text-sm text-foreground leading-relaxed">{card.upright_meaning}</p>
          </section>

          {/* Reversed */}
          {card.reversed_meaning && (
            <section className="space-y-3">
              <h2 className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">Reversed</h2>
              {card.reversed_keywords?.length > 0 && (
                <div className="flex flex-wrap gap-1.5">
                  {card.reversed_keywords.map((kw) => (
                    <span key={kw} className="text-xs bg-muted text-muted-foreground px-2.5 py-1 rounded-full">{kw}</span>
                  ))}
                </div>
              )}
              <p className="text-sm text-foreground leading-relaxed">{card.reversed_meaning}</p>
            </section>
          )}

          {/* Reflection */}
          {card.reflection && (
            <section className="bg-card border border-border rounded-xl p-4 space-y-2">
              <h2 className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">Reflection</h2>
              <p className="text-sm italic text-foreground leading-relaxed">"{card.reflection}"</p>
            </section>
          )}

          {/* Symbolism */}
          {card.symbolism?.length > 0 && (
            <section className="space-y-2">
              <h2 className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">Symbolism</h2>
              <div className="flex flex-wrap gap-1.5">
                {card.symbolism.map((sym) => (
                  <span key={sym} className="text-xs bg-muted text-muted-foreground px-2.5 py-1 rounded-full">{sym}</span>
                ))}
              </div>
            </section>
          )}

          {/* Details table */}
          <section className="bg-card border border-border rounded-xl px-4">
            <InfoRow label="Astrology" value={card.astrology} />
            <InfoRow label="Element" value={card.element} />
            <InfoRow label="Yes / No" value={card.yes_no} />
            {card.deck_type === "tarot" && card.arcana === "minor" && (
              <InfoRow label="Suit" value={card.suit} />
            )}
            {card.deck_type === "oracle" && (
              <InfoRow label="Type" value="Oracle Card" />
            )}
          </section>

          {/* Yes/No advice */}
          {card.yes_no_advice && (
            <section className="space-y-2">
              <h2 className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">Yes/No Guidance</h2>
              <p className="text-sm text-foreground leading-relaxed">{card.yes_no_advice}</p>
            </section>
          )}
        </div>
      </div>
    </Layout>
  );
}
