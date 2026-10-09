"use client";

import { useCart } from "../providers";

export default function AddToCartButton({ dish }) {
  const { addItem } = useCart();
  return (
    <button type="button" className="button add-button" onClick={() => addItem(dish)}>
      + Add to cart
    </button>
  );
}
