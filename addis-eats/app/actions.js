"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { signInSchema, signUpSchema } from "../lib/authSchema";
import { orderSchema, fieldErrors } from "../lib/orderSchema";
import { createOrderOnce, cancelOwnedOrder, advanceOrderStatus } from "../lib/orders";
import { createUser, verifyCredentials } from "../lib/users";
import { startSession, endSession, getSession } from "../lib/session";
import { safeNext } from "../lib/safeNext";
import { getDish } from "../lib/dishStore";

export async function signIn(_previousState, formData) {
  const result = signInSchema.safeParse({ phone: formData.get("phone"), password: formData.get("password") });
  if (!result.success) return { fieldErrors: fieldErrors(result) };
  const user = verifyCredentials(result.data.phone, result.data.password);
  if (!user) return { error: "Phone number or password is incorrect." };
  await startSession(user.id);
  redirect(safeNext(formData.get("next")));
}

export async function signUp(_previousState, formData) {
  const result = signUpSchema.safeParse({ name: formData.get("name"), phone: formData.get("phone"), password: formData.get("password") });
  if (!result.success) return { fieldErrors: fieldErrors(result) };
  const created = createUser(result.data); // the role is never read from the form: always "customer"
  if (created.error) return { error: created.error };
  await startSession(created.user.id);
  redirect(safeNext(formData.get("next")));
}

export async function signOut() {
  await endSession();
}

export async function placeOrder(_previousState, formData) {
  const user = await getSession();
  if (!user) return { error: "Please sign in to place an order.", status: 401 };

  let rawItems;
  try {
    rawItems = JSON.parse(formData.get("items"));
  } catch {
    return { error: "Your cart could not be read. Please return to the cart and try again." };
  }

  const result = orderSchema.safeParse({
    customerName: formData.get("customerName"),
    phone: formData.get("phone"),
    deliveryArea: formData.get("deliveryArea"),
    items: rawItems
  });
  if (!result.success) {
    const errors = fieldErrors(result);
    return errors.items ? { error: errors.items[0] } : { fieldErrors: errors };
  }

  // Prices come from the server's menu, never from the client.
  const items = result.data.items.map((item) => {
    const dish = getDish(item.id);
    return dish?.available ? { ...dish, quantity: item.quantity } : null;
  });
  if (items.some((item) => !item)) return { error: "One of the selected dishes is no longer available." };

  const total = items.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const created = createOrderOnce(
    { ...result.data, items, total },
    user.id,
    formData.get("idempotencyKey")
  );
  if (created.error) return created;
  const order = created.order;
  revalidatePath("/orders/history");
  revalidatePath("/kitchen");
  revalidatePath("/admin", "layout");
  return { success: true, orderId: order.id, message: "Your order has been placed successfully." };
}

export async function cancelOrder(orderId) {
  const user = await getSession();
  if (!user) return { error: "You must be signed in.", status: 401 };
  const result = cancelOwnedOrder(orderId, user.id); // ownership is checked inside
  if (result.error) return result;
  revalidatePath("/orders/history");
  revalidatePath("/kitchen");
  revalidatePath("/admin", "layout");
  return { success: true, order: result.order };
}

export async function advanceOrder(orderId) {
  const user = await getSession();
  if (!user) return { error: "You must be signed in.", status: 401 };
  if (user.role !== "staff") return { error: "Staff only.", status: 403 };
  const result = advanceOrderStatus(orderId);
  if (result.error) return result;
  revalidatePath("/kitchen");
  revalidatePath("/admin", "layout");
  return { success: true, order: result.order };
}
