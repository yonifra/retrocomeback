"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Download,
  Copy,
  Check,
  ChevronDown,
  ChevronRight,
  Folder,
  FileText,
  Terminal,
} from "lucide-react";
import { toast } from "sonner";
import type { MarketplaceWithPlugins } from "@/types";
import {
  exportMarketplaceAsZip,
  downloadBlob,
  getFileTree,
  getMarketplaceJsonPreview,
} from "@/lib/export/marketplace-export";

interface ExportPanelProps {
  marketplace: MarketplaceWithPlugins;
}

export function ExportPanel({ marketplace }: ExportPanelProps) {
  const [isExporting, setIsExporting] = useState(false);
  const [copied, setCopied] = useState(false);
  const [showJson, setShowJson] = useState(false);

  const fileTree = getFileTree(marketplace);
  const jsonPreview = getMarketplaceJsonPreview(marketplace);

  const handleDownload = async () => {
    setIsExporting(true);
    try {
      const blob = await exportMarketplaceAsZip(marketplace);
      downloadBlob(blob, `${marketplace.name}.zip`);
      toast.success("ZIP downloaded successfully!");
    } catch (err) {
      toast.error("Failed to generate ZIP file");
      console.error(err);
    } finally {
      setIsExporting(false);
    }
  };

  const handleCopyJson = async () => {
    try {
      await navigator.clipboard.writeText(jsonPreview);
      setCopied(true);
      toast.success("Copied to clipboard!");
      setTimeout(() => setCopied(false), 2000);
    } catch {
      toast.error("Failed to copy to clipboard");
    }
  };

  return (
    <div className="space-y-6">
      {/* Download CTA */}
      <div className="rounded-md border border-border bg-card p-6">
        <h3 className="font-heading text-xs text-primary">
          EXPORT MARKETPLACE
        </h3>
        <p className="mt-2 text-sm text-muted-foreground">
          Download your marketplace as a ZIP file that follows the Claude Code
          plugin marketplace spec.
        </p>

        {marketplace.plugins.length === 0 ? (
          <p className="mt-4 text-sm text-destructive">
            Add at least one plugin before exporting.
          </p>
        ) : (
          <Button
            onClick={handleDownload}
            disabled={isExporting}
            className="mt-4 font-heading text-xs transition-shadow hover:neon-glow"
          >
            <Download className="mr-2 size-4" />
            {isExporting ? "Generating..." : "Download ZIP"}
          </Button>
        )}
      </div>

      {/* File Tree Preview */}
      <div className="rounded-md border border-border bg-card p-6">
        <h3 className="font-heading text-xs text-primary">FILE STRUCTURE</h3>
        <div className="mt-3 rounded-md bg-secondary p-4 font-mono text-sm">
          {fileTree.map((path, i) => {
            const isDir = path.endsWith("/");
            const depth = (path.match(/\//g) || []).length - 1;
            const name = isDir
              ? path.split("/").filter(Boolean).pop() + "/"
              : path.split("/").pop();

            return (
              <div
                key={i}
                className="flex items-center gap-1 text-muted-foreground"
                style={{ paddingLeft: `${depth * 16}px` }}
              >
                {isDir ? (
                  <Folder className="size-3 text-accent" />
                ) : (
                  <FileText className="size-3 text-primary" />
                )}
                <span className={isDir ? "text-accent" : ""}>{name}</span>
              </div>
            );
          })}
        </div>
      </div>

      {/* marketplace.json Preview */}
      <div className="rounded-md border border-border bg-card p-6">
        <div className="flex items-center justify-between">
          <button
            onClick={() => setShowJson(!showJson)}
            className="flex items-center gap-2 font-heading text-xs text-primary"
          >
            {showJson ? (
              <ChevronDown className="size-4" />
            ) : (
              <ChevronRight className="size-4" />
            )}
            MARKETPLACE.JSON PREVIEW
          </button>
          <Button variant="outline" size="sm" onClick={handleCopyJson}>
            {copied ? (
              <Check className="mr-1 size-3" />
            ) : (
              <Copy className="mr-1 size-3" />
            )}
            {copied ? "Copied!" : "Copy"}
          </Button>
        </div>
        {showJson && (
          <pre className="mt-3 overflow-x-auto rounded-md bg-secondary p-4 font-mono text-sm text-foreground">
            {jsonPreview}
          </pre>
        )}
      </div>

      {/* CLI Instructions */}
      <div className="rounded-md border border-border bg-card p-6">
        <h3 className="font-heading text-xs text-primary">
          <Terminal className="mr-2 inline size-4" />
          CLI INTEGRATION
        </h3>
        <p className="mt-2 text-sm text-muted-foreground">
          After downloading, unzip and add to Claude Code:
        </p>
        <div className="mt-3 space-y-2 rounded-md bg-secondary p-4 font-mono text-sm">
          <p className="text-accent"># Add the marketplace</p>
          <p className="text-foreground">
            /plugin marketplace add ./path/to/{marketplace.name}
          </p>
          <p className="mt-2 text-accent"># Install a plugin</p>
          {marketplace.plugins.map((plugin) => (
            <p key={plugin.id} className="text-foreground">
              /plugin install {plugin.name}@{marketplace.name}
            </p>
          ))}
        </div>
      </div>
    </div>
  );
}
