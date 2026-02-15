"use client";

import Link from "next/link";
import { Home, ShoppingBag, Grid3X3, ShoppingCart, User } from "lucide-react";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";

const navLinks = [
  { href: "/", label: "Home", icon: Home },
  { href: "/products", label: "Shop", icon: ShoppingBag },
  { href: "/categories", label: "Categories", icon: Grid3X3 },
  { href: "/cart", label: "Cart", icon: ShoppingCart },
  { href: "/login", label: "Account", icon: User },
];

interface MobileNavProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function MobileNav({ open, onOpenChange }: MobileNavProps) {
  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="left" className="w-72 border-border bg-background">
        <SheetHeader>
          <SheetTitle className="font-heading text-sm neon-text text-primary">
            RETROCOMEBACK
          </SheetTitle>
        </SheetHeader>

        <nav className="flex flex-col gap-1 px-4">
          {navLinks.map(({ href, label, icon: Icon }) => (
            <Link
              key={href}
              href={href}
              onClick={() => onOpenChange(false)}
              className="flex items-center gap-3 rounded-md px-3 py-3 text-sm text-foreground transition-colors hover:bg-secondary hover:text-primary"
            >
              <Icon className="size-5" />
              <span>{label}</span>
            </Link>
          ))}
        </nav>
      </SheetContent>
    </Sheet>
  );
}
