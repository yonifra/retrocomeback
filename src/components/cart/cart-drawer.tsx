"use client";

import Link from "next/link";
import { ShoppingCart } from "lucide-react";
import { useCartStore } from "@/lib/stores/cart-store";
import { formatPrice } from "@/lib/utils";
import { CartItemRow } from "./cart-item";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
} from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { ScrollArea } from "@/components/ui/scroll-area";

export function CartDrawer() {
  const isOpen = useCartStore((state) => state.isOpen);
  const closeCart = useCartStore((state) => state.closeCart);
  const items = useCartStore((state) => state.items);
  const subtotal = useCartStore((state) => state.subtotal());
  const totalItems = useCartStore((state) => state.totalItems());
  const clearCart = useCartStore((state) => state.clearCart);

  return (
    <Sheet open={isOpen} onOpenChange={(open) => !open && closeCart()}>
      <SheetContent side="right" className="flex flex-col border-border bg-background">
        <SheetHeader>
          <SheetTitle className="font-heading text-sm text-primary">
            YOUR CART ({totalItems})
          </SheetTitle>
          <SheetDescription>
            Review your items before checkout.
          </SheetDescription>
        </SheetHeader>

        {items.length === 0 ? (
          <div className="flex flex-1 flex-col items-center justify-center gap-4 px-4">
            <ShoppingCart className="size-12 text-muted-foreground" />
            <p className="font-heading text-xs text-muted-foreground">
              CART IS EMPTY
            </p>
            <p className="text-xs text-muted-foreground">
              Add some radical retro gear!
            </p>
            <Button asChild variant="outline" size="sm" onClick={closeCart}>
              <Link href="/products">SHOP NOW</Link>
            </Button>
          </div>
        ) : (
          <>
            <ScrollArea className="flex-1 px-4">
              <div className="divide-y divide-border">
                {items.map((item) => (
                  <CartItemRow
                    key={`${item.productId}-${item.variantId}`}
                    item={item}
                    compact
                  />
                ))}
              </div>
            </ScrollArea>

            <div className="space-y-4 border-t border-border px-4 pt-4">
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Subtotal</span>
                <span className="text-sm font-semibold text-foreground">
                  {formatPrice(subtotal)}
                </span>
              </div>

              <p className="text-[10px] text-muted-foreground">
                Shipping & taxes calculated at checkout.
              </p>

              <div className="flex flex-col gap-2">
                <Button
                  asChild
                  className="w-full font-heading text-xs transition-shadow hover:neon-glow"
                  onClick={closeCart}
                >
                  <Link href="/checkout">CHECKOUT</Link>
                </Button>

                <Button
                  asChild
                  variant="outline"
                  size="sm"
                  className="w-full"
                  onClick={closeCart}
                >
                  <Link href="/cart">VIEW FULL CART</Link>
                </Button>

                <Button
                  variant="ghost"
                  size="sm"
                  className="w-full text-xs text-muted-foreground hover:text-destructive"
                  onClick={clearCart}
                >
                  Clear Cart
                </Button>
              </div>
            </div>
          </>
        )}
      </SheetContent>
    </Sheet>
  );
}
