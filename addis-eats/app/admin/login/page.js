import { redirect } from "next/navigation";
import AdminLoginForm from "../AdminLoginForm";
import { getAdminSession } from "../../../lib/adminSession";
import { safeAdminNext } from "../../../lib/safeNext";

export const metadata = {
  title: "Admin sign in",
  description: "Sign in to the Addis Eats admin dashboard to manage the menu and customer orders."
};

export default async function AdminLoginPage({ searchParams }) {
  const next = safeAdminNext((await searchParams).next);
  if (await getAdminSession()) redirect(next);

  return (
    <main className="container page">
      <div className="page-heading">
        <div>
          <span className="eyebrow">ADMIN ONLY</span>
          <h1>Admin sign in</h1>
          <p>Use the admin username and password to manage the menu and orders.</p>
        </div>
      </div>
      <AdminLoginForm next={next} />
    </main>
  );
}
