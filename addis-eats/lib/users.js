import { randomBytes, scryptSync, timingSafeEqual } from "node:crypto";
import { env } from "./env";

// In-memory store, like orders: it resets when the server restarts.
const users = globalThis.__addisEatsUsers ?? [];
globalThis.__addisEatsUsers = users;

// Passwords are stored as a salted scrypt hash, never as the password itself.
function hashPassword(password) {
  const salt = randomBytes(16);
  return `${salt.toString("hex")}:${scryptSync(password, salt, 64).toString("hex")}`;
}

function checkPassword(password, stored) {
  const [salt, hash] = stored.split(":");
  const expected = Buffer.from(hash, "hex");
  const actual = scryptSync(password, Buffer.from(salt, "hex"), expected.length);
  return timingSafeEqual(actual, expected);
}

// Checked when the phone number is unknown, so a miss takes as long as a wrong password.
const DUMMY_HASH = hashPassword(randomBytes(16).toString("hex"));

// +2519XXXXXXXX and 09XXXXXXXX are the same person.
function normalizePhone(phone) {
  return phone.startsWith("+251") ? `0${phone.slice(4)}` : phone;
}

function publicUser({ id, name, phone, role }) {
  return { id, name, phone, role };
}

export function createUser({ name, phone, password, role = "customer" }) {
  const normalized = normalizePhone(phone);
  if (users.some((user) => user.phone === normalized)) {
    return { error: "An account with this phone number already exists." };
  }
  const user = { id: `usr_${crypto.randomUUID().slice(0, 8)}`, name, phone: normalized, role, passwordHash: hashPassword(password) };
  users.push(user);
  return { user: publicUser(user) };
}

export function verifyCredentials(phone, password) {
  const user = users.find((candidate) => candidate.phone === normalizePhone(phone));
  const valid = checkPassword(password, user?.passwordHash ?? DUMMY_HASH);
  return user && valid ? publicUser(user) : null;
}

export function findUser(id) {
  const user = users.find((candidate) => candidate.id === id);
  return user ? publicUser(user) : null;
}

// Demo staff account (the only way to get the "staff" role; sign-up always creates customers).
// Phone 0911000000. Password: STAFF_PASSWORD from .env.local if set, otherwise staff-demo-1234 (see lib/env.js).
if (!users.some((user) => user.role === "staff")) {
  createUser({ name: "Kitchen Staff", phone: "0911000000", password: env.STAFF_PASSWORD, role: "staff" });
}
