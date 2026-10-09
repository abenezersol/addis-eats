import { NEXT_STATUS } from "./orderStatus.js";

const orders = globalThis.__addisEatsOrders ?? [];
globalThis.__addisEatsOrders = orders;

export function createOrder(data, userId) {
  const order = {
    id: `ord_${crypto.randomUUID().slice(0, 8)}`,
    userId,
    status: "pending",
    currency: "ETB",
    ...data,
    createdAt: new Date().toISOString()
  };
  orders.push(order);
  return order;
}

export function getOrders() {
  return orders;
}

export function getOrdersFor(userId) {
  return orders.filter((order) => order.userId === userId);
}

export function findOrder(id) {
  return orders.find((order) => order.id === id);
}

export function cancelOwnedOrder(id, userId) {
  const order = findOrder(id);
  if (!order) return { error: "Order not found", status: 404 };
  if (order.userId !== userId) return { error: "You are not allowed to cancel this order", status: 403 };
  if (order.status !== "pending") return { error: "Only pending orders can be cancelled", status: 422 };
  order.status = "cancelled";
  return { order };
}

export function advanceOrderStatus(id) {
  const order = findOrder(id);
  if (!order) return { error: "Order not found", status: 404 };
  const next = NEXT_STATUS[order.status];
  if (!next) return { error: `A ${order.status} order cannot be advanced`, status: 422 };
  order.status = next;
  return { order };
}

export function deleteOrder(id) {
  const index = orders.findIndex((order) => order.id === id);
  if (index === -1) return { error: "Order not found", status: 404 };
  const [order] = orders.splice(index, 1);
  return { order };
}
