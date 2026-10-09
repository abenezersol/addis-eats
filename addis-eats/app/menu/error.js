"use client";

export default function MenuError({ reset }) {
  return (
    <div className="error-state">
      <div className="empty-icon">⚠️</div>
      <h2>We couldn&apos;t load the menu</h2>
      <p>Please try again. Your header and cart are still available.</p>
      <button className="button" onClick={() => reset()}>
        Try again
      </button>
    </div>
  );
}
