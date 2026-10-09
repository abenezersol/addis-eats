import { siteUrl } from "../lib/site";

// Crawlers may read everything except the pages that belong to one person or one staff member, and the API.
export default function robots() {
  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        disallow: ["/cart", "/checkout", "/orders", "/kitchen", "/admin", "/favorites", "/api/"]
      }
    ],
    sitemap: `${siteUrl}/sitemap.xml`
  };
}
