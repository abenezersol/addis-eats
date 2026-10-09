import { notFound } from "next/navigation";
import { ogCard } from "../../../lib/ogCard";
import { priceLabel } from "../../../lib/seo";
import { getDish } from "../../../lib/dishStore";

// One tailored card per dish, drawn on the server from the dish record.
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";
export const alt = "A dish from the Addis Eats menu";

export default async function Image({ params }) {
  const { id } = await params;
  const dish = getDish(id);
  if (!dish) notFound();
  return ogCard({
    eyebrow: dish.category.toUpperCase(),
    title: dish.name,
    subtitle: dish.description,
    footer: "Addis Eats · delivered across Addis Ababa",
    price: priceLabel(dish),
    titleSize: 104
  });
}
