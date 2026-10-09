import "./globals.css";
import Link from "next/link";
import { Inter } from "next/font/google";
import { Providers } from "./providers";
import CartHeader from "./CartHeader";
import FavoritesHeader from "./FavoritesHeader";
import AuthNav from "./AuthNav";
import { siteUrl, siteName, defaultTitle, locale } from "../lib/site";

// Downloaded once at build time and served from our own origin: no request to Google, no flash of the wrong text.
const inter = Inter({ subsets: ["latin"], display: "swap", variable: "--font-inter" });

// Site-wide defaults, set once. metadataBase turns every relative URL below it (the share images, the
// canonicals) into an absolute one. There is deliberately no description here: a description inherited by
// every page would make them all read as duplicates, so each route writes its own.
export const metadata = {
  metadataBase: new URL(siteUrl),
  title: { template: `%s · ${siteName}`, default: defaultTitle },
  openGraph: { siteName, type: "website", locale }
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" className={inter.variable}>
      <body>
        <Providers>
          <header className="site-header">
            <div className="container nav">
              <Link href="/" className="logo"><span>AE</span> Addis Eats</Link>
              <nav>
                <Link href="/">Home</Link>
                <Link href="/menu">Menu</Link>
                <FavoritesHeader />
                <CartHeader />
                <Link href="/orders/history">Orders</Link>
              </nav>
              <div className="header-actions">
                <Link href="/checkout" className="header-cart">Checkout</Link>
                <AuthNav />
              </div>
            </div>
          </header>
          {children}
          <footer className="footer">
            <div className="container footer-grid">
              <div>
                <Link href="/" className="logo"><span>AE</span> Addis Eats</Link>
                <p>Great food, made simple for Addis.</p>
              </div>
              <div>
                <strong>Explore</strong>
                <Link href="/menu">Menu</Link>
                <Link href="/favorites">Favorites</Link>
                <Link href="/cart">Cart</Link>
                <Link href="/orders/history">Order history</Link>
              </div>
              <div>
                <strong>Project</strong>
                <span>Next.js App Router</span>
                <span>Server-first architecture</span>
                <span>ETB pricing</span>
              </div>
            </div>
            <div className="container footer-bottom">© 2026 Addis Eats · CodeOps Module 3 Day 45</div>
          </footer>
        </Providers>
      </body>
    </html>
  );
}
