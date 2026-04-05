import { adminDb } from "@/lib/firebase/admin";
import type {
  ProductCard,
  ProductWithDetails,
  Category,
  PaginatedResult,
} from "@/types";
import type { ProductFilterParams } from "@/lib/validators/product";

const PRODUCTS_PER_PAGE = 12;

/**
 * Check if Firestore is configured. Returns false if env vars are missing.
 */
function isConfigured(): boolean {
  return !!(
    process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID ||
    process.env.FIREBASE_PROJECT_ID
  );
}

/**
 * Convert a Firestore product document + its subcollections into a ProductCard.
 */
function toProductCard(
  id: string,
  data: FirebaseFirestore.DocumentData,
  images: FirebaseFirestore.DocumentData[],
  variants: FirebaseFirestore.DocumentData[],
): ProductCard {
  const primaryImage = images.find((img) => img.is_primary) ?? images[0];
  const totalStock = variants.reduce(
    (sum, v) => sum + (v.stock_quantity ?? 0),
    0,
  );

  return {
    id,
    slug: data.slug,
    title: data.title,
    short_description: data.short_description ?? null,
    retail_price: Number(data.retail_price),
    compare_at_price: data.compare_at_price ? Number(data.compare_at_price) : null,
    brand: data.brand ?? null,
    featured: data.featured ?? false,
    primary_image: primaryImage?.url ?? null,
    primary_image_alt: primaryImage?.alt_text ?? null,
    category_name: data.category_name ?? null,
    category_slug: data.category_slug ?? null,
    total_stock: totalStock,
    affiliate_url: data.affiliate_url ?? null,
    source_platform: data.source_platform ?? null,
  };
}

/**
 * Fetch products for the grid with lightweight card data.
 * Supports filtering, sorting, searching, and pagination.
 */
export async function getProducts(
  params: Partial<ProductFilterParams> = {},
): Promise<PaginatedResult<ProductCard>> {
  const page = params.page ?? 1;
  const pageSize = PRODUCTS_PER_PAGE;

  if (!isConfigured()) {
    return { data: [], total: 0, page, pageSize, totalPages: 0 };
  }

  try {
    let query: FirebaseFirestore.Query = adminDb
      .collection("products")
      .where("status", "==", "active");

    // Category filter
    if (params.category) {
      query = query.where("category_slug", "==", params.category);
    }

    // Brand filter
    if (params.brand) {
      query = query.where("brand", "==", params.brand);
    }

    // Sorting
    switch (params.sort) {
      case "price-asc":
        query = query.orderBy("retail_price", "asc");
        break;
      case "price-desc":
        query = query.orderBy("retail_price", "desc");
        break;
      case "name-asc":
        query = query.orderBy("title", "asc");
        break;
      case "newest":
      default:
        query = query.orderBy("created_at", "desc");
        break;
    }

    // Get total count
    const countSnap = await query.count().get();
    const total = countSnap.data().count;

    // Pagination
    const offset = (page - 1) * pageSize;
    const snap = await query.offset(offset).limit(pageSize).get();

    const products: ProductCard[] = [];
    for (const doc of snap.docs) {
      const data = doc.data();

      // Price range filters (applied in-app since Firestore can't combine
      // range filters on different fields with inequality)
      if (params.minPrice !== undefined && Number(data.retail_price) < params.minPrice) continue;
      if (params.maxPrice !== undefined && Number(data.retail_price) > params.maxPrice) continue;

      // Simple text search (case-insensitive substring match on title)
      if (params.q) {
        const q = params.q.toLowerCase();
        const matchesTitle = (data.title ?? "").toLowerCase().includes(q);
        const matchesDesc = (data.short_description ?? "").toLowerCase().includes(q);
        const matchesBrand = (data.brand ?? "").toLowerCase().includes(q);
        if (!matchesTitle && !matchesDesc && !matchesBrand) continue;
      }

      const imagesSnap = await adminDb
        .collection("products")
        .doc(doc.id)
        .collection("images")
        .orderBy("position")
        .get();
      const images = imagesSnap.docs.map((d) => d.data());

      const variantsSnap = await adminDb
        .collection("products")
        .doc(doc.id)
        .collection("variants")
        .get();
      const variants = variantsSnap.docs.map((d) => d.data());

      products.push(toProductCard(doc.id, data, images, variants));
    }

    return {
      data: products,
      total,
      page,
      pageSize,
      totalPages: Math.ceil(total / pageSize),
    };
  } catch (error) {
    console.error("Error fetching products:", error);
    return { data: [], total: 0, page, pageSize, totalPages: 0 };
  }
}

/**
 * Fetch featured products for the homepage.
 */
export async function getFeaturedProducts(): Promise<ProductCard[]> {
  if (!isConfigured()) return [];

  try {
    const snap = await adminDb
      .collection("products")
      .where("status", "==", "active")
      .where("featured", "==", true)
      .orderBy("created_at", "desc")
      .limit(8)
      .get();

    const products: ProductCard[] = [];
    for (const doc of snap.docs) {
      const data = doc.data();

      const imagesSnap = await doc.ref.collection("images").orderBy("position").get();
      const images = imagesSnap.docs.map((d) => d.data());

      const variantsSnap = await doc.ref.collection("variants").get();
      const variants = variantsSnap.docs.map((d) => d.data());

      products.push(toProductCard(doc.id, data, images, variants));
    }

    return products;
  } catch (error) {
    console.error("Error fetching featured products:", error);
    return [];
  }
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
  slug: string,
): Promise<ProductWithDetails | null> {
  if (!isConfigured()) return null;

  try {
    const snap = await adminDb
      .collection("products")
      .where("slug", "==", slug)
      .where("status", "==", "active")
      .limit(1)
      .get();

    if (snap.empty) return null;

    const doc = snap.docs[0];
    const data = doc.data();

    // Fetch images
    const imagesSnap = await doc.ref
      .collection("images")
      .orderBy("position")
      .get();
    const images = imagesSnap.docs.map((d) => ({
      id: d.id,
      product_id: doc.id,
      ...d.data(),
    }));

    // Fetch variants with their options
    const variantsSnap = await doc.ref
      .collection("variants")
      .orderBy("sort_order")
      .get();

    const variants = [];
    for (const vDoc of variantsSnap.docs) {
      const vData = vDoc.data();
      const optionsSnap = await vDoc.ref.collection("options").get();
      const options = optionsSnap.docs.map((oDoc) => ({
        id: oDoc.id,
        variant_id: vDoc.id,
        ...oDoc.data(),
      }));

      variants.push({
        id: vDoc.id,
        product_id: doc.id,
        ...vData,
        price_override: vData.price_override ? Number(vData.price_override) : null,
        stock_quantity: Number(vData.stock_quantity ?? 0),
        weight: vData.weight ? Number(vData.weight) : null,
        options,
      });
    }

    // Fetch category
    let category = null;
    if (data.category_id) {
      const catDoc = await adminDb.collection("categories").doc(data.category_id).get();
      if (catDoc.exists) {
        category = { id: catDoc.id, ...catDoc.data() };
      }
    }

    return {
      id: doc.id,
      ...data,
      retail_price: Number(data.retail_price),
      compare_at_price: data.compare_at_price ? Number(data.compare_at_price) : null,
      category,
      images,
      variants,
    } as ProductWithDetails;
  } catch (error) {
    console.error("Error fetching product by slug:", error);
    return null;
  }
}

/**
 * Fetch all categories.
 */
export async function getCategories(): Promise<Category[]> {
  if (!isConfigured()) return [];

  try {
    const snap = await adminDb
      .collection("categories")
      .orderBy("sort_order")
      .get();

    return snap.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    })) as Category[];
  } catch (error) {
    console.error("Error fetching categories:", error);
    return [];
  }
}

/**
 * Fetch all distinct brands from active products.
 */
export async function getBrands(): Promise<string[]> {
  if (!isConfigured()) return [];

  try {
    const snap = await adminDb
      .collection("products")
      .where("status", "==", "active")
      .select("brand")
      .get();

    const brands = new Set<string>();
    for (const doc of snap.docs) {
      const brand = doc.data().brand;
      if (brand) brands.add(brand);
    }

    return [...brands].sort();
  } catch (error) {
    console.error("Error fetching brands:", error);
    return [];
  }
}

/**
 * Search products using simple text matching.
 * (Firestore doesn't have full-text search; for production use Algolia/Typesense.)
 */
export async function searchProducts(
  query: string,
  limit = 5,
): Promise<ProductCard[]> {
  if (!isConfigured() || !query) return [];

  try {
    // Firestore doesn't support full-text search natively.
    // We fetch active products and filter in-app.
    // For production, integrate Algolia or Typesense.
    const snap = await adminDb
      .collection("products")
      .where("status", "==", "active")
      .orderBy("created_at", "desc")
      .limit(100) // cap to avoid scanning too many docs
      .get();

    const q = query.toLowerCase();
    const results: ProductCard[] = [];

    for (const doc of snap.docs) {
      if (results.length >= limit) break;

      const data = doc.data();
      const matchesTitle = (data.title ?? "").toLowerCase().includes(q);
      const matchesDesc = (data.short_description ?? "").toLowerCase().includes(q);
      const matchesBrand = (data.brand ?? "").toLowerCase().includes(q);
      const matchesTags = (data.tags ?? []).some((t: string) =>
        t.toLowerCase().includes(q),
      );

      if (!matchesTitle && !matchesDesc && !matchesBrand && !matchesTags) continue;

      const imagesSnap = await doc.ref.collection("images").orderBy("position").get();
      const images = imagesSnap.docs.map((d) => d.data());

      const variantsSnap = await doc.ref.collection("variants").get();
      const variants = variantsSnap.docs.map((d) => d.data());

      results.push(toProductCard(doc.id, data, images, variants));
    }

    return results;
  } catch (error) {
    console.error("Error searching products:", error);
    return [];
  }
}
