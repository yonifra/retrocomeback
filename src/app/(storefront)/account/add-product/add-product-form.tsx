"use client";

import { useState, useTransition } from "react";
import { Loader2, Link as LinkIcon, Sparkles, ExternalLink } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { toast } from "sonner";
import { addProductAction } from "./actions";
import { detectPlatform, platformLabel } from "@/lib/affiliate";
import type { Category } from "@/types";

interface AddProductFormProps {
  categories: Category[];
}

interface ScrapeResult {
  title: string | null;
  price: number | null;
  image_url: string | null;
  description: string | null;
  currency: string | null;
}

export function AddProductForm({ categories }: AddProductFormProps) {
  const [isPending, startTransition] = useTransition();
  const [isScraping, setIsScraping] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Form state
  const [url, setUrl] = useState("");
  const [title, setTitle] = useState("");
  const [price, setPrice] = useState("");
  const [imageUrl, setImageUrl] = useState("");
  const [description, setDescription] = useState("");
  const [shortDescription, setShortDescription] = useState("");
  const [brand, setBrand] = useState("");
  const [category, setCategory] = useState("");
  const [tags, setTags] = useState("");
  const [compareAtPrice, setCompareAtPrice] = useState("");
  const [featured, setFeatured] = useState(false);
  const [status, setStatus] = useState<"active" | "draft">("active");

  // Derived
  const detectedPlatform = url ? (() => {
    try { return detectPlatform(url); } catch { return null; }
  })() : null;

  const handleScrape = async () => {
    if (!url) {
      toast.error("Paste a product URL first");
      return;
    }

    setIsScraping(true);
    setError(null);

    try {
      const res = await fetch(`/api/admin/scrape?url=${encodeURIComponent(url)}`);
      const data: ScrapeResult & { error?: string } = await res.json();

      if (!res.ok || data.error) {
        toast.error(data.error ?? "Failed to scrape product details");
        return;
      }

      // Auto-fill fields that are currently empty
      if (data.title && !title) setTitle(data.title);
      if (data.price && !price) setPrice(String(data.price));
      if (data.image_url && !imageUrl) setImageUrl(data.image_url);
      if (data.description && !description) {
        // Use first 150 chars as short description, rest as full description
        if (!shortDescription && data.description.length > 150) {
          setShortDescription(data.description.slice(0, 150).trim());
        }
        setDescription(data.description);
      }

      toast.success("Product details auto-filled! Review and adjust as needed.");
    } catch {
      toast.error("Network error while scraping");
    } finally {
      setIsScraping(false);
    }
  };

  const handleSubmit = (formData: FormData) => {
    setError(null);
    startTransition(async () => {
      const result = await addProductAction(formData);
      if (result?.error) {
        setError(result.error);
        toast.error(result.error);
      }
    });
  };

  return (
    <form action={handleSubmit} className="space-y-8">
      {error && (
        <div className="rounded-md border border-destructive/50 bg-destructive/10 p-3">
          <p className="text-sm text-destructive">{error}</p>
        </div>
      )}

      {/* URL + Scrape */}
      <div className="space-y-3">
        <Label htmlFor="url" className="font-heading text-xs text-primary">
          PRODUCT URL
        </Label>
        <p className="text-xs text-muted-foreground">
          Paste an AliExpress or Amazon product link. Your affiliate tag will be
          added automatically.
        </p>
        <div className="flex gap-2">
          <div className="relative flex-1">
            <LinkIcon className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              id="url"
              name="url"
              type="url"
              placeholder="https://www.aliexpress.com/item/..."
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              className="pl-10"
              required
            />
          </div>
          <Button
            type="button"
            variant="outline"
            onClick={handleScrape}
            disabled={isScraping || !url}
            className="shrink-0"
          >
            {isScraping ? (
              <Loader2 className="mr-2 size-4 animate-spin" />
            ) : (
              <Sparkles className="mr-2 size-4" />
            )}
            Auto-Fill
          </Button>
        </div>
        {detectedPlatform && (
          <div className="flex items-center gap-2">
            <Badge
              variant="secondary"
              className="border border-primary/30 text-[10px]"
            >
              {platformLabel(detectedPlatform).toUpperCase()}
            </Badge>
            <span className="text-xs text-muted-foreground">
              Affiliate tag will be appended on save
            </span>
          </div>
        )}
      </div>

      <Separator />

      {/* Title + Price (side by side) */}
      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="title" className="text-xs uppercase tracking-wider text-muted-foreground">
            Product Title
          </Label>
          <Input
            id="title"
            name="title"
            placeholder="Retro Bluetooth Speaker"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            required
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="price" className="text-xs uppercase tracking-wider text-muted-foreground">
            Price (USD)
          </Label>
          <Input
            id="price"
            name="price"
            type="number"
            step="0.01"
            min="0.01"
            placeholder="29.99"
            value={price}
            onChange={(e) => setPrice(e.target.value)}
            required
          />
        </div>
      </div>

      {/* Image preview + URL */}
      <div className="space-y-2">
        <Label htmlFor="image_url" className="text-xs uppercase tracking-wider text-muted-foreground">
          Primary Image URL
        </Label>
        <Input
          id="image_url"
          name="image_url"
          type="url"
          placeholder="https://..."
          value={imageUrl}
          onChange={(e) => setImageUrl(e.target.value)}
        />
        {imageUrl && (
          <div className="mt-2 overflow-hidden rounded-md border border-border bg-secondary">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={imageUrl}
              alt="Product preview"
              className="mx-auto h-48 w-auto object-contain p-2"
              onError={(e) => {
                (e.target as HTMLImageElement).style.display = "none";
              }}
            />
          </div>
        )}
      </div>

      {/* Short description */}
      <div className="space-y-2">
        <Label htmlFor="short_description" className="text-xs uppercase tracking-wider text-muted-foreground">
          Short Description
        </Label>
        <Input
          id="short_description"
          name="short_description"
          placeholder="A rad retro speaker with neon lights"
          value={shortDescription}
          onChange={(e) => setShortDescription(e.target.value)}
        />
      </div>

      {/* Full description */}
      <div className="space-y-2">
        <Label htmlFor="description" className="text-xs uppercase tracking-wider text-muted-foreground">
          Full Description
        </Label>
        <Textarea
          id="description"
          name="description"
          placeholder="Detailed product description..."
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          rows={4}
        />
      </div>

      <Separator />

      {/* Optional fields grid */}
      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="brand" className="text-xs uppercase tracking-wider text-muted-foreground">
            Brand
          </Label>
          <Input
            id="brand"
            name="brand"
            placeholder="RetroTech"
            value={brand}
            onChange={(e) => setBrand(e.target.value)}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="category" className="text-xs uppercase tracking-wider text-muted-foreground">
            Category
          </Label>
          <select
            id="category"
            name="category"
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm transition-colors placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
          >
            <option value="">No category</option>
            {categories.map((cat) => (
              <option key={cat.id} value={cat.slug}>
                {cat.name}
              </option>
            ))}
          </select>
        </div>

        <div className="space-y-2">
          <Label htmlFor="compare_at_price" className="text-xs uppercase tracking-wider text-muted-foreground">
            Compare-at Price
          </Label>
          <Input
            id="compare_at_price"
            name="compare_at_price"
            type="number"
            step="0.01"
            min="0"
            placeholder="49.99"
            value={compareAtPrice}
            onChange={(e) => setCompareAtPrice(e.target.value)}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="tags" className="text-xs uppercase tracking-wider text-muted-foreground">
            Tags (comma-separated)
          </Label>
          <Input
            id="tags"
            name="tags"
            placeholder="retro, vintage, neon"
            value={tags}
            onChange={(e) => setTags(e.target.value)}
          />
        </div>
      </div>

      {/* Status + Featured */}
      <div className="flex items-center gap-6">
        <div className="flex items-center gap-2">
          <input
            type="checkbox"
            id="featured"
            name="featured"
            checked={featured}
            onChange={(e) => setFeatured(e.target.checked)}
            className="size-4 rounded border-border bg-transparent accent-primary"
          />
          <Label htmlFor="featured" className="text-sm text-muted-foreground">
            Featured product
          </Label>
        </div>

        <div className="flex items-center gap-2">
          <Label htmlFor="status" className="text-sm text-muted-foreground">
            Status:
          </Label>
          <select
            id="status"
            name="status"
            value={status}
            onChange={(e) => setStatus(e.target.value as "active" | "draft")}
            className="rounded-md border border-input bg-transparent px-2 py-1 text-sm"
          >
            <option value="active">Active</option>
            <option value="draft">Draft</option>
          </select>
        </div>
      </div>

      <Separator />

      {/* Preview summary */}
      {title && (
        <div className="rounded-md border border-primary/30 bg-card p-4">
          <h3 className="font-heading text-xs text-primary">PREVIEW</h3>
          <div className="mt-3 flex gap-4">
            {imageUrl && (
              /* eslint-disable-next-line @next/next/no-img-element */
              <img
                src={imageUrl}
                alt={title}
                className="size-20 shrink-0 rounded-md border border-border object-cover"
                onError={(e) => {
                  (e.target as HTMLImageElement).style.display = "none";
                }}
              />
            )}
            <div className="min-w-0">
              <p className="font-heading text-[10px] text-foreground">{title.toUpperCase()}</p>
              {shortDescription && (
                <p className="mt-1 text-xs text-muted-foreground line-clamp-2">
                  {shortDescription}
                </p>
              )}
              <div className="mt-2 flex items-center gap-2">
                {price && (
                  <span className="text-sm font-semibold text-foreground">
                    ${parseFloat(price).toFixed(2)}
                  </span>
                )}
                {detectedPlatform && (
                  <Badge variant="secondary" className="text-[10px]">
                    <ExternalLink className="mr-1 size-3" />
                    {platformLabel(detectedPlatform)}
                  </Badge>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Submit */}
      <Button
        type="submit"
        size="lg"
        disabled={isPending}
        className="w-full font-heading text-xs transition-shadow hover:neon-glow"
      >
        {isPending ? (
          <Loader2 className="mr-2 size-4 animate-spin" />
        ) : (
          <Sparkles className="mr-2 size-4" />
        )}
        {isPending ? "ADDING PRODUCT..." : "ADD PRODUCT"}
      </Button>
    </form>
  );
}
