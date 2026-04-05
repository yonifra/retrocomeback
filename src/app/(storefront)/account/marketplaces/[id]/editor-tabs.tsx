"use client";

import { useActionState } from "react";
import Link from "next/link";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { MarketplaceForm } from "@/components/marketplace/marketplace-form";
import { PluginCard } from "@/components/marketplace/plugin-card";
import { ExportPanel } from "@/components/marketplace/export-panel";
import { DeleteConfirmDialog } from "@/components/marketplace/delete-confirm-dialog";
import {
  updateMarketplaceAction,
  deleteMarketplaceAction,
  togglePublishAction,
} from "@/app/(storefront)/account/marketplaces/actions";
import type { ActionResult } from "@/app/(storefront)/account/marketplaces/actions";
import type { MarketplaceWithPlugins } from "@/types";
import { Plus, Globe, Lock, Loader2 } from "lucide-react";

interface MarketplaceEditorTabsProps {
  marketplace: MarketplaceWithPlugins;
}

export function MarketplaceEditorTabs({
  marketplace,
}: MarketplaceEditorTabsProps) {
  const [publishState, publishAction, isPublishing] = useActionState<
    ActionResult,
    FormData
  >(async (_prev, formData) => togglePublishAction(formData), {});

  const handleDelete = () => {
    const formData = new FormData();
    formData.set("id", marketplace.id);
    deleteMarketplaceAction(formData);
  };

  return (
    <Tabs defaultValue="settings">
      <TabsList className="w-full justify-start">
        <TabsTrigger value="settings">Settings</TabsTrigger>
        <TabsTrigger value="plugins">
          Plugins ({marketplace.plugins.length})
        </TabsTrigger>
        <TabsTrigger value="export">Export</TabsTrigger>
      </TabsList>

      {/* Settings Tab */}
      <TabsContent value="settings" className="mt-6 space-y-6">
        {/* Publish Toggle */}
        <div className="flex items-center justify-between rounded-md border border-border bg-card p-4">
          <div className="flex items-center gap-3">
            {marketplace.is_published ? (
              <>
                <Globe className="size-5 text-accent" />
                <div>
                  <p className="text-sm font-medium text-foreground">
                    Published
                  </p>
                  <p className="text-xs text-muted-foreground">
                    This marketplace is visible to other users
                  </p>
                </div>
              </>
            ) : (
              <>
                <Lock className="size-5 text-muted-foreground" />
                <div>
                  <p className="text-sm font-medium text-foreground">Private</p>
                  <p className="text-xs text-muted-foreground">
                    Only you can see this marketplace
                  </p>
                </div>
              </>
            )}
          </div>
          <form action={publishAction}>
            <input type="hidden" name="id" value={marketplace.id} />
            <input
              type="hidden"
              name="publish"
              value={marketplace.is_published ? "false" : "true"}
            />
            <Button
              type="submit"
              variant="outline"
              size="sm"
              disabled={isPublishing}
            >
              {isPublishing ? (
                <Loader2 className="mr-1 size-3 animate-spin" />
              ) : null}
              {marketplace.is_published ? "Unpublish" : "Publish"}
            </Button>
          </form>
        </div>

        {publishState.error && (
          <div className="rounded-md border border-destructive/30 bg-destructive/10 px-4 py-3 text-sm text-destructive">
            {publishState.error}
          </div>
        )}

        {/* Marketplace Form */}
        <div className="rounded-lg border border-border bg-card p-6">
          <MarketplaceForm
            action={updateMarketplaceAction}
            marketplace={marketplace}
            submitLabel="Save Changes"
          />
        </div>

        {/* Danger Zone */}
        <div className="rounded-md border border-destructive/30 bg-destructive/5 p-4">
          <h3 className="font-heading text-xs text-destructive">DANGER ZONE</h3>
          <p className="mt-1 text-sm text-muted-foreground">
            Deleting a marketplace will permanently remove all its plugins,
            skills, agents, and commands.
          </p>
          <div className="mt-3">
            <DeleteConfirmDialog
              title="Delete Marketplace"
              description={`Are you sure you want to delete "${marketplace.display_name}"? This action cannot be undone.`}
              onConfirm={handleDelete}
            />
          </div>
        </div>
      </TabsContent>

      {/* Plugins Tab */}
      <TabsContent value="plugins" className="mt-6 space-y-4">
        <div className="flex items-center justify-between">
          <p className="text-sm text-muted-foreground">
            {marketplace.plugins.length}{" "}
            {marketplace.plugins.length === 1 ? "plugin" : "plugins"}
          </p>
          <Button
            asChild
            variant="outline"
            size="sm"
          >
            <Link href={`/account/marketplaces/${marketplace.id}/plugins/new`}>
              <Plus className="mr-1 size-3" />
              Add Plugin
            </Link>
          </Button>
        </div>

        {marketplace.plugins.length === 0 ? (
          <div className="rounded-md border border-dashed border-border bg-card/50 p-12 text-center">
            <p className="text-sm text-muted-foreground">
              No plugins yet. Add your first plugin to get started.
            </p>
            <Button asChild variant="outline" className="mt-4">
              <Link
                href={`/account/marketplaces/${marketplace.id}/plugins/new`}
              >
                <Plus className="mr-2 size-4" />
                Add Plugin
              </Link>
            </Button>
          </div>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2">
            {marketplace.plugins.map((plugin) => (
              <PluginCard
                key={plugin.id}
                plugin={plugin}
                marketplaceId={marketplace.id}
              />
            ))}
          </div>
        )}
      </TabsContent>

      {/* Export Tab */}
      <TabsContent value="export" className="mt-6">
        <ExportPanel marketplace={marketplace} />
      </TabsContent>
    </Tabs>
  );
}
