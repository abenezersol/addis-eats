import { getSession } from "../../../lib/session";

export async function GET() {
  return Response.json({ user: await getSession() });
}
