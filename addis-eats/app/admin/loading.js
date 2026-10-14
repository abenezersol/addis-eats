export default function AdminLoading() {
  return (
    <main className="container page" aria-busy="true" aria-label="Loading admin page">
      <div className="page-heading">
        <div>
          <span className="eyebrow">ADMIN</span>
          <h1>Loading admin page</h1>
          <p className="muted">Preparing the page content…</p>
        </div>
      </div>
      <div className="stat-grid" aria-hidden="true">
        {Array.from({ length: 3 }, (_, index) => <div className="skeleton-block stat-skeleton" key={index} />)}
      </div>
      <div className="admin-two-col" aria-hidden="true">
        <div className="skeleton-block chart-skeleton" />
        <div className="skeleton-block chart-skeleton" />
      </div>
      <div className="skeleton-block table-skeleton" aria-hidden="true" />
    </main>
  );
}
