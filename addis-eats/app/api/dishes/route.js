import { getAvailableDishes } from "../../../lib/dishStore";
import { CATEGORIES, queryDishes } from "../../../lib/menuQuery";

export async function GET(request) {
  const params = new URL(request.url).searchParams;
  const category = params.get("category");
  const requestedPage = Number.parseInt(params.get("page") ?? "1", 10);
  const page = Number.isFinite(requestedPage) && requestedPage > 0 ? requestedPage : 1;

  if (category && !CATEGORIES.includes(category)) {
    return Response.json({ error: "Unknown category" }, { status: 400 });
  }

  return Response.json(queryDishes(getAvailableDishes(), { category: category || undefined, q: params.get("q") ?? "", page }));
}
