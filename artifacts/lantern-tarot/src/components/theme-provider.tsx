import { useState, useEffect, ReactNode } from "react";
import { ThemeContext } from "@/lib/theme-context";
import { THEMES } from "@/lib/themes";
import { useGetSettings, useUpdateSettings } from "@/lib/local-api";

export function ThemeProvider({ children }: { children: ReactNode }) {
  const { data: settings } = useGetSettings();
  const updateSettings = useUpdateSettings();
  const [currentTheme, setCurrentTheme] = useState("Midnight Plum");

  useEffect(() => {
    if (settings?.theme) setCurrentTheme(settings.theme);
  }, [settings]);

  useEffect(() => {
    const t = THEMES[currentTheme] ?? THEMES["Midnight Plum"];
    const root = document.documentElement;
    root.classList.add("dark");
    root.style.setProperty("--background", t.bgHsl);
    root.style.setProperty("--foreground", t.foregroundHsl);
    root.style.setProperty("--card", t.cardHsl);
    root.style.setProperty("--card-foreground", t.foregroundHsl);
    root.style.setProperty("--popover", t.cardHsl);
    root.style.setProperty("--popover-foreground", t.foregroundHsl);
    root.style.setProperty("--primary", t.primaryHsl);
    root.style.setProperty("--primary-foreground", t.bgHsl);
    root.style.setProperty("--secondary", t.secondaryHsl);
    root.style.setProperty("--secondary-foreground", t.foregroundHsl);
    root.style.setProperty("--muted", t.mutedHsl);
    root.style.setProperty("--muted-foreground", t.mutedFgHsl);
    root.style.setProperty("--accent", t.secondaryHsl);
    root.style.setProperty("--accent-foreground", t.foregroundHsl);
    root.style.setProperty("--border", t.borderHsl);
    root.style.setProperty("--input", t.borderHsl);
    root.style.setProperty("--ring", t.primaryHsl);
    root.style.setProperty("--destructive", "0 62.8% 30.6%");
    root.style.setProperty("--destructive-foreground", t.foregroundHsl);
    root.style.setProperty("--radius", "0.75rem");
    root.style.setProperty("--app-font-sans", "'Crimson Pro', serif");
    root.style.setProperty("--app-font-serif", "'Crimson Pro', serif");
    root.style.setProperty("--app-font-mono", "ui-monospace, monospace");
  }, [currentTheme]);

  const setTheme = (theme: string) => {
    setCurrentTheme(theme);
    updateSettings.mutate({ data: { theme } });
  };

  return (
    <ThemeContext.Provider value={{ theme: currentTheme, setTheme }}>
      {children}
    </ThemeContext.Provider>
  );
}
