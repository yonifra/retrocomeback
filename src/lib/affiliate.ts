/**
 * Shared affiliate URL utilities.
 *
 * Used by the CLI script, API route, and web UI for creating affiliate
 * product listings from Amazon/AliExpress source URLs.
 */

export type AffiliatePlatform = "amazon" | "aliexpress" | "other";

/**
 * Detect which affiliate platform a URL belongs to based on hostname.
 */
export function detectPlatform(url: string): AffiliatePlatform {
  const hostname = new URL(url).hostname.toLowerCase();
  if (hostname.includes("amazon.") || hostname.includes("amzn.")) return "amazon";
  if (hostname.includes("aliexpress.")) return "aliexpress";
  return "other";
}

/**
 * Append affiliate tracking parameters to a source URL.
 *
 * - Amazon: appends `?tag={AMAZON_AFFILIATE_TAG}`
 * - AliExpress: appends `?aff_id={ALIEXPRESS_AFFILIATE_ID}&aff_platform=portals-tool`
 * - Other: returns the URL unchanged
 *
 * If the relevant env var is not set, returns the source URL unmodified.
 */
export function buildAffiliateUrl(
  sourceUrl: string,
  platform: AffiliatePlatform,
): string {
  const parsed = new URL(sourceUrl);

  switch (platform) {
    case "amazon": {
      const tag = process.env.AMAZON_AFFILIATE_TAG;
      if (!tag) return sourceUrl;
      parsed.searchParams.set("tag", tag);
      return parsed.toString();
    }
    case "aliexpress": {
      const affId = process.env.ALIEXPRESS_AFFILIATE_ID;
      if (!affId) return sourceUrl;
      parsed.searchParams.set("aff_id", affId);
      parsed.searchParams.set("aff_platform", "portals-tool");
      return parsed.toString();
    }
    default:
      return sourceUrl;
  }
}

/**
 * Convert a product title into a URL-friendly slug.
 */
export function slugify(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
}

/**
 * Human-readable label for an affiliate platform.
 */
export function platformLabel(platform: AffiliatePlatform | string | null): string {
  switch (platform) {
    case "amazon":
      return "Amazon";
    case "aliexpress":
      return "AliExpress";
    default:
      return "Store";
  }
}
