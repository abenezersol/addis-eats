// RFC-4180-style escaping for a single CSV cell.
export function csvCell(value) {
  const text = String(value ?? "");
  return /[",\r\n]/.test(text) ? `"${text.replace(/"/g, '""')}"` : text;
}

export function ordersToCsv(orders) {
  const rows = [
    [
      "Order ID",
      "Placed at",
      "Status",
      "Customer",
      "Phone",
      "Delivery area",
      "Total (ETB)",
      "Items"
    ],
    ...orders.map((order) => [
      order.id,
      order.createdAt,
      order.status,
      order.customerName,
      order.phone,
      order.deliveryArea,
      order.total,
      (order.items ?? [])
        .map((item) => `${item.quantity} x ${item.name}`)
        .join("; ")
    ])
  ];

  return rows.map((row) => row.map(csvCell).join(",")).join("\r\n");
}
