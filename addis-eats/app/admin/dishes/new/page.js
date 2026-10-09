import Link from "next/link";
import { requireAdminPage } from "../../../../lib/adminGuard";
import DishForm from "../../DishForm";

export const metadata = {
  title: "Add a dish",
  description: "Create a new dish on the Addis Eats menu."
};

export default async function NewDishPage() {
  await requireAdminPage("/admin/dishes/new");

  return (
    <main className="container page">
      <div className="page-heading">
        <div>
          <span className="eyebrow">ADMIN · MENU</span>
          <h1>Add a dish</h1>
          <p>New dishes appear on the customer menu as soon as they are saved and switched on.</p>
        </div>
        <Link href="/admin/dishes" className="text-link">
          ← Back to dishes
        </Link>
      </div>
      <DishForm />
    </main>
  );
}
