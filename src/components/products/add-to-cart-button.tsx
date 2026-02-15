"use client";

import { ShoppingCart } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useCartStore } from "@/lib/stores/cart-store";
import type { ProductCard as ProductCardType } from "@/types";
import { toast } from "sonner";

interface AddToCartButtonProps {
  product: ProductCardType;
  size?: "default" | "sm" | "lg" | "icon";
  variant?: "default" | "outline" | "ghost" | "secondary";
  className?: string;
  showLabel?: boolean;
}

export function AddToCartButton({
  product,
  size = "default",
  variant = "ghost",
  className,
  showLabel = false,
}: AddToCartButtonProps) {
  const addItem = useCartStore((state) => state.addItem);
  const isOutOfStock = product.total_stock <= 0;

  const handleAdd = () => {
    addItem({
      productId: product.id,
      variantId: null,
      title: product.title,
      variantTitle: null,
      price: product.retail_price,
      image: product.primary_image,
      maxStock: product.total_stock,
    });
    toast.success(`${product.title} added to cart!`);
  };

  return (
    <Button
      size={size}
      variant={variant}
      disabled={isOutOfStock}
      onClick={handleAdd}
      className={className}
      aria-label={`Add ${product.title} to cart`}
    >
      <ShoppingCart className="size-4" />
      {showLabel && <span className="ml-2">Add to Cart</span>}
    </Button>
  );
}
