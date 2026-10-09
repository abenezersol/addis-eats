export default function DishSkeleton() {
  return (
    <div className="dish-grid">
      {[1, 2, 3, 4].map((item) => (
        <div className="card skeleton" key={item}>
          <div className="skeleton-line wide" />
          <div className="skeleton-line" />
          <div className="skeleton-line short" />
        </div>
      ))}
    </div>
  );
}
