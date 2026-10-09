import Link from "next/link";
import Image from "next/image";
import { notFound } from "next/navigation";
import { getAllDishes, getDish } from "../../../lib/dishStore";
import AddToCartButton from "../AddToCartButton";
import FavoriteButton from "../FavoriteButton";
import { dishDescription, dishJsonLd, fullTitle, jsonLdString, openGraphFor } from "../../../lib/seo";

export async function generateStaticParams() {
  return getAllDishes().map((dish) => ({ id: String(dish.id) }));
}

// Runs on the server before the page renders, with the same params. getDish is cheap, so calling it again
// in the page costs nothing. The title is just the dish name: the root layout appends " · Addis Eats".
export async function generateMetadata({ params }) {
  const { id } = await params;
  const dish = getDish(id);
  if (!dish) return { title: "Dish not found" };
  const description = dishDescription(dish);
  const path = `/menu/${dish.id}`;
  return {
    title: dish.name,
    description,
    alternates: { canonical: path },
    // A dish that is switched off stays reachable by its link, but search engines should not list it.
    ...(dish.available ? {} : { robots: { index: false, follow: true } }),
    openGraph: openGraphFor({ title: fullTitle(dish.name), description, path })
  };
}

export default async function DishPage({ params }) {
  const { id } = await params;
  const dish = getDish(id);
  if (!dish) notFound();

  return (
    <main className="container page detail-page">
      {/* Structured data from the very same dish object the page renders below. */}
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: jsonLdString(dishJsonLd(dish)) }} />
      <Link href="/menu" className="text-link">
        ← Back to menu
      </Link>
      <article className="detail-layout">
        <div className="detail-visual">
          <Image
            src={`/${dish.image}`}
            alt={dish.name}
            width={600}
            height={520}
            sizes="(max-width: 900px) calc(100vw - 40px), (max-width: 1200px) calc((100vw - 40px) / 2), 580px"
          />
          <small>{dish.category}</small>
        </div>
        <div className="detail-copy">
          <div className="card-top">
            <span className="category">{dish.category}</span>
            {dish.spicy && <span className="spicy">🌶 Spicy</span>}
          </div>
          <h1>{dish.name}</h1>
          <p className="detail-description">{dish.description}</p>
          <div className="tag-row">
            {dish.tags.map((tag) => (
              <span key={tag}>{tag}</span>
            ))}
          </div>
          <div className="detail-price">
            {dish.price.toLocaleString()} <small>ETB</small>
          </div>
          {!dish.available && (
            <p className="notice" role="status">
              This dish is currently unavailable.
            </p>
          )}
          <div className="actions">
            {dish.available && <AddToCartButton dish={dish} />}
            <FavoriteButton dish={dish} />
            <Link href="/cart" className="button secondary">
              View cart
            </Link>
          </div>
        </div>
      </article>
    </main>
  );
}
