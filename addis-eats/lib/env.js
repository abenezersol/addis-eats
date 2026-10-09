import { z } from "zod";

// Validated once, when the server loads this file, so a bad value fails with a clear message
// instead of an undefined three screens later. There are no NEXT_PUBLIC_ variables: nothing here may reach the browser.
const schema = z.object({
  STAFF_PASSWORD: z.string().min(8, "must be at least 8 characters").default("staff-demo-1234"),
  ADMIN_USERNAME: z.string().min(3, "must be at least 3 characters").default("admin"),
  ADMIN_PASSWORD: z.string().min(8, "must be at least 8 characters").default("admin-demo-1234")
});

// An empty value (for example "STAFF_PASSWORD=") means "not set".
const result = schema.safeParse({
  STAFF_PASSWORD: process.env.STAFF_PASSWORD || undefined,
  ADMIN_USERNAME: process.env.ADMIN_USERNAME || undefined,
  ADMIN_PASSWORD: process.env.ADMIN_PASSWORD || undefined
});

if (!result.success) {
  const problems = result.error.issues.map((issue) => `${issue.path.join(".")} ${issue.message}`).join("; ");
  throw new Error(`Invalid environment: ${problems}. See .env.example.`);
}

export const env = result.data;
