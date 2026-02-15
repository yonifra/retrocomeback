import { HeroBanner } from "@/components/shared/hero-banner";
import { CategoryGrid } from "@/components/shared/category-grid";
import { ProductSection } from "@/components/shared/product-section";
import {
  getFeaturedProducts,
  getNewArrivals,
  getCategories,
} from "@/lib/queries/products";

export default async function HomePage() {
  const [featured, newArrivals, categories] = await Promise.all([
    getFeaturedProducts(),
    getNewArrivals(),
    getCategories(),
  ]);

  return (
    <>
      <HeroBanner />

      {/* Featured Products */}
      {featured.length > 0 && (
        <ProductSection
          title="FEATURED PRODUCTS"
          subtitle="Hand-picked radical gear from the retro zone"
          products={featured}
          href="/products"
        />
      )}

      {/* Category Grid */}
      {categories.length > 0 && <CategoryGrid categories={categories} />}

      {/* New Arrivals */}
      {newArrivals.length > 0 && (
        <ProductSection
          title="NEW ARRIVALS"
          subtitle="Fresh drops straight from 1985"
          products={newArrivals}
          href="/products?sort=newest"
          glowClass="neon-text-cyan"
        />
      )}

      {/* Bottom CTA */}
      <section className="retro-grid-bg py-20 text-center">
        <p className="font-heading text-xs text-muted-foreground">
          MORE RAD STUFF COMING SOON
        </p>
        <p className="mt-2 text-sm text-muted-foreground">
          Subscribe to get notified when new retro drops land.
        </p>
      </section>
    </>
  );
}
