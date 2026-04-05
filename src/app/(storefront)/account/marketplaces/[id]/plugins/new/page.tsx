import { Breadcrumbs } from "@/components/shared/breadcrumbs";
import { PluginForm } from "@/components/marketplace/plugin-form";
import { createPluginAction } from "@/app/(storefront)/account/marketplaces/actions";

export default async function NewPluginPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  return (
    <div className="mx-auto max-w-2xl px-4 py-8 sm:px-6 lg:px-8">
      <Breadcrumbs
        items={[
          { label: "Account", href: "/account" },
          { label: "Marketplaces", href: "/account/marketplaces" },
          { label: "Marketplace", href: `/account/marketplaces/${id}` },
          { label: "New Plugin" },
        ]}
      />

      <div className="mt-4">
        <h1 className="font-heading text-lg neon-text text-primary sm:text-xl">
          CREATE PLUGIN
        </h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Add a new plugin to your marketplace
        </p>
      </div>

      <div className="mt-6 rounded-lg border border-border bg-card p-6">
        <PluginForm
          action={createPluginAction}
          marketplaceId={id}
          submitLabel="Create Plugin"
        />
      </div>
    </div>
  );
}
