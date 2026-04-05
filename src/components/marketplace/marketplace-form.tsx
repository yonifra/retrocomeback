"use client";

import { useActionState, useState } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { KebabCaseInput } from "./kebab-case-input";
import { Loader2 } from "lucide-react";
import type { Marketplace } from "@/types";
import type { ActionResult } from "@/app/(storefront)/account/marketplaces/actions";

interface MarketplaceFormProps {
  action: (formData: FormData) => Promise<ActionResult>;
  marketplace?: Marketplace;
  submitLabel?: string;
}

export function MarketplaceForm({
  action,
  marketplace,
  submitLabel = "Create Marketplace",
}: MarketplaceFormProps) {
  const [state, formAction, isPending] = useActionState<ActionResult, FormData>(
    async (_prev, formData) => action(formData),
    {}
  );
  const [displayName, setDisplayName] = useState(
    marketplace?.display_name ?? ""
  );
  const [name, setName] = useState(marketplace?.name ?? "");

  return (
    <form action={formAction} className="space-y-4">
      {marketplace && <input type="hidden" name="id" value={marketplace.id} />}

      {state.error && (
        <div className="rounded-md border border-destructive/30 bg-destructive/10 px-4 py-3 text-sm text-destructive">
          {state.error}
        </div>
      )}

      <div className="space-y-2">
        <Label className="text-sm text-foreground">Display Name</Label>
        <Input
          name="display_name"
          className="bg-secondary"
          value={displayName}
          onChange={(e) => setDisplayName(e.target.value)}
          placeholder="My Dev Tools"
          required
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
          defaultValue={marketplace?.description ?? ""}
          placeholder="A collection of useful development plugins..."
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
            defaultValue={marketplace?.version ?? "1.0.0"}
            placeholder="1.0.0"
            required
          />
        </div>
        <div className="space-y-2">
          <Label className="text-sm text-foreground">Owner Email</Label>
          <Input
            name="owner_email"
            type="email"
            className="bg-secondary"
            defaultValue={marketplace?.owner_email ?? ""}
            placeholder="you@example.com"
          />
        </div>
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
