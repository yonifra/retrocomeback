"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useCallback } from "react";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { X } from "lucide-react";
import type { Category } from "@/types";

interface ProductFiltersProps {
  categories: Category[];
  brands: string[];
}

export function ProductFilters({ categories, brands }: ProductFiltersProps) {
  const router = useRouter();
  const searchParams = useSearchParams();

  const currentCategory = searchParams.get("category") ?? "";
  const currentBrand = searchParams.get("brand") ?? "";
  const currentMinPrice = searchParams.get("minPrice") ?? "";
  const currentMaxPrice = searchParams.get("maxPrice") ?? "";
  const currentSort = searchParams.get("sort") ?? "newest";

  const updateParam = useCallback(
    (key: string, value: string) => {
      const params = new URLSearchParams(searchParams.toString());
      if (value) {
        params.set(key, value);
      } else {
        params.delete(key);
      }
      // Reset page when filters change
      if (key !== "page") {
        params.delete("page");
      }
      router.push(`/products?${params.toString()}`);
    },
    [router, searchParams]
  );

  const clearFilters = useCallback(() => {
    router.push("/products");
  }, [router]);

  const hasFilters =
    currentCategory || currentBrand || currentMinPrice || currentMaxPrice;

  return (
    <aside className="w-full space-y-6 lg:w-64 lg:shrink-0">
      <div className="flex items-center justify-between">
        <h2 className="font-heading text-xs text-primary">FILTERS</h2>
        {hasFilters && (
          <Button
            variant="ghost"
            size="sm"
            onClick={clearFilters}
            className="h-auto px-2 py-1 text-xs text-muted-foreground hover:text-destructive"
          >
            <X className="mr-1 size-3" />
            Clear
          </Button>
        )}
      </div>

      <Separator />

      {/* Sort */}
      <div className="space-y-2">
        <Label className="text-xs text-muted-foreground">Sort By</Label>
        <Select value={currentSort} onValueChange={(v) => updateParam("sort", v)}>
          <SelectTrigger className="w-full">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="newest">Newest</SelectItem>
            <SelectItem value="price-asc">Price: Low to High</SelectItem>
            <SelectItem value="price-desc">Price: High to Low</SelectItem>
            <SelectItem value="name-asc">Name: A to Z</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Category */}
      <div className="space-y-2">
        <Label className="text-xs text-muted-foreground">Category</Label>
        <Select
          value={currentCategory}
          onValueChange={(v) => updateParam("category", v === "all" ? "" : v)}
        >
          <SelectTrigger className="w-full">
            <SelectValue placeholder="All Categories" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Categories</SelectItem>
            {categories.map((cat) => (
              <SelectItem key={cat.id} value={cat.slug}>
                {cat.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Brand */}
      {brands.length > 0 && (
        <div className="space-y-2">
          <Label className="text-xs text-muted-foreground">Brand</Label>
          <Select
            value={currentBrand}
            onValueChange={(v) => updateParam("brand", v === "all" ? "" : v)}
          >
            <SelectTrigger className="w-full">
              <SelectValue placeholder="All Brands" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Brands</SelectItem>
              {brands.map((brand) => (
                <SelectItem key={brand} value={brand}>
                  {brand}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      )}

      {/* Price Range */}
      <div className="space-y-2">
        <Label className="text-xs text-muted-foreground">Price Range</Label>
        <div className="flex items-center gap-2">
          <Input
            type="number"
            placeholder="Min"
            min={0}
            value={currentMinPrice}
            onChange={(e) => updateParam("minPrice", e.target.value)}
            className="h-9 w-full"
          />
          <span className="text-muted-foreground">—</span>
          <Input
            type="number"
            placeholder="Max"
            min={0}
            value={currentMaxPrice}
            onChange={(e) => updateParam("maxPrice", e.target.value)}
            className="h-9 w-full"
          />
        </div>
      </div>
    </aside>
  );
}
