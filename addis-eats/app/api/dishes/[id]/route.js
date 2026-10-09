import { getDish } from "../../../../lib/dishStore";

export async function GET(_request, { params }) {
  const { id } = await params;
  const dish = getDish(id);

  if (!dish) {
    return Response.json({ error: "No such dish" }, { status: 404 });
  }

  return Response.json(dish, { status: 200 });
}
