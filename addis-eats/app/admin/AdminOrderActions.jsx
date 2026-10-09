"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import ConfirmDeleteButton from "./ConfirmDeleteButton";
import { adminAdvanceOrder, adminDeleteOrder } from "./actions";
import { ADVANCE_LABELS } from "../../lib/orderStatus";

// Move an order along (pending → preparing → delivering → delivered) or delete it.
// goToListAfterDelete: on the details page the order is gone after deleting, so go back to the list.
export default function AdminOrderActions({ orderId, status, goToListAfterDelete = false }) {
  const router = useRouter();
  const [error, setError] = useState("");
  const [pending, startTransition] = useTransition();
  const advanceLabel = ADVANCE_LABELS[status];

  function handleAdvance() {
    setError("");
    startTransition(async () => {
      const result = await adminAdvanceOrder(orderId);
      if (result?.error) setError(result.error);
    });
  }

  async function handleDelete() {
    const result = await adminDeleteOrder(orderId);
    if (result?.success && goToListAfterDelete) router.push("/admin/orders");
    return result;
  }

  return (
    <div className="order-foot-actions">
      {advanceLabel && (
        <button type="button" className="button" disabled={pending} onClick={handleAdvance}>
          {pending ? "Updating…" : advanceLabel}
        </button>
      )}
      <ConfirmDeleteButton
        label="Delete order"
        question={`Delete order ${orderId}?`}
        onDelete={handleDelete}
      />
      {error && (
        <small className="form-error" role="alert">
          {error}
        </small>
      )}
    </div>
  );
}
