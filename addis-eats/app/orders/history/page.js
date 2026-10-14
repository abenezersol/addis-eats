import Link from "next/link";
import { redirect } from "next/navigation";
import { getSession } from "../../../lib/session";
import { getOrdersFor } from "../../../lib/orders";
import { etb, when } from "../../../lib/format";
import CancelOrderButton from "./CancelOrderButton";
import ExportOrdersButton from "./ExportOrdersButton";

export const metadata = {
  title: "Order history",
  description:
    "See every order you have placed with Addis Eats, track live orders and cancel the ones still pending."
};

export default async function OrderHistoryPage() {
  const user = await getSession();
  if (!user) redirect("/signin?next=/orders/history");

  const orders = getOrdersFor(user.id).reverse(); // Scoped to the session's own id.
  const exportOrders = orders.map((order) => ({
    ...order,
    items: order.items.map((item) => ({
      id: item.id,
      name: item.name,
      quantity: item.quantity,
      price: item.price
    }))
  }));

  return (
    <main className="container page">
      <div className="page-heading">
        <div>
          <span className="eyebrow">YOUR ACCOUNT</span>
          <h1>Order history</h1>
          <p>Every order placed with your account.</p>
        </div>
        <div className="actions">
          <ExportOrdersButton orders={exportOrders} />
          <Link href="/menu" className="button">
            Order again
          </Link>
        </div>
      </div>

      {!orders.length ? (
        <div className="empty-state large">
          <div className="empty-icon">📦</div>
          <h2>No orders yet</h2>
          <p>Your confirmed orders will appear here.</p>
          <Link href="/menu" className="button">
            Browse menu
          </Link>
        </div>
      ) : (
        <div className="orders-list">
          {orders.map((order) => (
            <article className="order-card" key={order.id}>
              <div className="order-head">
                <div>
                  <span className={`status ${order.status}`}>{order.status}</span>
                  <h2>Order {order.id}</h2>
                  <small>{when.format(new Date(order.createdAt))}</small>
                </div>
                <strong>{etb.format(order.total)}</strong>
              </div>
              <div className="order-items">
                {order.items.map((item) => (
                  <div key={item.id}>
                    <span>
                      {item.quantity} × {item.name}
                    </span>
                    <strong>{etb.format(item.price * item.quantity)}</strong>
                  </div>
                ))}
              </div>
              <div className="order-foot">
                <span>Deliver to {order.deliveryArea}</span>
                <div className="order-foot-actions">
                  <Link href={`/orders/${order.id}`} className="text-link">
                    Track live
                  </Link>
                  {order.status === "pending" && (
                    <CancelOrderButton orderId={order.id} />
                  )}
                </div>
              </div>
            </article>
          ))}
        </div>
      )}
    </main>
  );
}
