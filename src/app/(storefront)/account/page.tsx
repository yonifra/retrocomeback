import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { getUserMarketplaces } from "@/lib/queries/marketplaces";
import { Breadcrumbs } from "@/components/shared/breadcrumbs";
import { Package, Puzzle, ArrowRight, Plus } from "lucide-react";

export default async function AccountPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return null;

  const marketplaces = await getUserMarketplaces(user.id);
  const totalPlugins = marketplaces.reduce(
    (sum, m) => sum + m.plugin_count,
    0
  );

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      <Breadcrumbs items={[{ label: "Account" }]} />

      <div className="mt-4">
        <h1 className="font-heading text-lg neon-text text-primary sm:text-xl">
          MY ACCOUNT
        </h1>
        <p className="mt-1 text-sm text-muted-foreground">
          {user.email}
        </p>
      </div>

      {/* Stats */}
      <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <div className="rounded-md border border-border bg-card p-6">
          <div className="flex items-center gap-3">
            <Package className="size-8 text-primary" />
            <div>
              <p className="font-heading text-lg text-foreground">
                {marketplaces.length}
              </p>
              <p className="text-sm text-muted-foreground">Marketplaces</p>
            </div>
          </div>
        </div>

        <div className="rounded-md border border-border bg-card p-6">
          <div className="flex items-center gap-3">
            <Puzzle className="size-8 text-accent" />
            <div>
              <p className="font-heading text-lg text-foreground">
                {totalPlugins}
              </p>
              <p className="text-sm text-muted-foreground">Total Plugins</p>
            </div>
          </div>
        </div>
      </div>

      {/* Quick Links */}
      <div className="mt-8">
        <h2 className="font-heading text-sm text-primary neon-text">
          QUICK LINKS
        </h2>
        <div className="mt-4 grid gap-3 sm:grid-cols-2">
          <Link
            href="/account/marketplaces"
            className="group flex items-center justify-between rounded-md border border-border bg-card p-4 transition-all hover:border-primary/50 hover:shadow-[0_0_15px_hsl(300_100%_50%/0.1)]"
          >
            <div className="flex items-center gap-3">
              <Package className="size-5 text-primary" />
              <div>
                <p className="text-sm font-medium text-foreground">
                  My Marketplaces
                </p>
                <p className="text-xs text-muted-foreground">
                  Create and manage plugin marketplaces
                </p>
              </div>
            </div>
            <ArrowRight className="size-4 text-muted-foreground transition-colors group-hover:text-primary" />
          </Link>

          <Link
            href="/account/marketplaces/new"
            className="group flex items-center justify-between rounded-md border border-border bg-card p-4 transition-all hover:border-accent/50 hover:shadow-[0_0_15px_hsl(180_100%_50%/0.1)]"
          >
            <div className="flex items-center gap-3">
              <Package className="size-5 text-accent" />
              <div>
                <p className="text-sm font-medium text-foreground">
                  New Marketplace
                </p>
                <p className="text-xs text-muted-foreground">
                  Create a new plugin marketplace
                </p>
              </div>
            </div>
            <ArrowRight className="size-4 text-muted-foreground transition-colors group-hover:text-accent" />
          </Link>

          <Link
            href="/account/add-product"
            className="group flex items-center justify-between rounded-md border border-border bg-card p-4 transition-all hover:border-primary/50 hover:shadow-[0_0_15px_hsl(300_100%_50%/0.1)]"
          >
            <div className="flex items-center gap-3">
              <Plus className="size-5 text-primary" />
              <div>
                <p className="text-sm font-medium text-foreground">
                  Add Affiliate Product
                </p>
                <p className="text-xs text-muted-foreground">
                  Import a product from AliExpress or Amazon
                </p>
              </div>
            </div>
            <ArrowRight className="size-4 text-muted-foreground transition-colors group-hover:text-primary" />
          </Link>
        </div>
      </div>
    </div>
  );
}
