import Link from "next/link";
import { requireAdminPage } from "../../lib/adminGuard";
import { getOrders } from "../../lib/orders";
import { getDashboardStats } from "../../lib/stats";
import { ORDER_STATUSES } from "../../lib/orderStatus";

export const metadata = {
  title: "Admin dashboard",
  description: "Revenue, order counts, best-selling dishes and order status for Addis Eats."
};

function etb(amount) {
  return `${amount.toLocaleString("en-US")} ETB`;
}

export default async function AdminDashboardPage() {
  await requireAdminPage("/admin");
  const stats = getDashboardStats(getOrders());
  const maxStatus = Math.max(1, ...Object.values(stats.statusCounts));
  const maxSold = Math.max(1, ...stats.topDishes.map((dish) => dish.quantity));

  return (
    <main className="container page">
      <div className="page-heading">
        <div>
          <span className="eyebrow">ADMIN</span>
          <h1>Dashboard</h1>
          <p>How the restaurant is doing right now. Cancelled orders are not counted as revenue.</p>
        </div>
        <div className="actions">
          <Link href="/admin/dishes" className="button secondary">
            Manage dishes
          </Link>
          <Link href="/admin/orders" className="button">
            Manage orders
          </Link>
        </div>
      </div>

      <section className="stat-grid" aria-label="Key numbers">
        <div className="stat-card">
          <span>Total revenue</span>
          <strong>{etb(stats.revenue)}</strong>
          <small>From {stats.earningCount} non-cancelled orders</small>
        </div>
        <div className="stat-card">
          <span>Orders</span>
          <strong>{stats.orderCount}</strong>
          <small>{stats.cancelledCount} cancelled</small>
        </div>
        <div className="stat-card">
          <span>Average order value</span>
          <strong>{etb(stats.averageOrderValue)}</strong>
          <small>Revenue ÷ non-cancelled orders</small>
        </div>
      </section>

      <div className="admin-two-col">
        <section className="admin-panel" aria-labelledby="top-dishes">
          <h2 id="top-dishes">Top-selling dishes</h2>
          {!stats.topDishes.length ? (
            <p className="muted">No sales yet. Dishes appear here once orders come in.</p>
          ) : (
            <ol className="bar-list">
              {stats.topDishes.map((dish, index) => (
                <li key={dish.id}>
                  <div className="bar-label">
                    <span>
                      {index + 1}. {dish.name}
                    </span>
                    <strong>{dish.quantity} sold</strong>
                  </div>
                  <div className="bar-track">
                    <div className="bar-fill" style={{ width: `${(dish.quantity / maxSold) * 100}%` }} />
                  </div>
                  <small>{etb(dish.revenue)}</small>
                </li>
              ))}
            </ol>
          )}
        </section>

        <section className="admin-panel" aria-labelledby="status-distribution">
          <h2 id="status-distribution">Orders by status</h2>
          <ul className="bar-list">
            {ORDER_STATUSES.map((status) => (
              <li key={status}>
                <div className="bar-label">
                  <span className={`status ${status}`}>{status}</span>
                  <strong>{stats.statusCounts[status]}</strong>
                </div>
                <div className="bar-track">
                  <div
                    className={`bar-fill ${status}`}
                    style={{ width: `${(stats.statusCounts[status] / maxStatus) * 100}%` }}
                  />
                </div>
              </li>
            ))}
          </ul>
        </section>
      </div>
    </main>
  );
}
