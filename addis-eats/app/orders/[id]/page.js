import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { getSession } from "../../../lib/session";
import { findOrder } from "../../../lib/orders";
import OrderStatusClient from "./OrderStatusClient";

// Static on purpose: the order belongs to the signed-in customer, so nothing about it goes into a tag.
export const metadata = {
  title: "Order status",
  description: "Follow the live status of your Addis Eats order from pending and preparing to delivered."
};

export default async function OrderStatusPage({ params }) {
  const { id } = await params;
  const user = await getSession();
  if (!user) redirect(`/signin?next=${encodeURIComponent(`/orders/${id}`)}`);

  const order = findOrder(id);
  if (!order || order.userId !== user.id) notFound(); // someone else's order looks the same as a missing one

  return (
    <main className="container page">
      <div className="page-heading">
        <div>
          <span className="eyebrow">LIVE ORDER</span>
          <h1>Order status</h1>
          <p>This first view is rendered on the server, then SWR keeps the status fresh in your browser.</p>
        </div>
        <Link href="/orders/history" className="button secondary">Order history</Link>
      </div>
      <OrderStatusClient id={id} initial={order} />
    </main>
  );
}
