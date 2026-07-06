import { ReactNode } from "react";
import { Link, useLocation } from "wouter";
import { Compass, BookOpen, Library, ScrollText, Sparkles } from "lucide-react";
import { cn } from "@/lib/utils";

const navItems = [
  { href: "/", icon: Compass, label: "Home" },
  { href: "/read", icon: Sparkles, label: "Read" },
  { href: "/library", icon: Library, label: "Library" },
  { href: "/journal", icon: ScrollText, label: "Journal" },
  { href: "/insights", icon: BookOpen, label: "Insights" },
];

export function Layout({ children, hideNav }: { children: ReactNode; hideNav?: boolean }) {
  const [location] = useLocation();

  return (
    <div className="flex flex-col min-h-[100dvh] bg-background text-foreground" style={{ paddingBottom: hideNav ? 0 : "4rem" }}>
      <main className="flex-1 w-full max-w-md mx-auto relative">
        {children}
      </main>

      {!hideNav && (
        <nav className="fixed bottom-0 left-0 right-0 h-16 bg-card border-t border-border flex justify-around items-center px-2 z-50">
          {navItems.map((item) => {
            const active =
              item.href === "/"
                ? location === "/"
                : location.startsWith(item.href);
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "flex flex-col items-center justify-center w-full h-full gap-0.5 transition-colors",
                  active ? "text-primary" : "text-muted-foreground hover:text-foreground"
                )}
              >
                <item.icon className="w-5 h-5" />
                <span className="text-[10px] font-medium">{item.label}</span>
              </Link>
            );
          })}
        </nav>
      )}
    </div>
  );
}
