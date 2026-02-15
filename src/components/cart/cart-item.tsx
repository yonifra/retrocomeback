"use client";

import Image from "next/image";
import { Minus, Plus, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useCartStore, type CartItem as CartItemType } from "@/lib/stores/cart-store";
import { formatPrice } from "@/lib/utils";

interface CartItemProps {
  item: CartItemType;
  compact?: boolean;
}

export function CartItemRow({ item, compact = false }: CartItemProps) {
  const updateQuantity = useCartStore((state) => state.updateQuantity);
  const removeItem = useCartStore((state) => state.removeItem);

  return (
    <div className="flex gap-3 py-3">
      {/* Image */}
      <div className="relative size-16 shrink-0 overflow-hidden rounded-md border border-border bg-secondary sm:size-20">
        {item.image ? (
          <Image
            src={item.image}
            alt={item.title}
            fill
            className="object-cover"
            sizes="80px"
          />
        ) : (
          <div className="flex h-full items-center justify-center text-xs text-muted-foreground">
            ?
          </div>
        )}
      </div>

      {/* Info */}
      <div className="flex flex-1 flex-col justify-between">
        <div>
          <h4
            className={`font-heading leading-relaxed text-foreground ${
              compact ? "text-[8px]" : "text-[10px]"
            }`}
          >
            {item.title}
          </h4>
          {item.variantTitle && (
            <p className="text-[10px] text-muted-foreground">
              {item.variantTitle}
            </p>
          )}
        </div>

        <div className="flex items-center justify-between">
          {/* Quantity controls */}
          <div className="flex items-center gap-1">
            <Button
              variant="outline"
              size="icon"
              className="size-6"
              onClick={() =>
                updateQuantity(item.productId, item.variantId, item.quantity - 1)
              }
            >
              <Minus className="size-3" />
            </Button>
            <span className="w-6 text-center text-xs">{item.quantity}</span>
            <Button
              variant="outline"
              size="icon"
              className="size-6"
              onClick={() =>
                updateQuantity(item.productId, item.variantId, item.quantity + 1)
              }
              disabled={item.quantity >= item.maxStock}
            >
              <Plus className="size-3" />
            </Button>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-xs font-medium text-foreground">
              {formatPrice(item.price * item.quantity)}
            </span>
            <Button
              variant="ghost"
              size="icon"
              className="size-6 text-muted-foreground hover:text-destructive"
              onClick={() => removeItem(item.productId, item.variantId)}
              aria-label={`Remove ${item.title}`}
            >
              <Trash2 className="size-3" />
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
