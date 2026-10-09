import Link from "next/link";
import Image from "next/image";
import { getAvailableDishes } from "../lib/dishStore";
import { defaultTitle } from "../lib/site";
import { openGraphFor } from "../lib/seo";

const description =
  "Order Doro Wot, Beef Tibs, Kitfo and more from Addis Eats. Simple ordering, clear prices in ETB and delivery across Addis Ababa.";

const SPECIAL_IDS = [6, 7, 10];

// No title here: the home page uses the default title from the root layout.
export const metadata = {
  description,
  alternates: { canonical: "/" },
  openGraph: openGraphFor({ title: defaultTitle, description, path: "/" })
};

export default function HomePage() {
  const available = getAvailableDishes();
  const specials = available.filter((dish) => SPECIAL_IDS.includes(dish.id));

  return (
    <main>
      <section className="hero-section">
        <div className="container hero-grid">
          <div className="hero-copy">
            <span className="eyebrow">AUTHENTIC FLAVORS · ADDIS ABABA</span>
            <h1>
              Good food, <em>delivered</em> across Addis.
            </h1>
            <p>
              From classic Ethiopian favorites to comfort-food classics, Addis Eats makes your next meal simple,
              delicious and memorable.
            </p>
            <div className="actions">
              <Link href="/menu" className="button">
                Explore the menu →
              </Link>
              <Link href="#specials" className="button secondary">
                Today&apos;s specials
              </Link>
            </div>
            <div className="hero-stats">
              <span>
                <strong>{available.length}</strong>
                <small>Fresh dishes</small>
              </span>
              <span>
                <strong>ETB</strong>
                <small>Clear pricing</small>
              </span>
              <span>
                <strong>Fast</strong>
                <small>Easy ordering</small>
              </span>
            </div>
          </div>
          <div className="hero-art">
            <div className="plate">
              <Image
                src="/images/beef-tibs.jpg"
                alt="Beef Tibs, today's pick"
                width={350}
                height={350}
                sizes="(max-width: 620px) 240px, 350px"
                priority
              />
            </div>
            <div className="floating-card">
              <span>Today&apos;s pick</span>
              <strong>Beef Tibs</strong>
              <small>700 ETB · 🌶 Spicy</small>
            </div>
          </div>
        </div>
      </section>

      <section id="specials" className="container section-block">
        <div className="section-heading">
          <div>
            <span className="eyebrow">TODAY&apos;S SPECIAL</span>
            <h2>Made for your table</h2>
          </div>
          <Link href="/menu" className="text-link">
            See full menu →
          </Link>
        </div>
        <div className="special-grid">
          {specials.map((dish) => (
            <Link href={`/menu/${dish.id}`} className="special-card" key={dish.id}>
              <span>
                <Image src={`/${dish.image}`} alt={dish.name} width={70} height={70} sizes="70px" />
              </span>
              <div>
                <small>{dish.category}</small>
                <h3>{dish.name}</h3>
                <strong>{dish.price.toLocaleString()} ETB</strong>
              </div>
            </Link>
          ))}
        </div>
      </section>

      <section className="trust-strip">
        <div className="container trust-grid">
          <div>
            🥘 <strong>Ethiopian favorites</strong>
            <span>Local flavors, familiar comfort</span>
          </div>
          <div>
            🛵 <strong>Simple ordering</strong>
            <span>Cart to checkout in a few clicks</span>
          </div>
          <div>
            🔒 <strong>Protected checkout</strong>
            <span>Orders are validated on the server</span>
          </div>
        </div>
      </section>
    </main>
  );
}
