import FavoritesView from "./FavoritesView";
import { getAvailableDishes } from "../../lib/dishStore";

export const metadata = {
  title: "Favorites",
  description: "The Addis Eats dishes you have saved, ready to add to your cart."
};

export default function FavoritesPage() {
  return <FavoritesView dishes={getAvailableDishes()} />;
}
