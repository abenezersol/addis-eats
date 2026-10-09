import Link from "next/link";
import { requireAdminPage } from "../../../lib/adminGuard";
import { getAllDishes } from "../../../lib/dishStore";
import AdminDishTable from "../AdminDishTable";

export const metadata = {
  title: "Manage dishes",
  description: "Add, edit, hide and delete the dishes on the Addis Eats menu."
};

export default async function AdminDishesPage() {
  await requireAdminPage("/admin/dishes");
  const dishes = getAllDishes();
  const offCount = dishes.filter((dish) => !dish.available).length;

  return (
    <main className="container page">
      <div className="page-heading">
        <div>
          <span className="eyebrow">ADMIN · MENU</span>
          <h1>Dishes</h1>
          <p>
            {dishes.length} dishes, {offCount} switched off. A dish that is off is hidden from customers and cannot be ordered.
          </p>
        </div>
        <Link href="/admin/dishes/new" className="button">
          + Add new dish
        </Link>
      </div>
      <AdminDishTable dishes={dishes} />
    </main>
  );
}
