"use client";

import Link from "next/link";
import { useState } from "react";

export default function MenuLayout({ children }) {
  const [visits, setVisits] = useState(0);

  return (
    <div className="menu-shell">
      <aside className="menu-sidebar">
        <span className="eyebrow">MENU GUIDE</span>
        <h2>Find your favorite</h2>
        <p>Browse by course and discover something new.</p>
        <nav className="menu-sidebar-nav">
          <Link href="/menu">All dishes</Link>
          <Link href="/favorites">My favorites</Link>
        </nav>
        <div className="menu-counter">
          <span>Menu visits this session</span>
          <strong>{visits}</strong>
          <button className="mini-button" onClick={() => setVisits((count) => count + 1)}>
            Tap to count
          </button>
        </div>
      </aside>
      <section className="menu-content">{children}</section>
    </div>
  );
}
