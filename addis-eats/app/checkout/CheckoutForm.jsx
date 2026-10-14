"use client";

import { useActionState, useId, useTransition } from "react";
import { placeOrder } from "../actions";
import { useCart } from "../providers";

const AREAS = ["Lebu", "Piazza", "Kazanchis", "CMC", "Bole", "Mexico"];

export default function CheckoutForm({ customerName, phone }) {
  const { items, clearCart } = useCart();
  const submissionId = useId();
  const [submitting, startTransition] = useTransition();
  const [state, formAction, actionPending] = useActionState(async (previous, formData) => {
    const result = await placeOrder(previous, formData);
    if (result?.success) clearCart();
    return result;
  }, {});
  const pending = submitting || actionPending;
  const errors = state?.fieldErrors ?? {};

  function handleSubmit(event) {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);
    startTransition(() => formAction(formData));
  }

  const payload = JSON.stringify(items.map(({ id, quantity }) => ({ id, quantity })));

  return (
    <form onSubmit={handleSubmit} className="checkout-form">
      <input type="hidden" name="items" value={payload} />
      <input type="hidden" name="idempotencyKey" value={`checkout-${submissionId}`} />
      <div className="form-section">
        <span className="eyebrow">DELIVERY DETAILS</span>
        <h2>Where should we deliver?</h2>
        <div className="form-grid">
          <label>
            Full name
            <input name="customerName" defaultValue={customerName ?? ""} autoComplete="name" required />
            {errors.customerName?.[0] && <small>{errors.customerName[0]}</small>}
          </label>
          <label>
            Phone number
            <input
              name="phone"
              type="tel"
              defaultValue={phone ?? ""}
              autoComplete="tel"
              placeholder="09XXXXXXXX"
              required
            />
            {errors.phone?.[0] && <small>{errors.phone[0]}</small>}
          </label>
          <label className="wide">
            Delivery area
            <select name="deliveryArea" defaultValue="" required>
              <option value="" disabled>
                Select your area
              </option>
              {AREAS.map((area) => (
                <option key={area}>{area}</option>
              ))}
            </select>
            {errors.deliveryArea?.[0] && <small>{errors.deliveryArea[0]}</small>}
          </label>
        </div>
      </div>

      {state?.error && (
        <div className="form-error" role="alert">
          {state.error}
        </div>
      )}
      {state?.success && (
        <div className="success-box" role="status">
          <strong>Order confirmed! 🎉</strong>
          <p>{state.message}</p>
          <p>
            Order ID: <strong>{state.orderId}</strong>
          </p>
        </div>
      )}

      <button className="button full" type="submit" disabled={pending || !items.length}>
        {pending ? "Placing your order…" : "Place order securely"}
      </button>
    </form>
  );
}
