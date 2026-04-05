# ARCHITECTURE.md -- System Architecture

## High-Level Overview

RETROCOMEBACK is a Next.js 16 App Router application deployed on Vercel. It uses Supabase for database (PostgreSQL 17), authentication, and storage. Stripe handles payments. The app is server-rendered by default, with client-side interactivity only where required.

```
┌──────────────────────────────────────────────────────────────┐
│  Browser                                                      │
│  ┌──────────┐  ┌─────────────┐  ┌──────────────────────────┐ │
│  │ Zustand   │  │ nuqs (URL)  │  │ React 19 Components      │ │
│  │ Cart Store│  │ Filter State│  │ (Server + Client mix)    │ │
│  └──────────┘  └─────────────┘  └──────────────────────────┘ │
└───────────────────────┬──────────────────────────────────────┘
                        │  HTTPS
┌───────────────────────▼──────────────────────────────────────┐
│  Vercel / Next.js 16 (Edge + Node.js Runtime)                │
│                                                               │
│  ┌───────────────┐  ┌──────────────┐  ┌────────────────────┐ │
│  │ Middleware     │  │ Server       │  │ API Routes         │ │
│  │ (session       │  │ Components   │  │ /api/search        │ │
│  │  refresh,      │  │ (pages, data │  │ /api/admin/*       │ │
│  │  route guard)  │  │  fetching)   │  │ /api/webhooks/*    │ │
│  └───────┬───────┘  └──────┬───────┘  └────────┬───────────┘ │
│          │                 │                    │              │
│  ┌───────▼─────────────────▼────────────────────▼───────────┐ │
│  │  Server Actions (mutations, form handling)               │ │
│  │  src/app/(auth)/actions.ts                               │ │
│  │  src/app/(storefront)/account/marketplaces/actions.ts    │ │
│  └──────────────────────┬───────────────────────────────────┘ │
└──────────────────────────┬───────────────────────────────────┘
                           │
         ┌─────────────────┼─────────────────┐
         ▼                 ▼                 ▼
┌─────────────────┐ ┌───────────┐ ┌─────────────────────┐
│ Supabase        │ │ Stripe    │ │ External Affiliates │
│ - PostgreSQL 17 │ │ - Checkout│ │ - Amazon            │
│ - Auth (email,  │ │ - Webhooks│ │ - AliExpress        │
│   Google OAuth) │ │ - Payments│ │                     │
│ - RLS policies  │ │           │ │                     │
└─────────────────┘ └───────────┘ └─────────────────────┘
```

## Request Flow

### Page Load (Server Component)

1. Browser requests `/products`
2. Next.js middleware (`src/middleware.ts`) refreshes the Supabase session
3. Page Server Component (`src/app/(storefront)/products/page.tsx`) renders
4. Component calls query functions from `src/lib/queries/products.ts`
5. Query functions use `createClient()` from `src/lib/supabase/server.ts` (cookie-based)
6. Supabase returns data; component renders HTML and streams to browser
7. Client Components hydrate for interactivity (filters, cart buttons)

### Mutation (Server Action)

1. User submits form (e.g., create marketplace)
2. Form calls a Server Action from a colocated `actions.ts`
3. Action validates input with Zod schema
4. Action calls `createClient()` to get authenticated Supabase client
5. Action performs the mutation via Supabase client
6. On success: `revalidatePath()` to bust cache, then `redirect()`
7. On error: returns `{ error: "message" }` for client-side display

### Authentication

1. **Email/Password**: Form -> Server Action -> `supabase.auth.signInWithPassword()`
2. **Google OAuth**: Redirect to Supabase OAuth URL -> callback at `/api/auth/callback` -> code exchange -> redirect to `/account`
3. **Session refresh**: Middleware refreshes token on every request via `supabase.auth.getUser()`
4. **Route protection**: Middleware checks `/account/*` paths; unauthenticated users redirect to `/login`

### Cart

1. Client-side only (Zustand store in `src/lib/stores/cart-store.ts`)
2. Items stored in `localStorage` under `"retrocomeback-cart"`
3. Each item keyed by `(productId, variantId)` pair
4. CartDrawer component (Sheet sidebar) renders current cart state
5. No server-side cart -- cart data lives entirely in the browser

### Stripe Checkout

1. Client initiates checkout (cart items + address)
2. Server creates Stripe PaymentIntent with amount and metadata
3. Client-side Stripe Elements collects card info
4. On success: Stripe fires webhook to `/api/webhooks/stripe/route.ts`
5. Webhook handler verifies signature and updates order status

## Module Dependency Map

```
src/app/ (pages & routes)
  ├── imports from: src/components/, src/lib/queries/, src/lib/validators/
  ├── colocated: actions.ts (server actions)
  └── uses: src/lib/supabase/server.ts

src/components/ (UI layer)
  ├── ui/         → standalone shadcn/ui primitives (no app imports)
  ├── layout/     → imports from: ui/, lib/stores/, lib/supabase/
  ├── products/   → imports from: ui/, types/, lib/utils
  ├── cart/       → imports from: ui/, lib/stores/cart-store
  ├── shared/     → imports from: ui/, types/
  └── marketplace/ → imports from: ui/, types/, lib/validators/

src/lib/ (business logic)
  ├── supabase/   → @supabase/ssr, next/headers
  ├── stripe/     → stripe, @stripe/stripe-js
  ├── queries/    → imports from: lib/supabase/server, types/
  ├── validators/ → zod (standalone, no other app imports)
  ├── stores/     → zustand (standalone, no other app imports)
  ├── export/     → jszip, types/
  └── utils.ts    → clsx, tailwind-merge

src/types/ (type definitions)
  └── standalone, no imports from app code
```

## Deployment

- **Hosting**: Vercel (configured via `vercel.json`)
- **Build**: `next build` (standard Next.js)
- **Database**: Supabase hosted PostgreSQL
- **Migrations**: Manual via `supabase db push` (no automated CI migration pipeline)
- **Environment**: All secrets managed through Vercel environment variables

## Key Design Decisions

1. **Server Components first** -- Minimizes client JS bundle. Client components only for interactivity.
2. **No client data-fetching library** -- No React Query or SWR. All data comes from Server Components or server actions.
3. **Zustand for cart only** -- Cart is the only global client state. Everything else is server-fetched or URL-driven.
4. **URL-driven filters (nuqs)** -- Product filters live in URL search params for shareability and SSR compatibility.
5. **Affiliate model, not inventory** -- Products link to external retailers. No real inventory management or fulfillment.
6. **Dark-only theme** -- No light mode. The synthwave aesthetic is core to the brand identity.
7. **Supabase RLS** -- Row-Level Security on every table. Auth enforcement happens at the database level, not just in app code.
