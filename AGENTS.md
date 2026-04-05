# AGENTS.md -- AI Agent Context for RETROCOMEBACK

## Project Overview

RETROCOMEBACK is an 80s retro/synthwave-themed web application with two product areas:

1. **Retro E-Commerce Store** -- Affiliate product catalog (stickers, vintage tech, apparel, home decor) linking to Amazon/AliExpress. Supports browsing, cart, guest checkout via Stripe.
2. **Claude Code Plugin Marketplace Builder** -- Authenticated users create, edit, and export AI plugin marketplaces as ZIP files following the Claude Code marketplace spec.

**Status**: MVP (v0.1.0, private). Dark-only theme, forced synthwave aesthetic.

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Framework | Next.js 16 (App Router, React 19) |
| Language | TypeScript (strict) |
| Styling | Tailwind CSS v4, dark-only theme |
| UI | shadcn/ui (new-york style), lucide-react icons |
| Database & Auth | Supabase (PostgreSQL 17, RLS, email + Google OAuth) |
| Payments | Stripe (checkout, webhooks) |
| State | Zustand (cart, localStorage persist), nuqs (URL params) |
| Validation | Zod schemas for all inputs |
| Forms | react-hook-form + @hookform/resolvers |
| Deployment | Vercel |

## Directory Structure

```
src/
  app/
    layout.tsx                    # Root: fonts (Press Start 2P, Fira Code), ThemeProvider
    globals.css                   # Synthwave theme, neon utilities, custom scrollbar
    (storefront)/                 # Public route group
      layout.tsx                  # Header, Footer, CartDrawer, SearchCommand, Toaster
      page.tsx                    # Homepage
      products/page.tsx           # Product listing (filters, sort, pagination)
      products/[slug]/page.tsx    # Product detail
      categories/page.tsx         # Category browsing
      cart/page.tsx               # Full cart page
      account/page.tsx            # User dashboard (protected)
      account/marketplaces/       # Marketplace CRUD (actions.ts has 18 server actions)
    (auth)/                       # Auth route group
      layout.tsx                  # Centered layout with retro grid + scanlines
      actions.ts                  # login, signup, loginWithGoogle, logout
      login/, signup/             # Auth pages
    api/
      admin/products/route.ts     # POST: add products (Bearer token auth)
      auth/callback/route.ts      # OAuth callback
      search/route.ts             # Full-text product search
      webhooks/stripe/route.ts    # Stripe webhook handler
  components/
    ui/                           # 22 shadcn/ui primitives (DO NOT hand-edit)
    layout/                       # Header, Footer, MobileNav
    products/                     # ProductCard, ProductGrid, ProductFilters, etc.
    cart/                         # CartDrawer, CartItem
    shared/                       # HeroBanner, CategoryGrid, Breadcrumbs, SearchCommand
    marketplace/                  # MarketplaceCard/Form, PluginCard/Form, editors, ExportPanel
  lib/
    supabase/client.ts            # Browser Supabase client
    supabase/server.ts            # Server Supabase client (cookies)
    supabase/middleware.ts         # Session refresh + /account protection
    stripe/client.ts              # loadStripe singleton
    stripe/server.ts              # Server Stripe instance
    stores/cart-store.ts          # Zustand cart store (persist to localStorage)
    queries/products.ts           # 7 product query functions
    queries/marketplaces.ts       # 18 marketplace CRUD query functions
    validators/                   # Zod schemas: auth, product, checkout, address, marketplace
    export/marketplace-export.ts  # ZIP generation (JSZip)
    utils.ts                      # cn() (clsx+twMerge), formatPrice()
  types/index.ts                  # All TypeScript interfaces (20+)
  middleware.ts                   # Next.js middleware entry point
supabase/
  config.toml                     # Local dev config
  migrations/                     # 5 SQL migration files
  seed.sql                        # Seed data
scripts/
  add-product.ts                  # CLI tool to add affiliate products
```

## Key Patterns (READ BEFORE MAKING CHANGES)

### Server Components by Default
Pages are async Server Components that fetch data directly from Supabase. Only add `"use client"` when interactive behavior is needed (forms, state, event handlers).

### Data Access
- **Queries**: `src/lib/queries/` -- read functions that call Supabase. They use a `getSupabase()` helper that returns `null` when env vars are missing (graceful fallback).
- **Mutations**: Server Actions in colocated `actions.ts` files. Pattern: validate with Zod -> get user -> call Supabase -> `revalidatePath` -> `redirect`.
- **Return type for actions**: `{ error?: string }` (see `ActionResult` type).

### Cart State
Zustand store at `src/lib/stores/cart-store.ts`. Persisted to `localStorage` under key `"retrocomeback-cart"`. Cart items are identified by `(productId, variantId)` pair.

### URL-Driven Filters
Product listing uses `nuqs` to sync filter/sort/pagination state with URL search params. Do not use React state for product filters.

### Validation
All user input validated with Zod schemas in `src/lib/validators/`. Schemas are used both in server actions (server-side) and with react-hook-form (client-side).

### Styling
- Dark-only theme (forced via next-themes).
- Custom CSS classes: `.neon-glow`, `.neon-glow-cyan`, `.neon-glow-purple`, `.neon-text`, `.neon-text-cyan`, `.retro-grid-bg`, `.scanline-overlay`, `.gradient-border`.
- Fonts: `--font-heading` (Press Start 2P), `--font-body` (Fira Code).
- Low border-radius (0.25rem) for retro pixel feel.
- Use `cn()` from `@/lib/utils` to merge Tailwind classes.

### Authentication
- Supabase Auth with email/password and Google OAuth.
- Middleware at `src/middleware.ts` refreshes sessions on every request and redirects unauthenticated users from `/account/*` to `/login`.
- Server-side: `createClient()` from `@/lib/supabase/server` (uses cookies).
- Client-side: `createBrowserClient()` from `@/lib/supabase/client`.

### Affiliate Commerce Model
Products have `affiliate_url`, `source_url`, and `source_platform` fields. Affiliate tags (Amazon `?tag=`, AliExpress `?aff_id=`) are appended from env vars.

## Environment Variables

See `.env.example` for the full list. Required:
- `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY` -- Supabase connection
- `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY`, `STRIPE_SECRET_KEY` -- Stripe payments
- `NEXT_PUBLIC_APP_URL` -- App base URL

## Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Start dev server |
| `npm run build` | Production build |
| `npm run start` | Start production server |
| `npm run lint` | Run ESLint |
| `npm run add-product` | CLI to add affiliate products |

## Testing

No test infrastructure exists yet. No test runner, no test files, no test dependencies.

## Common Tasks for Agents

### Adding a new page
1. Create `src/app/(storefront)/your-page/page.tsx` (Server Component by default).
2. If the page needs data, add query functions to `src/lib/queries/`.
3. If the page needs mutations, add server actions in a colocated `actions.ts`.

### Adding a new component
1. Place domain components in `src/components/<domain>/`.
2. Only use `"use client"` if the component needs interactivity.
3. Import shadcn/ui primitives from `@/components/ui/`.

### Adding a new shadcn/ui component
Run `npx shadcn add <component-name>`. Do not hand-write shadcn/ui components.

### Modifying the database
1. Create a new migration: `npx supabase migration new <name>`.
2. Write SQL in the generated file under `supabase/migrations/`.
3. Apply locally: `npx supabase db push`.
4. Update TypeScript types in `src/types/index.ts` to match.

### Adding a new API route
Create `src/app/api/<path>/route.ts` exporting HTTP method handlers (GET, POST, etc.).

## Files to Avoid Editing Directly

- `src/components/ui/*` -- Generated by shadcn/ui CLI.
- `src/types/database.types.ts` -- Supabase-generated (currently a placeholder).
- `node_modules/`, `.next/`, `package-lock.json`.

## Related Documentation

- [ARCHITECTURE.md](./ARCHITECTURE.md) -- System architecture and data flow.
- [CONVENTIONS.md](./CONVENTIONS.md) -- Coding patterns and style rules.
- [DATABASE.md](./DATABASE.md) -- Schema, migrations, and RLS policies.
- [docs/plans/2026-02-15-retrocomeback-design.md](./docs/plans/2026-02-15-retrocomeback-design.md) -- Original MVP design document.
