"use client";

import { useState } from "react";
import { ShoppingCart } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { useCartStore } from "@/lib/stores/cart-store";
import { formatPrice } from "@/lib/utils";
import type { ProductWithDetails } from "@/types";
import { toast } from "sonner";

interface VariantSelectorProps {
  product: ProductWithDetails;
}

export function VariantSelector({ product }: VariantSelectorProps) {
  const addItem = useCartStore((state) => state.addItem);
  const [selectedVariantId, setSelectedVariantId] = useState<string>(
    product.variants[0]?.id ?? ""
  );
  const [quantity, setQuantity] = useState(1);

  const selectedVariant = product.variants.find(
    (v) => v.id === selectedVariantId
  );

  const effectivePrice =
    selectedVariant?.price_override ?? product.retail_price;
  const isOutOfStock = !selectedVariant || selectedVariant.stock_quantity <= 0;

  // Group option names (e.g., "Size", "Color") for display
  const optionGroups = new Map<string, { variantId: string; value: string }[]>();
  for (const variant of product.variants) {
    for (const opt of variant.options) {
      const existing = optionGroups.get(opt.option_name) ?? [];
      existing.push({ variantId: variant.id, value: opt.option_value });
      optionGroups.set(opt.option_name, existing);
    }
  }

  const handleAddToCart = () => {
    if (!selectedVariant) return;

    addItem({
      productId: product.id,
      variantId: selectedVariant.id,
      title: product.title,
      variantTitle: selectedVariant.title,
      price: effectivePrice,
      image: product.images[0]?.url ?? null,
      maxStock: selectedVariant.stock_quantity,
      quantity,
    });
    toast.success(`${product.title} (${selectedVariant.title}) added to cart!`);
  };

  return (
    <div className="space-y-6">
      {/* Price */}
      <div className="flex items-baseline gap-3">
        <span className="text-2xl font-bold text-foreground">
          {formatPrice(effectivePrice)}
        </span>
        {product.compare_at_price &&
          product.compare_at_price > effectivePrice && (
            <span className="text-sm text-muted-foreground line-through">
              {formatPrice(product.compare_at_price)}
            </span>
          )}
        {product.compare_at_price &&
          product.compare_at_price > effectivePrice && (
            <Badge className="bg-[hsl(60_100%_50%)] text-[hsl(240_20%_4%)] text-[10px] font-bold">
              SAVE{" "}
              {formatPrice(product.compare_at_price - effectivePrice)}
            </Badge>
          )}
      </div>

      {/* Variant Selection */}
      {product.variants.length > 1 && (
        <div className="space-y-3">
          <Label className="text-xs uppercase tracking-wider text-muted-foreground">
            {selectedVariant?.title ?? "Select variant"}
          </Label>
          <div className="flex flex-wrap gap-2">
            {product.variants.map((variant) => {
              const out = variant.stock_quantity <= 0;
              return (
                <Button
                  key={variant.id}
                  variant={
                    variant.id === selectedVariantId ? "default" : "outline"
                  }
                  size="sm"
                  disabled={out}
                  onClick={() => {
                    setSelectedVariantId(variant.id);
                    setQuantity(1);
                  }}
                  className={
                    variant.id === selectedVariantId ? "neon-glow" : ""
                  }
                >
                  {variant.title}
                  {out && " (Sold Out)"}
                </Button>
              );
            })}
          </div>
        </div>
      )}

      {/* Stock status */}
      {selectedVariant && (
        <p className="text-xs text-muted-foreground">
          {isOutOfStock ? (
            <span className="text-destructive">Out of stock</span>
          ) : selectedVariant.stock_quantity <= 5 ? (
            <span className="text-[hsl(60_100%_50%)]">
              Only {selectedVariant.stock_quantity} left!
            </span>
          ) : (
            <span className="text-green-400">In stock</span>
          )}
        </p>
      )}

      {/* Quantity */}
      <div className="space-y-2">
        <Label className="text-xs uppercase tracking-wider text-muted-foreground">
          Quantity
        </Label>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="icon"
            onClick={() => setQuantity((q) => Math.max(1, q - 1))}
            disabled={quantity <= 1}
          >
            −
          </Button>
          <span className="w-10 text-center text-sm font-medium">{quantity}</span>
          <Button
            variant="outline"
            size="icon"
            onClick={() =>
              setQuantity((q) =>
                Math.min(selectedVariant?.stock_quantity ?? 1, q + 1)
              )
            }
            disabled={quantity >= (selectedVariant?.stock_quantity ?? 1)}
          >
            +
          </Button>
        </div>
      </div>

      {/* Add to Cart */}
      <Button
        size="lg"
        className="w-full font-heading text-xs transition-shadow hover:neon-glow"
        disabled={isOutOfStock}
        onClick={handleAddToCart}
      >
        <ShoppingCart className="mr-2 size-4" />
        {isOutOfStock ? "SOLD OUT" : "ADD TO CART"}
      </Button>
    </div>
  );
}
