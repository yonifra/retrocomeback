import { Suspense } from "react";
import type { Metadata } from "next";
import { productFilterSchema } from "@/lib/validators/product";
import { getProducts, getCategories, getBrands } from "@/lib/queries/products";
import { ProductGrid } from "@/components/products/product-grid";
import { ProductFilters } from "@/components/products/product-filters";
import { Pagination } from "@/components/products/pagination";
import { Skeleton } from "@/components/ui/skeleton";

export const metadata: Metadata = {
  title: "Shop | RETROCOMEBACK",
  description:
    "Browse our radical collection of retro stickers, vintage tech, synthwave apparel and 80s home decor.",
};

interface ProductsPageProps {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}

export default async function ProductsPage({ searchParams }: ProductsPageProps) {
  const rawParams = await searchParams;

  // Parse and validate search params
  const parsed = productFilterSchema.safeParse(rawParams);
  const filters = parsed.success ? parsed.data : { sort: "newest" as const, page: 1 };

  const [result, categories, brands] = await Promise.all([
    getProducts(filters),
    getCategories(),
    getBrands(),
  ]);

  const searchQuery = typeof rawParams.q === "string" ? rawParams.q : undefined;

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      {/* Page Header */}
      <div className="mb-8">
        <h1 className="font-heading text-lg neon-text text-primary sm:text-xl">
          {searchQuery ? `RESULTS FOR "${searchQuery.toUpperCase()}"` : "SHOP"}
        </h1>
        <p className="mt-1 text-sm text-muted-foreground">
          {result.total} product{result.total !== 1 ? "s" : ""} found
        </p>
      </div>

      <div className="flex flex-col gap-8 lg:flex-row">
        {/* Filters Sidebar */}
        <Suspense fallback={<FiltersSkeleton />}>
          <ProductFilters categories={categories} brands={brands} />
        </Suspense>

        {/* Product Grid + Pagination */}
        <div className="flex-1">
          <ProductGrid products={result.data} />
          <Pagination
            currentPage={result.page}
            totalPages={result.totalPages}
          />
        </div>
      </div>
    </div>
  );
}

function FiltersSkeleton() {
  return (
    <aside className="w-full space-y-4 lg:w-64 lg:shrink-0">
      {Array.from({ length: 4 }).map((_, i) => (
        <Skeleton key={i} className="h-10 w-full" />
      ))}
    </aside>
  );
}
