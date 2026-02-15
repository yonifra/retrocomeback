import { cn } from "@/lib/utils";
import type { ProductCard as ProductCardType } from "@/types";
import { ProductCard } from "./product-card";

interface ProductGridProps {
  products: ProductCardType[];
  className?: string;
}

export function ProductGrid({ products, className }: ProductGridProps) {
  if (products.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-center">
        <p className="font-heading text-sm text-muted-foreground">
          NO PRODUCTS FOUND
        </p>
        <p className="mt-2 text-sm text-muted-foreground">
          Try adjusting your filters or search query.
        </p>
      </div>
    );
  }

  return (
    <div
      className={cn(
        "grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4",
        className
      )}
    >
      {products.map((product) => (
        <ProductCard key={product.id} product={product} />
      ))}
    </div>
  );
}
