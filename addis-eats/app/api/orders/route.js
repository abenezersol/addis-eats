import { orderSchema, fieldErrors } from "../../../lib/orderSchema";
import { createOrder } from "../../../lib/orders";
import { getSession } from "../../../lib/session";
import { getDish } from "../../../lib/dishStore";

export async function POST(request) {
  try {
    const user = await getSession();
    if (!user) {
      return Response.json({ error: "You must be signed in" }, { status: 401 });
    }

    let body;
    try {
      body = await request.json();
    } catch {
      return Response.json({ error: "Malformed JSON body" }, { status: 400 });
    }

    const result = orderSchema.safeParse(body);
    if (!result.success) {
      return Response.json({ error: "Validation failed", fieldErrors: fieldErrors(result) }, { status: 422 });
    }

    const items = result.data.items.map((item) => {
      const dish = getDish(item.id);
      return dish?.available ? { ...dish, quantity: item.quantity } : null;
    });
    if (items.some((item) => !item)) {
      return Response.json({ error: "One or more dishes are not available" }, { status: 422 });
    }

    const total = items.reduce((sum, item) => sum + item.price * item.quantity, 0);
    const order = createOrder({ ...result.data, items, total }, user.id);

    return Response.json({ id: order.id, total: order.total, currency: order.currency }, { status: 201 });
  } catch {
    return Response.json({ error: "Internal server error" }, { status: 500 });
  }
}
