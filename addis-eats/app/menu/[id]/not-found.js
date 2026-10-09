import Link from "next/link";

export default function DishNotFound() {
  return (
    <div className="not-found compact">
      <span className="eyebrow">DISH NOT FOUND</span>
      <h1>That dish isn&apos;t available.</h1>
      <p>Try another item from our menu.</p>
      <Link href="/menu" className="button">
        Back to menu
      </Link>
    </div>
  );
}
