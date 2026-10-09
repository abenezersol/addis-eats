import { siteName, siteUrl, locale } from "./site";

// The title as it appears in the browser tab and in a social card. The root layout's title template
// builds the same string for <title>; Open Graph does not use that template, so it is built here.
export function fullTitle(title) {
  return `${title} · ${siteName}`;
}

// The Open Graph tags that matter: title, description, url (the image comes from the
// opengraph-image file sitting next to the page). openGraph is replaced, not merged, by a page that
// sets it, so siteName, type and locale are repeated here instead of being lost.
export function openGraphFor({ title, description, path }) {
  return { title, description, url: path, siteName, type: "website", locale };
}

// "1,250 ETB": the same figure the dish page prints, so the title, the card and the JSON-LD agree.
export function priceLabel(dish) {
  return `${dish.price.toLocaleString("en-US")} ETB`;
}

// Built from the dish record, so forty dishes are forty different descriptions (about 130 characters).
export function dishDescription(dish) {
  const summary = dish.description.replace(/\.$/, "");
  return `${dish.name} — ${priceLabel(dish)}. ${summary}. Order from Addis Eats, delivered across Addis Ababa.`;
}

// MenuItem structured data, generated from the same dish object the page renders. Every value here
// is something the page shows: name, description, picture and price (a plain number, in ETB).
export function dishJsonLd(dish) {
  return {
    "@context": "https://schema.org",
    "@type": "MenuItem",
    name: dish.name,
    description: dish.description,
    image: `${siteUrl}/${dish.image}`,
    offers: { "@type": "Offer", price: dish.price, priceCurrency: "ETB" }
  };
}

// "<" is escaped so no value can ever close the script tag early.
export function jsonLdString(data) {
  return JSON.stringify(data).replace(/</g, "\\u003c");
}
