// Run with: npm test   (Node 20.19+ or 22+). These check the pure rules behind attacks 2 and 3 and the
// menu seed. Attack 1 needs a cookie jar, so it is run live (see AUTH.md).
import test from "node:test";
import assert from "node:assert/strict";
import { safeNext, safeAdminNext } from "../lib/safeNext.js";
import { createOrder, createOrderOnce, cancelOwnedOrder, getOrdersFor, advanceOrderStatus, deleteOrder, findOrder } from "../lib/orders.js";
import { queryDishes, PAGE_SIZE } from "../lib/menuQuery.js";
import { dishes } from "../app/menu/dishes.js";
import { getAllDishes, getAvailableDishes, createDish, updateDish, setDishAvailability, deleteDish, getDish } from "../lib/dishStore.js";
import { getDashboardStats } from "../lib/stats.js";
import { getDashboardChartData, formatETB } from "../lib/dashboardData.js";

test("attack 3: a crafted next never leaves the site", () => {
  for (const value of ["https://example.com", "//example.com", "/\\example.com", "/\t/example.com", "javascript:alert(1)", undefined, ""]) {
    assert.equal(safeNext(value), "/", `next=${JSON.stringify(value)}`);
  }
  // Encoded backslash is an ordinary path on THIS site (it 404s here); it cannot reach another host.
  assert.equal(safeNext("/%5Cexample.com"), "/%5Cexample.com");
  assert.equal(safeNext("/checkout"), "/checkout");
  assert.equal(safeNext("/signin"), "/");
});

test("attack 2: another account cannot cancel my order", () => {
  const alice = createOrder({ items: [], total: 0 }, "usr_alice");
  const refused = cancelOwnedOrder(alice.id, "usr_bob");
  assert.equal(refused.status, 403);
  assert.equal(alice.status, "pending"); // untouched
  assert.equal(cancelOwnedOrder("ord_missing", "usr_bob").status, 404);
  assert.equal(cancelOwnedOrder(alice.id, "usr_alice").order.status, "cancelled"); // the owner still can
});

test("ownership: history is scoped to the session's own id", () => {
  const mine = createOrder({ items: [], total: 0 }, "usr_scope_a");
  createOrder({ items: [], total: 0 }, "usr_scope_b");
  const ids = getOrdersFor("usr_scope_a").map((order) => order.id);
  assert.deepEqual(ids, [mine.id]);
});

test("an order moves pending, preparing, delivering, delivered, and then stops", () => {
  const order = createOrder({ items: [], total: 0 }, "usr_flow");
  assert.equal(advanceOrderStatus(order.id).order.status, "preparing");
  assert.equal(advanceOrderStatus(order.id).order.status, "delivering");
  assert.equal(advanceOrderStatus(order.id).order.status, "delivered");
  assert.equal(advanceOrderStatus(order.id).status, 422);
  assert.equal(advanceOrderStatus("ord_missing").status, 404);
});

test("a cancelled order cannot be advanced", () => {
  const order = createOrder({ items: [], total: 0 }, "usr_cancel");
  cancelOwnedOrder(order.id, "usr_cancel");
  assert.equal(advanceOrderStatus(order.id).status, 422);
});

test("admin can delete an order, and only once", () => {
  const order = createOrder({ items: [], total: 0 }, "usr_delete");
  assert.equal(deleteOrder(order.id).order.id, order.id);
  assert.equal(findOrder(order.id), undefined);
  assert.equal(deleteOrder(order.id).status, 404);
});

test("admin sign-in can only lead to an admin page", () => {
  assert.equal(safeAdminNext("/admin/orders"), "/admin/orders");
  assert.equal(safeAdminNext("/admin"), "/admin");
  for (const value of ["/", "/checkout", "/admin/login", "//example.com", "https://example.com", undefined]) {
    assert.equal(safeAdminNext(value), "/admin", `next=${JSON.stringify(value)}`);
  }
});

test("dish CRUD: create, edit, switch off and on, delete", () => {
  const before = getAllDishes().length;
  const { dish } = createDish({ name: "Test Dish", description: "A dish for the tests", price: 120, category: "mains", image: "", tags: ["test"], spicy: false, available: true });
  assert.equal(getAllDishes().length, before + 1);
  assert.ok(dish.id > dishes.length);
  assert.equal(dish.image, "images/placeholder.png");

  assert.equal(updateDish(dish.id, { name: "Renamed", price: 150 }).dish.name, "Renamed");
  assert.equal(getDish(dish.id).price, 150);
  assert.equal(updateDish(99999, { name: "x" }).status, 404);

  setDishAvailability(dish.id, false);
  assert.ok(!getAvailableDishes().some((item) => item.id === dish.id));
  assert.ok(getAllDishes().some((item) => item.id === dish.id));
  setDishAvailability(dish.id, true);
  assert.ok(getAvailableDishes().some((item) => item.id === dish.id));

  assert.equal(deleteDish(dish.id).dish.id, dish.id);
  assert.equal(getDish(dish.id), undefined);
  assert.equal(deleteDish(dish.id).status, 404);
  assert.equal(getAllDishes().length, before);
});

test("dashboard: revenue, average, top dishes and status counts ignore cancelled orders correctly", () => {
  const tibs = { id: 7, name: "Beef Tibs", price: 700 };
  const sambusa = { id: 1, name: "Sambusa", price: 30 };
  const orders = [
    { status: "delivered", total: 1430, items: [{ ...tibs, quantity: 2 }, { ...sambusa, quantity: 1 }] },
    { status: "pending", total: 60, items: [{ ...sambusa, quantity: 2 }] },
    { status: "cancelled", total: 5000, items: [{ ...tibs, quantity: 9 }] }
  ];
  const stats = getDashboardStats(orders);
  assert.equal(stats.revenue, 1490);
  assert.equal(stats.orderCount, 3);
  assert.equal(stats.cancelledCount, 1);
  assert.equal(stats.averageOrderValue, 745);
  assert.deepEqual(stats.statusCounts, { pending: 1, preparing: 0, delivering: 0, delivered: 1, cancelled: 1 });
  assert.deepEqual(stats.topDishes.map((dish) => [dish.name, dish.quantity]), [["Sambusa", 3], ["Beef Tibs", 2]]);
  assert.equal(getDashboardStats([]).averageOrderValue, 0);
});

test("Day 46 dashboard summaries group revenue and orders by day", () => {
  const now = new Date(2026, 9, 13, 12, 0, 0);
  const orders = [
    { status: "delivered", total: 500, deliveryArea: "Bole", createdAt: "2026-10-02T10:00:00.000Z" },
    { status: "pending", total: 300, deliveryArea: "Bole", createdAt: "2026-10-02T12:00:00.000Z" },
    { status: "delivered", total: 700, deliveryArea: "Piazza", createdAt: "2026-10-03T09:00:00.000Z" },
    { status: "cancelled", total: 9000, deliveryArea: "Bole", createdAt: "2026-10-03T09:00:00.000Z" }
  ];
  const summary = getDashboardChartData(orders, now);
  assert.deepEqual(summary.revenueByNeighbourhood, [
    { area: "Bole", revenue: 800 },
    { area: "Piazza", revenue: 700 }
  ]);
  assert.equal(summary.ordersByDay.length, 13);
  assert.equal(summary.ordersByDay.find((row) => row.date === "2026-10-02").orders, 2);
  assert.equal(summary.ordersByDay.find((row) => row.date === "2026-10-03").orders, 2);
  assert.equal(summary.monthLabel, "October 2026");
  assert.match(formatETB(14200), /14,200/);
});

test("Day 46 revenue groups equivalent neighbourhood names and ignores invalid totals", () => {
  const orders = [
    { status: "delivered", total: 500, deliveryArea: "Bole" },
    { status: "pending", total: 300, deliveryArea: " bole  " },
    { status: "delivered", total: 200, deliveryArea: "BOLE" },
    { status: "delivered", total: 100, deliveryArea: "Bole    Atlas" },
    { status: "delivered", total: 700, deliveryArea: "Piazza" },
    { status: "cancelled", total: 9000, deliveryArea: "Bole" },
    { status: "delivered", total: "not-a-number", deliveryArea: "Piazza" }
  ];

  assert.deepEqual(getDashboardChartData(orders).revenueByNeighbourhood, [
    { area: "Bole", revenue: 1000 },
    { area: "Piazza", revenue: 700 },
    { area: "Bole Atlas", revenue: 100 }
  ]);
});

test("menu seed equals the API answer shape", () => {
  const first = queryDishes(dishes, { page: 1 });
  assert.equal(first.data.length, PAGE_SIZE);
  assert.equal(first.total, dishes.length);
  assert.equal(first.totalPages, Math.ceil(dishes.length / PAGE_SIZE));
  const mains = queryDishes(dishes, { category: "mains", page: 2 });
  assert.ok(mains.data.every((dish) => dish.category === "mains"));
  assert.equal(queryDishes(dishes, { page: 999 }).page, first.totalPages); // clamped, like the route
  assert.equal(queryDishes(dishes, { q: "  KITFO " }).total, 1);
  assert.equal(queryDishes(dishes, { q: "zzzz" }).data.length, 0);
});


import { csvCell, ordersToCsv } from "../lib/csv.js";
import { etb, when, relative } from "../lib/format.js";

test("Day 47 CSV escapes commas, quotes, and newlines without shifting columns", () => {
  assert.equal(csvCell('Bole, "Kitfo"\nHouse'), '"Bole, ""Kitfo""\nHouse"');
  assert.equal(csvCell(null), "");
  const csv = ordersToCsv([{
    id: "ord_test", createdAt: "2026-10-13T10:00:00.000Z", status: "pending",
    customerName: 'Abebe, "A"', phone: "0911000000", deliveryArea: "Bole\nAtlas",
    total: 100, items: [{ quantity: 1, name: 'Doro "Special"', price: 100 }]
  }]);
  assert.match(csv, /"Abebe, ""A"""/);
  assert.match(csv, /"Bole\nAtlas"/);
  assert.match(csv, /"1 x Doro ""Special"""/);
});

test("Day 47 shared locale formatters are available", () => {
  assert.match(etb.format(14200), /14,200/);
  assert.ok(when.format(new Date("2026-10-13T15:40:00Z")).length > 0);
  assert.equal(relative.format(-12, "minute"), "12 minutes ago");
});


test("Day 48 duplicate order submissions return the same order", () => {
  const userId = "usr_idempotency_test";
  const key = "checkout-test-key-001";
  const data = { customerName: "Test Customer", items: [{ id: 1, quantity: 1 }], total: 100 };
  const first = createOrderOnce(data, userId, key);
  const retry = createOrderOnce(data, userId, key);

  assert.equal(first.error, undefined);
  assert.equal(retry.error, undefined);
  assert.equal(first.order.id, retry.order.id);
  assert.equal(retry.replayed, true);
  assert.equal(getOrdersFor(userId).filter((order) => order.id === first.order.id).length, 1);
});

test("Day 48 idempotency keys cannot be reused for different order data", () => {
  const userId = "usr_idempotency_conflict";
  const key = "checkout-conflict-key-01";
  createOrderOnce({ total: 100, items: [] }, userId, key);
  const conflict = createOrderOnce({ total: 200, items: [] }, userId, key);
  assert.equal(conflict.status, 409);
  assert.match(conflict.error, /different order details/);
});
