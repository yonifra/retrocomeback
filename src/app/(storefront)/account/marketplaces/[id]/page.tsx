import { notFound } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { getMarketplaceById } from "@/lib/queries/marketplaces";
import { Breadcrumbs } from "@/components/shared/breadcrumbs";
import { MarketplaceEditorTabs } from "./editor-tabs";

export default async function MarketplaceEditorPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return null;

  const marketplace = await getMarketplaceById(id);

  if (!marketplace || marketplace.user_id !== user.id) {
    notFound();
  }

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      <Breadcrumbs
        items={[
          { label: "Account", href: "/account" },
          { label: "Marketplaces", href: "/account/marketplaces" },
          { label: marketplace.display_name },
        ]}
      />

      <div className="mt-4">
        <h1 className="font-heading text-lg neon-text text-primary sm:text-xl">
          {marketplace.display_name.toUpperCase()}
        </h1>
        <p className="mt-1 font-mono text-sm text-muted-foreground">
          {marketplace.name} &middot; v{marketplace.version}
        </p>
      </div>

      <div className="mt-6">
        <MarketplaceEditorTabs marketplace={marketplace} />
      </div>
    </div>
  );
}
