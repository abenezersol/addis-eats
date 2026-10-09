"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { adminSignInSchema } from "../../lib/adminSchema";
import { dishSchema, readDishForm } from "../../lib/dishSchema";
import { fieldErrors } from "../../lib/orderSchema";
import { verifyAdmin } from "../../lib/admin";
import { startAdminSession, endAdminSession, getAdminSession } from "../../lib/adminSession";
import { createDish, updateDish, deleteDish, setDishAvailability } from "../../lib/dishStore";
import { advanceOrderStatus, deleteOrder } from "../../lib/orders";
import { safeAdminNext } from "../../lib/safeNext";

const NOT_SIGNED_IN = { error: "Admin sign-in required.", status: 401 };

// The menu is shown on static pages, so a change to a dish must rebuild all of them.
function refreshMenu() {
  revalidatePath("/", "layout");
}

function refreshOrders() {
  revalidatePath("/admin", "layout");
  revalidatePath("/kitchen");
  revalidatePath("/orders/history");
}

// ---------- Authentication ----------

export async function adminSignIn(_previousState, formData) {
  const result = adminSignInSchema.safeParse({
    username: formData.get("username"),
    password: formData.get("password")
  });
  if (!result.success) return { fieldErrors: fieldErrors(result) };

  const admin = verifyAdmin(result.data.username, result.data.password);
  if (!admin) return { error: "Username or password is incorrect." };

  await startAdminSession(admin.username);
  // The form puts the admin into AdminContext and then navigates to `next`.
  return { success: true, admin, next: safeAdminNext(formData.get("next")) };
}

export async function adminSignOut() {
  await endAdminSession();
}

// ---------- Menu management ----------

export async function saveDish(_previousState, formData) {
  if (!(await getAdminSession())) return NOT_SIGNED_IN;

  const result = dishSchema.safeParse(readDishForm(formData));
  if (!result.success) return { fieldErrors: fieldErrors(result) };

  const id = formData.get("id");
  if (id) {
    const updated = updateDish(id, result.data);
    if (updated.error) return updated;
  } else {
    createDish(result.data);
  }

  refreshMenu();
  redirect("/admin/dishes");
}

export async function removeDish(id) {
  if (!(await getAdminSession())) return NOT_SIGNED_IN;
  const result = deleteDish(id);
  if (result.error) return result;
  refreshMenu();
  return { success: true };
}

export async function toggleDish(id, available) {
  if (!(await getAdminSession())) return NOT_SIGNED_IN;
  const result = setDishAvailability(id, available);
  if (result.error) return result;
  refreshMenu();
  return { success: true, available: result.dish.available };
}

// ---------- Order management ----------

export async function adminAdvanceOrder(orderId) {
  if (!(await getAdminSession())) return NOT_SIGNED_IN;
  const result = advanceOrderStatus(orderId);
  if (result.error) return result;
  refreshOrders();
  return { success: true, status: result.order.status };
}

export async function adminDeleteOrder(orderId) {
  if (!(await getAdminSession())) return NOT_SIGNED_IN;
  const result = deleteOrder(orderId);
  if (result.error) return result;
  refreshOrders();
  return { success: true };
}
