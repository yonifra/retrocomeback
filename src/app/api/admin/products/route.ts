import { NextRequest, NextResponse } from "next/server";
import { z } from "zod/v4";
import { adminDb } from "@/lib/firebase/admin";
import { detectPlatform, buildAffiliateUrl, slugify } from "@/lib/affiliate";

// ── Input validation ────────────────────────────────────────────────

const addProductSchema = z.object({
  url: z.url(),
  title: z.string().min(1).max(300),
  price: z.number().positive(),
  slug: z.string().optional(),
  category: z.string().optional(),
  brand: z.string().optional(),
  description: z.string().optional(),
  short_description: z.string().optional(),
  image_url: z.string().url().optional(),
  compare_at_price: z.number().positive().optional(),
  tags: z.array(z.string()).optional(),
  featured: z.boolean().optional(),
  status: z.enum(["draft", "active"]).optional(),
});

// ── Admin auth check ────────────────────────────────────────────────

function isAuthorized(request: NextRequest): boolean {
  const authHeader = request.headers.get("authorization");
  const expected = process.env.ADMIN_API_KEY;
  if (!expected) return false;
  return authHeader === `Bearer ${expected}`;
}

// ── Handler ─────────────────────────────────────────────────────────

export async function POST(request: NextRequest) {
  if (!isAuthorized(request)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await request.json();
  const parsed = addProductSchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json(
      { error: "Validation failed", issues: parsed.error.issues },
      { status: 400 }
    );
  }

  const input = parsed.data;
  const platform = detectPlatform(input.url);
  const affiliateUrl = buildAffiliateUrl(input.url, platform);
  const slug = input.slug ?? slugify(input.title);

  // Resolve category
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

  const now = new Date().toISOString();

  // Insert product
  try {
    const productRef = await adminDb.collection("products").add({
      slug,
      title: input.title,
      description: input.description ?? null,
      short_description: input.short_description ?? null,
      category_id: categoryId,
      category_name: categoryName,
      category_slug: categorySlug,
      brand: input.brand ?? null,
      tags: input.tags ?? [],
      retail_price: input.price,
      compare_at_price: input.compare_at_price ?? null,
      status: input.status ?? "active",
      featured: input.featured ?? false,
      affiliate_url: affiliateUrl,
      source_url: input.url,
      source_platform: platform,
      created_at: now,
      updated_at: now,
    });

    // Insert primary image
    if (input.image_url) {
      await productRef.collection("images").add({
        url: input.image_url,
        alt_text: input.title,
        position: 0,
        is_primary: true,
      });
    }

    // Default variant
    await productRef.collection("variants").add({
      title: "Default",
      stock_quantity: 999,
      sort_order: 0,
    });

    return NextResponse.json({
      success: true,
      product: {
        id: productRef.id,
        slug,
        platform,
        affiliate_url: affiliateUrl,
      },
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
