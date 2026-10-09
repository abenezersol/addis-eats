"use client";

import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import { usePathname } from "next/navigation";

const STORAGE_KEY = "addis-eats-admin";

const AdminContext = createContext(null);

function readSaved() {
  try {
    const parsed = JSON.parse(sessionStorage.getItem(STORAGE_KEY));
    return typeof parsed?.username === "string" ? { username: parsed.username } : null;
  } catch {
    return null;
  }
}

function writeSaved(admin) {
  try {
    if (admin) sessionStorage.setItem(STORAGE_KEY, JSON.stringify(admin));
    else sessionStorage.removeItem(STORAGE_KEY);
  } catch {
    // Storage can be blocked (private mode, policy). The server session still works without it.
  }
}

// The admin's identity for the interface: kept in context, mirrored in sessionStorage so a refresh keeps
// the admin logged in on screen at once. This is only what the UI shows. The real permission is the
// httpOnly admin_session cookie, which every admin page, action and handler checks on the server.
export function AdminProvider({ children }) {
  const pathname = usePathname();
  const [admin, setAdmin] = useState(null);
  const [ready, setReady] = useState(false);

  // 1. Restore what this browser tab remembered.
  useEffect(() => {
    setAdmin(readSaved());
  }, []);

  // 2. Ask the server whether that session is still valid (after the first load and after each navigation).
  useEffect(() => {
    let cancelled = false;
    fetch("/api/admin/me")
      .then((response) => (response.ok ? response.json() : null))
      .then((body) => {
        if (cancelled || !body) return;
        const confirmed = body.admin ?? null;
        setAdmin(confirmed);
        writeSaved(confirmed);
      })
      .catch(() => {
        // Offline or server error: keep what the tab remembered.
      })
      .finally(() => {
        if (!cancelled) setReady(true);
      });
    return () => {
      cancelled = true;
    };
  }, [pathname]);

  const login = useCallback((nextAdmin) => {
    setAdmin(nextAdmin);
    writeSaved(nextAdmin);
  }, []);

  const logout = useCallback(() => {
    setAdmin(null);
    writeSaved(null);
  }, []);

  const value = useMemo(() => ({ admin, ready, login, logout }), [admin, ready, login, logout]);

  return <AdminContext.Provider value={value}>{children}</AdminContext.Provider>;
}

export function useAdmin() {
  const context = useContext(AdminContext);
  if (!context) throw new Error("useAdmin must be used inside AdminProvider");
  return context;
}
