"use client";

import Link from "next/link";
import DishList from "../menu/DishList";
import { useFavorites } from "../providers";

// `dishes` is every dish a customer may order (from the server). The saved ids pick which ones to show,
// so a dish that was deleted or switched off simply stops appearing here.
export default function FavoritesView({ dishes }) {
  const { ids, ready, clearFavorites } = useFavorites();
  const favorites = ids.map((id) => dishes.find((dish) => dish.id === id)).filter(Boolean);

  return (
    <main className="container page">
      <div className="page-heading">
        <div>
          <span className="eyebrow">YOUR PICKS</span>
          <h1>Favorites</h1>
          <p>Dishes you have saved with the heart button. They are stored in this browser.</p>
        </div>
        {favorites.length > 0 && (
          <button type="button" className="text-button" onClick={clearFavorites}>
            Clear favorites
          </button>
        )}
      </div>

      {!ready ? (
        <p className="muted">Loading your favorites…</p>
      ) : !favorites.length ? (
        <div className="empty-state large">
          <div className="empty-icon">♡</div>
          <h2>No favorites yet</h2>
          <p>Tap the heart on any dish and it will be saved here.</p>
          <Link href="/menu" className="button">
            Browse menu
          </Link>
        </div>
      ) : (
        <DishList dishes={favorites} />
      )}
    </main>
  );
}
