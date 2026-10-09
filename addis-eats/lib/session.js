import { randomBytes } from "node:crypto";
import { cookies } from "next/headers";
import { findUser } from "./users";

export const SESSION_COOKIE = "session"; // middleware.js reads the same name
const MAX_AGE = 60 * 60 * 24 * 7; // seconds

// Database-style session: the cookie holds a random id, the server holds the truth.
const sessions = globalThis.__addisEatsSessions ?? new Map();
globalThis.__addisEatsSessions = sessions;

export async function startSession(userId) {
  const store = await cookies();
  const previous = store.get(SESSION_COOKIE)?.value;
  if (previous) sessions.delete(previous); // the old id must not outlive the sign-in that replaced it
  const token = randomBytes(32).toString("hex"); // a fresh id on every sign-in
  sessions.set(token, { userId, expires: Date.now() + MAX_AGE * 1000 });
  store.set(SESSION_COOKIE, token, {
    httpOnly: true, // JavaScript cannot read it
    secure: true, // HTTPS only (browsers still allow it on http://localhost)
    sameSite: "lax", // not sent from other sites
    path: "/",
    maxAge: MAX_AGE
  });
}

// The one helper used by pages, actions and handlers. Returns { id, name, role } or null.
export async function getSession() {
  const store = await cookies();
  const token = store.get(SESSION_COOKIE)?.value;
  const session = token ? sessions.get(token) : null;
  if (!session) return null;
  if (session.expires < Date.now()) {
    sessions.delete(token);
    return null;
  }
  return findUser(session.userId);
}

export async function endSession() {
  const store = await cookies();
  const token = store.get(SESSION_COOKIE)?.value;
  if (token) sessions.delete(token);
  store.delete(SESSION_COOKIE);
}
