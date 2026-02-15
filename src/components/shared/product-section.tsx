import Link from "next/link";
import { ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ProductGrid } from "@/components/products/product-grid";
import type { ProductCard } from "@/types";

interface ProductSectionProps {
  title: string;
  subtitle?: string;
  products: ProductCard[];
  href?: string;
  linkLabel?: string;
  glowClass?: string;
}

export function ProductSection({
  title,
  subtitle,
  products,
  href,
  linkLabel = "VIEW ALL",
  glowClass = "neon-text",
}: ProductSectionProps) {
  return (
    <section className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
      <div className="mb-8 flex items-end justify-between">
        <div>
          <h2
            className={`font-heading text-sm text-primary sm:text-base ${glowClass}`}
          >
            {title}
          </h2>
          {subtitle && (
            <p className="mt-1 text-sm text-muted-foreground">{subtitle}</p>
          )}
        </div>

        {href && (
          <Button
            asChild
            variant="ghost"
            size="sm"
            className="text-accent hover:text-primary"
          >
            <Link href={href}>
              {linkLabel}
              <ChevronRight className="ml-1 size-4" />
            </Link>
          </Button>
        )}
      </div>

      <ProductGrid products={products} />
    </section>
  );
}
