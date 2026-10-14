// One place for the facts every SEO file needs. Set NEXT_PUBLIC_SITE_URL separately for
// local development, Vercel previews, and production. This value is public, never a secret.
// A safe fallback keeps `next build` from failing when the variable has not been configured.
// Set the real deployment URL in Vercel for correct canonical URLs and sitemap metadata.
const configuredSiteUrl = process.env.NEXT_PUBLIC_SITE_URL;
const fallbackSiteUrl = process.env.NODE_ENV === "production"
  ? "https://addiseats.et"
  : "http://localhost:3000";
const normalizedSiteUrl = (configuredSiteUrl || fallbackSiteUrl).trim().replace(/\/+$/, "");

try {
  const parsedSiteUrl = new URL(normalizedSiteUrl);
  if (!["http:", "https:"].includes(parsedSiteUrl.protocol)) throw new Error();
} catch {
  throw new Error("NEXT_PUBLIC_SITE_URL must be an absolute http:// or https:// URL.");
}

export const siteUrl = normalizedSiteUrl;
export const siteName = "Addis Eats";
export const defaultTitle = "Addis Eats — food delivery in Addis Ababa";
export const locale = "en_ET";
