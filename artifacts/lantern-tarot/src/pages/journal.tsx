import { Layout } from "@/components/layout";
import { useListReadings, useDeleteReading } from "@/lib/local-api";
import { Link, useParams, useLocation } from "wouter";
import { cn } from "@/lib/utils";
import { ChevronLeft, Trash2, Sparkles, CalendarDays, Search } from "lucide-react";
import { useState, useMemo } from "react";

function JournalDetail({ id }: { id: string }) {
  const [, navigate] = useLocation();
  const { data: readings } = useListReadings();
  const deleteReading = useDeleteReading();

  const reading = readings?.find((r: any) => String(r.id) === id);

  if (!reading) {
    return (
      <Layout hideNav>
        <div className="p-6 pt-12 text-center space-y-4">
          <p className="text-muted-foreground">Reading not found.</p>
          <Link href="/journal" className="text-primary text-sm">← Back to Journal</Link>
        </div>
      </Layout>
    );
  }

  const handleDelete = async () => {
    if (!confirm("Delete this reading?")) return;
    await deleteReading.mutateAsync({ id: Number(id) });
    navigate("/journal");
  };

  const r = reading as any;

  return (
    <Layout hideNav>
      <div className="flex flex-col p-5 gap-5 pb-8">
        <div className="pt-6 flex items-center gap-3">
          <Link href="/journal" className="text-muted-foreground hover:text-foreground transition-colors">
            <ChevronLeft className="w-5 h-5" />
          </Link>
          <div className="flex-1 min-w-0">
            <div className="text-xs text-muted-foreground uppercase tracking-widest">Journal Entry</div>
            <h1 className="text-lg font-semibold truncate">{r.spreadName}</h1>
          </div>
          <button onClick={handleDelete} className="text-muted-foreground hover:text-destructive transition-colors p-1">
            <Trash2 className="w-4 h-4" />
          </button>
        </div>

        <div className="flex items-center gap-2 text-xs text-muted-foreground">
          <CalendarDays className="w-3.5 h-3.5" />
          {new Date(r.createdAt).toLocaleDateString(undefined, {
            weekday: "long", year: "numeric", month: "long", day: "numeric",
          })}
          {r.focus && r.focus !== "general" && (
            <span className="ml-2 px-2 py-0.5 rounded-full bg-muted capitalize">{r.focus} lens</span>
          )}
        </div>

        {r.question && (
          <div className="bg-card border border-border rounded-xl p-4">
            <p className="text-[10px] text-muted-foreground uppercase tracking-wide mb-1">Question</p>
            <p className="text-sm italic">{r.question}</p>
          </div>
        )}

        {r.cards?.length > 0 && (
          <div className="space-y-3">
            <h2 className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">Cards</h2>
            {r.cards.map((c: any) => (
              <div key={c.id} className="bg-card border border-border rounded-xl p-4 space-y-1.5">
                <div className="flex items-center justify-between">
                  <span className="text-xs text-muted-foreground">{c.positionName}</span>
                  {c.isReversed && <span className="text-[10px] text-muted-foreground/60">reversed</span>}
                </div>
                <Link href={`/card/${c.cardId}`} className="text-sm font-medium hover:text-primary transition-colors block">
                  {c.cardName}
                </Link>
                {c.meaning && <p className="text-xs text-muted-foreground leading-relaxed">{c.meaning}</p>}
              </div>
            ))}
          </div>
        )}

        {r.synthesis && (
          <div className="bg-card border border-primary/30 rounded-xl p-4 space-y-2">
            <h2 className="text-xs font-semibold uppercase tracking-widest text-primary">Overall Reading</h2>
            <p className="text-sm text-foreground leading-relaxed">{r.synthesis}</p>
          </div>
        )}

        {r.feelings?.length > 0 && (
          <div className="space-y-2">
            <h2 className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">Feelings</h2>
            <div className="flex flex-wrap gap-2">
              {(r.feelings as string[]).map((f: string) => (
                <span key={f} className="px-3 py-1 rounded-full text-xs bg-primary/10 text-primary border border-primary/20">{f}</span>
              ))}
            </div>
          </div>
        )}

        {r.notes && (
          <div className="space-y-2">
            <h2 className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">Notes</h2>
            <div className="bg-card border border-border rounded-xl p-4">
              <p className="text-sm text-foreground leading-relaxed">{r.notes}</p>
            </div>
          </div>
        )}
      </div>
    </Layout>
  );
}

export default function Journal() {
  const params = useParams<{ id?: string }>();
  const { data: readings, isLoading } = useListReadings();
  const [query, setQuery] = useState("");

  const filtered = useMemo(() => {
    if (!readings) return [];
    const q = query.trim().toLowerCase();
    if (!q) return readings as any[];
    return (readings as any[]).filter(
      (r) =>
        r.spreadName?.toLowerCase().includes(q) ||
        r.question?.toLowerCase().includes(q) ||
        r.notes?.toLowerCase().includes(q) ||
        r.feelings?.some((f: string) => f.toLowerCase().includes(q))
    );
  }, [readings, query]);

  if (params.id) return <JournalDetail id={params.id} />;

  return (
    <Layout>
      <div className="p-5 space-y-4">
        <header className="pt-6">
          <h1 className="text-2xl font-semibold">Journal</h1>
          <p className="text-sm text-muted-foreground mt-0.5">Your reading history</p>
        </header>

        {/* Search */}
        {!isLoading && (readings as any[])?.length > 0 && (
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search readings, questions, feelings…"
              className="w-full bg-card border border-border rounded-xl pl-9 pr-4 py-2.5 text-sm text-foreground placeholder:text-muted-foreground/60 focus:outline-none focus:ring-1 focus:ring-primary"
            />
          </div>
        )}

        {isLoading && (
          <div className="space-y-3">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-20 bg-card rounded-xl border border-border animate-pulse" />
            ))}
          </div>
        )}

        {!isLoading && (readings as any[])?.length === 0 && (
          <div className="text-sm text-muted-foreground italic text-center py-16 border border-dashed border-border rounded-xl">
            No readings saved yet. Complete a reading to see it here.
          </div>
        )}

        {!isLoading && filtered.length === 0 && query && (
          <div className="text-sm text-muted-foreground italic text-center py-8">
            No readings match "{query}".
          </div>
        )}

        {!isLoading && filtered.length > 0 && (
          <div className="space-y-2 pb-4">
            {filtered.map((r: any) => (
              <Link
                key={r.id}
                href={`/journal/${r.id}`}
                className="flex items-start gap-3 bg-card border border-border hover:border-primary/50 rounded-xl px-4 py-3.5 transition-colors group"
              >
                <Sparkles className="w-4 h-4 text-primary flex-shrink-0 mt-0.5" />
                <div className="flex-1 min-w-0">
                  <div className="font-medium text-sm truncate">{r.spreadName}</div>
                  {r.question && (
                    <div className="text-xs text-muted-foreground truncate italic mt-0.5">{r.question}</div>
                  )}
                  <div className="text-[10px] text-muted-foreground mt-1.5">
                    {new Date(r.createdAt).toLocaleDateString(undefined, {
                      weekday: "short", month: "short", day: "numeric", year: "numeric",
                    })}
                    {r.cards?.length ? ` · ${r.cards.length} card${r.cards.length !== 1 ? "s" : ""}` : ""}
                  </div>
                  {r.feelings?.length > 0 && (
                    <div className="flex gap-1 mt-1.5 flex-wrap">
                      {(r.feelings as string[]).slice(0, 3).map((f: string) => (
                        <span key={f} className={cn(
                          "text-[9px] px-2 py-0.5 rounded-full bg-primary/10 text-primary",
                          query && f.toLowerCase().includes(query.toLowerCase()) && "bg-primary/30"
                        )}>{f}</span>
                      ))}
                    </div>
                  )}
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </Layout>
  );
}
