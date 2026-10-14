"use client";

import Link from "next/link";
import { useActionState, useState, useTransition } from "react";
import { saveDish } from "./actions";

const CATEGORY_OPTIONS = ["starters", "mains", "desserts", "drinks"];

// One form for "add" and "edit". Fields are controlled so a failed save keeps what the admin typed.
export default function DishForm({ dish }) {
  const isEdit = Boolean(dish);
  const [state, formAction, actionPending] = useActionState(saveDish, {});
  const [submitting, startTransition] = useTransition();
  const pending = actionPending || submitting;

  function handleSubmit(event) {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);
    startTransition(() => formAction(formData));
  }
  const errors = state?.fieldErrors ?? {};
  const [values, setValues] = useState({
    name: dish?.name ?? "",
    description: dish?.description ?? "",
    price: dish ? String(dish.price) : "",
    category: dish?.category ?? "",
    image: dish?.image ?? "",
    tags: dish ? dish.tags.join(", ") : "",
    spicy: dish?.spicy ?? false,
    available: dish?.available ?? true
  });

  function setField(name, value) {
    setValues((current) => ({ ...current, [name]: value }));
  }

  return (
    <form onSubmit={handleSubmit} className="checkout-form admin-form">
      {isEdit && <input type="hidden" name="id" value={dish.id} />}

      <div className="form-grid">
        <label>
          Name
          <input name="name" value={values.name} onChange={(event) => setField("name", event.target.value)} required />
          {errors.name?.[0] && <small>{errors.name[0]}</small>}
        </label>

        <label>
          Price (ETB)
          <input
            name="price"
            type="number"
            inputMode="numeric"
            min="1"
            step="1"
            value={values.price}
            onChange={(event) => setField("price", event.target.value)}
            required
          />
          {errors.price?.[0] && <small>{errors.price[0]}</small>}
        </label>

        <label className="wide">
          Description
          <textarea
            name="description"
            rows={3}
            value={values.description}
            onChange={(event) => setField("description", event.target.value)}
            required
          />
          {errors.description?.[0] && <small>{errors.description[0]}</small>}
        </label>

        <label>
          Category
          <select name="category" value={values.category} onChange={(event) => setField("category", event.target.value)} required>
            <option value="" disabled>
              Select a category
            </option>
            {CATEGORY_OPTIONS.map((category) => (
              <option key={category} value={category}>
                {category}
              </option>
            ))}
          </select>
          {errors.category?.[0] && <small>{errors.category[0]}</small>}
        </label>

        <label>
          Image path
          <input
            name="image"
            value={values.image}
            onChange={(event) => setField("image", event.target.value)}
            placeholder="images/my-dish.jpg (optional)"
          />
          {errors.image?.[0] && <small>{errors.image[0]}</small>}
        </label>

        <label className="wide">
          Tags (separated by commas)
          <input
            name="tags"
            value={values.tags}
            onChange={(event) => setField("tags", event.target.value)}
            placeholder="vegan, gluten-free"
          />
          {errors.tags?.[0] && <small>{errors.tags[0]}</small>}
        </label>

        <label className="check-label">
          <input
            name="spicy"
            type="checkbox"
            checked={values.spicy}
            onChange={(event) => setField("spicy", event.target.checked)}
          />
          Spicy dish
        </label>

        <label className="check-label">
          <input
            name="available"
            type="checkbox"
            checked={values.available}
            onChange={(event) => setField("available", event.target.checked)}
          />
          Available on the menu
        </label>
      </div>

      {state?.error && (
        <div className="form-error" role="alert">
          {state.error}
        </div>
      )}

      <div className="actions">
        <button className="button" type="submit" disabled={pending}>
          {pending ? "Saving…" : isEdit ? "Save changes" : "Add dish"}
        </button>
        <Link href="/admin/dishes" className="button secondary">
          Cancel
        </Link>
      </div>
    </form>
  );
}
