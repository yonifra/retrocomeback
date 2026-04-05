import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { z } from "zod/v4";
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

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL ?? process.env.SUPABASE_URL;
  const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!supabaseUrl || !supabaseKey) {
    return NextResponse.json(
      { error: "Server misconfigured – missing Supabase credentials" },
      { status: 500 }
    );
  }

  const supabase = createClient(supabaseUrl, supabaseKey);
  const platform = detectPlatform(input.url);
  const affiliateUrl = buildAffiliateUrl(input.url, platform);
  const slug = input.slug ?? slugify(input.title);

  // Resolve category
  let categoryId: string | null = null;
  if (input.category) {
    const { data: cat } = await supabase
      .from("categories")
      .select("id")
      .eq("slug", input.category)
      .single();
    if (cat) categoryId = cat.id;
  }

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
      tags: input.tags ?? [],
      retail_price: input.price,
      compare_at_price: input.compare_at_price ?? null,
      status: input.status ?? "active",
      featured: input.featured ?? false,
      affiliate_url: affiliateUrl,
      source_url: input.url,
      source_platform: platform,
    })
    .select("id, slug")
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  // Insert primary image
  if (input.image_url) {
    await supabase.from("product_images").insert({
      product_id: product.id,
      url: input.image_url,
      alt_text: input.title,
      position: 0,
      is_primary: true,
    });
  }

  // Default variant
  await supabase.from("product_variants").insert({
    product_id: product.id,
    title: "Default",
    stock_quantity: 999,
  });

  return NextResponse.json({
    success: true,
    product: {
      id: product.id,
      slug: product.slug,
      platform,
      affiliate_url: affiliateUrl,
    },
  });
}
