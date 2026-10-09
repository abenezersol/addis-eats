"use client";

const categories = ["all", "starters", "mains", "desserts", "drinks"];

export default function CategoryBar({ active, onChange }) {
  return (
    <div className="categories" aria-label="Dish categories">
      {categories.map((category) => (
        <button
          key={category}
          type="button"
          className={active === category ? "chip active" : "chip"}
          onClick={() => onChange(category)}
        >
          {category}
        </button>
      ))}
    </div>
  );
}
