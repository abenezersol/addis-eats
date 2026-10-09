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

## Check it on the deployed site (view source, no tooling)

1. `https://addiseats.et/menu/7` → `og:image` starts with `https://addiseats.et/` and `og:title` is `Kitfo · Addis Eats`.
2. `/menu/7` and `/menu/9` have different `<meta name="description">`.
3. `/sitemap.xml` lists `/`, `/menu` and 25 dishes, and nothing behind sign-in.
4. `/robots.txt` disallows `/cart`, `/checkout`, `/orders`, `/kitchen`, `/api/` and ends with the `Sitemap:` line.
5. The `application/ld+json` price on a dish equals the price printed on the page.
6. Exactly one `<h1>` on each page.
7. Open `/menu/7/opengraph-image…` (the URL in `og:image`) in a browser: a 1200 × 630 card.
8. Paste a dish link into a Telegram chat. If the old card shows after a design change, rename the image or wait: platforms cache previews for days.

## Notes

- Locally the tags point at `https://addiseats.et` (the production `metadataBase`), so share images only resolve once deployed.
- Dish photos are served from `public/images`, which was not in the Day 43 zip; the JSON-LD image URL assumes that folder is deployed.
