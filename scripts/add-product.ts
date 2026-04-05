#!/usr/bin/env npx tsx
/**
 * CLI script to add affiliate products to RetroComeback.
 *
 * Usage:
 *   npx tsx scripts/add-product.ts \
 *     --url "https://www.amazon.com/dp/B08N5WRWNW" \
 *     --title "Retro Bluetooth Speaker" \
 *     --price 29.99 \
 *     --category retro-stickers \
 *     --description "A rad retro speaker" \
 *     --image "https://example.com/image.jpg"
 *
 * Required env vars (in .env.local):
 *   SUPABASE_URL
 *   SUPABASE_SERVICE_ROLE_KEY
 *   AMAZON_AFFILIATE_TAG        (e.g., "mystore-20")
 *   ALIEXPRESS_AFFILIATE_ID     (e.g., your AliExpress affiliate ID)
 *
 * The script detects whether the URL is Amazon or AliExpress,
 * appends your affiliate tag automatically, and inserts the product.
 */

import { createClient } from "@supabase/supabase-js";
import { detectPlatform, buildAffiliateUrl, slugify } from "../src/lib/affiliate";

// ── CLI arg parsing (no extra deps) ─────────────────────────────────

function parseArgs(argv: string[]): Record<string, string> {
  const args: Record<string, string> = {};
  for (let i = 2; i < argv.length; i++) {
    const arg = argv[i];
    if (arg.startsWith("--")) {
      const key = arg.slice(2);
      const value = argv[++i];
      if (value !== undefined) args[key] = value;
    }
  }
  return args;
}

// ── Main ────────────────────────────────────────────────────────────

async function main() {
  // Load .env.local if available
  try {
    const { config } = await import("dotenv");
    config({ path: ".env.local" });
  } catch {
    // dotenv not installed — env vars must already be set
  }

  const args = parseArgs(process.argv);

  // Validate required args
  if (!args.url || !args.title || !args.price) {
    console.error(`
Usage: npx tsx scripts/add-product.ts \\
  --url <amazon-or-aliexpress-url>  (required) \\
  --title <product-title>           (required) \\
  --price <retail-price>            (required) \\
  --slug <custom-slug>              (optional, auto-generated from title) \\
  --category <category-slug>        (optional) \\
  --brand <brand-name>              (optional) \\
  --description <full-description>  (optional) \\
  --short <short-description>       (optional) \\
  --image <primary-image-url>       (optional) \\
  --compare-price <compare-price>   (optional) \\
  --tags <comma,separated,tags>     (optional) \\
  --featured                        (optional flag) \\
  --status <draft|active>           (optional, default: active)
`);
    process.exit(1);
  }

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL ?? process.env.SUPABASE_URL;
  const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!supabaseUrl || !supabaseKey) {
    console.error("❌ Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY in environment");
    process.exit(1);
  }

  const supabase = createClient(supabaseUrl, supabaseKey);

  const sourceUrl = args.url;
  const platform = detectPlatform(sourceUrl);
  const affiliateUrl = buildAffiliateUrl(sourceUrl, platform);
  const slug = args.slug ?? slugify(args.title);
  const tags = args.tags ? args.tags.split(",").map((t) => t.trim()) : [];

  // Resolve category ID if slug provided
  let categoryId: string | null = null;
  if (args.category) {
    const { data: cat } = await supabase
      .from("categories")
      .select("id")
      .eq("slug", args.category)
      .single();
    if (cat) {
      categoryId = cat.id;
    } else {
      console.warn(`⚠  Category "${args.category}" not found – product will have no category`);
    }
  }

  // Insert product
  const { data: product, error } = await supabase
    .from("products")
    .insert({
      slug,
      title: args.title,
      description: args.description ?? null,
      short_description: args.short ?? null,
      category_id: categoryId,
      brand: args.brand ?? null,
      tags,
      retail_price: parseFloat(args.price),
      compare_at_price: args["compare-price"] ? parseFloat(args["compare-price"]) : null,
      status: args.status ?? "active",
      featured: "featured" in args,
      affiliate_url: affiliateUrl,
      source_url: sourceUrl,
      source_platform: platform,
    })
    .select("id, slug")
    .single();

  if (error) {
    console.error("❌ Failed to insert product:", error.message);
    process.exit(1);
  }

  console.log(`✅ Product created: ${product.slug} (${product.id})`);
  console.log(`   Platform:      ${platform}`);
  console.log(`   Affiliate URL: ${affiliateUrl}`);

  // Insert primary image if provided
  if (args.image) {
    const { error: imgError } = await supabase.from("product_images").insert({
      product_id: product.id,
      url: args.image,
      alt_text: args.title,
      position: 0,
      is_primary: true,
    });
    if (imgError) {
      console.warn("⚠  Failed to insert image:", imgError.message);
    } else {
      console.log(`   Image:         ${args.image}`);
    }
  }

  // Create a default variant so stock tracking works
  const { error: varError } = await supabase.from("product_variants").insert({
    product_id: product.id,
    title: "Default",
    stock_quantity: 999, // affiliate products are always "in stock"
  });
  if (varError) {
    console.warn("⚠  Failed to create default variant:", varError.message);
  }

  console.log("\nDone! 🎉");
}

main();
