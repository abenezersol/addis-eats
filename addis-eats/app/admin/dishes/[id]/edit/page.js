import Link from "next/link";
import { notFound } from "next/navigation";
import { requireAdminPage } from "../../../../../lib/adminGuard";
import { getDish } from "../../../../../lib/dishStore";
import DishForm from "../../../DishForm";

export const metadata = {
  title: "Edit a dish",
  description: "Update the details of a dish on the Addis Eats menu."
};

export default async function EditDishPage({ params }) {
  const { id } = await params;
  await requireAdminPage(`/admin/dishes/${id}/edit`);

  const dish = getDish(id);
  if (!dish) notFound();

  return (
    <main className="container page">
      <div className="page-heading">
        <div>
          <span className="eyebrow">ADMIN · MENU</span>
          <h1>Edit {dish.name}</h1>
          <p>Changes go live on the customer menu as soon as you save.</p>
        </div>
        <Link href="/admin/dishes" className="text-link">
          ← Back to dishes
        </Link>
      </div>
      <DishForm key={dish.id} dish={dish} />
    </main>
  );
}
