import { ogCard } from "../../lib/ogCard";
import { getAvailableDishes } from "../../lib/dishStore";

// Everything under /menu uses this card, except a dish, which has its own.
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";
export const alt = "The Addis Eats menu";

export default function Image() {
  return ogCard({
    eyebrow: "OUR MENU",
    title: "Choose something delicious",
    subtitle: `${getAvailableDishes().length} dishes: Ethiopian favorites, mains, desserts and drinks.`,
    footer: "addiseats.et/menu"
  });
}
