"use client";

import { useActionState, useState } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Bot, Plus, Edit, Trash2, Save, X, Loader2 } from "lucide-react";
import { DeleteConfirmDialog } from "./delete-confirm-dialog";
import type { PluginAgent } from "@/types";
import type { ActionResult } from "@/app/(storefront)/account/marketplaces/actions";
import {
  createAgentAction,
  updateAgentAction,
  deleteAgentAction,
} from "@/app/(storefront)/account/marketplaces/actions";

interface AgentEditorProps {
  agents: PluginAgent[];
  pluginId: string;
  marketplaceId: string;
}

function AgentForm({
  action,
  pluginId,
  marketplaceId,
  agent,
  onCancel,
}: {
  action: (formData: FormData) => Promise<ActionResult>;
  pluginId: string;
  marketplaceId: string;
  agent?: PluginAgent;
  onCancel: () => void;
}) {
  const [state, formAction, isPending] = useActionState<ActionResult, FormData>(
    async (_prev, formData) => action(formData),
    {}
  );

  return (
    <form
      action={formAction}
      className="space-y-4 rounded-md border border-border bg-card p-4"
    >
      <input type="hidden" name="plugin_id" value={pluginId} />
      <input type="hidden" name="marketplace_id" value={marketplaceId} />
      {agent && <input type="hidden" name="id" value={agent.id} />}

      {state.error && (
        <div className="rounded-md border border-destructive/30 bg-destructive/10 px-4 py-3 text-sm text-destructive">
          {state.error}
        </div>
      )}

      <div className="grid gap-4 md:grid-cols-2">
        <div className="space-y-2">
          <Label className="text-sm text-foreground">
            Agent Name (kebab-case)
          </Label>
          <Input
            name="name"
            className="bg-secondary font-mono text-sm"
            defaultValue={agent?.name ?? ""}
            placeholder="my-agent"
            required
          />
        </div>
        <div className="space-y-2">
          <Label className="text-sm text-foreground">Description</Label>
          <Input
            name="description"
            className="bg-secondary text-sm"
            defaultValue={agent?.description ?? ""}
            placeholder="Agent description..."
            required
          />
        </div>
      </div>

      <div className="space-y-2">
        <Label className="text-sm text-foreground">Content (Markdown)</Label>
        <Textarea
          name="content"
          className="min-h-[200px] bg-secondary font-mono text-sm"
          defaultValue={agent?.content ?? ""}
          placeholder="Agent instructions in markdown..."
          required
        />
      </div>

      <div className="flex gap-2">
        <Button
          type="submit"
          disabled={isPending}
          className="font-heading text-xs transition-shadow hover:neon-glow"
        >
          {isPending ? (
            <>
              <Loader2 className="mr-2 size-4 animate-spin" />
              Saving...
            </>
          ) : (
            <>
              <Save className="mr-2 size-4" />
              {agent ? "Update" : "Add"} Agent
            </>
          )}
        </Button>
        <Button type="button" variant="outline" onClick={onCancel}>
          <X className="mr-2 size-4" />
          Cancel
        </Button>
      </div>
    </form>
  );
}

export function AgentEditor({
  agents,
  pluginId,
  marketplaceId,
}: AgentEditorProps) {
  const [showForm, setShowForm] = useState(false);
  const [editingAgent, setEditingAgent] = useState<PluginAgent | undefined>();

  const handleEdit = (agent: PluginAgent) => {
    setEditingAgent(agent);
    setShowForm(true);
  };

  const handleAdd = () => {
    setEditingAgent(undefined);
    setShowForm(true);
  };

  const handleCancel = () => {
    setShowForm(false);
    setEditingAgent(undefined);
  };

  const handleDelete = (agentId: string) => {
    const formData = new FormData();
    formData.set("id", agentId);
    formData.set("plugin_id", pluginId);
    formData.set("marketplace_id", marketplaceId);
    deleteAgentAction(formData);
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="font-heading text-xs text-primary">
          AGENTS ({agents.length})
        </h3>
        {!showForm && (
          <Button variant="outline" size="sm" onClick={handleAdd}>
            <Plus className="mr-1 size-3" />
            Add Agent
          </Button>
        )}
      </div>

      {showForm && (
        <AgentForm
          action={editingAgent ? updateAgentAction : createAgentAction}
          pluginId={pluginId}
          marketplaceId={marketplaceId}
          agent={editingAgent}
          onCancel={handleCancel}
        />
      )}

      {!showForm && agents.length === 0 ? (
        <div className="rounded-md border border-dashed border-border bg-card/50 p-8 text-center">
          <Bot className="mx-auto size-8 text-muted-foreground" />
          <p className="mt-2 text-sm text-muted-foreground">No agents yet.</p>
          <Button
            variant="outline"
            size="sm"
            className="mt-3"
            onClick={handleAdd}
          >
            <Plus className="mr-1 size-3" />
            Add Agent
          </Button>
        </div>
      ) : !showForm ? (
        <div className="space-y-2">
          {agents.map((agent) => (
            <div
              key={agent.id}
              className="flex items-center justify-between rounded-md border border-border bg-card p-3"
            >
              <div className="flex items-center gap-3">
                <Bot className="size-4 text-accent" />
                <div>
                  <p className="font-mono text-sm text-foreground">
                    {agent.name}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {agent.description}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-1">
                <Button
                  variant="ghost"
                  size="icon-sm"
                  onClick={() => handleEdit(agent)}
                >
                  <Edit className="size-3" />
                </Button>
                <DeleteConfirmDialog
                  title="Delete Agent"
                  description={`Are you sure you want to delete "${agent.name}"?`}
                  onConfirm={() => handleDelete(agent.id)}
                  trigger={
                    <Button variant="ghost" size="icon-sm">
                      <Trash2 className="size-3 text-destructive" />
                    </Button>
                  }
                />
              </div>
            </div>
          ))}
        </div>
      ) : null}
    </div>
  );
}
