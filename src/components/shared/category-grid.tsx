import Link from "next/link";
import Image from "next/image";
import type { Category } from "@/types";

interface CategoryGridProps {
  categories: Category[];
}

const categoryColors = [
  "from-primary/20 to-primary/5 hover:border-primary/50",
  "from-accent/20 to-accent/5 hover:border-accent/50",
  "from-[hsl(277_100%_45%)]/20 to-[hsl(277_100%_45%)]/5 hover:border-[hsl(277_100%_45%)]/50",
  "from-[hsl(60_100%_50%)]/20 to-[hsl(60_100%_50%)]/5 hover:border-[hsl(60_100%_50%)]/50",
];

export function CategoryGrid({ categories }: CategoryGridProps) {
  return (
    <section className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
      <div className="mb-8 text-center">
        <h2 className="font-heading text-sm neon-text-cyan text-accent sm:text-base">
          SHOP BY CATEGORY
        </h2>
        <p className="mt-2 text-sm text-muted-foreground">
          Find your retro fix in the perfect aisle
        </p>
      </div>

      <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
        {categories.map((category, idx) => (
          <Link
            key={category.id}
            href={`/products?category=${category.slug}`}
            className={`group relative flex flex-col items-center justify-center overflow-hidden rounded-md border border-border bg-gradient-to-b p-6 text-center transition-all ${
              categoryColors[idx % categoryColors.length]
            }`}
          >
            {category.image_url && (
              <div className="relative mb-4 size-16 overflow-hidden rounded-md sm:size-20">
                <Image
                  src={category.image_url}
                  alt={category.name}
                  fill
                  className="object-cover transition-transform duration-300 group-hover:scale-110"
                  sizes="80px"
                />
              </div>
            )}

            <h3 className="font-heading text-[10px] text-foreground transition-colors group-hover:text-primary sm:text-xs">
              {category.name.toUpperCase()}
            </h3>

            {category.description && (
              <p className="mt-1.5 text-[10px] text-muted-foreground line-clamp-2 sm:text-xs">
                {category.description}
              </p>
            )}
          </Link>
        ))}
      </div>
    </section>
  );
}
