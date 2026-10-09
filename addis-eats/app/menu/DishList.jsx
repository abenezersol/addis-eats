"use client";

import Link from "next/link";
import Image from "next/image";
import AddToCartButton from "./AddToCartButton";
import FavoriteButton from "./FavoriteButton";

export default function DishList({ dishes }) {
  if (!dishes.length) {
    return (
      <div className="empty-state">
        <h2>No dishes found</h2>
        <p>Try another category.</p>
      </div>
    );
  }

  return (
    <div className="dish-grid">
      {dishes.map((dish) => (
        <article className="dish-card" key={dish.id} data-category={dish.category}>
          <div className="dish-visual">
            <Image
              src={`/${dish.image}`}
              alt={dish.name}
              width={400}
              height={300}
              sizes="(max-width: 620px) calc(100vw - 80px), (max-width: 900px) calc((100vw - 100px) / 2), calc((100vw - 370px) / 3)"
            />
            <FavoriteButton dish={dish} />
          </div>

          <div className="dish-card-body">
            <div className="card-top">
              <span className="category">{dish.category}</span>
              {dish.spicy && <span className="spicy">🌶 Spicy</span>}
            </div>

            <h2>{dish.name}</h2>
            <p>{dish.description}</p>

            <div className="tag-row">
              {dish.tags.map((tag) => (
                <span key={tag}>{tag}</span>
              ))}
            </div>

            <div className="card-bottom">
              <strong>{dish.price.toLocaleString()} ETB</strong>
              <div className="card-actions">
                <Link href={`/menu/${dish.id}`} className="text-link">
                  Details
                </Link>
                <AddToCartButton dish={dish} />
              </div>
            </div>
          </div>
        </article>
      ))}
    </div>
  );
}
