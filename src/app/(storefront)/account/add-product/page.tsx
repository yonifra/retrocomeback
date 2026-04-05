import { Breadcrumbs } from "@/components/shared/breadcrumbs";
import { AddProductForm } from "./add-product-form";
import { getCategories } from "@/lib/queries/products";

export default async function AddProductPage() {
  const categories = await getCategories();

  return (
    <div className="mx-auto max-w-3xl px-4 py-8 sm:px-6 lg:px-8">
      <Breadcrumbs
        items={[
          { label: "Account", href: "/account" },
          { label: "Add Product" },
        ]}
      />

      <div className="mt-4">
        <h1 className="font-heading text-lg neon-text text-primary sm:text-xl">
          ADD AFFILIATE PRODUCT
        </h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Paste an AliExpress or Amazon link. The product will be listed in
          the store with your retro theme, and the &ldquo;Buy&rdquo; button
          will redirect buyers to the original listing with your referral code.
        </p>
      </div>

      <div className="mt-8">
        <AddProductForm categories={categories} />
      </div>
    </div>
  );
}
