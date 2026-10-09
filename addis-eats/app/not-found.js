import Link from "next/link";

export default function NotFound() {
  return (
    <main className="container page not-found">
      <div className="empty-icon">🍽️</div>
      <span className="eyebrow">404 · NOT ON THE MENU</span>
      <h1>That dish doesn&apos;t exist</h1>
      <p>We couldn&apos;t find the food you were looking for. Let&apos;s get you back to something tasty.</p>
      <Link href="/menu" className="button">
        Browse the menu
      </Link>
    </main>
  );
}
