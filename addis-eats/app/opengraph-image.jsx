import { ogCard } from "../lib/ogCard";

// The site-wide share card. Every page uses it unless a section has its own opengraph-image.
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";
export const alt = "Addis Eats — good food, delivered across Addis Ababa";

export default function Image() {
  return ogCard({
    eyebrow: "AUTHENTIC FLAVORS · ADDIS ABABA",
    title: "Good food, delivered across Addis.",
    subtitle: "Ethiopian favorites and comfort-food classics, with clear prices in ETB.",
    footer: "addiseats.et"
  });
}
