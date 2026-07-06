export interface ThemeColors {
  background: string;
  surface: string;
  primary: string;
  secondary: string;
  text: string;
  muted: string;
  border: string;
  cardBack: string;
  themeIcon: string;
  // HSL values for CSS vars
  bgHsl: string;
  cardHsl: string;
  cardAltHsl: string;
  primaryHsl: string;
  secondaryHsl: string;
  foregroundHsl: string;
  mutedHsl: string;
  mutedFgHsl: string;
  borderHsl: string;
}

export const THEMES: Record<string, ThemeColors> = {
  "Midnight Plum": {
    background: "#0B0E14", surface: "#121828", primary: "#D8B986", secondary: "#8B56C9",
    text: "#F4F2E8", muted: "#A9A7B3", border: "#A37A38",
    cardBack: "midnight_lantern.png", themeIcon: "midnight_plum.png",
    bgHsl: "220 29% 6%", cardHsl: "223 38% 11%", cardAltHsl: "222 33% 15%",
    primaryHsl: "37 53% 68%", secondaryHsl: "267 52% 56%",
    foregroundHsl: "50 33% 93%", mutedHsl: "223 33% 15%", mutedFgHsl: "250 8% 68%",
    borderHsl: "37 49% 43%",
  },
  "Moonlit Blue": {
    background: "#0E1B2D", surface: "#162943", primary: "#B9CDEB", secondary: "#6A96D8",
    text: "#F5F9FF", muted: "#AAC0DA", border: "#5E7AA5",
    cardBack: "moonlit_moon.png", themeIcon: "moonlit_blue.png",
    bgHsl: "214 49% 12%", cardHsl: "213 47% 17%", cardAltHsl: "211 44% 24%",
    primaryHsl: "213 57% 83%", secondaryHsl: "213 59% 64%",
    foregroundHsl: "215 100% 98%", mutedHsl: "213 40% 20%", mutedFgHsl: "210 30% 76%",
    borderHsl: "213 36% 51%",
  },
  "Desert Dawn": {
    background: "#382218", surface: "#6A3E2A", primary: "#D4B972", secondary: "#EBCBA8",
    text: "#FFF1E3", muted: "#D9B087", border: "#C39257",
    cardBack: "desert_star.png", themeIcon: "desert_dawn.png",
    bgHsl: "16 37% 15%", cardHsl: "18 42% 29%", cardAltHsl: "21 43% 45%",
    primaryHsl: "41 57% 63%", secondaryHsl: "34 63% 79%",
    foregroundHsl: "32 100% 94%", mutedHsl: "19 43% 40%", mutedFgHsl: "33 49% 69%",
    borderHsl: "35 48% 55%",
  },
  "Forest Oracle": {
    background: "#1A2B20", surface: "#28402E", primary: "#B8AF8C", secondary: "#8BCAB0",
    text: "#DCEAD9", muted: "#AFC7B3", border: "#8CA06F",
    cardBack: "forest_leaf.png", themeIcon: "forest_oracle.png",
    bgHsl: "138 24% 13%", cardHsl: "133 22% 20%", cardAltHsl: "130 20% 29%",
    primaryHsl: "45 25% 63%", secondaryHsl: "159 33% 66%",
    foregroundHsl: "120 22% 88%", mutedHsl: "133 22% 23%", mutedFgHsl: "142 18% 74%",
    borderHsl: "91 17% 54%",
  },
  "Crimson Noir": {
    background: "#0A090B", surface: "#161217", primary: "#D4B07A", secondary: "#B13A48",
    text: "#F7EFEA", muted: "#B9A8A8", border: "#8F3A46",
    cardBack: "crimson_eye.png", themeIcon: "crimson_noir.png",
    bgHsl: "270 14% 4%", cardHsl: "288 14% 8%", cardAltHsl: "324 17% 12%",
    primaryHsl: "37 49% 64%", secondaryHsl: "353 47% 46%",
    foregroundHsl: "24 33% 94%", mutedHsl: "288 12% 13%", mutedFgHsl: "0 12% 69%",
    borderHsl: "352 43% 39%",
  },
  "Silver Frost": {
    background: "#111318", surface: "#1A1E26", primary: "#C9D1DD", secondary: "#7FA7C7",
    text: "#F3F7FA", muted: "#A4B0BF", border: "#5A6B80",
    cardBack: "silver_ice.png", themeIcon: "silver_frost.png",
    bgHsl: "224 19% 8%", cardHsl: "222 21% 12%", cardAltHsl: "220 19% 16%",
    primaryHsl: "212 22% 83%", secondaryHsl: "207 41% 64%",
    foregroundHsl: "210 40% 97%", mutedHsl: "222 19% 17%", mutedFgHsl: "212 18% 70%",
    borderHsl: "211 17% 43%",
  },
  "Rose Quartz": {
    background: "#1E1218", surface: "#2E1B24", primary: "#E8C4D0", secondary: "#C96B8A",
    text: "#FFF0F5", muted: "#C9A8B4", border: "#9B5070",
    cardBack: "rose_heart.png", themeIcon: "rose_quartz.png",
    bgHsl: "330 26% 9%", cardHsl: "328 26% 14%", cardAltHsl: "326 24% 20%",
    primaryHsl: "340 44% 83%", secondaryHsl: "339 42% 60%",
    foregroundHsl: "340 100% 97%", mutedHsl: "329 24% 21%", mutedFgHsl: "335 25% 72%",
    borderHsl: "335 32% 46%",
  },
  "Golden Hour": {
    background: "#1A1408", surface: "#2A2010", primary: "#F0D080", secondary: "#D4902A",
    text: "#FFF8E8", muted: "#C8B870", border: "#A07820",
    cardBack: "golden_potion.png", themeIcon: "golden_hour.png",
    bgHsl: "38 45% 7%", cardHsl: "37 44% 12%", cardAltHsl: "37 41% 17%",
    primaryHsl: "46 82% 72%", secondaryHsl: "34 66% 49%",
    foregroundHsl: "42 100% 95%", mutedHsl: "37 38% 20%", mutedFgHsl: "47 45% 61%",
    borderHsl: "41 67% 37%",
  },
};

export const THEME_NAMES = Object.keys(THEMES);
