"use client";

import { useEffect, useState } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

interface KebabCaseInputProps {
  displayName: string;
  value: string;
  onChange: (value: string) => void;
  error?: string;
}

function toKebabCase(str: string): string {
  return str
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .replace(/-{2,}/g, "-");
}

export function KebabCaseInput({
  displayName,
  value,
  onChange,
  error,
}: KebabCaseInputProps) {
  const [autoGenerate, setAutoGenerate] = useState(true);

  useEffect(() => {
    if (autoGenerate && displayName) {
      onChange(toKebabCase(displayName));
    }
  }, [displayName, autoGenerate, onChange]);

  return (
    <div className="space-y-2">
      <Label className="text-sm text-foreground">Name (slug)</Label>
      <Input
        className="bg-secondary font-mono text-sm"
        value={value}
        onChange={(e) => {
          setAutoGenerate(false);
          onChange(e.target.value);
        }}
        placeholder="my-marketplace"
      />
      {!autoGenerate && displayName && (
        <button
          type="button"
          className="text-xs text-muted-foreground hover:text-accent"
          onClick={() => {
            setAutoGenerate(true);
            onChange(toKebabCase(displayName));
          }}
        >
          Auto-generate from display name
        </button>
      )}
      {error && <p className="text-xs text-destructive">{error}</p>}
    </div>
  );
}
