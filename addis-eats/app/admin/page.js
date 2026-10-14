import Link from "next/link";
import { requireAdminPage } from "../../lib/adminGuard";
import { getOrders } from "../../lib/orders";
import { getDashboardStats } from "../../lib/stats";
import { ORDER_STATUSES } from "../../lib/orderStatus";
import { getDashboardChartData, formatETB } from "../../lib/dashboardData";
import RevenueChart from "./RevenueChart";
import OrdersLineChart from "./OrdersLineChart";

export const metadata = {
  title: "Admin dashboard",
  description: "Revenue, order counts, best-selling dishes and order status for Addis Eats."
};

export default async function AdminDashboardPage() {
  await requireAdminPage("/admin");
  const allOrders = getOrders();
  const stats = getDashboardStats(allOrders);
  const chartData = getDashboardChartData(allOrders);
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
          <strong>{formatETB(stats.revenue)}</strong>
          <small>From {stats.earningCount} non-cancelled orders</small>
        </div>
        <div className="stat-card">
          <span>Orders</span>
          <strong>{stats.orderCount}</strong>
          <small>{stats.cancelledCount} cancelled</small>
        </div>
        <div className="stat-card">
          <span>Average order value</span>
          <strong>{formatETB(stats.averageOrderValue)}</strong>
          <small>Revenue ÷ non-cancelled orders</small>
        </div>
      </section>

      <div className="admin-two-col">
        <section className="admin-panel" aria-labelledby="revenue-by-area-title">
          <h2 id="revenue-by-area-title">Revenue by neighbourhood</h2>
          <p className="panel-description">Revenue from non-cancelled orders, in ETB.</p>
          <RevenueChart data={chartData.revenueByNeighbourhood} />
          <div className="table-wrap chart-data-table">
            <table className="admin-table">
              <caption>Revenue by neighbourhood, in Ethiopian birr</caption>
              <thead><tr><th scope="col">Neighbourhood</th><th scope="col" className="numeric-cell">Revenue (ETB)</th></tr></thead>
              <tbody>
                {chartData.revenueByNeighbourhood.length ? chartData.revenueByNeighbourhood.map((row) => (
                  <tr key={row.area}><td>{row.area}</td><td className="numeric-cell">{formatETB(row.revenue)}</td></tr>
                )) : <tr><td colSpan={2}>No revenue data yet.</td></tr>}
              </tbody>
            </table>
          </div>
        </section>

        <section className="admin-panel" aria-labelledby="orders-over-time-title">
          <h2 id="orders-over-time-title">Orders per day — {chartData.monthLabel}</h2>
          <p className="panel-description">Number of orders created each day this month.</p>
          <OrdersLineChart data={chartData.ordersByDay} />
          <div className="table-wrap chart-data-table">
            <table className="admin-table">
              <caption>Daily order counts for {chartData.monthLabel}</caption>
              <thead><tr><th scope="col">Date</th><th scope="col" className="numeric-cell">Orders</th></tr></thead>
              <tbody>
                {chartData.ordersByDay.map((row) => (
                  <tr key={row.date}><td>{row.day}</td><td className="numeric-cell">{row.orders}</td></tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      </div>

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
                    <span>{index + 1}. {dish.name}</span>
                    <strong>{dish.quantity} sold</strong>
                  </div>
                  <div className="bar-track">
                    <div className="bar-fill" style={{ width: `${(dish.quantity / maxSold) * 100}%` }} />
                  </div>
                  <small>{formatETB(dish.revenue)}</small>
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
                <div className="bar-track" role="img" aria-label={`${status}: ${stats.statusCounts[status]} orders`}>
                  <div className={`bar-fill ${status}`} style={{ width: `${(stats.statusCounts[status] / maxStatus) * 100}%` }} />
                </div>
              </li>
            ))}
          </ul>
        </section>
      </div>

      <section className="admin-panel" aria-labelledby="recent-orders-title">
        <div className="dashboard-panel-heading">
          <h2 id="recent-orders-title">Recent orders</h2>
          <Link href="/admin/orders" className="text-link">View sortable order table →</Link>
        </div>
        {allOrders.length === 0 ? (
          <div className="empty-state">
            <div className="empty-icon" aria-hidden="true">📦</div>
            <h3>No orders yet</h3>
            <p>When customers place orders, the latest records will appear here.</p>
            <Link href="/menu" className="button secondary">Browse menu</Link>
          </div>
        ) : (
          <div className="table-wrap">
            <table className="admin-table">
              <caption>Five most recent orders</caption>
              <thead><tr><th scope="col">Order</th><th scope="col">Customer</th><th scope="col">Status</th><th scope="col">Placed</th><th scope="col" className="numeric-cell">Total (ETB)</th></tr></thead>
              <tbody>
                {allOrders.slice().sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()).slice(0, 5).map((order) => (
                  <tr key={order.id}>
                    <td><Link href={`/admin/orders/${order.id}`} className="text-link">{order.id}</Link></td>
                    <td>{order.customerName}</td>
                    <td><span className={`status ${order.status}`}>{order.status}</span></td>
                    <td>{new Date(order.createdAt).toLocaleDateString("en-ET")}</td>
                    <td className="numeric-cell">{formatETB(order.total)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </main>
  );
}
