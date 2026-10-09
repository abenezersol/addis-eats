"use client";
import Link from "next/link";
import { useCart } from "./providers";

export default function CartHeader() {
  const { items } = useCart();
  const count = items.reduce((total, item) => total + item.quantity, 0);
  return <Link href="/cart" className="header-cart">Cart{count > 0 && <span className="cart-badge">{count}</span>}</Link>;
}
