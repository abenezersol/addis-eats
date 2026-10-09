import { randomBytes, scryptSync, timingSafeEqual } from "node:crypto";
import { env } from "./env";

// The admin account comes from the environment (see .env.example). The password is hashed once when
// this file loads, and every attempt is compared in constant time, whether or not the username matched.
const salt = randomBytes(16);
const expectedHash = scryptSync(env.ADMIN_PASSWORD, salt, 64);

export function verifyAdmin(username, password) {
  const actualHash = scryptSync(password, salt, 64);
  const passwordMatches = timingSafeEqual(actualHash, expectedHash);
  const usernameMatches = username === env.ADMIN_USERNAME;
  return usernameMatches && passwordMatches ? { username: env.ADMIN_USERNAME } : null;
}
