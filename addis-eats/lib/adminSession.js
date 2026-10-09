import { randomBytes } from "node:crypto";
import { cookies } from "next/headers";

export const ADMIN_COOKIE = "admin_session"; // middleware.js reads the same name
const MAX_AGE = 60 * 60 * 8; // seconds: an admin session lasts one working day

// Separate from the customer sessions, so signing in as admin never signs a customer in (or the reverse).
const sessions = globalThis.__addisEatsAdminSessions ?? new Map();
globalThis.__addisEatsAdminSessions = sessions;

export async function startAdminSession(username) {
  const store = await cookies();
  const previous = store.get(ADMIN_COOKIE)?.value;
  if (previous) sessions.delete(previous);
  const token = randomBytes(32).toString("hex");
  sessions.set(token, { username, expires: Date.now() + MAX_AGE * 1000 });
  store.set(ADMIN_COOKIE, token, {
    httpOnly: true,
    secure: true,
    sameSite: "lax",
    path: "/",
    maxAge: MAX_AGE
  });
}

// Returns { username } or null. Used by every admin page, action and handler.
export async function getAdminSession() {
  const store = await cookies();
  const token = store.get(ADMIN_COOKIE)?.value;
  const session = token ? sessions.get(token) : null;
  if (!session) return null;
  if (session.expires < Date.now()) {
    sessions.delete(token);
    return null;
  }
  return { username: session.username };
}

export async function endAdminSession() {
  const store = await cookies();
  const token = store.get(ADMIN_COOKIE)?.value;
  if (token) sessions.delete(token);
  store.delete(ADMIN_COOKIE);
}
