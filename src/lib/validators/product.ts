import { z } from "zod";

export const productFilterSchema = z.object({
  category: z.string().optional(),
  minPrice: z.coerce.number().min(0).optional(),
  maxPrice: z.coerce.number().min(0).optional(),
  brand: z.string().optional(),
  tags: z.array(z.string()).optional(),
  sort: z.enum(["price-asc", "price-desc", "newest", "name-asc"]).default("newest"),
  page: z.coerce.number().min(1).default(1),
  q: z.string().optional(),
});

export const searchSchema = z.object({
  q: z.string().min(1, "Search query is required").max(200),
});

export type ProductFilterParams = z.infer<typeof productFilterSchema>;
export type SearchParams = z.infer<typeof searchSchema>;
