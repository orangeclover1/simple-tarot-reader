import midnightLantern from "@/assets/card-backs/midnight_lantern.png";
import moonlitMoon from "@/assets/card-backs/moonlit_moon.png";
import desertStar from "@/assets/card-backs/desert_star.png";
import forestLeaf from "@/assets/card-backs/forest_leaf.png";
import crimsonEye from "@/assets/card-backs/crimson_eye.png";
import silverIce from "@/assets/card-backs/silver_ice.png";
import roseHeart from "@/assets/card-backs/rose_heart.png";
import goldenPotion from "@/assets/card-backs/golden_potion.png";

export const CARD_BACKS: Record<string, string> = {
  "Midnight Plum": midnightLantern,
  "Moonlit Blue": moonlitMoon,
  "Desert Dawn": desertStar,
  "Forest Oracle": forestLeaf,
  "Crimson Noir": crimsonEye,
  "Silver Frost": silverIce,
  "Rose Quartz": roseHeart,
  "Golden Hour": goldenPotion,
};

export function getCardBack(theme: string): string {
  return CARD_BACKS[theme] ?? midnightLantern;
}
