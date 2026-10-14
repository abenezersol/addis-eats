import { z } from "zod";

// Validated once, when the server loads this file, so a bad value fails with a clear message
// instead of an undefined three screens later. Only server-side secrets belong in this module; the public site URL is handled separately in lib/site.js.
const isProduction = process.env.NODE_ENV === "production";
const schema = z.object({
  STAFF_PASSWORD: z.string().min(8, "must be at least 8 characters"),
  ADMIN_USERNAME: z.string().min(3, "must be at least 3 characters"),
  ADMIN_PASSWORD: z.string().min(8, "must be at least 8 characters")
});

// Demo credentials are allowed only for local development. Production must configure unique values.
const result = schema.safeParse({
  STAFF_PASSWORD: process.env.STAFF_PASSWORD || (isProduction ? undefined : "staff-demo-1234"),
  ADMIN_USERNAME: process.env.ADMIN_USERNAME || (isProduction ? undefined : "admin"),
  ADMIN_PASSWORD: process.env.ADMIN_PASSWORD || (isProduction ? undefined : "admin-demo-1234")
});

if (!result.success) {
  const problems = result.error.issues.map((issue) => `${issue.path.join(".")} ${issue.message}`).join("; ");
  throw new Error(`Invalid environment: ${problems}. See .env.example.`);
}

export const env = result.data;

if (isProduction && (env.STAFF_PASSWORD === "staff-demo-1234" || env.ADMIN_USERNAME === "admin" || env.ADMIN_PASSWORD === "admin-demo-1234")) {
  throw new Error("Demo credentials are not allowed in production. Set unique STAFF_PASSWORD, ADMIN_USERNAME, and ADMIN_PASSWORD values.");
}
