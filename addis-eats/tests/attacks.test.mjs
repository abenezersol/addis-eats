// Run with: npm test   (Node 20.19+ or 22+). These check the pure rules behind attacks 2 and 3 and the
// menu seed. Attack 1 needs a cookie jar, so it is run live (see AUTH.md).
import test from "node:test";
import assert from "node:assert/strict";
import { safeNext, safeAdminNext } from "../lib/safeNext.js";
import { createOrder, cancelOwnedOrder, getOrdersFor, advanceOrderStatus, deleteOrder, findOrder } from "../lib/orders.js";
import { queryDishes, PAGE_SIZE } from "../lib/menuQuery.js";
import { dishes } from "../app/menu/dishes.js";
import { getAllDishes, getAvailableDishes, createDish, updateDish, setDishAvailability, deleteDish, getDish } from "../lib/dishStore.js";
import { getDashboardStats } from "../lib/stats.js";

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
