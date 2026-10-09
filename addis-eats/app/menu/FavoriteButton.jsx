"use client";

import { useFavorites } from "../providers";

export default function FavoriteButton({ dish }) {
  const { isFavorite, toggleFavorite } = useFavorites();
  const active = isFavorite(dish.id);
  return (
    <button
      type="button"
      className={active ? "favorite-button active" : "favorite-button"}
      aria-pressed={active}
      aria-label={active ? `Remove ${dish.name} from favorites` : `Add ${dish.name} to favorites`}
      title={active ? "Remove from favorites" : "Add to favorites"}
      onClick={() => toggleFavorite(dish.id)}
    >
      <span aria-hidden="true">{active ? "♥" : "♡"}</span>
    </button>
  );
}
