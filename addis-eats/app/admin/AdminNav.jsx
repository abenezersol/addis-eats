"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useAdmin } from "./AdminProvider";
import { adminSignOut } from "./actions";

const links = [
  { href: "/admin", label: "Dashboard" },
  { href: "/admin/dishes", label: "Dishes" },
  { href: "/admin/orders", label: "Orders" }
];

function isActive(pathname, href) {
  return href === "/admin" ? pathname === "/admin" : pathname.startsWith(href);
}

export default function AdminNav() {
  const { admin, logout } = useAdmin();
  const pathname = usePathname();
  const router = useRouter();

  async function handleSignOut() {
    await adminSignOut();
    logout();
    router.push("/admin/login");
    router.refresh();
  }

  if (!admin) return null;

  return (
    <div className="admin-bar">
      <div className="container admin-bar-inner">
        <nav aria-label="Admin sections">
          {links.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className={isActive(pathname, link.href) ? "admin-link active" : "admin-link"}
            >
              {link.label}
            </Link>
          ))}
        </nav>
        <div className="admin-bar-user">
          <span>
            Signed in as <strong>{admin.username}</strong>
          </span>
          <button type="button" className="session-button" onClick={handleSignOut}>
            Sign out
          </button>
        </div>
      </div>
    </div>
  );
}
