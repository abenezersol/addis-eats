"use client";

import { useState, useTransition } from "react";
import { toggleDish } from "./actions";

// Switch a dish on (visible and orderable) or off (hidden from customers).
export default function AvailabilityToggle({ dishId, dishName, available }) {
  const [error, setError] = useState("");
  const [pending, startTransition] = useTransition();

  function handleToggle() {
    setError("");
    startTransition(async () => {
      const result = await toggleDish(dishId, !available);
      if (result?.error) setError(result.error);
    });
  }

  return (
    <span className="toggle-wrap">
      <button
        type="button"
        role="switch"
        aria-checked={available}
        aria-label={`${dishName} is ${available ? "on" : "off"}`}
        className={available ? "switch on" : "switch"}
        disabled={pending}
        onClick={handleToggle}
      >
        <span className="switch-knob" />
      </button>
      <small>{pending ? "Saving…" : available ? "On" : "Off"}</small>
      {error && (
        <small className="form-error" role="alert">
          {error}
        </small>
      )}
    </span>
  );
}
