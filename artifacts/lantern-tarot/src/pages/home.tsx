import { Layout } from "@/components/layout";
import { useListRecentReadings } from "@workspace/api-client-react";
import { Link } from "wouter";
import { useTheme } from "@/lib/theme-context";
import { THEMES, THEME_NAMES } from "@/lib/themes";
import { SPREADS } from "@/lib/reading-engine";
import { Sparkles, RotateCcw, Clock, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";
import { useState } from "react";

const QUICK_SPREADS = ["single", "decision-maker", "three-time"];

function ThemePicker() {
  const { theme, setTheme } = useTheme();
  const [open, setOpen] = useState(false);

  return (
    <div className="relative">
      <button
        onClick={() => setOpen((o) => !o)}
        className="flex items-center gap-2 text-xs text-muted-foreground hover:text-foreground transition-colors"
      >
        <span
          className="w-3 h-3 rounded-full border border-border"
          style={{ background: THEMES[theme]?.primary ?? "#D8B986" }}
        />
        {theme}
        <ChevronRight className={cn("w-3 h-3 transition-transform", open && "rotate-90")} />
      </button>
      {open && (
        <div className="absolute top-7 right-0 z-50 bg-card border border-border rounded-xl p-2 shadow-lg min-w-[180px]">
          {THEME_NAMES.map((name) => (
            <button
              key={name}
              onClick={() => { setTheme(name); setOpen(false); }}
              className={cn(
                "flex items-center gap-2 w-full text-left px-3 py-2 rounded-lg text-sm transition-colors",
                theme === name ? "text-primary bg-muted" : "text-foreground hover:bg-muted"
              )}
            >
              <span
                className="w-3 h-3 rounded-full flex-shrink-0"
                style={{ background: THEMES[name]?.primary ?? "#D8B986" }}
              />
              {name}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

export default function Home() {
  const { data: recent } = useListRecentReadings();
  const quickSpreads = SPREADS.filter((s) => QUICK_SPREADS.includes(s.id));
  const moreSpreads = SPREADS.filter((s) => !QUICK_SPREADS.includes(s.id));

  return (
    <Layout>
      <div className="p-5 space-y-7">
        {/* Header */}
        <header className="flex items-start justify-between pt-6">
          <div>
            <h1 className="text-3xl font-semibold tracking-wide text-primary">Lantern Tarot</h1>
            <p className="text-muted-foreground italic text-sm mt-0.5">A candlelit room in your pocket</p>
          </div>
          <ThemePicker />
        </header>

        {/* Quick access spreads */}
        <section className="space-y-3">
          <h2 className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">Begin a Reading</h2>
          <div className="grid grid-cols-1 gap-2">
            {quickSpreads.map((s) => (
              <Link
                key={s.id}
                href={`/read/${s.id}`}
                className="flex items-center gap-3 bg-card border border-border hover:border-primary/70 rounded-xl px-4 py-3 transition-colors group"
              >
                <span className="text-xl w-8 text-center">{s.icon}</span>
                <div className="flex-1 min-w-0">
                  <div className="font-medium text-sm text-foreground">{s.name}</div>
                  <div className="text-xs text-muted-foreground truncate">{s.description}</div>
                </div>
                <ChevronRight className="w-4 h-4 text-muted-foreground group-hover:text-primary transition-colors flex-shrink-0" />
              </Link>
            ))}
          </div>
        </section>

        {/* More spreads */}
        <section className="space-y-3">
          <h2 className="text-xs font-semibold uppercase tracking-widest text-muted-foreground flex items-center gap-2">
            <span>More Spreads</span>
            <Link href="/read" className="text-primary text-[10px] hover:underline ml-auto normal-case tracking-normal">See all</Link>
          </h2>
          <div className="grid grid-cols-2 gap-2">
            {moreSpreads.slice(0, 4).map((s) => (
              <Link
                key={s.id}
                href={`/read/${s.id}`}
                className="flex flex-col items-center gap-1.5 bg-card border border-border hover:border-primary/70 rounded-xl px-3 py-4 transition-colors"
              >
                <span className="text-2xl">{s.icon}</span>
                <span className="text-xs font-medium text-center leading-tight">{s.name}</span>
              </Link>
            ))}
          </div>
        </section>

        {/* Recent readings */}
        <section className="space-y-3 pb-2">
          <h2 className="text-xs font-semibold uppercase tracking-widest text-muted-foreground flex items-center gap-2">
            <Clock className="w-3 h-3" />
            Recent Readings
          </h2>
          {recent && recent.length > 0 ? (
            <div className="space-y-2">
              {recent.slice(0, 5).map((r: any) => (
                <Link
                  key={r.id}
                  href={`/journal/${r.id}`}
                  className="flex items-center gap-3 bg-card border border-border hover:border-primary/50 rounded-xl px-4 py-3 transition-colors group"
                >
                  <Sparkles className="w-4 h-4 text-primary flex-shrink-0" />
                  <div className="flex-1 min-w-0">
                    <div className="text-sm font-medium truncate">{r.spreadName}</div>
                    {r.question && (
                      <div className="text-xs text-muted-foreground truncate italic">{r.question}</div>
                    )}
                  </div>
                  <div className="flex flex-col items-end gap-0.5 flex-shrink-0">
                    <span className="text-[10px] text-muted-foreground">
                      {new Date(r.createdAt).toLocaleDateString(undefined, { month: "short", day: "numeric" })}
                    </span>
                    <ChevronRight className="w-3 h-3 text-muted-foreground group-hover:text-primary transition-colors" />
                  </div>
                </Link>
              ))}
              <Link href="/journal" className="flex items-center justify-center gap-1 text-xs text-muted-foreground hover:text-primary py-2 transition-colors">
                <RotateCcw className="w-3 h-3" />
                View full journal
              </Link>
            </div>
          ) : (
            <div className="text-sm text-muted-foreground italic text-center p-8 border border-dashed border-border rounded-xl">
              Your readings will appear here once you begin.
            </div>
          )}
        </section>
      </div>
    </Layout>
  );
}
