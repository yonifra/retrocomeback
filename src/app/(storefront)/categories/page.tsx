import type { Metadata } from "next";
import { getCategories } from "@/lib/queries/products";
import { CategoryGrid } from "@/components/shared/category-grid";
import { Breadcrumbs } from "@/components/shared/breadcrumbs";

export const metadata: Metadata = {
  title: "Categories | RETROCOMEBACK",
  description: "Browse retro product categories — stickers, vintage tech, apparel, and home decor.",
};

export default async function CategoriesPage() {
  const categories = await getCategories();

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      <Breadcrumbs items={[{ label: "Categories" }]} />

      <h1 className="font-heading text-lg neon-text text-primary sm:text-xl">
        CATEGORIES
      </h1>
      <p className="mt-1 text-sm text-muted-foreground">
        Find your retro fix in the perfect aisle
      </p>

      <div className="mt-8">
        <CategoryGrid categories={categories} />
      </div>
    </div>
  );
}
