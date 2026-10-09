import Link from "next/link";
import { redirect } from "next/navigation";
import { getSession } from "../../lib/session";
import CheckoutForm from "./CheckoutForm";

export const metadata = {
  title: "Checkout",
  description: "Enter your delivery details and place your Addis Eats order. Your cart is checked on the server before an order is created."
};

export default async function CheckoutPage() {
  const user = await getSession();

  if (!user) {
    redirect("/signin?next=/checkout");
  }

  return (
    <main className="container page checkout-page">
      <div className="page-heading">
        <div>
          <span className="eyebrow">SECURE CHECKOUT</span>
          <h1>Finish your order</h1>
          <p>Your cart is validated on the server before an order is created.</p>
        </div>
        <Link href="/cart" className="text-link">
          ← Back to cart
        </Link>
      </div>

      <CheckoutForm customerName={user.name} phone={user.phone} />
    </main>
  );
}
