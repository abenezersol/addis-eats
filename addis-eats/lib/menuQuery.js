// The one place that decides what a menu query returns. The route handler answers /api/dishes with it,
// and the menu page uses it to seed the client query, so the seed is byte-for-byte what the API would send.
export const CATEGORIES = ["starters", "mains", "desserts", "drinks"];
export const PAGE_SIZE = 6;

// category: one of CATEGORIES, or undefined for all. q: search text. page: 1-based (clamped into range).
export function queryDishes(dishes, { category, q = "", page = 1 } = {}) {
  const query = q.trim().toLowerCase();
  let result = category ? dishes.filter((dish) => dish.category === category) : dishes;

  if (query) {
    result = result.filter((dish) =>
      [dish.name, dish.description, dish.category, ...dish.tags].some((value) => value.toLowerCase().includes(query))
    );
  }

  const total = result.length;
  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE));
  const safePage = Math.min(page, totalPages);
  const start = (safePage - 1) * PAGE_SIZE;

  return { data: result.slice(start, start + PAGE_SIZE), page: safePage, pageSize: PAGE_SIZE, total, totalPages };
}
