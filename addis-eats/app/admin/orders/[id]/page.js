import Link from "next/link";
import { notFound } from "next/navigation";
import { requireAdminPage } from "../../../../lib/adminGuard";
import { findOrder } from "../../../../lib/orders";
import { ORDER_FLOW } from "../../../../lib/orderStatus";
import AdminOrderActions from "../../AdminOrderActions";

export const metadata = {
  title: "Order details",
  description: "Customer information, ordered items and total for one Addis Eats order."
};

export default async function AdminOrderDetailsPage({ params }) {
  const { id } = await params;
  await requireAdminPage(`/admin/orders/${id}`);

  const order = findOrder(id);
  if (!order) notFound();

  const stepIndex = ORDER_FLOW.indexOf(order.status);

  return (
    <main className="container page">
      <div className="page-heading">
        <div>
          <span className="eyebrow">ADMIN · ORDER</span>
          <h1>Order {order.id}</h1>
          <p>
            Placed {new Date(order.createdAt).toLocaleString("en-US")} · <span className={`status ${order.status}`}>{order.status}</span>
          </p>
        </div>
        <Link href="/admin/orders" className="text-link">
          ← Back to orders
        </Link>
      </div>

      <ol className="timeline" aria-label="Order progress">
        {ORDER_FLOW.map((step, index) => (
          <li key={step} className={order.status !== "cancelled" && index <= stepIndex ? "done" : ""}>
            {step}
          </li>
        ))}
      </ol>
      {order.status === "cancelled" && <p className="muted">This order was cancelled by the customer.</p>}

      <div className="admin-two-col">
        <section className="admin-panel" aria-labelledby="customer-info">
          <h2 id="customer-info">Customer</h2>
          <dl className="detail-list">
            <div>
              <dt>Name</dt>
              <dd>{order.customerName}</dd>
            </div>
            <div>
              <dt>Phone</dt>
              <dd>{order.phone}</dd>
            </div>
            <div>
              <dt>Delivery area</dt>
              <dd>{order.deliveryArea}</dd>
            </div>
            <div>
              <dt>Account id</dt>
              <dd>{order.userId}</dd>
            </div>
          </dl>
        </section>

        <section className="admin-panel" aria-labelledby="order-items">
          <h2 id="order-items">Items</h2>
          <div className="table-wrap">
            <table className="admin-table">
              <thead>
                <tr>
                  <th>Dish</th>
                  <th>Qty</th>
                  <th>Price</th>
                  <th>Subtotal</th>
                </tr>
              </thead>
              <tbody>
                {order.items.map((item) => (
                  <tr key={item.id}>
                    <td>{item.name}</td>
                    <td>{item.quantity}</td>
                    <td>{item.price.toLocaleString("en-US")} ETB</td>
                    <td>{(item.price * item.quantity).toLocaleString("en-US")} ETB</td>
                  </tr>
                ))}
              </tbody>
              <tfoot>
                <tr>
                  <td colSpan={3}>Total</td>
                  <td>
                    <strong>{order.total.toLocaleString("en-US")} ETB</strong>
                  </td>
                </tr>
              </tfoot>
            </table>
          </div>
        </section>
      </div>

      <AdminOrderActions orderId={order.id} status={order.status} goToListAfterDelete />
    </main>
  );
}
