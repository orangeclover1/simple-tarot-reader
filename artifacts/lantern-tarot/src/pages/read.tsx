import { Layout } from "@/components/layout";
import { Link } from "wouter";
import { SPREADS } from "@/lib/reading-engine";
import { ChevronRight } from "lucide-react";

export default function Read() {
  return (
    <Layout>
      <div className="p-5 space-y-6">
        <header className="pt-6">
          <h1 className="text-2xl font-semibold text-foreground">Choose a Spread</h1>
          <p className="text-sm text-muted-foreground mt-1">Select the layout that best fits your question.</p>
        </header>

        <div className="space-y-2">
          {SPREADS.map((spread) => (
            <Link
              key={spread.id}
              href={`/read/${spread.id}`}
              className="flex items-center gap-4 bg-card border border-border hover:border-primary/70 rounded-xl px-4 py-4 transition-colors group"
            >
              <div className="w-10 h-10 rounded-full bg-muted flex items-center justify-center flex-shrink-0 text-xl">
                {spread.icon}
              </div>
              <div className="flex-1 min-w-0">
                <div className="font-semibold text-sm text-foreground">{spread.name}</div>
                <div className="text-xs text-muted-foreground mt-0.5 leading-snug">{spread.description}</div>
                <div className="text-xs text-primary mt-1">{spread.positions.length} card{spread.positions.length !== 1 ? "s" : ""}</div>
              </div>
              <ChevronRight className="w-4 h-4 text-muted-foreground group-hover:text-primary transition-colors flex-shrink-0" />
            </Link>
          ))}
        </div>
      </div>
    </Layout>
  );
}
