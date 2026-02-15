import { NextRequest, NextResponse } from "next/server";
import { searchProducts } from "@/lib/queries/products";

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const q = searchParams.get("q") ?? "";
  const limit = Math.min(Number(searchParams.get("limit") ?? 6), 20);

  if (!q || q.length < 2) {
    return NextResponse.json({ results: [] });
  }

  try {
    const products = await searchProducts(q, limit);

    const results = products.map((p) => ({
      id: p.id,
      slug: p.slug,
      title: p.title,
      retail_price: p.retail_price,
      primary_image: p.primary_image,
    }));

    return NextResponse.json({ results });
  } catch {
    return NextResponse.json({ results: [] }, { status: 500 });
  }
}
