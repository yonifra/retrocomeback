import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { getProductBySlug } from "@/lib/queries/products";
import { ImageGallery } from "@/components/products/image-gallery";
import { VariantSelector } from "@/components/products/variant-selector";
import { Breadcrumbs } from "@/components/shared/breadcrumbs";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";

interface ProductPageProps {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({
  params,
}: ProductPageProps): Promise<Metadata> {
  const { slug } = await params;
  const product = await getProductBySlug(slug);

  if (!product) {
    return { title: "Product Not Found | RETROCOMEBACK" };
  }

  return {
    title: `${product.seo_title ?? product.title} | RETROCOMEBACK`,
    description: product.seo_description ?? product.short_description ?? product.description,
    openGraph: {
      title: product.title,
      description: product.short_description ?? undefined,
      images: product.images[0]?.url ? [product.images[0].url] : undefined,
    },
  };
}

export default async function ProductPage({ params }: ProductPageProps) {
  const { slug } = await params;
  const product = await getProductBySlug(slug);

  if (!product) {
    notFound();
  }

  const breadcrumbs = [
    { label: "Shop", href: "/products" },
    ...(product.category
      ? [
          {
            label: product.category.name,
            href: `/products?category=${product.category.slug}`,
          },
        ]
      : []),
    { label: product.title },
  ];

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      <Breadcrumbs items={breadcrumbs} />

      <div className="grid gap-8 md:grid-cols-2 lg:gap-12">
        {/* Image Gallery */}
        <ImageGallery images={product.images} productTitle={product.title} />

        {/* Product Info */}
        <div className="flex flex-col">
          {/* Category + Brand */}
          <div className="mb-2 flex items-center gap-2">
            {product.category && (
              <span className="text-xs uppercase tracking-wider text-accent">
                {product.category.name}
              </span>
            )}
            {product.brand && (
              <>
                <span className="text-xs text-muted-foreground">•</span>
                <span className="text-xs text-muted-foreground">
                  {product.brand}
                </span>
              </>
            )}
          </div>

          {/* Title */}
          <h1 className="font-heading text-sm leading-relaxed text-foreground sm:text-base md:text-lg">
            {product.title.toUpperCase()}
          </h1>

          {/* Tags */}
          {product.tags.length > 0 && (
            <div className="mt-3 flex flex-wrap gap-1">
              {product.tags.slice(0, 6).map((tag) => (
                <Badge
                  key={tag}
                  variant="secondary"
                  className="text-[10px]"
                >
                  {tag}
                </Badge>
              ))}
            </div>
          )}

          <Separator className="my-6" />

          {/* Variant Selector & Add to Cart */}
          <VariantSelector product={product} />

          <Separator className="my-6" />

          {/* Description */}
          <div className="space-y-3">
            <h2 className="font-heading text-xs text-primary">DESCRIPTION</h2>
            {product.short_description && (
              <p className="text-sm font-medium text-foreground">
                {product.short_description}
              </p>
            )}
            {product.description && (
              <p className="text-sm leading-relaxed text-muted-foreground">
                {product.description}
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
