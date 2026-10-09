# Addis Eats — Server / Client Boundary

| Component | Side | Why |
|---|---|---|
| `app/layout.js` | Server | Owns the metadata defaults (`metadataBase`, title template), header/footer and passes children through the provider. It never reads cookies, so pages stay static. |
| `middleware.js` | Edge | Cheap cookie-exists redirect for `/checkout`, `/orders`, `/kitchen`. Not security on its own. |
| `app/providers.jsx` | Client | Cart context requires browser state. |
| `app/AuthNav.jsx` | Client | Shows who is signed in (via `/api/me`) and signs out; the header lives in a static layout. |
| `app/AuthForm.jsx` | Client | `useActionState` for pending and validation feedback on sign-in and sign-up. |
| `app/signin/page.js`, `app/signup/page.js` | Server | Validate `next` with `safeNext` and skip the form for signed-in visitors. |
| `app/page.js` | Server | Static landing page and specials need no browser interaction. |
| `app/menu/layout.js` | Client | The menu visit counter uses state and persists inside the nested layout. It exports no metadata (a client layout cannot); the menu pages do. |
| `app/menu/page.js` | Server | Renders the route on the server and passes the dishes to the explorer. |
| `MenuExplorer.jsx` | Client | Search, category, paging and SWR. Seeds its browse query with `queryDishes` (the same pure function the API route uses), so the seed equals the API answer. |
| `CategoryBar.jsx` | Client | Buttons need click handlers. |
| `DishList.jsx` | Client | Rendered by `MenuExplorer` and contains the add-to-cart button. |
| `AddToCartButton.jsx` | Client | The add action writes to the cart context. |
| `app/menu/[id]/page.js` | Server | Reads params, resolves the dish, calls `notFound()`, exports `generateMetadata` and renders the JSON-LD. |
| `app/cart/page.js` | Server | A page marked `"use client"` cannot export `metadata`, so the page stays on the server and only exports its title and description. |
| `app/cart/CartView.jsx` | Client | Quantity, remove and clear controls change private cart state (the interactive leaf of the cart page). |
| `app/checkout/page.js` | Server | Verifies the session while rendering. |
| `CheckoutForm.jsx` | Client | Uses `useActionState` for pending and validation feedback. |
| `app/orders/history/page.js` | Server | Verifies the session and queries by the session's own id. |
| `app/orders/[id]/page.js` | Server | Verifies session and ownership, then hands the order to SWR. |
| `OrderStatusClient.jsx` | Client | SWR polling for live status. |
| `CancelOrderButton.jsx` | Client | Uses a transition for the cancel server action (ownership checked inside). |
| `app/kitchen/page.js` | Server | Verifies session and the staff role before rendering anything. |
| `AdvanceOrderButton.jsx` | Client | Uses a transition for the staff-only server action. |
| `app/actions.js` | Server | Every write re-checks the session; secrets and hashes never leave the server. |
| `app/menu/error.js` | Client | Next.js error boundaries require client behavior and `reset()`. |
| `app/menu/MenuErrorTrigger.jsx` | Client | Uses `useSearchParams()` to deliberately exercise the error boundary. |
| `app/menu/loading.js` | Server | Loading skeleton is presentational only. |
