import { findOrder } from "../../../../../lib/orders";
import { getSession } from "../../../../../lib/session";

export const dynamic = "force-dynamic";

export async function GET(request, { params }) {
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
    return Response.json(
      { error: "You are not allowed to view this order" },
      { status: 403 }
    );
  }

  const encoder = new TextEncoder();
  let interval;
  let closed = false;

  const stream = new ReadableStream({
    start(controller) {
      const close = () => {
        if (closed) return;
        closed = true;

        if (interval) clearInterval(interval);
        try {
          controller.close();
        } catch {
          // The client may have already closed the stream.
        }
      };

      const send = (currentOrder) => {
        if (closed) return;

        try {
          const payload = {
            id: currentOrder.id,
            status: currentOrder.status,
            updatedAt: new Date().toISOString()
          };
          controller.enqueue(encoder.encode(`data: ${JSON.stringify(payload)}\n\n`));

          if (
            currentOrder.status === "delivered" ||
            currentOrder.status === "cancelled"
          ) {
            close();
          }
        } catch {
          close();
        }
      };

      // Seed immediately, then re-check server state. This demo uses in-memory orders.
      const current = findOrder(id);
      if (!current || current.userId !== user.id) {
        close();
        return;
      }

      send(current);

      if (!closed) {
        interval = setInterval(() => {
          const latest = findOrder(id);
          if (!latest || latest.userId !== user.id) {
            close();
            return;
          }
          send(latest);
        }, 3000);
      }

      request.signal.addEventListener("abort", close, { once: true });
    },
    cancel() {
      closed = true;
      if (interval) clearInterval(interval);
    }
  });

  return new Response(stream, {
    headers: {
      "Content-Type": "text/event-stream; charset=utf-8",
      "Cache-Control": "no-cache, no-transform",
      Connection: "keep-alive",
      "X-Accel-Buffering": "no"
    }
  });
}
