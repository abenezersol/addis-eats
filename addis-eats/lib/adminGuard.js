import { redirect } from "next/navigation";
import { getAdminSession } from "./adminSession";

// Used at the top of every admin page: the page-level check behind the middleware's cookie check.
export async function requireAdminPage(path) {
  const admin = await getAdminSession();
  if (!admin) redirect(`/admin/login?next=${encodeURIComponent(path)}`);
  return admin;
}
