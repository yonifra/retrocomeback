"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { addProductSchema } from "@/lib/validators/product";
import {
  detectPlatform,
  buildAffiliateUrl,
  slugify,
} from "@/lib/affiliate";

export type ActionResult = {
  error?: string;
  product?: { id: string; slug: string };
};

export async function addProductAction(
  formData: FormData,
): Promise<ActionResult> {
  const rawData = {
    url: formData.get("url") as string,
    title: formData.get("title") as string,
    price: formData.get("price") as string,
    slug: (formData.get("slug") as string) || undefined,
    category: (formData.get("category") as string) || undefined,
    brand: (formData.get("brand") as string) || undefined,
    description: (formData.get("description") as string) || undefined,
    short_description: (formData.get("short_description") as string) || undefined,
    image_url: (formData.get("image_url") as string) || undefined,
    compare_at_price: (formData.get("compare_at_price") as string) || undefined,
    tags: (formData.get("tags") as string) || undefined,
    featured: formData.get("featured") === "on" ? true : undefined,
    status: (formData.get("status") as string) || "active",
  };

  const parsed = addProductSchema.safeParse(rawData);
  if (!parsed.success) {
    return { error: parsed.error.issues[0].message };
  }

  // Authenticate -- must be logged in
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { error: "You must be logged in" };
  }

  // TODO: In production, check for admin role:
  // const { data: profile } = await supabase.from("profiles").select("role").eq("id", user.id).single();
  // if (profile?.role !== "admin") return { error: "Unauthorized" };

  const input = parsed.data;
  const sourceUrl = input.url;
  const platform = detectPlatform(sourceUrl);
  const affiliateUrl = buildAffiliateUrl(sourceUrl, platform);
  const slug = input.slug || slugify(input.title);
  const tags = input.tags
    ? input.tags.split(",").map((t: string) => t.trim()).filter(Boolean)
    : [];

  // Resolve category by slug
  let categoryId: string | null = null;
  if (input.category) {
    const { data: cat } = await supabase
      .from("categories")
      .select("id")
      .eq("slug", input.category)
      .single();
    if (cat) categoryId = cat.id;
  }

  // Ensure compare_at_price is a number or null
  const compareAtPrice =
    input.compare_at_price && typeof input.compare_at_price === "number"
      ? input.compare_at_price
      : input.compare_at_price
        ? parseFloat(String(input.compare_at_price))
        : null;

  // Insert product
  const { data: product, error } = await supabase
    .from("products")
    .insert({
      slug,
      title: input.title,
      description: input.description ?? null,
      short_description: input.short_description ?? null,
      category_id: categoryId,
      brand: input.brand ?? null,
      tags,
      retail_price: input.price,
      compare_at_price:
        compareAtPrice && !isNaN(compareAtPrice) ? compareAtPrice : null,
      status: input.status,
      featured: input.featured ?? false,
      affiliate_url: affiliateUrl,
      source_url: sourceUrl,
      source_platform: platform,
    })
    .select("id, slug")
    .single();

  if (error) {
    if (error.code === "23505") {
      return { error: "A product with this slug already exists. Try a different title or set a custom slug." };
    }
    return { error: error.message };
  }

  // Insert primary image
  if (input.image_url && input.image_url.startsWith("http")) {
    await supabase.from("product_images").insert({
      product_id: product.id,
      url: input.image_url,
      alt_text: input.title,
      position: 0,
      is_primary: true,
    });
  }

  // Default variant (affiliate products are always "in stock")
  await supabase.from("product_variants").insert({
    product_id: product.id,
    title: "Default",
    stock_quantity: 999,
  });

  revalidatePath("/products");
  revalidatePath("/");
  redirect(`/products/${product.slug}`);
}
