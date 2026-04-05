import { notFound } from "next/navigation";
import { getSessionUser } from "@/lib/firebase/session";
import { getPluginById, getMarketplaceById } from "@/lib/queries/marketplaces";
import { Breadcrumbs } from "@/components/shared/breadcrumbs";
import { PluginEditorTabs } from "./plugin-editor-tabs";

export default async function PluginEditorPage({
  params,
}: {
  params: Promise<{ id: string; pluginId: string }>;
}) {
  const { id, pluginId } = await params;

  const user = await getSessionUser();

  if (!user) return null;

  const marketplace = await getMarketplaceById(id);
  if (!marketplace || marketplace.user_id !== user.uid) {
    notFound();
  }

  const plugin = await getPluginById(pluginId);
  if (!plugin) {
    notFound();
  }

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      <Breadcrumbs
        items={[
          { label: "Account", href: "/account" },
          { label: "Marketplaces", href: "/account/marketplaces" },
          {
            label: marketplace.display_name,
            href: `/account/marketplaces/${id}`,
          },
          { label: plugin.name },
        ]}
      />

      <div className="mt-4">
        <h1 className="font-heading text-lg neon-text text-primary sm:text-xl">
          {plugin.name.toUpperCase()}
        </h1>
        <p className="mt-1 font-mono text-sm text-muted-foreground">
          v{plugin.version}
          {plugin.author_name && ` · ${plugin.author_name}`}
        </p>
      </div>

      <div className="mt-6">
        <PluginEditorTabs
          plugin={plugin}
          marketplaceId={id}
        />
      </div>
    </div>
  );
}
