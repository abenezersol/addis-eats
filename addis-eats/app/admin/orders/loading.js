export default function AdminOrdersLoading() {
  return (
    <main className="container page" aria-busy="true" aria-label="Loading order records">
      <div className="page-heading"><div><span className="eyebrow">ADMIN · ORDERS</span><h1>Loading orders</h1><p className="muted">Preparing the order table…</p></div></div>
      <div className="skeleton-block table-skeleton" aria-hidden="true" />
    </main>
  );
}
