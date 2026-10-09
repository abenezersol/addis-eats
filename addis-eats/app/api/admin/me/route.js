import { getAdminSession } from "../../../../lib/adminSession";

// Lets the AdminProvider (client) confirm that the browser's admin session is still valid on the server.
export async function GET() {
  return Response.json({ admin: await getAdminSession() });
}
