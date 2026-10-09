import { z } from "zod";
import { CATEGORIES } from "./menuQuery";

// The admin form sends everything as text, so numbers are coerced and the tag list is split here.
export const dishSchema = z.object({
  name: z.string().trim().min(2, "Name must be at least 2 characters").max(60, "Name is too long"),
  description: z.string().trim().min(5, "Description must be at least 5 characters").max(200, "Description is too long"),
  price: z.coerce
    .number({ message: "Price must be a number" })
    .int("Price must be a whole number of ETB")
    .positive("Price must be more than 0")
    .max(100000, "Price is too high"),
  category: z.enum(CATEGORIES, { message: "Choose a category" }),
  image: z
    .string()
    .trim()
    .regex(/^(images\/[A-Za-z0-9_-]+\.(jpg|jpeg|png|webp|avif))?$/i, "Use a path like images/my-dish.jpg, or leave it empty"),
  tags: z
    .string()
    .transform((value) =>
      value
        .split(",")
        .map((tag) => tag.trim().slice(0, 30))
        .filter(Boolean)
        .slice(0, 8)
    ),
  spicy: z.boolean(),
  available: z.boolean()
});

// Reads the form the same way for "add" and "edit". A checkbox is only present in the form data when ticked.
export function readDishForm(formData) {
  return {
    name: formData.get("name") ?? "",
    description: formData.get("description") ?? "",
    price: formData.get("price") ?? "",
    category: formData.get("category") ?? "",
    image: formData.get("image") ?? "",
    tags: formData.get("tags") ?? "",
    spicy: formData.get("spicy") === "on",
    available: formData.get("available") === "on"
  };
}
