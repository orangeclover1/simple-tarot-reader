import { createContext, useContext } from "react";

export const ThemeContext = createContext<{
  theme: string;
  setTheme: (theme: string) => void;
}>({ theme: "Midnight Plum", setTheme: () => {} });

export function useTheme() {
  return useContext(ThemeContext);
}
