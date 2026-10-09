// Pure constants, safe to import from both server and client code.
export const ORDER_STATUSES = ["pending", "preparing", "delivering", "delivered", "cancelled"];

// The path an order follows. "cancelled" is outside it: only a pending order can be cancelled.
export const ORDER_FLOW = ["pending", "preparing", "delivering", "delivered"];

export const NEXT_STATUS = {
  pending: "preparing",
  preparing: "delivering",
  delivering: "delivered"
};

export const ADVANCE_LABELS = {
  pending: "Start preparing",
  preparing: "Send out for delivery",
  delivering: "Mark delivered"
};
