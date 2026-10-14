import { NEXT_STATUS } from "./orderStatus.js";

const orders = globalThis.__addisEatsOrders ?? [];
globalThis.__addisEatsOrders = orders;

// Demonstration-only idempotency store. Production must move orders and these keys to
// a persistent database with a unique constraint so retries are safe across instances.
const idempotencyRecords = globalThis.__addisEatsIdempotency ?? new Map();
globalThis.__addisEatsIdempotency = idempotencyRecords;

function insertOrder(data, userId) {
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

export function createOrder(data, userId) {
  return insertOrder(data, userId);
}

/**
 * Creates an order once for a given user + submission key.
 * Reusing a key with different order data is rejected rather than silently changing it.
 */
export function createOrderOnce(data, userId, idempotencyKey) {
  if (typeof idempotencyKey !== "string" || !/^[A-Za-z0-9:_-]{8,200}$/.test(idempotencyKey)) {
    return { error: "A valid order submission key is required.", status: 400 };
  }

  const recordKey = `${userId}:${idempotencyKey}`;
  const fingerprint = JSON.stringify(data);
  const existing = idempotencyRecords.get(recordKey);

  if (existing) {
    if (existing.fingerprint !== fingerprint) {
      return { error: "This submission key was already used for different order details. Refresh checkout and try again.", status: 409 };
    }
    const order = orders.find((item) => item.id === existing.orderId);
    if (order) return { order, replayed: true };
    // If an admin removed the order, do not recreate it using a stale key.
    return { error: "This order submission was already processed. Refresh your order history.", status: 409 };
  }

  const order = insertOrder(data, userId);
  idempotencyRecords.set(recordKey, { fingerprint, orderId: order.id });
  return { order, replayed: false };
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
