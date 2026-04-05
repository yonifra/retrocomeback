# DATABASE.md -- Database Schema, Migrations & RLS Policies

## Overview

- **Engine**: PostgreSQL 17 (via Supabase)
- **ORM**: None. Direct Supabase client queries with typed responses.
- **Migrations**: SQL files in `supabase/migrations/`, applied via `supabase db push`.
- **RLS**: Row Level Security enabled on every table. Auth enforcement happens at the database level.

## Schema Diagram

```
┌──────────────────┐
│   auth.users     │ (Supabase managed)
│   ────────────── │
│   id (UUID, PK)  │
│   email          │
│   ...            │
└────────┬─────────┘
         │ 1:1 (trigger: handle_new_user)
         ▼
┌──────────────────┐     ┌──────────────────┐
│   profiles       │     │   addresses      │
│   ────────────── │◄────│   ────────────── │
│   id (FK→users)  │  1:N│   user_id        │
│   display_name   │     │   type           │
│   avatar_url     │     │   name, street   │
│   phone          │     │   city, state    │
└────────┬─────────┘     │   zip, country   │
         │               └──────────────────┘
         │
         │ 1:N
         ▼
┌──────────────────┐     ┌──────────────────┐
│   orders         │────►│   order_items    │
│   ────────────── │ 1:N │   ────────────── │
│   order_number   │     │   product_id     │
│   status         │     │   variant_id     │
│   email          │     │   quantity       │
│   subtotal, tax  │     │   unit_price     │
│   shipping_cost  │     │   *_snapshot     │
│   total          │     └──────────────────┘
│   stripe_*       │
└────────┬─────────┘
         │ 1:N
         ▼
┌──────────────────────┐
│ order_status_history │
└──────────────────────┘

┌──────────────────┐     ┌──────────────────┐     ┌──────────────────┐
│   categories     │◄────│   products       │────►│  product_images  │
│   ────────────── │ N:1 │   ────────────── │ 1:N │  ────────────── │
│   name, slug     │     │   slug, title    │     │  url, alt_text   │
│   parent_id(self)│     │   description    │     │  is_primary      │
│   image_url      │     │   retail_price   │     └──────────────────┘
│   sort_order     │     │   status         │
└──────────────────┘     │   featured       │     ┌──────────────────┐
                         │   affiliate_url  │────►│ product_variants │
                         │   source_platform│ 1:N │ ────────────────│
                         │   search_vector  │     │ sku, title       │
                         └────────┬─────────┘     │ price_override   │
                                  │               │ stock_quantity   │
                         ┌────────┼───────┐       └────────┬─────────┘
                         ▼        ▼       ▼                │ 1:N
                    watchlist  reviews  carts               ▼
                                         │        ┌──────────────────┐
                                         ▼        │ variant_options  │
                                     cart_items   │ ────────────────│
                                                  │ option_name      │
                                                  │ option_value     │
                                                  └──────────────────┘

── Marketplace Domain ──

┌──────────────────┐     ┌────────────────────┐
│  marketplaces    │────►│ marketplace_plugins│
│  ────────────── │ 1:N │ ──────────────────│
│  user_id(→users)│     │ name, description  │
│  name (slug)     │     │ version            │
│  display_name    │     │ author_name        │
│  version         │     │ tags, keywords     │
│  is_published    │     └─────────┬──────────┘
└──────────────────┘               │
                          ┌────────┼────────┐
                          ▼        ▼        ▼
                   plugin_skills  plugin_agents  plugin_commands
```

## Tables

### E-Commerce Domain (14 tables)

| Table | Purpose | Key Fields |
|-------|---------|-----------|
| `profiles` | User profiles (1:1 with auth.users) | display_name, avatar_url, phone |
| `addresses` | Shipping/billing addresses | user_id, type, street, city, state, zip |
| `categories` | Product categories (self-referencing) | name, slug, parent_id, image_url |
| `products` | Product catalog | slug, title, retail_price, status, featured, affiliate_url, source_platform, search_vector |
| `product_variants` | Size/color variants | product_id, sku, title, price_override, stock_quantity |
| `variant_options` | Key-value pairs for variants | variant_id, option_name, option_value |
| `product_images` | Product gallery images | product_id, variant_id, url, is_primary, position |
| `carts` | Shopping carts (user or session) | user_id, session_id |
| `cart_items` | Items in a cart | cart_id, product_id, variant_id, quantity, price_at_addition |
| `orders` | Placed orders | order_number (RC-XXXXXX), status, email, total, stripe_payment_intent_id |
| `order_items` | Line items in an order | order_id, quantity, unit_price, *_snapshot fields |
| `order_status_history` | Audit trail for order status changes | order_id, status, changed_by, note |
| `watchlist` | User product wishlist | user_id, product_id (unique pair) |
| `reviews` | Product reviews (moderated) | user_id, product_id, rating (1-5), status (pending/approved/rejected) |

### Marketplace Domain (5 tables)

| Table | Purpose | Key Fields |
|-------|---------|-----------|
| `marketplaces` | User-created AI plugin marketplaces | user_id, name (slug), display_name, version, is_published |
| `marketplace_plugins` | Plugins within a marketplace | marketplace_id, name (slug), description, version, author_name, tags, keywords |
| `plugin_skills` | SKILL.md files for a plugin | plugin_id, name, description, disable_model_invocation, content |
| `plugin_agents` | Agent definitions for a plugin | plugin_id, name, description, content |
| `plugin_commands` | Command definitions for a plugin | plugin_id, name, content |

## Row Level Security (RLS) Policies

RLS is enabled on **every table**. Key patterns:

### Public Read Access
- `categories` -- Anyone can view
- `products` -- Anyone can view **active** products
- `product_variants`, `variant_options`, `product_images` -- Anyone can view
- Published marketplaces and their children -- Anyone can view when `is_published = TRUE`

### Owner-Only Access
- `profiles` -- Users can view/update their own profile only
- `addresses` -- Users can manage their own addresses
- `watchlist` -- Users can manage their own watchlist
- `reviews` -- Users can create/update their own; anyone can view **approved** reviews
- `marketplaces` -- Users can manage their own marketplaces
- `marketplace_plugins`, `plugin_skills`, `plugin_agents`, `plugin_commands` -- Access derived from parent marketplace ownership

### Admin Access
- `categories`, `products`, `product_variants`, `variant_options`, `product_images` -- Full access for users with `app_metadata.role = 'admin'`
- `reviews` -- Admins can manage all reviews

### Service Role Access
- `orders`, `order_items` -- Service role has full access (for webhook processing)

## Key Database Features

### Full-Text Search
Products have a `search_vector` column (tsvector) auto-updated by a trigger. Weights:
- **A**: title
- **B**: short_description
- **C**: description
- **D**: brand

Indexed with a GIN index (`products_search_idx`).

### Auto-Updated Timestamps
A shared `update_updated_at()` trigger function is applied to all tables with an `updated_at` column. This fires `BEFORE UPDATE` and sets `updated_at = NOW()`.

### Order Number Generation
Sequential order numbers in format `RC-XXXXXX` (e.g., `RC-001000`), generated by the `generate_order_number()` function using a PostgreSQL sequence starting at 1000.

### Profile Auto-Creation
A trigger `on_auth_user_created` fires `AFTER INSERT ON auth.users` and creates a corresponding `profiles` row. Display name is derived from user metadata or email prefix.

### Unique Constraints
- `products.slug` -- unique across all products
- `categories.slug` -- unique across all categories
- `cart_items(cart_id, product_id, variant_id)` -- one entry per product/variant per cart
- `watchlist(user_id, product_id)` -- one entry per user per product
- `marketplaces(user_id, name)` -- unique marketplace names per user
- `marketplace_plugins(marketplace_id, name)` -- unique plugin names per marketplace
- `plugin_skills(plugin_id, name)`, `plugin_agents(plugin_id, name)`, `plugin_commands(plugin_id, name)` -- unique names within a plugin

## Migrations

Migrations are in `supabase/migrations/` and run in order:

| File | Description |
|------|-------------|
| `20260215085625_initial_schema.sql` | 14 e-commerce tables, RLS, triggers, full-text search, indexes |
| `20260215090000_seed_data.sql` | Initial product and category data |
| `20260216130000_fix_image_urls.sql` | Image URL corrections |
| `20260223100000_add_affiliate_fields.sql` | Adds affiliate_url, source_url, source_platform to products |
| `20260223120000_marketplace_tables.sql` | 5 marketplace tables with RLS and triggers |

### Creating a New Migration

```bash
# 1. Create the migration file
npx supabase migration new descriptive_name

# 2. Edit the generated file in supabase/migrations/

# 3. Apply locally
npx supabase db push

# 4. Update TypeScript types in src/types/index.ts to match
```

### Important Notes for Migrations
- Always enable RLS on new tables: `ALTER TABLE new_table ENABLE ROW LEVEL SECURITY;`
- Always add at least a SELECT policy for public-facing data.
- Add the `update_updated_at` trigger if the table has an `updated_at` column.
- Use `gen_random_uuid()` (preferred) or `uuid_generate_v4()` for UUID primary keys.
- All prices use `NUMERIC(10,2)`.
- All timestamps use `TIMESTAMPTZ NOT NULL DEFAULT NOW()`.

## Indexes

Key performance indexes:
- `products_search_idx` (GIN on search_vector) -- full-text search
- `products_tags_idx` (GIN on tags) -- tag filtering
- `products_category_idx` -- category filtering
- `products_status_idx` -- status filtering
- `products_featured_idx` (partial, WHERE featured=true) -- featured products query
- `products_source_platform_idx` (partial) -- affiliate platform filtering
- `orders_stripe_pi_idx` -- Stripe webhook lookups
- Various foreign key indexes on all join columns
