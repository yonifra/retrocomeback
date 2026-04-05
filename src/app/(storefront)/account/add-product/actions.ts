"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { getSessionUser } from "@/lib/firebase/session";
import { adminDb } from "@/lib/firebase/admin";
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
  const user = await getSessionUser();
  if (!user) {
    return { error: "You must be logged in" };
  }

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
  let categoryName: string | null = null;
  let categorySlug: string | null = null;
  if (input.category) {
    const catSnap = await adminDb
      .collection("categories")
      .where("slug", "==", input.category)
      .limit(1)
      .get();
    if (!catSnap.empty) {
      const catDoc = catSnap.docs[0];
      categoryId = catDoc.id;
      const catData = catDoc.data();
      categoryName = catData.name ?? null;
      categorySlug = catData.slug ?? null;
    }
  }

  // Ensure compare_at_price is a number or null
  const compareAtPrice =
    input.compare_at_price && typeof input.compare_at_price === "number"
      ? input.compare_at_price
      : input.compare_at_price
        ? parseFloat(String(input.compare_at_price))
        : null;

  // Check for slug uniqueness
  const existingSnap = await adminDb
    .collection("products")
    .where("slug", "==", slug)
    .limit(1)
    .get();
  if (!existingSnap.empty) {
    return { error: "A product with this slug already exists. Try a different title or set a custom slug." };
  }

  const now = new Date().toISOString();

  // Insert product
  const productRef = await adminDb.collection("products").add({
    slug,
    title: input.title,
    description: input.description ?? null,
    short_description: input.short_description ?? null,
    category_id: categoryId,
    category_name: categoryName,
    category_slug: categorySlug,
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
    created_at: now,
    updated_at: now,
  });

  // Insert primary image as subcollection doc
  if (input.image_url && input.image_url.startsWith("http")) {
    await productRef.collection("images").add({
      url: input.image_url,
      alt_text: input.title,
      position: 0,
      is_primary: true,
    });
  }

  // Default variant (affiliate products are always "in stock")
  await productRef.collection("variants").add({
    title: "Default",
    stock_quantity: 999,
    sort_order: 0,
  });

  revalidatePath("/products");
  revalidatePath("/");
  redirect(`/products/${slug}`);
}
