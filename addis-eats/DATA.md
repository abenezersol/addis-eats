# Addis Eats — Data Map 

| Query | Key | Refresh rule | Reasoning |
|---|---|---|---|
| Order status | `/api/orders/${id}` | `refreshInterval: 5000`; revalidate on focus | Order status can change while the customer waits, so poll every five seconds and refresh when the tab returns. |
| Signed-in user (header) | `/api/me` | Revalidated after every navigation (`AuthNav`) | The header sits in a static layout that cannot read cookies, so it asks the server who is signed in. |
| Menu search + category + page | `/api/dishes?category=...&q=...&page=...` | Revalidate on key change; `keepPreviousData: true` | The key identifies the exact result set. Debouncing limits requests while typing and previous data prevents an empty flash. |
| Menu seed | Same menu query key, `fallbackData: queryDishes(initialDishes, { category, page })` | Client revalidates after first paint | The seed comes from the same function the API uses (`lib/menuQuery.js`), so it is exactly what the API answers, for any category and page, and nobody watches a skeleton for data the page already had. |

## Decision 2 — where data is fetched

| Data | Server or client | Where, and why |
|---|---|---|
| Menu and dishes | Server first | `app/menu/page.js` and `app/menu/[id]/page.js` read `dishes.js` on the server: public, indexable, cacheable. The menu page passes the dishes to the explorer as props. |
| Dish page | Server | `generateMetadata`, the JSON-LD and the page itself read the same dish record. |
| Order history | Server | `app/orders/history/page.js` queries `getOrdersFor(session.id)`: private, scoped to the session. |
| Order status | Server first, then polled on the client | The page verifies ownership and passes the order as `fallbackData`; `OrderStatusClient` polls `/api/orders/${id}` every 5 s. |
| Menu search | Client | Triggered by typing, debounced 300 ms, key `null` while the box is empty. Not seeded: there is nothing to seed before the person types. |
| Cart | Client store | `app/providers.jsx`; it never leaves the browser until `placeOrder` sends only ids and quantities. |
| Signed-in user (header) | Client | The root layout is static and cannot read cookies, so `AuthNav` asks `/api/me`. |

## Menu search behavior

The search term is debounced by 300 ms. An empty search term is represented by the SWR null-key pattern in the query construction so no empty search request is required; category-only browsing continues through the menu query.

To check it: open DevTools → Network → Fetch/XHR, clear it, type five characters in the search box at a normal speed and stop. Count the `/api/dishes?q=…` requests (you want one, after the pause), then set throttling to Slow 4G, reload `/menu?category=mains&page=2` and check the mains are on screen as soon as the page hydrates, before the `/api/dishes` response arrives (the query's own loading skeleton never shows for browsing, because the seed is always there).

## Paging

The menu page number is stored in the `page` query-string parameter. This keeps numbered pages linkable and shareable, while SWR keeps the previous page visible during the next request.

## Server/client boundary

The order-status page fetches the first order value on the server and passes it to the client as `fallbackData`. The client then owns polling. Menu data starts with the server-rendered list and is revalidated by the client for search, category changes, and paging.
