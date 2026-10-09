# Addis Eats — Next.js

A food-ordering app for Addis Ababa built with the Next.js App Router. It grew from Day 36 to Day 45: routing and layouts, rendering strategies, server/client boundaries, route handlers, Zod validation, server actions, SWR live data, real authentication, performance work, metadata and SEO (Day 44), and — on Day 45 — the finishing pass: the three decision tables, the three attacks, and deployment.

## Run it

```bash
npm install
cp .env.example .env.local         # optional: set STAFF_PASSWORD there
npm run build
npm run start                      # or: npm run dev
```

Open http://localhost:3000. Dish photos are served from `public/images/` (add that folder from your earlier days if it is missing).

## Routes

| Route | What it is | Access |
|---|---|---|
| `/` | Landing page with today's specials | Public |
| `/menu`, `/menu/[id]` | Menu with search, categories, paging; dish details | Public |
| `/cart` | Cart (server page, client `CartView`) | Public |
| `/signin`, `/signup` | Phone + password account pages | Public |
| `/checkout` | Server-validated checkout | Signed in |
| `/orders/history`, `/orders/[id]` | Your orders; live status with SWR | Signed in, own orders only |
| `/favorites` | Dishes you saved with the heart button (kept in this browser) | Public |
| `/kitchen` | All orders, advance their status | Staff only |
| `/admin/login` | Admin username + password sign-in | Public |
| `/admin` | Dashboard: revenue, order count, average order value, top dishes, orders by status | Admin only |
| `/admin/dishes`, `/admin/dishes/new`, `/admin/dishes/[id]/edit` | Menu CRUD: search, add, edit, delete (with confirmation), switch a dish on/off | Admin only |
| `/admin/orders`, `/admin/orders/[id]` | All orders, advance status, delete (with confirmation), full order details | Admin only |
| `/api/dishes`, `/api/dishes/[id]` | Menu endpoints | Public |
| `/api/orders`, `/api/orders/[id]` | Create an order; read your own order | Signed in |
| `/api/me` | Who is signed in (`{ user }` or `{ user: null }`) | Public |
| `/api/admin/me` | Is an admin signed in (`{ admin }` or `{ admin: null }`) | Public |
| `/sitemap.xml`, `/robots.txt` | Generated from the dishes and `lib/site.js` | Public |

## Admin area and favorites

**Admin login:** open `/admin/login`. Default username `admin`, password `admin-demo-1234`. Set `ADMIN_USERNAME` and `ADMIN_PASSWORD` in `.env.local` (see `.env.example`) and restart the server. Always change them before deploying.

| Feature | Where it lives |
|---|---|
| Admin login and session | `app/admin/AdminLoginForm.jsx`, `lib/admin.js`, `lib/adminSession.js` |
| Session in context + `sessionStorage` | `app/admin/AdminProvider.jsx`. It keeps the admin logged in on screen after a refresh. The real permission is the `httpOnly` `admin_session` cookie, checked again in every admin page and action. |
| Dashboard analytics, top dishes, status distribution | `app/admin/page.js`, `lib/stats.js` |
| Dish CRUD, search, delete confirmation | `app/admin/AdminDishTable.jsx`, `DishForm.jsx`, `ConfirmDeleteButton.jsx`, `lib/dishStore.js`, `lib/dishSchema.js` |
| Menu item on/off | `app/admin/AvailabilityToggle.jsx`. A dish that is off is hidden from the menu, the home page, the sitemap and the API list, and cannot be ordered (the server refuses it). |
| Orders: list, advance, delete, details | `app/admin/orders/`, `app/admin/AdminOrderActions.jsx`, `lib/orders.js`, `lib/orderStatus.js` |
| Add to favorites | `app/menu/FavoriteButton.jsx`, `FavoritesProvider` in `app/providers.jsx`, `app/favorites/` |

Order status now follows **pending → preparing → delivering → delivered** (a pending order can also be cancelled by its customer). The kitchen page uses the same flow.

Dishes, like users and orders, are held in server memory: admin changes reset when the server restarts. New dishes use `images/placeholder.png` unless the admin enters another path under `public/images/`.

Favorites are stored per browser (localStorage), not per account.

## Live URL

**Deployed URL: _paste it here once deployed (see `DEPLOY.md`)_.** Nothing below counts as done until the evidence column has something in it.

## Day 45 — the finishing pass

| Area | Evidence | Where it is recorded |
|---|---|---|
| Accounts | Cookie flags (`HttpOnly`, `Secure`, `SameSite=Lax`, 7-day expiry) visible in DevTools → Application → Cookies after sign-in; the cookie is gone after sign-out | `AUTH.md` → How a session works |
| Protection | Middleware, page check and an action/handler check on every private route | `AUTH.md` → Decision 1, then the layer table |
| Ownership | Every query scoped to the session's own id; changing the id in `/orders/<id>` is a 404 | `AUTH.md` → Decision 1 |
| The three attacks | `npm test` passes (attacks 2 and 3 as rules); live runs are pasted into the *Observed (live)* lines | `AUTH.md` → The three attacks |
| Live data | One polled query (`/api/orders/${id}`, 5 s, seeded) and one debounced search (300 ms, null key); the menu browse query is seeded with exactly the API's answer | `DATA.md` |
| Performance | Budget table with Before and After | `PERF.md` → Decision 3 |
| Discovery | Metadata on every route, cards, sitemap, robots, JSON-LD | `SEO.md` |

What changed in the code on Day 45:

- `lib/menuQuery.js` is now the single function behind `/api/dishes` and the menu seed. Before, the seed held all 25 dishes while the API answered 6 per page, so the list changed shape after the first paint; now the seed is the API's own answer for the current category and page.
- `startSession` removes the session the browser already held before creating the new one.
- `tests/attacks.test.mjs` (`npm test`, Node 20.19+ or 22+) checks the rules behind attacks 2 and 3, scoped history, status advancing and the menu seed. It does not replace the live runs, and attack 1 (signed out) is run live because it needs a cookie jar.

Not done in code, and said plainly: the **deployed URL**, the **live attack results**, the **First Load JS** and **largest image** numbers, and a **Lighthouse figure of 90**. Each has its row in the documents above, marked as not recorded.

### Demo accounts

Create customer accounts on `/signup`. The seeded staff account is phone `0911000000` with the password `staff-demo-1234` (or `STAFF_PASSWORD` from `.env.local` if you set one; restart the server after changing it). Users, sessions and orders live in server memory and reset when the server restarts.

