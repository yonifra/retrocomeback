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
 *   FIREBASE_PROJECT_ID            (or via GOOGLE_APPLICATION_CREDENTIALS)
 *   FIREBASE_CLIENT_EMAIL
 *   FIREBASE_PRIVATE_KEY
 *   AMAZON_AFFILIATE_TAG           (e.g., "mystore-20")
 *   ALIEXPRESS_AFFILIATE_ID        (e.g., your AliExpress affiliate ID)
 *
 * The script detects whether the URL is Amazon or AliExpress,
 * appends your affiliate tag automatically, and inserts the product.
 */

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

  // Dynamically import firebase-admin (avoid top-level import issues with env loading)
  const { initializeApp, cert, getApps, getApp } = await import("firebase-admin/app");
  const { getFirestore } = await import("firebase-admin/firestore");

  const projectId = process.env.FIREBASE_PROJECT_ID || process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID;
  const clientEmail = process.env.FIREBASE_CLIENT_EMAIL;
  const privateKey = process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, "\n");

  if (!projectId) {
    console.error("Missing FIREBASE_PROJECT_ID in environment");
    process.exit(1);
  }

  // Initialize Firebase Admin
  const app = getApps().length
    ? getApp()
    : clientEmail && privateKey
      ? initializeApp({ credential: cert({ projectId, clientEmail, privateKey }) })
      : initializeApp({ projectId });

  const db = getFirestore(app);

  const sourceUrl = args.url;
  const platform = detectPlatform(sourceUrl);
  const affiliateUrl = buildAffiliateUrl(sourceUrl, platform);
  const slug = args.slug ?? slugify(args.title);
  const tags = args.tags ? args.tags.split(",").map((t) => t.trim()) : [];

  // Resolve category ID if slug provided
  let categoryId: string | null = null;
  let categoryName: string | null = null;
  let categorySlug: string | null = null;
  if (args.category) {
    const catSnap = await db
      .collection("categories")
      .where("slug", "==", args.category)
      .limit(1)
      .get();
    if (!catSnap.empty) {
      const catDoc = catSnap.docs[0];
      categoryId = catDoc.id;
      const catData = catDoc.data();
      categoryName = catData.name ?? null;
      categorySlug = catData.slug ?? null;
    } else {
      console.warn(`Warning: Category "${args.category}" not found -- product will have no category`);
    }
  }

  const now = new Date().toISOString();

  // Insert product
  const productRef = await db.collection("products").add({
    slug,
    title: args.title,
    description: args.description ?? null,
    short_description: args.short ?? null,
    category_id: categoryId,
    category_name: categoryName,
    category_slug: categorySlug,
    brand: args.brand ?? null,
    tags,
    retail_price: parseFloat(args.price),
    compare_at_price: args["compare-price"] ? parseFloat(args["compare-price"]) : null,
    status: args.status ?? "active",
    featured: "featured" in args,
    affiliate_url: affiliateUrl,
    source_url: sourceUrl,
    source_platform: platform,
    created_at: now,
    updated_at: now,
  });

  console.log(`Product created: ${slug} (${productRef.id})`);
  console.log(`   Platform:      ${platform}`);
  console.log(`   Affiliate URL: ${affiliateUrl}`);

  // Insert primary image if provided
  if (args.image) {
    try {
      await productRef.collection("images").add({
        url: args.image,
        alt_text: args.title,
        position: 0,
        is_primary: true,
      });
      console.log(`   Image:         ${args.image}`);
    } catch (err) {
      console.warn("Warning: Failed to insert image:", err);
    }
  }

  // Create a default variant so stock tracking works
  try {
    await productRef.collection("variants").add({
      title: "Default",
      stock_quantity: 999,
      sort_order: 0,
    });
  } catch (err) {
    console.warn("Warning: Failed to create default variant:", err);
  }

  console.log("\nDone!");
}

main();
