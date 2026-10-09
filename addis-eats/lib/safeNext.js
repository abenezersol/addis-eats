// Only same-site paths are allowed as a sign-in destination.
// "/" alone is not enough: "//evil.com" and "/\evil.com" also start with a slash,
// so the value is parsed the way a browser would and its origin is compared.
export function safeNext(value) {
  if (typeof value !== "string" || !value.startsWith("/")) return "/";
  const base = "http://localhost";
  const url = new URL(value, base);
  if (url.origin !== base || url.pathname === "/signin" || url.pathname === "/signup") return "/";
  return url.pathname + url.search;
}

// The admin sign-in may only lead to another admin page (never back to the login page itself).
export function safeAdminNext(value) {
  const next = safeNext(value);
  const isAdminPage = next === "/admin" || next.startsWith("/admin/");
  return isAdminPage && !next.startsWith("/admin/login") ? next : "/admin";
}
