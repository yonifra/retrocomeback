# ARCHITECTURE.md -- System Architecture

## High-Level Overview

RETROCOMEBACK is a Next.js 16 App Router application deployed on Vercel. It uses Firebase for authentication (Firebase Auth) and database (Cloud Firestore). Stripe handles payments. The app is server-rendered by default, with client-side interactivity only where required.

```
┌──────────────────────────────────────────────────────────────┐
│  Browser                                                      │
│  ┌──────────┐  ┌─────────────┐  ┌──────────────────────────┐ │
│  │ Zustand   │  │ nuqs (URL)  │  │ React 19 Components      │ │
│  │ Cart Store│  │ Filter State│  │ (Server + Client mix)    │ │
│  └──────────┘  └─────────────┘  └──────────────────────────┘ │
│                                                               │
│  ┌──────────────────────────────────────────────────────────┐ │
│  │ Firebase Client SDK (Auth: signIn, signUp, signOut)      │ │
│  └──────────────────────────────────────────────────────────┘ │
└───────────────────────┬──────────────────────────────────────┘
                        │  HTTPS
┌───────────────────────▼──────────────────────────────────────┐
│  Vercel / Next.js 16 (Edge + Node.js Runtime)                │
│                                                               │
│  ┌───────────────┐  ┌──────────────┐  ┌────────────────────┐ │
│  │ Middleware     │  │ Server       │  │ API Routes         │ │
│  │ (cookie check, │  │ Components   │  │ /api/auth/session  │ │
│  │  route guard)  │  │ (pages, data │  │ /api/search        │ │
│  │               │  │  fetching)   │  │ /api/admin/*       │ │
│  └───────────────┘  └──────┬───────┘  │ /api/webhooks/*    │ │
│                            │          └────────┬───────────┘ │
│  ┌─────────────────────────▼───────────────────▼───────────┐ │
│  │  Server Actions (mutations, form handling)               │ │
│  │  src/app/(auth)/actions.ts                               │ │
│  │  src/app/(storefront)/account/marketplaces/actions.ts    │ │
│  │  src/app/(storefront)/account/add-product/actions.ts     │ │
│  └──────────────────────┬───────────────────────────────────┘ │
│                          │                                     │
│  ┌───────────────────────▼─────────────────────────────────┐ │
│  │  Firebase Admin SDK (server-side only)                   │ │
│  │  - Session cookie verification (verifySessionCookie)     │ │
│  │  - Firestore reads/writes (adminDb)                     │ │
│  └──────────────────────┬──────────────────────────────────┘ │
└──────────────────────────┬───────────────────────────────────┘
                           │
         ┌─────────────────┼─────────────────┐
         ▼                 ▼                 ▼
┌─────────────────┐ ┌───────────┐ ┌─────────────────────┐
│ Firebase        │ │ Stripe    │ │ External Affiliates │
│ - Firestore     │ │ - Checkout│ │ - Amazon            │
│   (NoSQL)       │ │ - Webhooks│ │ - AliExpress        │
│ - Auth (email,  │ │ - Payments│ │                     │
│   Google OAuth) │ │           │ │                     │
└─────────────────┘ └───────────┘ └─────────────────────┘
```

## Request Flow

### Page Load (Server Component)

1. Browser requests `/products`
2. Next.js middleware (`src/middleware.ts`) checks for session cookie on protected routes
3. Page Server Component (`src/app/(storefront)/products/page.tsx`) renders
4. Component calls query functions from `src/lib/queries/products.ts`
5. Query functions use Firebase Admin SDK (`adminDb` from `@/lib/firebase/admin`)
6. Firestore returns data; component renders HTML and streams to browser
7. Client Components hydrate for interactivity (filters, cart buttons)

### Mutation (Server Action)

1. User submits form (e.g., create marketplace)
2. Form calls a Server Action from a colocated `actions.ts`
3. Action validates input with Zod schema
4. Action calls `getSessionUser()` to verify the Firebase session cookie
5. Action performs the mutation via Firestore query functions in `src/lib/queries/`
6. On success: `revalidatePath()` to bust cache, then `redirect()`
7. On error: returns `{ error: "message" }` for client-side display

### Authentication

1. **Email/Password**: Client-side Firebase Auth (`signInWithEmailAndPassword`) -> get ID token -> POST to `/api/auth/session` -> server creates session cookie
2. **Google OAuth**: Client-side Firebase Auth (`signInWithPopup` with `GoogleAuthProvider`) -> get ID token -> POST to `/api/auth/session` -> server creates session cookie
3. **Session verification**: Server Components and Server Actions call `getSessionUser()` which verifies the session cookie via `adminAuth.verifySessionCookie()`
4. **Route protection**: Middleware checks `/account/*` paths for the session cookie; missing cookie redirects to `/login`
5. **Logout**: Client calls `signOut(auth)` + `DELETE /api/auth/session` to clear client and server state

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
  └── uses: src/lib/firebase/session.ts (getSessionUser)

src/components/ (UI layer)
  ├── ui/         → standalone shadcn/ui primitives (no app imports)
  ├── layout/     → imports from: ui/, lib/stores/, lib/firebase/client
  ├── products/   → imports from: ui/, types/, lib/utils
  ├── cart/       → imports from: ui/, lib/stores/cart-store
  ├── shared/     → imports from: ui/, types/
  └── marketplace/ → imports from: ui/, types/, lib/validators/

src/lib/ (business logic)
  ├── firebase/   → firebase, firebase-admin, next/headers
  ├── stripe/     → stripe, @stripe/stripe-js
  ├── queries/    → imports from: lib/firebase/admin, types/
  ├── validators/ → zod (standalone, no other app imports)
  ├── stores/     → zustand (standalone, no other app imports)
  ├── export/     → jszip, types/
  ├── affiliate.ts → standalone affiliate URL utilities
  └── utils.ts    → clsx, tailwind-merge

src/types/ (type definitions)
  └── standalone, no imports from app code
```

## Deployment

- **Hosting**: Vercel (configured via `vercel.json`)
- **Build**: `next build` (standard Next.js)
- **Database**: Firebase Cloud Firestore (managed, serverless)
- **Auth**: Firebase Auth (managed, serverless)
- **Migrations**: None needed -- Firestore is schemaless; collections created on first write
- **Environment**: All secrets managed through Vercel environment variables

## Key Design Decisions

1. **Server Components first** -- Minimizes client JS bundle. Client components only for interactivity.
2. **No client data-fetching library** -- No React Query or SWR. All data comes from Server Components or server actions.
3. **Zustand for cart only** -- Cart is the only global client state. Everything else is server-fetched or URL-driven.
4. **URL-driven filters (nuqs)** -- Product filters live in URL search params for shareability and SSR compatibility.
5. **Affiliate model, not inventory** -- Products link to external retailers. No real inventory management or fulfillment.
6. **Dark-only theme** -- No light mode. The synthwave aesthetic is core to the brand identity.
7. **Firebase session cookies** -- Server-side session verification via `adminAuth.verifySessionCookie()`. Client handles auth (sign-in/sign-up) and sends the ID token to create a server session.
8. **Firestore subcollections** -- Nested data (products → images/variants, marketplaces → plugins → skills/agents/commands) is modeled as subcollections rather than flat tables. This enables efficient hierarchical queries.
