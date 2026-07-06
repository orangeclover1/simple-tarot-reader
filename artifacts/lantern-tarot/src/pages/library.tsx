import { Layout } from "@/components/layout";
import { Link } from "wouter";
import { TAROT_CARDS, ORACLE_CARDS, getCardGradient, getCardAccent } from "@/lib/reading-engine";
import { cn } from "@/lib/utils";
import { useState, useMemo } from "react";
import { Search, Layers } from "lucide-react";

type Filter = "all" | "major" | "wands" | "cups" | "swords" | "pentacles" | "oracle";

const FILTERS: { key: Filter; label: string }[] = [
  { key: "all", label: "All" },
  { key: "major", label: "Major Arcana" },
  { key: "wands", label: "Wands" },
  { key: "cups", label: "Cups" },
  { key: "swords", label: "Swords" },
  { key: "pentacles", label: "Pentacles" },
  { key: "oracle", label: "Oracle" },
];

export default function Library() {
  const [filter, setFilter] = useState<Filter>("all");
  const [query, setQuery] = useState("");

  const allCards = useMemo(() => {
    const tarot = TAROT_CARDS.map((c) => ({ ...c, _src: "tarot" as const }));
    const oracle = ORACLE_CARDS.map((c) => ({ ...c, _src: "oracle" as const }));
    return [...tarot, ...oracle];
  }, []);

  const filtered = useMemo(() => {
    let list = allCards;
    if (filter === "major") list = list.filter((c) => c.arcana === "major" && c.deck_type === "tarot");
    else if (filter === "oracle") list = list.filter((c) => c.deck_type === "oracle");
    else if (filter !== "all") list = list.filter((c) => c.suit?.toLowerCase() === filter);
    if (query.trim()) {
      const q = query.toLowerCase();
      list = list.filter(
        (c) =>
          c.name.toLowerCase().includes(q) ||
          c.upright_keywords?.some((k) => k.toLowerCase().includes(q)) ||
          c.suit?.toLowerCase().includes(q)
      );
    }
    return list;
  }, [allCards, filter, query]);

  return (
    <Layout>
      <div className="p-5 space-y-5">
        <header className="pt-6 flex items-start justify-between gap-3">
          <div>
            <h1 className="text-2xl font-semibold">Card Library</h1>
            <p className="text-sm text-muted-foreground mt-0.5">{allCards.length} cards total</p>
          </div>
          <Link
            href="/custom-decks"
            className="flex items-center gap-1.5 text-xs text-muted-foreground hover:text-primary border border-border hover:border-primary/50 px-3 py-2 rounded-xl transition-colors flex-shrink-0 mt-1"
          >
            <Layers className="w-3.5 h-3.5" />
            My Decks
          </Link>
        </header>

        {/* Search */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search cards or keywords…"
            className="w-full bg-card border border-border rounded-xl pl-9 pr-4 py-2.5 text-sm text-foreground placeholder:text-muted-foreground/60 focus:outline-none focus:ring-1 focus:ring-primary"
          />
        </div>

        {/* Filter chips */}
        <div className="flex gap-2 overflow-x-auto pb-1 -mx-5 px-5 scrollbar-none">
          {FILTERS.map((f) => (
            <button
              key={f.key}
              onClick={() => setFilter(f.key)}
              className={cn(
                "flex-shrink-0 px-3 py-1.5 rounded-full text-xs border transition-colors",
                filter === f.key
                  ? "bg-primary text-primary-foreground border-primary"
                  : "bg-card border-border text-muted-foreground hover:border-primary/50"
              )}
            >
              {f.label}
            </button>
          ))}
        </div>

        {/* Count */}
        <p className="text-xs text-muted-foreground">
          {filtered.length} card{filtered.length !== 1 ? "s" : ""}
          {query && <span> matching "{query}"</span>}
        </p>

        {/* Card grid */}
        <div className="grid grid-cols-2 gap-3 pb-4">
          {filtered.map((card) => (
            <Link
              key={card.id}
              href={`/card/${card.id}`}
              className={cn(
                "relative rounded-xl border border-border overflow-hidden aspect-[3/4] flex flex-col items-center justify-center p-3 gap-2 bg-gradient-to-b hover:border-primary/60 transition-all",
                getCardGradient(card)
              )}
            >
              <span className="text-3xl">{card.glyph || "✦"}</span>
              <span className={cn("text-xs font-medium text-center leading-tight", getCardAccent(card))}>
                {card.name}
              </span>
              {card.arcana && (
                <span className="text-[9px] text-white/40 capitalize">
                  {card.arcana === "major" ? "Major" : card.suit ? card.suit.charAt(0).toUpperCase() + card.suit.slice(1) : card.deck_type}
                </span>
              )}
              {card.upright_keywords?.slice(0, 2).map((kw) => (
                <span key={kw} className="text-[8px] text-white/40 leading-none">{kw}</span>
              ))}
            </Link>
          ))}
        </div>

        {filtered.length === 0 && (
          <div className="text-center py-12 text-muted-foreground text-sm italic">
            No cards match your search.
          </div>
        )}
      </div>
    </Layout>
  );
}
