import { NextRequest, NextResponse } from "next/server";

/**
 * GET /api/admin/scrape?url=...
 *
 * Best-effort scraper for AliExpress and Amazon product pages.
 * Fetches the HTML, extracts title/price/image/description from
 * OpenGraph meta tags and common DOM patterns.
 *
 * AliExpress aggressively blocks server-side requests, so the scraper:
 * 1. Rewrites aliexpress.us URLs to aliexpress.com (less aggressive blocking)
 * 2. Sends browser-like headers including Sec-Fetch-* headers
 * 3. Falls back to minimal extraction if price isn't in HTML (AliExpress
 *    renders prices client-side via JavaScript)
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

  // Try JSON-LD structured data
  const jsonLdPatterns = [
    /"price"\s*:\s*"?([0-9]+\.?[0-9]*)"?/,
    /"lowPrice"\s*:\s*"?([0-9]+\.?[0-9]*)"?/,
    /"offers"[\s\S]*?"price"\s*:\s*"?([0-9]+\.?[0-9]*)"?/,
  ];
  for (const pattern of jsonLdPatterns) {
    const match = html.match(pattern);
    if (match?.[1]) {
      const parsed = parseFloat(match[1]);
      if (!isNaN(parsed) && parsed > 0 && parsed < 100000) return parsed;
    }
  }

  // Try AliExpress-specific patterns (data embedded in scripts)
  const aliPatterns = [
    /(?:minAmount|actMinPrice|formattedPrice|salePrice|tradePrice)['":\s]+['"]?\$?\s*([0-9]+\.[0-9]{2})/i,
    /(?:totalValue|unitPrice)['":\s]+['"]?([0-9]+\.[0-9]{2})/i,
  ];
  for (const pattern of aliPatterns) {
    const match = html.match(pattern);
    if (match?.[1]) {
      const parsed = parseFloat(match[1]);
      if (!isNaN(parsed) && parsed > 0 && parsed < 100000) return parsed;
    }
  }

  // Try common price patterns in HTML (US$ 12.34, $12.34, etc.)
  const pricePatterns = [
    /US\s*\$\s*([0-9]+\.[0-9]{2})/i,
    /\$\s*([0-9]+\.[0-9]{2})/,
  ];
  for (const pattern of pricePatterns) {
    const match = html.match(pattern);
    if (match?.[1]) {
      const parsed = parseFloat(match[1]);
      if (!isNaN(parsed) && parsed > 0 && parsed < 100000) return parsed;
    }
  }

  return null;
}

function extractTitle(html: string): string | null {
  const ogTitle = extractMeta(html, "og:title");
  if (ogTitle) {
    // Clean up common suffixes like "| AliExpress" or "- Amazon.com"
    return ogTitle
      .replace(/\s*[-|–]\s*(AliExpress|Amazon\.com|Amazon|Aliexpress).*$/i, "")
      .trim();
  }

  // Fallback to <title> tag
  const titleMatch = html.match(/<title[^>]*>([^<]+)<\/title>/i);
  if (titleMatch?.[1]) {
    return titleMatch[1]
      .replace(/\s*[-|–]\s*(AliExpress|Amazon\.com|Amazon|Aliexpress).*$/i, "")
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

  // Try to find AliExpress CDN image URLs
  const aliCdnMatch = html.match(/(https?:\/\/ae\d+\.alicdn\.com\/[^\s"']+\.(?:jpg|jpeg|png|webp))/i);
  if (aliCdnMatch?.[1]) return aliCdnMatch[1];

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

/**
 * Normalize AliExpress URLs for better scraping:
 * - Rewrite aliexpress.us to aliexpress.com (less blocking)
 * - Strip tracking parameters to get a cleaner URL
 */
function normalizeAliExpressUrl(originalUrl: string): string {
  try {
    const parsed = new URL(originalUrl);

    // Rewrite .us domain to .com (aliexpress.us blocks server requests)
    if (parsed.hostname.includes("aliexpress.us")) {
      parsed.hostname = parsed.hostname.replace("aliexpress.us", "aliexpress.com");
    }

    // Extract item ID and build a clean URL to avoid tracking param issues
    const itemIdMatch = parsed.pathname.match(/item\/(\d+)\.html/);
    if (itemIdMatch?.[1]) {
      return `https://www.aliexpress.com/item/${itemIdMatch[1]}.html`;
    }

    return parsed.toString();
  } catch {
    return originalUrl;
  }
}

/**
 * Check if the URL is an AliExpress URL.
 */
function isAliExpressUrl(url: string): boolean {
  try {
    const parsed = new URL(url);
    return parsed.hostname.includes("aliexpress");
  } catch {
    return false;
  }
}

const BROWSER_HEADERS = {
  "User-Agent":
    "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36",
  "Accept":
    "text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8",
  "Accept-Language": "en-US,en;q=0.9",
  "Accept-Encoding": "identity",
  "Sec-Fetch-Dest": "document",
  "Sec-Fetch-Mode": "navigate",
  "Sec-Fetch-Site": "none",
  "Sec-Fetch-User": "?1",
  "Cache-Control": "max-age=0",
};

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

  // Determine the fetch URL (may rewrite for AliExpress)
  const isAli = isAliExpressUrl(url);
  const fetchUrl = isAli ? normalizeAliExpressUrl(url) : url;

  try {
    // Fetch the page HTML with browser-like headers
    const response = await fetch(fetchUrl, {
      headers: BROWSER_HEADERS,
      redirect: "follow",
      signal: AbortSignal.timeout(15_000), // 15s timeout
    });

    if (!response.ok) {
      // For AliExpress, a non-200 is common -- return partial result
      if (isAli) {
        return NextResponse.json({
          title: null,
          price: null,
          image_url: null,
          description: null,
          currency: "USD",
          warning: `AliExpress returned HTTP ${response.status}. Their pages block server-side scraping. Please enter product details manually.`,
        });
      }

      return NextResponse.json(
        { error: `Failed to fetch page (HTTP ${response.status})` },
        { status: 502 },
      );
    }

    const html = await response.text();

    // Check if we got a meaningful page (not a redirect/captcha page)
    const hasContent = html.length > 5000;

    const result: ScrapeResult = {
      title: extractTitle(html),
      price: extractPrice(html),
      image_url: extractImage(html),
      description: extractDescription(html),
      currency: extractMeta(html, "og:price:currency")
        ?? extractMeta(html, "product:price:currency")
        ?? "USD",
    };

    // For AliExpress, add a note if price wasn't found
    // (AliExpress renders prices client-side via JS)
    if (isAli && !result.price && hasContent) {
      return NextResponse.json({
        ...result,
        warning: "Price not found in page HTML. AliExpress renders prices via JavaScript. Please enter the price manually.",
      });
    }

    return NextResponse.json(result);
  } catch (err) {
    const message = err instanceof Error ? err.message : "Unknown error";

    // For AliExpress, return a helpful message instead of a 502
    if (isAli) {
      return NextResponse.json({
        title: null,
        price: null,
        image_url: null,
        description: null,
        currency: "USD",
        warning: `Could not scrape AliExpress (${message}). Their pages block server-side requests. Please enter product details manually.`,
      });
    }

    return NextResponse.json(
      { error: `Scrape failed: ${message}` },
      { status: 502 },
    );
  }
}
