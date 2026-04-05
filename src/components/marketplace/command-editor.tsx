"use client";

import { useActionState, useState } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Terminal, Plus, Edit, Trash2, Save, X, Loader2 } from "lucide-react";
import { DeleteConfirmDialog } from "./delete-confirm-dialog";
import type { PluginCommand } from "@/types";
import type { ActionResult } from "@/app/(storefront)/account/marketplaces/actions";
import {
  createCommandAction,
  updateCommandAction,
  deleteCommandAction,
} from "@/app/(storefront)/account/marketplaces/actions";

interface CommandEditorProps {
  commands: PluginCommand[];
  pluginId: string;
  marketplaceId: string;
}

function CommandForm({
  action,
  pluginId,
  marketplaceId,
  command,
  onCancel,
}: {
  action: (formData: FormData) => Promise<ActionResult>;
  pluginId: string;
  marketplaceId: string;
  command?: PluginCommand;
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
      {command && <input type="hidden" name="id" value={command.id} />}

      {state.error && (
        <div className="rounded-md border border-destructive/30 bg-destructive/10 px-4 py-3 text-sm text-destructive">
          {state.error}
        </div>
      )}

      <div className="space-y-2">
        <Label className="text-sm text-foreground">
          Command Name (kebab-case)
        </Label>
        <Input
          name="name"
          className="bg-secondary font-mono text-sm"
          defaultValue={command?.name ?? ""}
          placeholder="my-command"
          required
        />
      </div>

      <div className="space-y-2">
        <Label className="text-sm text-foreground">Content (Markdown)</Label>
        <Textarea
          name="content"
          className="min-h-[200px] bg-secondary font-mono text-sm"
          defaultValue={command?.content ?? ""}
          placeholder="Command content in markdown..."
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
              {command ? "Update" : "Add"} Command
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

export function CommandEditor({
  commands,
  pluginId,
  marketplaceId,
}: CommandEditorProps) {
  const [showForm, setShowForm] = useState(false);
  const [editingCommand, setEditingCommand] = useState<
    PluginCommand | undefined
  >();

  const handleEdit = (command: PluginCommand) => {
    setEditingCommand(command);
    setShowForm(true);
  };

  const handleAdd = () => {
    setEditingCommand(undefined);
    setShowForm(true);
  };

  const handleCancel = () => {
    setShowForm(false);
    setEditingCommand(undefined);
  };

  const handleDelete = (commandId: string) => {
    const formData = new FormData();
    formData.set("id", commandId);
    formData.set("plugin_id", pluginId);
    formData.set("marketplace_id", marketplaceId);
    deleteCommandAction(formData);
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="font-heading text-xs text-primary">
          COMMANDS ({commands.length})
        </h3>
        {!showForm && (
          <Button variant="outline" size="sm" onClick={handleAdd}>
            <Plus className="mr-1 size-3" />
            Add Command
          </Button>
        )}
      </div>

      {showForm && (
        <CommandForm
          action={editingCommand ? updateCommandAction : createCommandAction}
          pluginId={pluginId}
          marketplaceId={marketplaceId}
          command={editingCommand}
          onCancel={handleCancel}
        />
      )}

      {!showForm && commands.length === 0 ? (
        <div className="rounded-md border border-dashed border-border bg-card/50 p-8 text-center">
          <Terminal className="mx-auto size-8 text-muted-foreground" />
          <p className="mt-2 text-sm text-muted-foreground">
            No commands yet.
          </p>
          <Button
            variant="outline"
            size="sm"
            className="mt-3"
            onClick={handleAdd}
          >
            <Plus className="mr-1 size-3" />
            Add Command
          </Button>
        </div>
      ) : !showForm ? (
        <div className="space-y-2">
          {commands.map((command) => (
            <div
              key={command.id}
              className="flex items-center justify-between rounded-md border border-border bg-card p-3"
            >
              <div className="flex items-center gap-3">
                <Terminal className="size-4 text-accent" />
                <p className="font-mono text-sm text-foreground">
                  {command.name}
                </p>
              </div>
              <div className="flex items-center gap-1">
                <Button
                  variant="ghost"
                  size="icon-sm"
                  onClick={() => handleEdit(command)}
                >
                  <Edit className="size-3" />
                </Button>
                <DeleteConfirmDialog
                  title="Delete Command"
                  description={`Are you sure you want to delete "${command.name}"?`}
                  onConfirm={() => handleDelete(command.id)}
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
