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

/** Schema for adding a new affiliate product via the web UI. */
export const addProductSchema = z.object({
  url: z.string().url("Please enter a valid URL"),
  title: z.string().min(1, "Title is required").max(300),
  price: z.coerce.number().positive("Price must be greater than 0"),
  slug: z.string().optional(),
  category: z.string().optional(),
  brand: z.string().optional(),
  description: z.string().optional(),
  short_description: z.string().optional(),
  image_url: z.string().url("Please enter a valid image URL").optional().or(z.literal("")),
  compare_at_price: z.coerce.number().positive().optional().or(z.literal("")),
  tags: z.string().optional(), // comma-separated, parsed in the action
  featured: z.coerce.boolean().optional(),
  status: z.enum(["draft", "active"]).default("active"),
});

export type ProductFilterParams = z.infer<typeof productFilterSchema>;
export type SearchParams = z.infer<typeof searchSchema>;
export type AddProductInput = z.infer<typeof addProductSchema>;
