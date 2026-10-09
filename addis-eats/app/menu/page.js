import Link from "next/link";
import { Suspense } from "react";
import MenuExplorer from "./MenuExplorer";
import MenuErrorTrigger from "./MenuErrorTrigger";
import { getAvailableDishes } from "../../lib/dishStore";
import { fullTitle, openGraphFor } from "../../lib/seo";

function menuDescription(count) {
  return `Browse all ${count} dishes: Ethiopian favorites, international mains, desserts and drinks, each with a clear price in ETB.`;
}

// /menu?category=mains, /menu?page=2 and /menu?ref=telegram are all the same menu to a crawler.
export function generateMetadata() {
  const description = menuDescription(getAvailableDishes().length);
  return {
    title: "Menu",
    description,
    alternates: { canonical: "/menu" },
    openGraph: openGraphFor({ title: fullTitle("Menu"), description, path: "/menu" })
  };
}

export default function MenuPage() {
  const dishes = getAvailableDishes();

  return (
    <main className="page">
      <Suspense fallback={null}>
        <MenuErrorTrigger />
      </Suspense>
      <div className="page-heading">
        <div>
          <span className="eyebrow">OUR MENU · {dishes.length} DISHES</span>
          <h1>Choose something delicious</h1>
          <p>Explore Ethiopian favorites, mains, desserts and drinks. Every dish is ready to add to your cart.</p>
        </div>
        <Link href="/cart" className="button secondary">
          Open cart →
        </Link>
      </div>
      <Suspense
        fallback={
          <div className="skeleton">
            <div className="skeleton-title" />
            <div className="skeleton-line wide" />
            <div className="skeleton-line" />
          </div>
        }
      >
        <MenuExplorer initialDishes={dishes} />
      </Suspense>
    </main>
  );
}
