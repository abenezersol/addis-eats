# Addis Eats — Metadata & SEO (Day 44)

## What is set where

| Where | What |
|---|---|
| `lib/site.js` | The production URL, site name, default title, locale. Nothing else in the app hard-codes the domain. |
| `app/layout.js` | `metadataBase`, the title template `%s · Addis Eats`, the default title, `openGraph` site name / type / locale. No description (each route writes its own). |
| Static pages | Their own `title` and `description` (`/`, `/menu`, `/cart`, `/checkout`, `/signin`, `/signup`, `/orders/history`, `/orders/[id]`, `/kitchen`). |
| `app/menu/[id]/page.js` | `generateMetadata`: title = dish name, description from name + price + summary, canonical, Open Graph. Also the MenuItem JSON-LD. |
| `app/opengraph-image.jsx` | Site-wide share card. |
| `app/menu/opengraph-image.jsx` | Card for `/menu`. |
| `app/menu/[id]/opengraph-image.jsx` | One card per dish (`ImageResponse`, 1200 × 630, flexbox only). |
| `app/sitemap.js`, `app/robots.js` | Sitemap from the dish records; private routes disallowed. |

## Why a few choices were made

- **`/cart` is a server page.** A `"use client"` page cannot export `metadata`, so the interactive part moved to `CartView.jsx`.
- **`app/menu/layout.js` stays a client layout** and exports no metadata. The menu pages do.
- **Open Graph is replaced, not merged, by a page that sets it.** `lib/seo.js` `openGraphFor()` repeats site name, type and locale so they are never lost, and the card image comes from the `opengraph-image` file in the same folder as the page.
- **JSON-LD only states what the page shows.** Name, description, picture and a plain-number price in ETB (`1250`; the page prints `1,250 ETB`). No availability, rating or hours, because the page shows none.
- **Canonicals** point `/menu?category=…`, `?page=…` and `?ref=…` at `/menu`, and `/signin?next=…` at `/signin`.
- **Private routes** (`/cart`, `/checkout`, `/orders`, `/kitchen`, `/api/`) are disallowed in `robots.js` and absent from the sitemap.
