"use client";

import Link from "next/link";
import { ShoppingCart, ArrowLeft } from "lucide-react";
import { useCartStore } from "@/lib/stores/cart-store";
import { formatPrice } from "@/lib/utils";
import { CartItemRow } from "@/components/cart/cart-item";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Breadcrumbs } from "@/components/shared/breadcrumbs";

export default function CartPage() {
  const items = useCartStore((state) => state.items);
  const subtotal = useCartStore((state) => state.subtotal());
  const totalItems = useCartStore((state) => state.totalItems());
  const clearCart = useCartStore((state) => state.clearCart);

  // Flat-rate shipping for MVP
  const shippingCost = items.length > 0 ? 5.99 : 0;
  const total = subtotal + shippingCost;

  return (
    <div className="mx-auto max-w-4xl px-4 py-8 sm:px-6 lg:px-8">
      <Breadcrumbs items={[{ label: "Cart" }]} />

      <h1 className="font-heading text-lg neon-text text-primary sm:text-xl">
        YOUR CART
      </h1>
      <p className="mt-1 text-sm text-muted-foreground">
        {totalItems} item{totalItems !== 1 ? "s" : ""} in your cart
      </p>

      {items.length === 0 ? (
        <div className="mt-16 flex flex-col items-center gap-4 text-center">
          <ShoppingCart className="size-16 text-muted-foreground" />
          <p className="font-heading text-sm text-muted-foreground">
            YOUR CART IS EMPTY
          </p>
          <p className="text-sm text-muted-foreground">
            Time to fill it with some radical retro gear!
          </p>
          <Button asChild className="mt-4">
            <Link href="/products">
              <ArrowLeft className="mr-2 size-4" />
              CONTINUE SHOPPING
            </Link>
          </Button>
        </div>
      ) : (
        <div className="mt-8 grid gap-8 lg:grid-cols-3">
          {/* Cart Items */}
          <div className="lg:col-span-2">
            <div className="divide-y divide-border rounded-md border border-border bg-card p-4">
              {items.map((item) => (
                <CartItemRow
                  key={`${item.productId}-${item.variantId}`}
                  item={item}
                />
              ))}
            </div>

            <div className="mt-4 flex items-center justify-between">
              <Button asChild variant="ghost" size="sm">
                <Link href="/products">
                  <ArrowLeft className="mr-1 size-4" />
                  Continue Shopping
                </Link>
              </Button>

              <Button
                variant="ghost"
                size="sm"
                className="text-muted-foreground hover:text-destructive"
                onClick={clearCart}
              >
                Clear Cart
              </Button>
            </div>
          </div>

          {/* Order Summary */}
          <div className="h-fit rounded-md border border-border bg-card p-6">
            <h2 className="font-heading text-xs text-primary">
              ORDER SUMMARY
            </h2>

            <div className="mt-4 space-y-3">
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Subtotal</span>
                <span className="text-foreground">{formatPrice(subtotal)}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Shipping</span>
                <span className="text-foreground">
                  {formatPrice(shippingCost)}
                </span>
              </div>
              <Separator />
              <div className="flex justify-between text-sm font-semibold">
                <span className="text-foreground">Total</span>
                <span className="text-foreground">{formatPrice(total)}</span>
              </div>
            </div>

            <Button
              asChild
              className="mt-6 w-full font-heading text-xs transition-shadow hover:neon-glow"
            >
              <Link href="/checkout">PROCEED TO CHECKOUT</Link>
            </Button>

            <p className="mt-3 text-center text-[10px] text-muted-foreground">
              Taxes calculated at checkout. US shipping only.
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
