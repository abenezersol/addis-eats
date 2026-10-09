import { z } from "zod";

export const phoneSchema = z.string().trim().regex(/^(09\d{8}|\+2519\d{8})$/, "Use 09XXXXXXXX or +2519XXXXXXXX");

export const orderSchema = z.object({
  customerName: z.string().trim().min(2, "Name must be at least 2 characters"),
  phone: phoneSchema,
  deliveryArea: z.string().trim().min(2, "Delivery area is required"),
  items: z.array(
    z.object({
      id: z.coerce.number().int().positive(),
      quantity: z.coerce.number().int().positive().max(20)
    })
  ).min(1, "Add at least one dish")
});

export function fieldErrors(result) {
  return result.error.flatten().fieldErrors;
}
