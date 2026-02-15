import Link from "next/link";
import Image from "next/image";
import { ShoppingCart } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import type { ProductCard as ProductCardType } from "@/types";
import { formatPrice } from "@/lib/utils";
import { AddToCartButton } from "./add-to-cart-button";

interface ProductCardProps {
  product: ProductCardType;
}

export function ProductCard({ product }: ProductCardProps) {
  const isOnSale =
    product.compare_at_price !== null &&
    product.compare_at_price > product.retail_price;
  const isOutOfStock = product.total_stock <= 0;
  const discount = isOnSale
    ? Math.round(
        ((product.compare_at_price! - product.retail_price) /
          product.compare_at_price!) *
          100
      )
    : 0;

  return (
    <div className="group relative flex flex-col overflow-hidden rounded-md border border-border bg-card transition-all hover:border-primary/50 hover:shadow-[0_0_15px_hsl(300_100%_50%/0.1)]">
      {/* Image */}
      <Link
        href={`/products/${product.slug}`}
        className="relative aspect-square overflow-hidden bg-secondary"
      >
        {product.primary_image ? (
          <Image
            src={product.primary_image}
            alt={product.primary_image_alt ?? product.title}
            fill
            className="object-cover transition-transform duration-300 group-hover:scale-105"
            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
          />
        ) : (
          <div className="flex h-full items-center justify-center text-muted-foreground">
            <ShoppingCart className="size-10" />
          </div>
        )}

        {/* Badges */}
        <div className="absolute left-2 top-2 flex flex-col gap-1">
          {isOnSale && (
            <Badge className="bg-[hsl(60_100%_50%)] text-[hsl(240_20%_4%)] text-[10px] font-bold">
              -{discount}%
            </Badge>
          )}
          {product.featured && (
            <Badge
              variant="secondary"
              className="border border-primary/50 text-[10px]"
            >
              FEATURED
            </Badge>
          )}
          {isOutOfStock && (
            <Badge variant="destructive" className="text-[10px]">
              SOLD OUT
            </Badge>
          )}
        </div>
      </Link>

      {/* Info */}
      <div className="flex flex-1 flex-col gap-1.5 p-3">
        {product.category_name && (
          <Link
            href={`/products?category=${product.category_slug}`}
            className="text-[10px] uppercase tracking-wider text-accent transition-colors hover:text-primary"
          >
            {product.category_name}
          </Link>
        )}

        <Link href={`/products/${product.slug}`}>
          <h3 className="font-heading text-[10px] leading-relaxed text-foreground line-clamp-2 transition-colors group-hover:text-primary sm:text-xs">
            {product.title}
          </h3>
        </Link>

        {product.short_description && (
          <p className="text-xs text-muted-foreground line-clamp-2">
            {product.short_description}
          </p>
        )}

        <div className="mt-auto flex items-center justify-between pt-2">
          <div className="flex items-baseline gap-2">
            <span className="text-sm font-semibold text-foreground">
              {formatPrice(product.retail_price)}
            </span>
            {isOnSale && (
              <span className="text-xs text-muted-foreground line-through">
                {formatPrice(product.compare_at_price!)}
              </span>
            )}
          </div>

          <AddToCartButton product={product} size="icon" />
        </div>
      </div>
    </div>
  );
}
