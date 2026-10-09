"use client";

import Link from "next/link";
import { useFavorites } from "./providers";

export default function FavoritesHeader() {
  const { ids } = useFavorites();
  return (
    <Link href="/favorites" className="header-cart">
      Favorites
      {ids.length > 0 && <span className="cart-badge">{ids.length}</span>}
    </Link>
  );
}
