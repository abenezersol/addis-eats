"use client";

export default function AdminError({ error, reset }) {
  return (
    <main className="container page">
      <section className="error-state" role="alert" aria-labelledby="admin-error-title">
        <div className="empty-icon" aria-hidden="true">⚠️</div>
        <h1 id="admin-error-title">We couldn’t load the admin dashboard</h1>
        <p>The dashboard data could not be displayed. Try again; if the problem continues, check the server logs.</p>
        {process.env.NODE_ENV === "development" && error?.message ? <p className="muted">Development detail: {error.message}</p> : null}
        <button className="button" type="button" onClick={() => reset()}>Try again</button>
      </section>
    </main>
  );
}
