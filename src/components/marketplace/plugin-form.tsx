"use client";

import { useActionState, useState } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { KebabCaseInput } from "./kebab-case-input";
import { Loader2 } from "lucide-react";
import type { MarketplacePlugin } from "@/types";
import type { ActionResult } from "@/app/(storefront)/account/marketplaces/actions";

interface PluginFormProps {
  action: (formData: FormData) => Promise<ActionResult>;
  marketplaceId: string;
  plugin?: MarketplacePlugin;
  submitLabel?: string;
}

export function PluginForm({
  action,
  marketplaceId,
  plugin,
  submitLabel = "Create Plugin",
}: PluginFormProps) {
  const [state, formAction, isPending] = useActionState<ActionResult, FormData>(
    async (_prev, formData) => action(formData),
    {}
  );
  const [displayName, setDisplayName] = useState(plugin?.name ?? "");
  const [name, setName] = useState(plugin?.name ?? "");

  return (
    <form action={formAction} className="space-y-4">
      <input type="hidden" name="marketplace_id" value={marketplaceId} />
      {plugin && <input type="hidden" name="id" value={plugin.id} />}

      {state.error && (
        <div className="rounded-md border border-destructive/30 bg-destructive/10 px-4 py-3 text-sm text-destructive">
          {state.error}
        </div>
      )}

      <div className="space-y-2">
        <Label className="text-sm text-foreground">Plugin Name</Label>
        <Input
          className="bg-secondary"
          value={displayName}
          onChange={(e) => setDisplayName(e.target.value)}
          placeholder="Code Reviewer"
        />
      </div>

      <KebabCaseInput
        displayName={displayName}
        value={name}
        onChange={setName}
      />
      <input type="hidden" name="name" value={name} />

      <div className="space-y-2">
        <Label className="text-sm text-foreground">Description</Label>
        <Textarea
          name="description"
          className="bg-secondary"
          defaultValue={plugin?.description ?? ""}
          placeholder="A plugin that reviews code..."
          required
          rows={3}
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label className="text-sm text-foreground">Version</Label>
          <Input
            name="version"
            className="bg-secondary font-mono"
            defaultValue={plugin?.version ?? "1.0.0"}
            placeholder="1.0.0"
            required
          />
        </div>
        <div className="space-y-2">
          <Label className="text-sm text-foreground">Author Name</Label>
          <Input
            name="author_name"
            className="bg-secondary"
            defaultValue={plugin?.author_name ?? ""}
            placeholder="Your Name"
            required
          />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label className="text-sm text-foreground">Author Email</Label>
          <Input
            name="author_email"
            type="email"
            className="bg-secondary"
            defaultValue={plugin?.author_email ?? ""}
            placeholder="author@example.com"
          />
        </div>
        <div className="space-y-2">
          <Label className="text-sm text-foreground">Homepage</Label>
          <Input
            name="homepage"
            className="bg-secondary"
            defaultValue={plugin?.homepage ?? ""}
            placeholder="https://github.com/..."
          />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label className="text-sm text-foreground">Category</Label>
          <Input
            name="category"
            className="bg-secondary"
            defaultValue={plugin?.category ?? ""}
            placeholder="development"
          />
        </div>
        <div className="space-y-2">
          <Label className="text-sm text-foreground">
            Tags (comma-separated)
          </Label>
          <Input
            name="tags"
            className="bg-secondary"
            defaultValue={plugin?.tags?.join(", ") ?? ""}
            placeholder="code-review, ai, productivity"
          />
        </div>
      </div>

      <div className="space-y-2">
        <Label className="text-sm text-foreground">
          Keywords (comma-separated)
        </Label>
        <Input
          name="keywords"
          className="bg-secondary"
          defaultValue={plugin?.keywords?.join(", ") ?? ""}
          placeholder="review, lint, quality"
        />
      </div>

      <Button
        type="submit"
        disabled={isPending}
        className="w-full font-heading text-xs transition-shadow hover:neon-glow"
      >
        {isPending ? (
          <>
            <Loader2 className="mr-2 size-4 animate-spin" />
            Saving...
          </>
        ) : (
          submitLabel
        )}
      </Button>
    </form>
  );
}
