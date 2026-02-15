"use client";

import { useCartStore } from "@/lib/stores/cart-store";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
} from "@/components/ui/sheet";

export function CartDrawer() {
  const isOpen = useCartStore((state) => state.isOpen);
  const closeCart = useCartStore((state) => state.closeCart);

  return (
    <Sheet open={isOpen} onOpenChange={(open) => !open && closeCart()}>
      <SheetContent side="right" className="border-border bg-background">
        <SheetHeader>
          <SheetTitle className="font-heading text-sm text-primary">
            Your Cart
          </SheetTitle>
          <SheetDescription>
            Review your items before checkout.
          </SheetDescription>
        </SheetHeader>

        <div className="flex flex-1 items-center justify-center px-4">
          <p className="text-sm text-muted-foreground">Coming soon...</p>
        </div>
      </SheetContent>
    </Sheet>
  );
}
