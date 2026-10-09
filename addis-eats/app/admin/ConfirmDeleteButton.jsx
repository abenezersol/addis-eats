"use client";

import { useState, useTransition } from "react";

// Two-step delete: the first click only asks, the second click deletes.
// onDelete must return the server action's result ({ error } on failure).
export default function ConfirmDeleteButton({ onDelete, label = "Delete", question = "Delete this? This cannot be undone." }) {
  const [confirming, setConfirming] = useState(false);
  const [error, setError] = useState("");
  const [pending, startTransition] = useTransition();

  function handleConfirm() {
    setError("");
    startTransition(async () => {
      const result = await onDelete();
      if (result?.error) setError(result.error);
      else setConfirming(false);
    });
  }

  if (!confirming) {
    return (
      <button type="button" className="mini-danger" onClick={() => setConfirming(true)}>
        {label}
      </button>
    );
  }

  return (
    <span className="confirm-box" role="alertdialog" aria-label="Confirm delete">
      <span>{question}</span>
      <button type="button" className="mini-danger solid" disabled={pending} onClick={handleConfirm}>
        {pending ? "Deleting…" : "Yes, delete"}
      </button>
      <button type="button" className="mini-button" disabled={pending} onClick={() => setConfirming(false)}>
        Cancel
      </button>
      {error && (
        <small className="form-error" role="alert">
          {error}
        </small>
      )}
    </span>
  );
}
