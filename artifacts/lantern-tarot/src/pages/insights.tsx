import { Layout } from "@/components/layout";
import { useListReadings } from "@workspace/api-client-react";
import { useMemo } from "react";
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, PieChart, Pie, Cell,
} from "recharts";
import { Sparkles, BookOpen, TrendingUp } from "lucide-react";

const COLORS = ["#D8B986", "#8B56C9", "#6A96D8", "#B13A48", "#8BCAB0", "#E8C4D0", "#D4902A", "#B9CDEB"];

function StatCard({ label, value, sub, icon: Icon }: { label: string; value: string | number; sub?: string; icon?: any }) {
  return (
    <div className="bg-card border border-border rounded-xl p-4 flex items-start gap-3">
      {Icon && (
        <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
          <Icon className="w-4 h-4 text-primary" />
        </div>
      )}
      <div>
        <div className="text-2xl font-semibold text-primary">{value}</div>
        <div className="text-xs text-foreground font-medium mt-0.5">{label}</div>
        {sub && <div className="text-[10px] text-muted-foreground mt-0.5">{sub}</div>}
      </div>
    </div>
  );
}

export default function Insights() {
  const { data: readings, isLoading } = useListReadings();

  const stats = useMemo(() => {
    if (!readings?.length) return null;
    const list = readings as any[];

    const totalReadings = list.length;
    const totalCards = list.reduce((s: number, r: any) => s + (r.cards?.length ?? 0), 0);

    const spreadCounts: Record<string, number> = {};
    const suitCounts: Record<string, number> = {};
    const feelingCounts: Record<string, number> = {};
    const cardCounts: Record<string, number> = {};
    let reversedCount = 0;
    let totalCardItems = 0;

    for (const r of list) {
      spreadCounts[r.spreadName] = (spreadCounts[r.spreadName] ?? 0) + 1;
      for (const f of r.feelings ?? []) {
        feelingCounts[f] = (feelingCounts[f] ?? 0) + 1;
      }
      for (const c of r.cards ?? []) {
        totalCardItems++;
        if (c.isReversed) reversedCount++;
        cardCounts[c.cardName] = (cardCounts[c.cardName] ?? 0) + 1;
        const name = c.cardName?.toLowerCase() ?? "";
        if (name.includes("wands")) suitCounts["Wands"] = (suitCounts["Wands"] ?? 0) + 1;
        else if (name.includes("cups")) suitCounts["Cups"] = (suitCounts["Cups"] ?? 0) + 1;
        else if (name.includes("swords")) suitCounts["Swords"] = (suitCounts["Swords"] ?? 0) + 1;
        else if (name.includes("pentacles")) suitCounts["Pentacles"] = (suitCounts["Pentacles"] ?? 0) + 1;
        else suitCounts["Major/Oracle"] = (suitCounts["Major/Oracle"] ?? 0) + 1;
      }
    }

    const spreadData = Object.entries(spreadCounts)
      .map(([name, count]) => ({ name: name.split("·")[0].trim(), count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 6);

    const suitData = Object.entries(suitCounts)
      .map(([name, value]) => ({ name, value }))
      .sort((a, b) => b.value - a.value);

    const topFeelings = Object.entries(feelingCounts)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5);

    const topCards = Object.entries(cardCounts)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5);

    const reversedPct = totalCardItems ? Math.round((reversedCount / totalCardItems) * 100) : 0;

    return { totalReadings, totalCards, spreadData, suitData, topFeelings, topCards, reversedPct };
  }, [readings]);

  if (isLoading) {
    return (
      <Layout>
        <div className="p-5 pt-12 space-y-4">
          {[1,2,3].map(i => <div key={i} className="h-24 bg-card rounded-xl border border-border animate-pulse" />)}
        </div>
      </Layout>
    );
  }

  if (!stats) {
    return (
      <Layout>
        <div className="p-5">
          <header className="pt-6 mb-8">
            <h1 className="text-2xl font-semibold">Insights</h1>
            <p className="text-sm text-muted-foreground mt-0.5">Patterns across your readings</p>
          </header>
          <div className="text-center py-16 border border-dashed border-border rounded-xl">
            <TrendingUp className="w-8 h-8 text-muted-foreground mx-auto mb-3" />
            <p className="text-sm text-muted-foreground italic">Complete some readings to see patterns here.</p>
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="p-5 space-y-6 pb-8">
        <header className="pt-6">
          <h1 className="text-2xl font-semibold">Insights</h1>
          <p className="text-sm text-muted-foreground mt-0.5">Patterns across your readings</p>
        </header>

        {/* Key stats */}
        <div className="grid grid-cols-2 gap-3">
          <StatCard label="Total Readings" value={stats.totalReadings} icon={Sparkles} />
          <StatCard label="Cards Drawn" value={stats.totalCards} icon={BookOpen} />
          <StatCard label="Reversed Rate" value={`${stats.reversedPct}%`} sub="of cards drawn reversed" />
          <StatCard label="Spreads Used" value={stats.spreadData.length} sub="unique spread types" />
        </div>

        {/* Spread frequency */}
        {stats.spreadData.length > 0 && (
          <div className="space-y-3">
            <h2 className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">Spreads Used</h2>
            <div className="bg-card border border-border rounded-xl p-4">
              <ResponsiveContainer width="100%" height={180}>
                <BarChart data={stats.spreadData} margin={{ top: 0, right: 0, left: -20, bottom: 0 }}>
                  <XAxis dataKey="name" tick={{ fontSize: 9, fill: "#A9A7B3" }} />
                  <YAxis tick={{ fontSize: 9, fill: "#A9A7B3" }} allowDecimals={false} />
                  <Tooltip
                    contentStyle={{ background: "hsl(var(--card))", border: "1px solid hsl(var(--border))", borderRadius: "8px", fontSize: "12px" }}
                    labelStyle={{ color: "hsl(var(--foreground))" }}
                    itemStyle={{ color: "hsl(var(--primary))" }}
                  />
                  <Bar dataKey="count" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        )}

        {/* Suit distribution */}
        {stats.suitData.length > 0 && (
          <div className="space-y-3">
            <h2 className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">Card Distribution</h2>
            <div className="bg-card border border-border rounded-xl p-4 flex gap-4">
              <ResponsiveContainer width="50%" height={140}>
                <PieChart>
                  <Pie data={stats.suitData} cx="50%" cy="50%" outerRadius={55} dataKey="value" stroke="none">
                    {stats.suitData.map((_, i) => (
                      <Cell key={i} fill={COLORS[i % COLORS.length]} />
                    ))}
                  </Pie>
                </PieChart>
              </ResponsiveContainer>
              <div className="flex flex-col justify-center gap-2">
                {stats.suitData.map((s, i) => (
                  <div key={s.name} className="flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full flex-shrink-0" style={{ background: COLORS[i % COLORS.length] }} />
                    <span className="text-xs text-muted-foreground">{s.name}</span>
                    <span className="text-xs text-foreground font-medium ml-auto">{s.value}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Top feelings */}
        {stats.topFeelings.length > 0 && (
          <div className="space-y-3">
            <h2 className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">Common Feelings</h2>
            <div className="space-y-2">
              {stats.topFeelings.map(([feeling, count]) => {
                const max = stats.topFeelings[0][1];
                return (
                  <div key={feeling} className="flex items-center gap-3">
                    <span className="text-sm w-24 flex-shrink-0">{feeling}</span>
                    <div className="flex-1 h-2 bg-muted rounded-full overflow-hidden">
                      <div
                        className="h-full bg-primary rounded-full transition-all"
                        style={{ width: `${(count / max) * 100}%` }}
                      />
                    </div>
                    <span className="text-xs text-muted-foreground w-4 text-right">{count}</span>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Top cards */}
        {stats.topCards.length > 0 && (
          <div className="space-y-3">
            <h2 className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">Most Drawn Cards</h2>
            <div className="space-y-2">
              {stats.topCards.map(([card, count], i) => (
                <div key={card} className="flex items-center gap-3 bg-card border border-border rounded-xl px-4 py-3">
                  <span className="text-xs text-muted-foreground w-4">{i + 1}</span>
                  <span className="text-sm flex-1">{card}</span>
                  <span className="text-xs text-primary font-medium">{count}×</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </Layout>
  );
}
