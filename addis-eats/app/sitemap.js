import { getAvailableDishes } from "../lib/dishStore";
import { siteUrl } from "../lib/site";

// Built from the real dish records, so a dish added next month appears with no one editing a file.
// Only public pages are listed. /cart, /checkout, /orders, /kitchen, /admin, /favorites and the sign-in pages
// are left out (and the private ones are disallowed in robots.js). Dishes switched off are left out too.
export default async function sitemap() {
  return [
    { url: `${siteUrl}/`, priority: 1 },
    { url: `${siteUrl}/menu`, priority: 0.9 },
    ...getAvailableDishes().map((dish) => ({ url: `${siteUrl}/menu/${dish.id}`, priority: 0.8 }))
  ];
}
