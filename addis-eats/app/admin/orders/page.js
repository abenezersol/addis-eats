import Link from "next/link";
import { requireAdminPage } from "../../../lib/adminGuard";
import { getOrders } from "../../../lib/orders";
import { ORDER_STATUSES } from "../../../lib/orderStatus";
import AdminOrderActions from "../AdminOrderActions";

export const metadata = {
  title: "Manage orders",
  description: "See every customer order, move it through its stages, or delete it."
};

export default async function AdminOrdersPage({ searchParams }) {
  await requireAdminPage("/admin/orders");
  const { status } = await searchParams;
  const filter = ORDER_STATUSES.includes(status) ? status : "all";

  const allOrders = getOrders().slice().reverse();
  const orders = filter === "all" ? allOrders : allOrders.filter((order) => order.status === filter);

  return (
    <main className="container page">
      <div className="page-heading">
        <div>
          <span className="eyebrow">ADMIN · ORDERS</span>
          <h1>Orders</h1>
          <p>Every customer order, newest first. {allOrders.length} in total.</p>
        </div>
      </div>

      <nav className="categories" aria-label="Filter orders by status">
        <Link href="/admin/orders" className={filter === "all" ? "chip active" : "chip"}>
          all
        </Link>
        {ORDER_STATUSES.map((value) => (
          <Link
            key={value}
            href={`/admin/orders?status=${value}`}
            className={filter === value ? "chip active" : "chip"}
          >
            {value}
          </Link>
        ))}
      </nav>

      {!orders.length ? (
        <div className="empty-state large">
          <div className="empty-icon">📦</div>
          <h2>No {filter === "all" ? "" : `${filter} `}orders</h2>
          <p>Orders will appear here as customers place them.</p>
        </div>
      ) : (
        <div className="orders-list">
          {orders.map((order) => (
            <article className="order-card" key={order.id}>
              <div className="order-head">
                <div>
                  <span className={`status ${order.status}`}>{order.status}</span>
                  <h2>Order {order.id}</h2>
                  <small>
                    {order.customerName} · {order.phone} · {new Date(order.createdAt).toLocaleString("en-US")}
                  </small>
                </div>
                <strong>{order.total.toLocaleString("en-US")} ETB</strong>
              </div>
              <div className="order-items">
                {order.items.map((item) => (
                  <div key={item.id}>
                    <span>
                      {item.quantity} × {item.name}
                    </span>
                  </div>
                ))}
              </div>
              <div className="order-foot">
                <span>Deliver to {order.deliveryArea}</span>
                <div className="order-foot-actions">
                  <Link href={`/admin/orders/${order.id}`} className="text-link">
                    View details
                  </Link>
                  <AdminOrderActions orderId={order.id} status={order.status} />
                </div>
              </div>
            </article>
          ))}
        </div>
      )}
    </main>
  );
}
