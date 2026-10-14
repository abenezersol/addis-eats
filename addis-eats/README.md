# Addis Eats — Next.js

A food-ordering app for Addis Ababa built with the Next.js App Router. It grew from Day 36 to Day 45: routing and layouts, rendering strategies, server/client boundaries, route handlers, Zod validation, server actions, SWR live data, real authentication, performance work, metadata and SEO (Day 44), and — on Day 45 — the finishing pass: the three decision tables, the three attacks, and deployment.

## Run it

```bash
npm install
cp .env.example .env.local
npm test
npm run dev
```

Open http://localhost:3000. For a production build, configure all environment variables first, then run `npm run build` and `npm run start`. Dish photos are served from `public/images/` (add that folder from your earlier days if it is missing).

### Environment variables

- Local development can use the demo credentials documented below. Never use them in a public deployment.
- Set `STAFF_PASSWORD`, `ADMIN_USERNAME`, and `ADMIN_PASSWORD` to unique strong values in Vercel Preview and Production settings. Production builds intentionally fail if these are missing or still use demo defaults.
- Set `NEXT_PUBLIC_SITE_URL` separately: `http://localhost:3000` locally, the preview URL for Preview, and the real canonical domain for Production. It is public configuration, not a secret; changes require a new build/deployment.
- Keep `.env.local` out of Git. `.gitignore` excludes local environment files, dependencies, and `.next/` output.

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
| `/admin` | Dashboard: revenue and orders-per-day charts, accessible chart data tables, revenue/order summaries, top dishes and order status | Admin only |
| `/admin/dishes`, `/admin/dishes/new`, `/admin/dishes/[id]/edit` | Menu CRUD: search, add, edit, delete (with confirmation), switch a dish on/off | Admin only |
| `/admin/orders`, `/admin/orders/[id]` | Accessible order table with URL-based sorting and pagination, status filters, advance status, delete (with confirmation), full order details | Admin only |
| `/api/dishes`, `/api/dishes/[id]` | Menu endpoints | Public |
| `/api/orders`, `/api/orders/[id]` | Create an order; read your own order | Signed in |
| `/api/me` | Who is signed in (`{ user }` or `{ user: null }`) | Public |
| `/api/admin/me` | Is an admin signed in (`{ admin }` or `{ admin: null }`) | Public |
| `/sitemap.xml`, `/robots.txt` | Generated from the dishes and `lib/site.js` | Public |

## Admin area and favorites

**Admin login:** open `/admin/login`. Default username `admin`, password `admin-1234`. Set `ADMIN_USERNAME` and `ADMIN_PASSWORD` in `.env.local` (see `.env.example`) and restart the server. Always change them before deploying.

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

### Demo accounts

Create customer accounts on `/signup`. The seeded staff account is phone `0911000000` with the password `staff-1234` (or `STAFF_PASSWORD` from `.env.local` if you set one; restart the server after changing it). Users, sessions and orders live in server memory and reset when the server restarts.

## Day 48 — Event handling and deployment hardening

- Auth, checkout, admin login, and dish forms use explicit `onSubmit` handlers, `FormData`, and pending states. They support keyboard form submission with Enter and prevent a second submit while an action is pending.
- Checkout includes an idempotency key. The server action and `POST /api/orders` reuse the original order for an identical retry and reject key reuse with different payload data. Tests cover both cases.
- Global `:focus-visible` styling provides a visible keyboard focus indicator. Favorite and cart quantity controls are at least 44 by 44 pixels; common action buttons have a 44px minimum height. Reduced-motion preferences are respected.
- `NEXT_PUBLIC_SITE_URL` configures metadata, sitemap, robots, and social card URLs per environment. Production credentials are required and demo defaults are rejected in production.
- Before shipping: run `npm test`, `npm run build`, and `npm run start`; test the live URL in a private window, test all admin/customer protection checks, keyboard navigation, a rapid double-submit, mobile touch targets, and social preview cards.

**Production blocker:** users, sessions, dishes, orders, SSE events, and the idempotency-key registry still use process memory in this educational project. The idempotency protection is therefore effective only within the current running process. Before using this as a real public ordering service, move this state into a persistent database/shared store and enforce idempotency with a database unique constraint. Do not claim durable duplicate-order protection across server restarts or multiple Vercel instances until that migration is done.

**Dependency reproducibility:** package versions are still expressed using `latest` for Next.js and React, and this source ZIP does not include a lockfile. Generate and commit `package-lock.json` with a successful `npm install` in an environment that can reach the npm registry, then pin/verify compatible versions before deployment. I did not invent versions while the registry was unavailable.
