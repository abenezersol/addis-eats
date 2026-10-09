import { dishes as seedDishes } from "../app/menu/dishes.js";

export const PLACEHOLDER_IMAGE = "images/placeholder.png";

// In-memory store, like orders and users: it starts from the seed list and resets when the server restarts.
const store =
  globalThis.__addisEatsDishes ??
  seedDishes.map((dish) => ({ ...dish, tags: [...dish.tags], available: true }));
globalThis.__addisEatsDishes = store;

function sorted(list) {
  return list.slice().sort((a, b) => a.id - b.id);
}

// Every dish, including the ones an admin has switched off. Admin screens use this.
export function getAllDishes() {
  return sorted(store);
}

// Only dishes a customer may see and order.
export function getAvailableDishes() {
  return sorted(store.filter((dish) => dish.available));
}

export function getDish(id) {
  return store.find((dish) => String(dish.id) === String(id));
}

export function createDish(data) {
  const id = store.reduce((highest, dish) => Math.max(highest, dish.id), 0) + 1;
  const dish = { ...data, id, image: data.image || PLACEHOLDER_IMAGE };
  store.push(dish);
  return { dish };
}

export function updateDish(id, data) {
  const dish = getDish(id);
  if (!dish) return { error: "Dish not found", status: 404 };
  Object.assign(dish, data, { id: dish.id, image: data.image || dish.image });
  return { dish };
}

export function setDishAvailability(id, available) {
  const dish = getDish(id);
  if (!dish) return { error: "Dish not found", status: 404 };
  dish.available = Boolean(available);
  return { dish };
}

export function deleteDish(id) {
  const index = store.findIndex((dish) => String(dish.id) === String(id));
  if (index === -1) return { error: "Dish not found", status: 404 };
  const [dish] = store.splice(index, 1);
  return { dish };
}
