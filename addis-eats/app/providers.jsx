"use client";

import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";

const CartContext = createContext(null);
const FavoritesContext = createContext(null);

const FAVORITES_KEY = "addis-eats-favorites";

export function CartProvider({ children }) {
  const [items, setItems] = useState([]);

  useEffect(() => {
    const saved = document.cookie
      .split("; ")
      .find((part) => part.startsWith("addis-eats-cart="))
      ?.split("=")[1];
    if (!saved) return;
    try {
      const parsed = JSON.parse(decodeURIComponent(saved));
      if (Array.isArray(parsed)) setItems(parsed);
    } catch {
      document.cookie = "addis-eats-cart=; Max-Age=0; Path=/";
    }
  }, []);

  useEffect(() => {
    document.cookie = `addis-eats-cart=${encodeURIComponent(JSON.stringify(items))}; Max-Age=604800; Path=/; SameSite=Lax`;
  }, [items]);

  const value = useMemo(
    () => ({
      items,
      addItem: (dish) =>
        setItems((current) => {
          const found = current.find((item) => item.id === dish.id);
          if (found) {
            return current.map((item) => (item.id === dish.id ? { ...item, quantity: item.quantity + 1 } : item));
          }
          return [...current, { id: dish.id, name: dish.name, price: dish.price, image: dish.image, quantity: 1 }];
        }),
      decreaseItem: (id) =>
        setItems((current) =>
          current.flatMap((item) => {
            if (item.id !== id) return [item];
            return item.quantity > 1 ? [{ ...item, quantity: item.quantity - 1 }] : [];
          })
        ),
      removeItem: (id) => setItems((current) => current.filter((item) => item.id !== id)),
      clearCart: () => {
        setItems([]);
        document.cookie = "addis-eats-cart=; Max-Age=0; Path=/; SameSite=Lax";
      }
    }),
    [items]
  );

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useCart() {
  const context = useContext(CartContext);
  if (!context) throw new Error("useCart must be used inside CartProvider");
  return context;
}

function readFavorites() {
  try {
    const parsed = JSON.parse(localStorage.getItem(FAVORITES_KEY));
    return Array.isArray(parsed) ? parsed.filter((id) => Number.isInteger(id)) : [];
  } catch {
    return [];
  }
}

function writeFavorites(ids) {
  try {
    localStorage.setItem(FAVORITES_KEY, JSON.stringify(ids));
  } catch {
    // Storage can be blocked (private mode, policy). Favorites then last only until the page is closed.
  }
}

// Favorites are the ids of the dishes a visitor has hearted, kept in this browser's localStorage.
// The list is read after the first render (never during it) so the server HTML and the first client render match.
export function FavoritesProvider({ children }) {
  const [ids, setIds] = useState([]);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    setIds(readFavorites());
    setReady(true);

    // Keep several open tabs in step.
    function handleStorage(event) {
      if (event.key === FAVORITES_KEY) setIds(readFavorites());
    }
    window.addEventListener("storage", handleStorage);
    return () => window.removeEventListener("storage", handleStorage);
  }, []);

  // Only write after the saved list has been read, or the empty starting list would erase it.
  useEffect(() => {
    if (ready) writeFavorites(ids);
  }, [ids, ready]);

  const toggleFavorite = useCallback((id) => {
    setIds((current) => (current.includes(id) ? current.filter((value) => value !== id) : [...current, id]));
  }, []);

  const clearFavorites = useCallback(() => setIds([]), []);

  const value = useMemo(
    () => ({
      ids,
      ready,
      isFavorite: (id) => ids.includes(id),
      toggleFavorite,
      clearFavorites
    }),
    [ids, ready, toggleFavorite, clearFavorites]
  );

  return <FavoritesContext.Provider value={value}>{children}</FavoritesContext.Provider>;
}

export function useFavorites() {
  const context = useContext(FavoritesContext);
  if (!context) throw new Error("useFavorites must be used inside FavoritesProvider");
  return context;
}

export function Providers({ children }) {
  return (
    <CartProvider>
      <FavoritesProvider>{children}</FavoritesProvider>
    </CartProvider>
  );
}
