import { createClient } from "@/lib/supabase/server";
import type {
  ProductCard,
  ProductWithDetails,
  Category,
  PaginatedResult,
  VariantOption,
} from "@/types";
import type { ProductFilterParams } from "@/lib/validators/product";

const PRODUCTS_PER_PAGE = 12;

/** Try to create a Supabase client; returns null if env vars are missing. */
async function getSupabase() {
  try {
    return await createClient();
  } catch {
    return null;
  }
}

/**
 * Fetch products for the grid with lightweight card data.
 * Supports filtering, sorting, searching, and pagination.
 */
export async function getProducts(
  params: Partial<ProductFilterParams> = {}
): Promise<PaginatedResult<ProductCard>> {
  const supabase = await getSupabase();
  const page = params.page ?? 1;
  const pageSize = PRODUCTS_PER_PAGE;

  if (!supabase) {
    return { data: [], total: 0, page, pageSize, totalPages: 0 };
  }

  const from = (page - 1) * pageSize;
  const to = from + pageSize - 1;

  // Build base query
  let query = supabase
    .from("products")
    .select(
      `
      id, slug, title, short_description, retail_price, compare_at_price,
      brand, featured, created_at,
      category:categories!category_id(name, slug),
      images:product_images!product_id(url, alt_text, is_primary),
      variants:product_variants!product_id(stock_quantity)
    `,
      { count: "exact" }
    )
    .eq("status", "active");

  // Full-text search
  if (params.q) {
    query = query.textSearch("search_vector", params.q, {
      type: "websearch",
      config: "english",
    });
  }

  // Category filter
  if (params.category) {
    // First resolve category id from slug
    const { data: cat } = await supabase
      .from("categories")
      .select("id")
      .eq("slug", params.category)
      .single();
    if (cat) {
      query = query.eq("category_id", cat.id);
    }
  }

  // Brand filter
  if (params.brand) {
    query = query.eq("brand", params.brand);
  }

  // Price range
  if (params.minPrice !== undefined) {
    query = query.gte("retail_price", params.minPrice);
  }
  if (params.maxPrice !== undefined) {
    query = query.lte("retail_price", params.maxPrice);
  }

  // Tags filter
  if (params.tags && params.tags.length > 0) {
    query = query.overlaps("tags", params.tags);
  }

  // Sorting
  switch (params.sort) {
    case "price-asc":
      query = query.order("retail_price", { ascending: true });
      break;
    case "price-desc":
      query = query.order("retail_price", { ascending: false });
      break;
    case "name-asc":
      query = query.order("title", { ascending: true });
      break;
    case "newest":
    default:
      query = query.order("created_at", { ascending: false });
      break;
  }

  // Pagination
  query = query.range(from, to);

  const { data, count, error } = await query;

  if (error) {
    console.error("Error fetching products:", error);
    return { data: [], total: 0, page, pageSize, totalPages: 0 };
  }

  const total = count ?? 0;

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const products: ProductCard[] = (data ?? []).map((row: any) => {
    const primaryImage = row.images?.find((img: { is_primary: boolean }) => img.is_primary);
    const firstImage = row.images?.[0];
    const image = primaryImage || firstImage;
    const totalStock = row.variants?.reduce(
      (sum: number, v: { stock_quantity: number }) => sum + v.stock_quantity,
      0
    ) ?? 0;

    return {
      id: row.id,
      slug: row.slug,
      title: row.title,
      short_description: row.short_description,
      retail_price: Number(row.retail_price),
      compare_at_price: row.compare_at_price ? Number(row.compare_at_price) : null,
      brand: row.brand,
      featured: row.featured,
      primary_image: image?.url ?? null,
      primary_image_alt: image?.alt_text ?? null,
      category_name: row.category?.name ?? null,
      category_slug: row.category?.slug ?? null,
      total_stock: totalStock,
    };
  });

  return {
    data: products,
    total,
    page,
    pageSize,
    totalPages: Math.ceil(total / pageSize),
  };
}

/**
 * Fetch featured products for the homepage.
 */
export async function getFeaturedProducts(): Promise<ProductCard[]> {
  const supabase = await getSupabase();
  if (!supabase) return [];
  const { data, error } = await supabase
    .from("products")
    .select(
      `
      id, slug, title, short_description, retail_price, compare_at_price,
      brand, featured, created_at,
      category:categories!category_id(name, slug),
      images:product_images!product_id(url, alt_text, is_primary),
      variants:product_variants!product_id(stock_quantity)
    `
    )
    .eq("status", "active")
    .eq("featured", true)
    .order("created_at", { ascending: false })
    .limit(8);

  if (error || !data) return [];

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  return data.map((row: any) => {
    const primaryImage = row.images?.find((img: { is_primary: boolean }) => img.is_primary);
    const image = primaryImage || row.images?.[0];
    const totalStock =
      row.variants?.reduce(
        (sum: number, v: { stock_quantity: number }) => sum + v.stock_quantity,
        0
      ) ?? 0;

    return {
      id: row.id,
      slug: row.slug,
      title: row.title,
      short_description: row.short_description,
      retail_price: Number(row.retail_price),
      compare_at_price: row.compare_at_price ? Number(row.compare_at_price) : null,
      brand: row.brand,
      featured: row.featured,
      primary_image: image?.url ?? null,
      primary_image_alt: image?.alt_text ?? null,
      category_name: row.category?.name ?? null,
      category_slug: row.category?.slug ?? null,
      total_stock: totalStock,
    };
  });
}

/**
 * Fetch the latest 8 products.
 */
export async function getNewArrivals(): Promise<ProductCard[]> {
  const result = await getProducts({ sort: "newest", page: 1 });
  return result.data.slice(0, 8);
}

/**
 * Fetch a single product with full details by slug.
 */
export async function getProductBySlug(
  slug: string
): Promise<ProductWithDetails | null> {
  const supabase = await getSupabase();
  if (!supabase) return null;

  const { data, error } = await supabase
    .from("products")
    .select(
      `
      *,
      category:categories!category_id(*),
      images:product_images!product_id(*),
      variants:product_variants!product_id(
        *,
        options:variant_options!variant_id(*)
      )
    `
    )
    .eq("slug", slug)
    .eq("status", "active")
    .single();

  if (error || !data) return null;

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const product = data as any;

  return {
    ...product,
    retail_price: Number(product.retail_price),
    compare_at_price: product.compare_at_price
      ? Number(product.compare_at_price)
      : null,
    category: product.category ?? null,
    images: (product.images ?? []).sort(
      (a: { position: number }, b: { position: number }) =>
        a.position - b.position
    ),
    variants: (product.variants ?? [])
      .sort(
        (a: { sort_order: number }, b: { sort_order: number }) =>
          a.sort_order - b.sort_order
      )
      .map((v: { price_override: number | null; stock_quantity: number; weight: number | null; options: VariantOption[] }) => ({
        ...v,
        price_override: v.price_override ? Number(v.price_override) : null,
        stock_quantity: Number(v.stock_quantity),
        weight: v.weight ? Number(v.weight) : null,
        options: v.options ?? [],
      })),
  } as ProductWithDetails;
}

/**
 * Fetch all categories.
 */
export async function getCategories(): Promise<Category[]> {
  const supabase = await getSupabase();
  if (!supabase) return [];

  const { data, error } = await supabase
    .from("categories")
    .select("*")
    .order("sort_order", { ascending: true });

  if (error || !data) return [];
  return data as Category[];
}

/**
 * Fetch all distinct brands from active products.
 */
export async function getBrands(): Promise<string[]> {
  const supabase = await getSupabase();
  if (!supabase) return [];

  const { data, error } = await supabase
    .from("products")
    .select("brand")
    .eq("status", "active")
    .not("brand", "is", null);

  if (error || !data) return [];

  const brands = [...new Set(data.map((p) => p.brand as string))].sort();
  return brands;
}

/**
 * Search products using full-text search.
 */
export async function searchProducts(
  query: string,
  limit = 5
): Promise<ProductCard[]> {
  const supabase = await getSupabase();
  if (!supabase) return [];

  const { data, error } = await supabase
    .from("products")
    .select(
      `
      id, slug, title, short_description, retail_price, compare_at_price,
      brand, featured,
      images:product_images!product_id(url, alt_text, is_primary),
      variants:product_variants!product_id(stock_quantity)
    `
    )
    .eq("status", "active")
    .textSearch("search_vector", query, {
      type: "websearch",
      config: "english",
    })
    .limit(limit);

  if (error || !data) return [];

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  return data.map((row: any) => {
    const primaryImage = row.images?.find((img: { is_primary: boolean }) => img.is_primary);
    const image = primaryImage || row.images?.[0];
    const totalStock =
      row.variants?.reduce(
        (sum: number, v: { stock_quantity: number }) => sum + v.stock_quantity,
        0
      ) ?? 0;

    return {
      id: row.id,
      slug: row.slug,
      title: row.title,
      short_description: row.short_description,
      retail_price: Number(row.retail_price),
      compare_at_price: row.compare_at_price ? Number(row.compare_at_price) : null,
      brand: row.brand,
      featured: row.featured,
      primary_image: image?.url ?? null,
      primary_image_alt: image?.alt_text ?? null,
      category_name: null,
      category_slug: null,
      total_stock: totalStock,
    };
  });
}
