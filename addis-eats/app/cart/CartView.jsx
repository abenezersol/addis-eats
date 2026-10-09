"use client";

import Link from "next/link";
import Image from "next/image";
import { useCart } from "../providers";

export default function CartView() {
  const { items, addItem, decreaseItem, removeItem, clearCart } = useCart();
  const total = items.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const itemCount = items.reduce((count, item) => count + item.quantity, 0);

  return (
    <main className="container page">
      <div className="page-heading">
        <div>
          <span className="eyebrow">YOUR ORDER</span>
          <h1>Shopping cart</h1>
          <p>Review your dishes, adjust quantities, then continue to checkout.</p>
        </div>
        {items.length > 0 && (
          <button className="text-button" onClick={clearCart}>
            Clear cart
          </button>
        )}
      </div>

      {!items.length ? (
        <div className="empty-state large">
          <div className="empty-icon">🛒</div>
          <h2>Your cart is empty</h2>
          <p>Pick something delicious from the menu and it will appear here.</p>
          <Link href="/menu" className="button">
            Browse menu
          </Link>
        </div>
      ) : (
        <div className="cart-layout">
          <div className="cart-lines">
            {items.map((item) => (
              <article className="cart-line" key={item.id}>
                <div className="cart-icon">
                  <Image src={`/${item.image}`} alt={item.name} width={55} height={55} sizes="55px" />
                </div>
                <div className="cart-info">
                  <h2>{item.name}</h2>
                  <p>{item.price.toLocaleString()} ETB each</p>
                </div>
                <div className="quantity">
                  <button onClick={() => decreaseItem(item.id)} aria-label={`Decrease ${item.name}`}>
                    −
                  </button>
                  <strong>{item.quantity}</strong>
                  <button onClick={() => addItem(item)} aria-label={`Increase ${item.name}`}>
                    +
                  </button>
                </div>
                <strong className="line-total">{(item.price * item.quantity).toLocaleString()} ETB</strong>
                <button className="remove-button" onClick={() => removeItem(item.id)}>
                  Remove
                </button>
              </article>
            ))}
          </div>

          <aside className="summary-card">
            <span className="eyebrow">ORDER SUMMARY</span>
            <div className="summary-row">
              <span>Items</span>
              <strong>{itemCount}</strong>
            </div>
            <div className="summary-row total">
              <span>Total</span>
              <strong>{total.toLocaleString()} ETB</strong>
            </div>
            <Link href="/checkout" className="button full">
              Continue to checkout
            </Link>
            <Link href="/menu" className="text-link center">
              + Add more food
            </Link>
          </aside>
        </div>
      )}
    </main>
  );
}
