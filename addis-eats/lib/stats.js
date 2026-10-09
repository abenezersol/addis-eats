import { ORDER_STATUSES } from "./orderStatus.js";

const TOP_DISH_COUNT = 5;

// Everything the dashboard shows, computed from the order list.
// Revenue and the average ignore cancelled orders, because that money was never earned.
export function getDashboardStats(orders) {
  const earning = orders.filter((order) => order.status !== "cancelled");
  const revenue = earning.reduce((sum, order) => sum + order.total, 0);
  const averageOrderValue = earning.length ? Math.round(revenue / earning.length) : 0;

  const statusCounts = Object.fromEntries(ORDER_STATUSES.map((status) => [status, 0]));
  for (const order of orders) {
    if (order.status in statusCounts) statusCounts[order.status] += 1;
  }

  const byDish = new Map();
  for (const order of earning) {
    for (const item of order.items) {
      const entry = byDish.get(item.id) ?? { id: item.id, name: item.name, quantity: 0, revenue: 0 };
      entry.quantity += item.quantity;
      entry.revenue += item.price * item.quantity;
      byDish.set(item.id, entry);
    }
  }
  const topDishes = [...byDish.values()]
    .sort((a, b) => b.quantity - a.quantity || a.name.localeCompare(b.name))
    .slice(0, TOP_DISH_COUNT);

  return {
    revenue,
    orderCount: orders.length,
    earningCount: earning.length,
    cancelledCount: statusCounts.cancelled,
    averageOrderValue,
    statusCounts,
    topDishes
  };
}
