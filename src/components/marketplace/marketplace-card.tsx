import Link from "next/link";
import { Package, Globe, Lock } from "lucide-react";
import type { Marketplace } from "@/types";

interface MarketplaceCardProps {
  marketplace: Marketplace & { plugin_count: number };
}

export function MarketplaceCard({ marketplace }: MarketplaceCardProps) {
  return (
    <Link href={`/account/marketplaces/${marketplace.id}`}>
      <div className="group relative flex flex-col gap-3 rounded-md border border-border bg-card p-4 transition-all hover:border-primary/50 hover:shadow-[0_0_15px_hsl(300_100%_50%/0.1)]">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-2">
            <Package className="size-5 text-primary" />
            <h3 className="font-heading text-xs text-foreground">
              {marketplace.display_name}
            </h3>
          </div>
          {marketplace.is_published ? (
            <span className="flex items-center gap-1 text-xs text-accent">
              <Globe className="size-3" />
              Public
            </span>
          ) : (
            <span className="flex items-center gap-1 text-xs text-muted-foreground">
              <Lock className="size-3" />
              Private
            </span>
          )}
        </div>

        <p className="line-clamp-2 text-sm text-muted-foreground">
          {marketplace.description || "No description"}
        </p>

        <div className="flex items-center justify-between text-xs text-muted-foreground">
          <span className="font-mono">{marketplace.name}</span>
          <span>
            {marketplace.plugin_count}{" "}
            {marketplace.plugin_count === 1 ? "plugin" : "plugins"}
          </span>
        </div>

        <div className="text-xs text-muted-foreground">
          v{marketplace.version}
        </div>
      </div>
    </Link>
  );
}
