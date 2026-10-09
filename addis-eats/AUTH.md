# Addis Eats — Authentication Map (Day 42, finalised Day 45)

## How a session works

1. The person posts their phone number and password (`signIn` / `signUp` in `app/actions.js`).
2. The server checks them against the stored scrypt hash (`lib/users.js`) — passwords are never stored.
3. The server creates a session and sets its random id as the `session` cookie (`lib/session.js`).
4. The browser sends that cookie with every later request.
5. `getSession()` reads the cookie and looks the session up — one helper used by pages, actions and handlers.
6. `signOut` deletes the session on the server **and** clears the cookie, so a copied token is dead.

Cookie flags: `httpOnly` (no script can read it), `secure` (HTTPS only; browsers still allow it on `localhost`), `sameSite: "lax"` (not sent from other sites), `maxAge` 7 days. The cookie holds only a random 256-bit id; there is no signing secret in the code or in the browser bundle.

## Decision 1 — who may see what

| Route | Protected by | What that proves |
|---|---|---|
| `/`, `/menu`, `/menu/[id]` | Nothing | Public, and stays indexable (in the sitemap, not disallowed). |
| `/cart` | Nothing (client store) | Public page; the cart never leaves the browser until checkout, and `/robots.txt` keeps it out of search. |
| `/signin`, `/signup` | Nothing; signed-in visitors are redirected on to `next` | Public; `safeNext` decides where they go. |
| `/orders/history` | Middleware + page + scoped query | Signed in, and only their own records (`getOrdersFor(session.id)`). |
| `/orders/[id]` | Middleware + page ownership check + API ownership check | Signed in, and only that person's order; another person's id is a 404 (page) or 403 (API). |
| `/checkout` | Middleware + page | Signed in. The write (`placeOrder`) checks the rest: session again, validation, server prices. |
| `/kitchen` | Middleware + page role check + role check in every action | Signed in, and permitted: `role === "staff"`. |
| `/admin/*` (except `/admin/login`) | Middleware (`admin_session` cookie exists) + `requireAdminPage()` in every page | Signed in as the admin. A customer or staff session does not open it. |
| Every admin action (`saveDish`, `removeDish`, `toggleDish`, `adminAdvanceOrder`, `adminDeleteOrder`) | `getAdminSession()` at the top of each action (401 if missing) | The browser's `sessionStorage` copy of the admin is only for display; it grants nothing. |
| `placeOrder`, `cancelOrder`, `advanceOrder` | Session check inside each action | Who is asking; `cancelOrder` also proves ownership, `advanceOrder` proves the staff role. |
| `POST /api/orders`, `GET /api/orders/[id]`, `GET /api/me` | Session check inside each handler | The API cannot be used as a side door around the pages. |

One line per layer for the route that matters most:

```
/orders/history  middleware -> a cookie exists
                 page       -> session verified (getSession)
                 query      -> getOrdersFor(session.id)
                 action     -> cancelOrder re-checks ownership (order.userId === session.id)
```

## Protected routes and what each layer proves

| Route | Layer 1 · `middleware.js` | Layer 2 · page check | Layer 3 · the check that matters |
|---|---|---|---|
| `/checkout` | Cookie exists, else redirect to `/signin?next=` | `getSession()` — redirect if not valid | `placeOrder` re-checks the session; prices come from the server menu |
| `/orders/history` | Cookie exists | `getSession()`; query is `getOrdersFor(user.id)` — the session's own id | `cancelOrder` checks session, then `order.userId === user.id` |
| `/orders/[id]` | Cookie exists | `getSession()`, then `order.userId === user.id` else 404 | `GET /api/orders/[id]` checks session (401) and ownership (403) |
| `/kitchen` | Cookie exists | `getSession()`, then `role === "staff"` else 404 | `advanceOrder` checks session (401) and `role === "staff"` (403) |
| `POST /api/orders` | Not matched (API answers with JSON, not a redirect) | — | Handler checks the session (401), validates, prices on the server |
| `GET /api/me` | Not matched | — | Returns only `{ id, name, role }` or `null` |

What each layer proves:

- **Middleware** proves only that *a* cookie exists. It never says who the person is, and it is not security.
- **Page check** proves the cookie belongs to a live session and that the screen matches the person.
- **Action / handler check** proves who is asking *and* that they may touch this record. It cannot be bypassed from the console, which is why it is the real check.
- **Sign-in replaces the old session id.** `startSession` deletes the session the browser already held before it creates a new one, so a previous id cannot outlive the sign-in that replaced it.
- **Hiding the link** (the *Kitchen* link in the header only shows for staff) proves nothing; `/kitchen` and `advanceOrder` refuse non-staff on the server regardless.

The middleware matcher names only `/checkout`, `/orders` and `/kitchen`, so it does not run on images, static files or the menu.

## The `next` parameter

Middleware stores the original path in `?next=`. After sign-in, `safeNext()` (`lib/safeNext.js`) validates it on the server. A bare `startsWith("/")` check is not enough: `//evil.com`, `/\evil.com` and `/<tab>/evil.com` all start with a slash but browsers treat them as another site. `safeNext` parses the value the way a browser does and accepts it only if the origin stays on the site; anything else becomes `/`.

## Accounts

- Sign-up always creates a `customer`. The role is never read from the form.
- A demo **staff** account is seeded: phone `0911000000`, password `staff-demo-1234` (or `STAFF_PASSWORD` from `.env.local` if you set one, then restart the server). It is not `NEXT_PUBLIC`, so it never reaches the browser.
- Users, sessions and orders are held in memory and reset when the server restarts.

## The three attacks

Run each one against the **deployed URL** (`npm run build && npm run start` locally is only a rehearsal), then write what you saw in the *Observed (live)* line. The *Observed (rule)* lines come from `npm test`, which runs the same rules without a browser; they show which line refuses, they do not replace the live run.

### 1. Server action from the console while signed out

Sign out, open DevTools and call a server action (or POST to the endpoint it is served from) with an order id / cart.
Also: `curl -i -X POST http://localhost:3000/api/orders -H "Content-Type: application/json" -d '{}'`

- **Stopped by:** `if (!user) return { error: ..., status: 401 }` at the top of `placeOrder`, `cancelOrder` and `advanceOrder` in `app/actions.js`; `if (!user)` → 401 in `app/api/orders/route.js`.
- **Expected:** `401` / "You must be signed in." No order is created or changed.
- **Observed (live):** _fill in after running the curl above against the deployed URL: paste the status line_

### 2. One account calls an action with another account's order id

Sign up as Alice, place an order and note its id. Sign in as Bob (another browser or private window) and call `cancelOrder("<Alice's id>")`, open `/orders/<Alice's id>`, and request `/api/orders/<Alice's id>`.

- **Stopped by:** `if (order.userId !== userId)` in `cancelOwnedOrder` (`lib/orders.js`) → 403; `order.userId !== user.id` → 403 in `app/api/orders/[id]/route.js`; `notFound()` in `app/orders/[id]/page.js`.
- **Expected:** `403` for the action and the API, a 404 page for the screen. Alice's order stays `pending`.
- **Observed (rule, `npm test`):** `cancelOwnedOrder(alice.id, "usr_bob")` returned status `403` and Alice's order stayed `pending`; an unknown id returned `404`; Alice herself could still cancel. Test: `attack 2` in `tests/attacks.test.mjs` (passing).
- **Observed (live):** _fill in after running it as two real accounts on the deployed URL_

### 3. Sign-in link with `next` pointing at another site

Open `http://localhost:3000/signin?next=https://example.com`, then `?next=//example.com`, then `?next=/%5Cexample.com`, and sign in.

- **Stopped by:** `safeNext()` in `lib/safeNext.js`, called by `signIn`/`signUp` just before `redirect(...)`.
- **Expected:** you land on `/` on this site, except for `?next=/%5Cexample.com`: a percent-encoded backslash is an ordinary path on this site, so you land on `/%5Cexample.com` (a 404 page here). That is still never another site.
- **Observed (rule, `npm test`):** `safeNext` returned `/` for `https://example.com`, `//example.com`, `/\example.com`, a tab-prefixed `//example.com`, `javascript:alert(1)`, an empty and a missing value; it returned `/%5Cexample.com` unchanged for the encoded form and `/` for `/signin`. Test: `attack 3` in `tests/attacks.test.mjs` (passing).
- **Observed (live):** _fill in after signing in from each link on the deployed URL_

Also try: signed in as one account, change the id in `/orders/<id>` to another account's order id. It is a 404, because the page compares `order.userId` with the session's own id.
