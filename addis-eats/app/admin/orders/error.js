"use client";

export default function AdminOrdersError({ error, reset }) {
  return (
    <main className="container page">
      <section className="error-state" role="alert" aria-labelledby="orders-error-title">
        <div className="empty-icon" aria-hidden="true">⚠️</div>
        <h1 id="orders-error-title">We couldn’t load the orders</h1>
        <p>Something went wrong while preparing the order table. Try again.</p>
        {process.env.NODE_ENV === "development" && error?.message ? <p className="muted">Development detail: {error.message}</p> : null}
        <button className="button" type="button" onClick={() => reset()}>Try again</button>
      </section>
    </main>
  );
}
