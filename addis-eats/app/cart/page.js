import CartView from "./CartView";

// A page marked "use client" cannot export metadata, so this page stays on the server and the
// interactive cart lives in a client leaf (the Day 38 pattern).
export const metadata = {
  title: "Shopping cart",
  description: "Review the dishes in your cart, change quantities and see your total in ETB before you continue to checkout."
};

export default function CartPage() {
  return <CartView />;
}
