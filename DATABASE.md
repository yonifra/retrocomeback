# DATABASE.md -- Firestore Data Model

## Overview

- **Engine**: Cloud Firestore (Firebase, NoSQL document database)
- **Admin SDK**: `firebase-admin` for server-side reads/writes
- **Client SDK**: `firebase` (used only for Auth on the client side; Firestore reads go through the Admin SDK in Server Components)
- **Migrations**: None needed -- Firestore is schemaless; collections are created on first write
- **Security**: Firestore Security Rules should be configured in the Firebase Console for any client-side access. Currently all data access goes through the Admin SDK (which bypasses security rules).

## Data Model Diagram

```
products/{productId}
  ├── images/{imageId}              # Product gallery images
  ├── variants/{variantId}          # Size/color variants
  │   └── options/{optionId}        # Key-value pairs for variant options
  └── (fields: slug, title, description, retail_price, status, ...)

categories/{categoryId}
  └── (fields: name, slug, parent_id, image_url, sort_order)

marketplaces/{marketplaceId}
  └── plugins/{pluginId}
      ├── skills/{skillId}          # SKILL.md files
      ├── agents/{agentId}          # Agent definitions
      └── commands/{commandId}      # Command definitions
```

## Collections

### Products Collection: `products/{productId}`

| Field | Type | Description |
|-------|------|------------|
| `slug` | string | URL-friendly identifier (unique) |
| `title` | string | Product name |
| `description` | string? | Full description |
| `short_description` | string? | Brief description for cards |
| `category_id` | string? | Reference to categories collection |
| `category_name` | string? | Denormalized category name |
| `category_slug` | string? | Denormalized category slug |
| `brand` | string? | Brand name |
| `tags` | string[] | Product tags |
| `retail_price` | number | Price |
| `compare_at_price` | number? | Original/compare-at price |
| `status` | "draft" \| "active" | Product status |
| `featured` | boolean | Show on homepage |
| `affiliate_url` | string? | Affiliate redirect URL (with tag) |
| `source_url` | string? | Original product URL |
| `source_platform` | "amazon" \| "aliexpress" \| "other" \| null | Source marketplace |
| `created_at` | string (ISO) | Creation timestamp |
| `updated_at` | string (ISO) | Last update timestamp |

#### Subcollection: `products/{productId}/images/{imageId}`

| Field | Type | Description |
|-------|------|------------|
| `url` | string | Image URL |
| `alt_text` | string? | Alt text |
| `position` | number | Sort order |
| `is_primary` | boolean | Primary image flag |

#### Subcollection: `products/{productId}/variants/{variantId}`

| Field | Type | Description |
|-------|------|------------|
| `title` | string | Variant name (e.g., "Small", "Red") |
| `sku` | string? | SKU code |
| `price_override` | number? | Override price (null = use product price) |
| `stock_quantity` | number | Available stock |
| `weight` | number? | Weight in grams |
| `sort_order` | number | Sort order |

#### Subcollection: `products/{productId}/variants/{variantId}/options/{optionId}`

| Field | Type | Description |
|-------|------|------------|
| `option_name` | string | e.g., "Size", "Color" |
| `option_value` | string | e.g., "XL", "Red" |

### Categories Collection: `categories/{categoryId}`

| Field | Type | Description |
|-------|------|------------|
| `name` | string | Category display name |
| `slug` | string | URL-friendly identifier (unique) |
| `description` | string? | Category description |
| `parent_id` | string? | Self-reference for hierarchy |
| `image_url` | string? | Category image |
| `sort_order` | number | Display order |
| `created_at` | string (ISO) | Creation timestamp |
| `updated_at` | string (ISO) | Last update timestamp |

### Marketplaces Collection: `marketplaces/{marketplaceId}`

| Field | Type | Description |
|-------|------|------------|
| `user_id` | string | Firebase Auth UID of owner |
| `name` | string | Slug-style identifier |
| `display_name` | string | Human-readable name |
| `description` | string | Description |
| `version` | string | Semantic version |
| `owner_email` | string? | Contact email |
| `is_published` | boolean | Publicly visible flag |
| `created_at` | string (ISO) | Creation timestamp |
| `updated_at` | string (ISO) | Last update timestamp |

#### Subcollection: `marketplaces/{id}/plugins/{pluginId}`

| Field | Type | Description |
|-------|------|------------|
| `name` | string | Plugin identifier |
| `description` | string | Plugin description |
| `version` | string | Semantic version |
| `author_name` | string | Author display name |
| `author_email` | string? | Author email |
| `homepage` | string? | Homepage URL |
| `category` | string? | Plugin category |
| `tags` | string[] | Tags |
| `keywords` | string[] | Keywords |
| `sort_order` | number | Display order |
| `created_at` | string (ISO) | Creation timestamp |
| `updated_at` | string (ISO) | Last update timestamp |

#### Subcollection: `marketplaces/{id}/plugins/{pid}/skills/{skillId}`

| Field | Type | Description |
|-------|------|------------|
| `name` | string | Skill name |
| `description` | string | Skill description |
| `disable_model_invocation` | boolean | Disable model invocation flag |
| `content` | string | SKILL.md content |
| `sort_order` | number | Display order |
| `created_at` | string (ISO) | Creation timestamp |
| `updated_at` | string (ISO) | Last update timestamp |

#### Subcollection: `marketplaces/{id}/plugins/{pid}/agents/{agentId}`

| Field | Type | Description |
|-------|------|------------|
| `name` | string | Agent name |
| `description` | string | Agent description |
| `content` | string | Agent definition content |
| `sort_order` | number | Display order |
| `created_at` | string (ISO) | Creation timestamp |
| `updated_at` | string (ISO) | Last update timestamp |

#### Subcollection: `marketplaces/{id}/plugins/{pid}/commands/{commandId}`

| Field | Type | Description |
|-------|------|------------|
| `name` | string | Command name |
| `content` | string | Command content |
| `sort_order` | number | Display order |
| `created_at` | string (ISO) | Creation timestamp |
| `updated_at` | string (ISO) | Last update timestamp |

## Key Differences from SQL

### No Foreign Keys
Firestore doesn't have foreign keys or joins. Parent-child relationships are expressed through:
1. **Subcollections** (e.g., `products/{id}/images/{imgId}`) -- preferred for hierarchical data
2. **Document references** (e.g., `category_id` field stores the category document ID) -- used for cross-collection references

### Denormalization
Products store `category_name` and `category_slug` directly (denormalized from the categories collection). This avoids the need for joins when displaying product cards.

### No Full-Text Search
Firestore doesn't support full-text search natively. The current implementation fetches active products and filters by substring match in-app. For production at scale, integrate Algolia or Typesense.

### No RLS (Row-Level Security)
Firestore has Security Rules, but since all data access goes through the Admin SDK (which bypasses rules), authorization is enforced in application code:
- Server Actions call `getSessionUser()` to verify authentication
- Marketplace ownership is checked by comparing `user_id` against the session user's `uid`
- Admin API routes use Bearer token authentication

### Auto-Generated IDs
Firestore auto-generates document IDs when using `collection.add()`. These are random alphanumeric strings, not sequential UUIDs.

### No Auto-Updated Timestamps
Timestamps are managed in application code (query functions set `created_at` and `updated_at` manually). There are no database triggers.

## Indexes

Firestore requires composite indexes for queries that combine multiple fields. These are auto-created when you first run a query that needs one (Firestore logs a URL to create the index in the console). Key queries that may need indexes:

- Products: `status` + `category_slug` + `created_at` (product listing with category filter)
- Products: `status` + `featured` + `created_at` (featured products)
- Products: `status` + `brand` + `retail_price` (brand filter with price sort)
- Marketplaces: `user_id` + `updated_at` (user's marketplaces sorted by update time)
- Marketplaces: `is_published` + `updated_at` (public marketplace listing)

## Adding a New Collection

1. No migration needed -- just start writing to the collection in query functions.
2. Add the query functions to `src/lib/queries/`.
3. Add TypeScript types to `src/types/index.ts`.
4. If the collection needs composite query indexes, Firestore will log the index creation URL on first query attempt.
