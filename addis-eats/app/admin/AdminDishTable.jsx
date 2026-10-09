"use client";

import Link from "next/link";
import Image from "next/image";
import { useMemo, useState } from "react";
import AvailabilityToggle from "./AvailabilityToggle";
import ConfirmDeleteButton from "./ConfirmDeleteButton";
import { removeDish } from "./actions";

function matches(dish, query) {
  return [dish.name, dish.description, dish.category, ...dish.tags].some((value) => value.toLowerCase().includes(query));
}

export default function AdminDishTable({ dishes }) {
  const [term, setTerm] = useState("");
  const query = term.trim().toLowerCase();
  const visible = useMemo(() => (query ? dishes.filter((dish) => matches(dish, query)) : dishes), [dishes, query]);

  return (
    <section>
      <div className="menu-search-row">
        <label className="search-field">
          <span>Search dishes</span>
          <input
            value={term}
            onChange={(event) => setTerm(event.target.value)}
            placeholder="Search by name, description, tag or category…"
            aria-label="Search dishes"
          />
        </label>
        <span className="search-count">
          {visible.length} of {dishes.length} {dishes.length === 1 ? "dish" : "dishes"}
        </span>
      </div>

      {!visible.length ? (
        <div className="empty-state">
          <h2>No dishes match “{term.trim()}”</h2>
          <p>Try a different word, or clear the search box.</p>
        </div>
      ) : (
        <div className="table-wrap">
          <table className="admin-table">
            <thead>
              <tr>
                <th>Dish</th>
                <th>Category</th>
                <th>Price</th>
                <th>On menu</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {visible.map((dish) => (
                <tr key={dish.id} className={dish.available ? "" : "row-off"}>
                  <td>
                    <div className="dish-cell">
                      <Image src={`/${dish.image}`} alt="" width={48} height={48} sizes="48px" />
                      <div>
                        <strong>{dish.name}</strong>
                        <small>{dish.description}</small>
                      </div>
                    </div>
                  </td>
                  <td className="capitalize">{dish.category}</td>
                  <td>{dish.price.toLocaleString("en-US")} ETB</td>
                  <td>
                    <AvailabilityToggle dishId={dish.id} dishName={dish.name} available={dish.available} />
                  </td>
                  <td>
                    <div className="row-actions">
                      <Link href={`/admin/dishes/${dish.id}/edit`} className="mini-button">
                        Edit
                      </Link>
                      <ConfirmDeleteButton
                        label="Delete"
                        question={`Delete ${dish.name}?`}
                        onDelete={() => removeDish(dish.id)}
                      />
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </section>
  );
}
