import Link from "next/link";
import { getSessionUser } from "@/lib/firebase/session";
import { getUserMarketplaces } from "@/lib/queries/marketplaces";
import { Breadcrumbs } from "@/components/shared/breadcrumbs";
import { MarketplaceCard } from "@/components/marketplace/marketplace-card";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";

export default async function MarketplacesPage() {
  const user = await getSessionUser();

  if (!user) return null;

  const marketplaces = await getUserMarketplaces(user.uid);

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      <Breadcrumbs
        items={[
          { label: "Account", href: "/account" },
          { label: "Marketplaces" },
        ]}
      />

      <div className="mt-4 flex items-center justify-between">
        <div>
          <h1 className="font-heading text-lg neon-text text-primary sm:text-xl">
            MY MARKETPLACES
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Create and manage your AI plugin marketplaces
          </p>
        </div>
        <Button asChild className="font-heading text-xs transition-shadow hover:neon-glow">
          <Link href="/account/marketplaces/new">
            <Plus className="mr-2 size-4" />
            New Marketplace
          </Link>
        </Button>
      </div>

      {marketplaces.length === 0 ? (
        <div className="mt-12 rounded-md border border-dashed border-border bg-card/50 p-12 text-center">
          <p className="text-sm text-muted-foreground">
            You haven&apos;t created any marketplaces yet.
          </p>
          <Button
            asChild
            variant="outline"
            className="mt-4"
          >
            <Link href="/account/marketplaces/new">
              <Plus className="mr-2 size-4" />
              Create your first marketplace
            </Link>
          </Button>
        </div>
      ) : (
        <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {marketplaces.map((marketplace) => (
            <MarketplaceCard key={marketplace.id} marketplace={marketplace} />
          ))}
        </div>
      )}
    </div>
  );
}
