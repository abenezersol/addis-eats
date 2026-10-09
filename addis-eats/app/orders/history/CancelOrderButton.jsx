"use client";

import { useTransition } from "react";
import { cancelOrder } from "../../actions";

export default function CancelOrderButton({ orderId }) {
  const [pending, startTransition] = useTransition();

  return (
    <button
      className="button danger"
      disabled={pending}
      onClick={() => startTransition(() => cancelOrder(orderId))}
    >
      {pending ? "Cancelling…" : "Cancel order"}
    </button>
  );
}
