export default function Loading() {
  return (
    <main className="container page">
      <div className="skeleton-title" />
      <p>Loading the Addis Eats menu...</p>

      <div className="dish-grid">
        {[1, 2, 3].map((item) => (
          <div className="card skeleton" key={item}>
            <div className="skeleton-line wide" />
            <div className="skeleton-line" />
            <div className="skeleton-line short" />
          </div>
        ))}
      </div>
    </main>
  );
}
