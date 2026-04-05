import { Breadcrumbs } from "@/components/shared/breadcrumbs";
import { MarketplaceForm } from "@/components/marketplace/marketplace-form";
import { createMarketplaceAction } from "../actions";

export default function NewMarketplacePage() {
  return (
    <div className="mx-auto max-w-2xl px-4 py-8 sm:px-6 lg:px-8">
      <Breadcrumbs
        items={[
          { label: "Account", href: "/account" },
          { label: "Marketplaces", href: "/account/marketplaces" },
          { label: "New" },
        ]}
      />

      <div className="mt-4">
        <h1 className="font-heading text-lg neon-text text-primary sm:text-xl">
          CREATE MARKETPLACE
        </h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Set up a new AI plugin marketplace for Claude Code
        </p>
      </div>

      <div className="mt-6 rounded-lg border border-border bg-card p-6">
        <MarketplaceForm
          action={createMarketplaceAction}
          submitLabel="Create Marketplace"
        />
      </div>
    </div>
  );
}
