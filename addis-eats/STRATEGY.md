# Addis Eats — Rendering Strategy

| Route | Strategy | Reason |
|---|---|---|
| `/` | Static | Public landing content and today's specials do not depend on the request. |
| `/menu` | Static shell, client-side SWR data | The menu does not depend on who is asking; search, category and paging are handled in the browser. |
| `/menu/[id]` | Static via `generateStaticParams` | All 25 dish IDs are known at build time and can be pre-rendered. |
| `/cart` | Static page, client leaf | The page is a server component so it can export metadata; `CartView` holds the private browser state and changes through interaction. |
| `/signin`, `/signup` | Dynamic | They read `searchParams` and the session, so a signed-in visitor is sent on to their destination. |
| `/checkout` | Dynamic | `getSession()` reads the cookie, so the response depends on the request. |
| `/orders/history` | Dynamic | `getSession()` identifies the person so only their orders are rendered. |
| `/orders/[id]` | Dynamic | Session and ownership are checked per request; SWR then polls the status. |
| `/kitchen` | Dynamic | Session and staff role are checked per request. |
| `/api/me`, `/api/orders*` | Dynamic | Route handlers that read the session cookie. |
| `/sitemap.xml`, `/robots.txt` | Static | Built from the dish store (`lib/dishStore.js`) and `lib/site.js`; rebuilt when an admin changes a dish. |
| `/opengraph-image`, `/menu/opengraph-image` | Static | Fixed cards with no params. |
| `/menu/[id]/opengraph-image` | Dynamic (on first request) | One card per dish, drawn from the dish record with `ImageResponse`. |

The root layout deliberately does **not** read cookies: that would make every page dynamic. The header's sign-in state (`AuthNav`) is a client component that asks `/api/me`, so the public pages stay static.


