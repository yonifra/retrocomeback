"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Search, ShoppingCart, User, Menu, LogOut, Package } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useCartStore } from "@/lib/stores/cart-store";
import { MobileNav } from "./mobile-nav";
import { onAuthStateChanged, signOut } from "firebase/auth";
import { auth } from "@/lib/firebase/client";

interface HeaderProps {
  initialUserEmail?: string | null;
}

export function Header({ initialUserEmail = null }: HeaderProps) {
  const [mobileNavOpen, setMobileNavOpen] = useState(false);
  const totalItems = useCartStore((state) => state.totalItems());
  const openCart = useCartStore((state) => state.openCart);
  const [userEmail, setUserEmail] = useState<string | null>(initialUserEmail);
  const router = useRouter();

  useEffect(() => {
    let mounted = true;

    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (mounted) {
        setUserEmail(user?.email ?? null);
      }
    });

    return () => {
      mounted = false;
      unsubscribe();
    };
  }, []);

  async function handleLogout() {
    try {
      // Sign out of Firebase client-side
      await signOut(auth);
      // Clear server session cookie
      await fetch("/api/auth/session", { method: "DELETE" });
      setUserEmail(null);
      router.push("/");
      router.refresh();
    } catch {
      // Best effort — redirect anyway
      router.push("/");
      router.refresh();
    }
  }

  return (
    <>
      <header className="sticky top-0 z-40 w-full border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
          {/* Left: Hamburger + Logo */}
          <div className="flex items-center gap-3">
            <Button
              variant="ghost"
              size="icon"
              className="md:hidden"
              onClick={() => setMobileNavOpen(true)}
              aria-label="Open menu"
            >
              <Menu className="size-5" />
            </Button>

            <Link href="/" className="font-heading text-sm neon-text text-primary transition-opacity hover:opacity-80 lg:text-base">
              RETROCOMEBACK
            </Link>
          </div>

          {/* Center: Desktop Nav */}
          <nav className="hidden items-center gap-6 md:flex">
            <Link
              href="/products"
              className="text-sm text-muted-foreground transition-colors hover:text-primary"
            >
              Shop
            </Link>
            <Link
              href="/categories"
              className="text-sm text-muted-foreground transition-colors hover:text-primary"
            >
              Categories
            </Link>
          </nav>

          {/* Right: Actions */}
          <div className="flex items-center gap-1">
            <Button
              variant="ghost"
              size="icon"
              aria-label="Search (Ctrl+K)"
              onClick={() => {
                document.dispatchEvent(
                  new KeyboardEvent("keydown", { key: "k", metaKey: true })
                );
              }}
            >
              <Search className="size-5" />
            </Button>

            <Button
              variant="ghost"
              size="icon"
              className="relative"
              onClick={openCart}
              aria-label="Open cart"
            >
              <ShoppingCart className="size-5" />
              {totalItems > 0 && (
                <Badge className="absolute -top-1 -right-1 flex size-5 items-center justify-center p-0 text-[10px]">
                  {totalItems > 99 ? "99+" : totalItems}
                </Badge>
              )}
            </Button>

            {userEmail ? (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="icon" aria-label="Account menu">
                    <User className="size-5" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-56">
                  <DropdownMenuLabel className="font-mono text-xs text-muted-foreground">
                    {userEmail}
                  </DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem asChild>
                    <Link href="/account" className="cursor-pointer">
                      <User className="mr-2 size-4" />
                      My Account
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <Link
                      href="/account/marketplaces"
                      className="cursor-pointer"
                    >
                      <Package className="mr-2 size-4" />
                      My Marketplaces
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem
                    variant="destructive"
                    onSelect={handleLogout}
                    className="cursor-pointer"
                  >
                    <LogOut className="mr-2 size-4" />
                    Logout
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            ) : (
              <Button variant="ghost" size="icon" asChild>
                <Link href="/login" aria-label="Account">
                  <User className="size-5" />
                </Link>
              </Button>
            )}
          </div>
        </div>
      </header>

      <MobileNav open={mobileNavOpen} onOpenChange={setMobileNavOpen} />
    </>
  );
}
