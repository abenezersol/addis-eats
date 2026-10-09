"use client";

import { useTransition } from "react";
import { advanceOrder } from "../actions";
import { ADVANCE_LABELS } from "../../lib/orderStatus";

export default function AdvanceOrderButton({ orderId, status }) {
  const [pending, startTransition] = useTransition();
  if (!ADVANCE_LABELS[status]) return null;

  return (
    <button className="button" disabled={pending} onClick={() => startTransition(() => advanceOrder(orderId))}>
      {pending ? "Updating…" : ADVANCE_LABELS[status]}
    </button>
  );
}
