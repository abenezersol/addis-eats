import { findOrder } from "../../../../lib/orders";
import { getSession } from "../../../../lib/session";

export async function GET(_request, { params }) {
  const user = await getSession();
  if (!user) {
    return Response.json({ error: "You must be signed in" }, { status: 401 });
  }

  const { id } = await params;
  const order = findOrder(id);
  if (!order) {
    return Response.json({ error: "Order not found" }, { status: 404 });
  }
  if (order.userId !== user.id) {
    return Response.json({ error: "You are not allowed to view this order" }, { status: 403 });
  }

  return Response.json(order, { status: 200 });
}
