import { NextRequest, NextResponse } from "next/server";

/**
 * GET /api/admin/scrape?url=...
 *
 * Best-effort scraper for AliExpress (and Amazon) product pages.
 * Fetches the HTML, extracts title/price/image/description from
 * OpenGraph meta tags and common DOM patterns.
 *
 * Protected by ADMIN_API_KEY or Supabase auth (checked in the admin
 * product creation UI via server action -- this route is for the
 * client-side "auto-fill" button).
 */

interface ScrapeResult {
  title: string | null;
  price: number | null;
  image_url: string | null;
  description: string | null;
  currency: string | null;
}

function extractMeta(html: string, property: string): string | null {
  // Match both property="..." and name="..." patterns
  const patterns = [
    new RegExp(`<meta[^>]+property=["']${property}["'][^>]+content=["']([^"']+)["']`, "i"),
    new RegExp(`<meta[^>]+content=["']([^"']+)["'][^>]+property=["']${property}["']`, "i"),
    new RegExp(`<meta[^>]+name=["']${property}["'][^>]+content=["']([^"']+)["']`, "i"),
    new RegExp(`<meta[^>]+content=["']([^"']+)["'][^>]+name=["']${property}["']`, "i"),
  ];

  for (const pattern of patterns) {
    const match = html.match(pattern);
    if (match?.[1]) return match[1].trim();
  }
  return null;
}

function extractPrice(html: string): number | null {
  // Try OG price first
  const ogPrice = extractMeta(html, "og:price:amount")
    ?? extractMeta(html, "product:price:amount");
  if (ogPrice) {
    const parsed = parseFloat(ogPrice.replace(/[^0-9.]/g, ""));
    if (!isNaN(parsed) && parsed > 0) return parsed;
  }

  // Try common AliExpress price patterns in JSON-LD
  const jsonLdMatch = html.match(/"price"\s*:\s*"?([0-9]+\.?[0-9]*)"?/);
  if (jsonLdMatch?.[1]) {
    const parsed = parseFloat(jsonLdMatch[1]);
    if (!isNaN(parsed) && parsed > 0) return parsed;
  }

  // Try common price patterns in HTML (US$ 12.34, $12.34, etc.)
  const pricePatterns = [
    /US\s*\$\s*([0-9]+\.?[0-9]*)/i,
    /\$\s*([0-9]+\.?[0-9]*)/,
    /price['":\s]*([0-9]+\.?[0-9]*)/i,
  ];
  for (const pattern of pricePatterns) {
    const match = html.match(pattern);
    if (match?.[1]) {
      const parsed = parseFloat(match[1]);
      if (!isNaN(parsed) && parsed > 0) return parsed;
    }
  }

  return null;
}

function extractTitle(html: string): string | null {
  const ogTitle = extractMeta(html, "og:title");
  if (ogTitle) {
    // Clean up common suffixes like "| AliExpress" or "- Amazon.com"
    return ogTitle
      .replace(/\s*[-|]\s*(AliExpress|Amazon\.com|Amazon).*$/i, "")
      .trim();
  }

  // Fallback to <title> tag
  const titleMatch = html.match(/<title[^>]*>([^<]+)<\/title>/i);
  if (titleMatch?.[1]) {
    return titleMatch[1]
      .replace(/\s*[-|]\s*(AliExpress|Amazon\.com|Amazon).*$/i, "")
      .trim();
  }

  return null;
}

function extractImage(html: string): string | null {
  const ogImage = extractMeta(html, "og:image");
  if (ogImage) {
    // Ensure it's an absolute URL
    if (ogImage.startsWith("http")) return ogImage;
    if (ogImage.startsWith("//")) return `https:${ogImage}`;
  }
  return null;
}

function extractDescription(html: string): string | null {
  const ogDesc = extractMeta(html, "og:description")
    ?? extractMeta(html, "description");
  if (ogDesc) {
    // Trim to reasonable length
    return ogDesc.length > 500 ? ogDesc.slice(0, 500) + "..." : ogDesc;
  }
  return null;
}

export async function GET(request: NextRequest) {
  const url = request.nextUrl.searchParams.get("url");

  if (!url) {
    return NextResponse.json(
      { error: "Missing 'url' query parameter" },
      { status: 400 },
    );
  }

  // Basic URL validation
  try {
    new URL(url);
  } catch {
    return NextResponse.json(
      { error: "Invalid URL" },
      { status: 400 },
    );
  }

  try {
    // Fetch the page HTML with a browser-like User-Agent
    const response = await fetch(url, {
      headers: {
        "User-Agent":
          "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
        "Accept":
          "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
        "Accept-Language": "en-US,en;q=0.9",
      },
      redirect: "follow",
      signal: AbortSignal.timeout(10_000), // 10s timeout
    });

    if (!response.ok) {
      return NextResponse.json(
        { error: `Failed to fetch page (HTTP ${response.status})` },
        { status: 502 },
      );
    }

    const html = await response.text();

    const result: ScrapeResult = {
      title: extractTitle(html),
      price: extractPrice(html),
      image_url: extractImage(html),
      description: extractDescription(html),
      currency: extractMeta(html, "og:price:currency")
        ?? extractMeta(html, "product:price:currency")
        ?? "USD",
    };

    return NextResponse.json(result);
  } catch (err) {
    const message = err instanceof Error ? err.message : "Unknown error";
    return NextResponse.json(
      { error: `Scrape failed: ${message}` },
      { status: 502 },
    );
  }
}
