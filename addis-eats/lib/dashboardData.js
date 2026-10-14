const etbFormatter = new Intl.NumberFormat("en-ET", {
  style: "currency",
  currency: "ETB",
  maximumFractionDigits: 0
});

export function formatETB(amount) {
  return etbFormatter.format(Number.isFinite(amount) ? amount : 0);
}

/** Return small, serialisable summaries for the dashboard charts. */
export function getDashboardChartData(orders, now = new Date()) {
  const revenueByArea = new Map();
  for (const order of orders) {
    // Cancelled orders did not earn revenue; do not count them in this chart.
    if (order.status === "cancelled") continue;

    // Trim and collapse whitespace, then group case-insensitively so values such
    // as "Bole", " bole " and "BOLE" do not become separate chart categories.
    const rawArea = typeof order.deliveryArea === "string"
      ? order.deliveryArea.trim().replace(/\s+/g, " ")
      : "";
    const area = rawArea || "Unknown area";
    const areaKey = area.toLocaleLowerCase("en");
    const total = Number(order.total);

    // Ignore malformed totals rather than allowing NaN to corrupt the sum.
    if (!Number.isFinite(total) || total < 0) continue;

    const existing = revenueByArea.get(areaKey);
    if (existing) {
      existing.revenue += total;
    } else {
      revenueByArea.set(areaKey, { area, revenue: total });
    }
  }

  const revenueByNeighbourhood = [...revenueByArea.values()]
    .map(({ area, revenue }) => ({ area, revenue }))
    .sort((a, b) => b.revenue - a.revenue || a.area.localeCompare(b.area));

  const year = now.getFullYear();
  const month = now.getMonth();
  const dayCount = now.getDate();
  const ordersByDay = Array.from({ length: dayCount }, (_, index) => {
    const date = new Date(year, month, index + 1);
    return {
      date: `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`,
      day: date.toLocaleDateString("en-ET", { month: "short", day: "numeric" }),
      orders: 0
    };
  });
  const dailyIndex = new Map(ordersByDay.map((entry, index) => [entry.date, index]));

  for (const order of orders) {
    if (!order.createdAt) continue;
    const createdAt = new Date(order.createdAt);
    if (Number.isNaN(createdAt.getTime())) continue;
    const key = `${createdAt.getFullYear()}-${String(createdAt.getMonth() + 1).padStart(2, "0")}-${String(createdAt.getDate()).padStart(2, "0")}`;
    const index = dailyIndex.get(key);
    if (index !== undefined) ordersByDay[index].orders += 1;
  }

  return {
    revenueByNeighbourhood,
    ordersByDay,
    monthLabel: now.toLocaleDateString("en-ET", { month: "long", year: "numeric" })
  };
}
