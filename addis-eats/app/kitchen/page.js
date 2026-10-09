import { notFound, redirect } from "next/navigation";
import { getSession } from "../../lib/session";
import { getOrders } from "../../lib/orders";
import AdvanceOrderButton from "./AdvanceOrderButton";

export const metadata = {
  title: "Kitchen",
  description: "Staff-only order board for the Addis Eats kitchen: every order, newest first, moved along from pending to delivered."
};

export default async function KitchenPage() {
  const user = await getSession();
  if (!user) redirect("/signin?next=/kitchen");
  if (user.role !== "staff") notFound(); // refused on the server, not just hidden

  const orders = getOrders().slice().reverse();

  return (
    <main className="container page">
      <div className="page-heading">
        <div>
          <span className="eyebrow">STAFF ONLY</span>
          <h1>Kitchen</h1>
          <p>Every order, newest first. Move each one along as it is prepared and delivered.</p>
        </div>
      </div>
      {!orders.length ? (
        <div className="empty-state large"><div className="empty-icon">👨‍🍳</div><h2>No orders yet</h2><p>New orders will appear here.</p></div>
      ) : (
        <div className="orders-list">
          {orders.map((order) => (
            <article className="order-card" key={order.id}>
              <div className="order-head">
                <div>
                  <span className={`status ${order.status}`}>{order.status}</span>
                  <h2>Order {order.id}</h2>
                  <small>{order.customerName} · {order.phone} · {new Date(order.createdAt).toLocaleString()}</small>
                </div>
                <strong>{order.total.toLocaleString()} ETB</strong>
              </div>
              <div className="order-items">
                {order.items.map((item) => (
                  <div key={item.id}><span>{item.quantity} × {item.name}</span></div>
                ))}
              </div>
              <div className="order-foot">
                <span>Deliver to {order.deliveryArea}</span>
                <AdvanceOrderButton orderId={order.id} status={order.status} />
              </div>
            </article>
          ))}
        </div>
      )}
    </main>
  );
}
