import { AdminProvider } from "./AdminProvider";
import AdminNav from "./AdminNav";

// Admin pages are private and must never appear in search results.
export const metadata = {
  robots: { index: false, follow: false }
};

export default function AdminLayout({ children }) {
  return (
    <AdminProvider>
      <AdminNav />
      {children}
    </AdminProvider>
  );
}
