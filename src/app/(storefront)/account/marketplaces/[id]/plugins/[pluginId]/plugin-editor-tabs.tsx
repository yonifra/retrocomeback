"use client";

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { PluginForm } from "@/components/marketplace/plugin-form";
import { SkillList } from "@/components/marketplace/skill-list";
import { AgentEditor } from "@/components/marketplace/agent-editor";
import { CommandEditor } from "@/components/marketplace/command-editor";
import { DeleteConfirmDialog } from "@/components/marketplace/delete-confirm-dialog";
import {
  updatePluginAction,
  deletePluginAction,
} from "@/app/(storefront)/account/marketplaces/actions";
import type { PluginWithDetails } from "@/types";

interface PluginEditorTabsProps {
  plugin: PluginWithDetails;
  marketplaceId: string;
}

export function PluginEditorTabs({
  plugin,
  marketplaceId,
}: PluginEditorTabsProps) {
  const handleDelete = () => {
    const formData = new FormData();
    formData.set("id", plugin.id);
    formData.set("marketplace_id", marketplaceId);
    deletePluginAction(formData);
  };

  return (
    <Tabs defaultValue="skills">
      <TabsList className="w-full justify-start">
        <TabsTrigger value="skills">
          Skills ({plugin.skills.length})
        </TabsTrigger>
        <TabsTrigger value="agents">
          Agents ({plugin.agents.length})
        </TabsTrigger>
        <TabsTrigger value="commands">
          Commands ({plugin.commands.length})
        </TabsTrigger>
        <TabsTrigger value="metadata">Metadata</TabsTrigger>
      </TabsList>

      {/* Skills Tab */}
      <TabsContent value="skills" className="mt-6">
        <SkillList
          skills={plugin.skills}
          pluginId={plugin.id}
          marketplaceId={marketplaceId}
        />
      </TabsContent>

      {/* Agents Tab */}
      <TabsContent value="agents" className="mt-6">
        <AgentEditor
          agents={plugin.agents}
          pluginId={plugin.id}
          marketplaceId={marketplaceId}
        />
      </TabsContent>

      {/* Commands Tab */}
      <TabsContent value="commands" className="mt-6">
        <CommandEditor
          commands={plugin.commands}
          pluginId={plugin.id}
          marketplaceId={marketplaceId}
        />
      </TabsContent>

      {/* Metadata Tab */}
      <TabsContent value="metadata" className="mt-6 space-y-6">
        <div className="rounded-lg border border-border bg-card p-6">
          <PluginForm
            action={updatePluginAction}
            marketplaceId={marketplaceId}
            plugin={plugin}
            submitLabel="Save Changes"
          />
        </div>

        {/* Danger Zone */}
        <div className="rounded-md border border-destructive/30 bg-destructive/5 p-4">
          <h3 className="font-heading text-xs text-destructive">DANGER ZONE</h3>
          <p className="mt-1 text-sm text-muted-foreground">
            Deleting this plugin will permanently remove all its skills, agents,
            and commands.
          </p>
          <div className="mt-3">
            <DeleteConfirmDialog
              title="Delete Plugin"
              description={`Are you sure you want to delete "${plugin.name}"? This action cannot be undone.`}
              onConfirm={handleDelete}
            />
          </div>
        </div>
      </TabsContent>
    </Tabs>
  );
}
