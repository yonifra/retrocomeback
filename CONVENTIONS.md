# CONVENTIONS.md -- Coding Conventions & Patterns

## TypeScript

- **Strict mode** enabled (`tsconfig.json`).
- Path alias: `@/*` maps to `./src/*`. Always use `@/` imports, never relative paths outside the same directory.
- All types live in `src/types/index.ts`. Do not scatter type definitions across files.
- Prefer `interface` over `type` for object shapes (project convention).

## React & Next.js

### Server Components (Default)
- Pages (`page.tsx`) and layouts (`layout.tsx`) are **async Server Components** unless they need interactivity.
- Fetch data directly in Server Components by calling query functions from `src/lib/queries/`.
- Do not use `useEffect` or `useState` for data fetching. Data comes from the server.

### Client Components
- Mark with `"use client"` at the top of the file.
- Only use when the component needs: event handlers, browser APIs, React state, or hooks.
- Keep client components small and leaf-level. Push interactivity to the smallest possible component.

### Component Organization
```
src/components/
  ui/           # shadcn/ui primitives -- NEVER hand-edit, use `npx shadcn add`
  layout/       # Structural components (Header, Footer, MobileNav)
  products/     # Product domain (ProductCard, ProductGrid, ProductFilters, etc.)
  cart/         # Cart domain (CartDrawer, CartItem)
  shared/       # Cross-cutting (HeroBanner, CategoryGrid, Breadcrumbs, SearchCommand)
  marketplace/  # Marketplace domain (MarketplaceCard, PluginForm, editors, etc.)
```

### Naming
- Components: PascalCase (`ProductCard.tsx`)
- Files: kebab-case for non-component files (`cart-store.ts`), PascalCase for component files
- Server Actions: camelCase ending in `Action` (`createMarketplaceAction`)

## Server Actions Pattern

All mutations use Server Actions in colocated `actions.ts` files. Follow this exact pattern:

```typescript
"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { getSessionUser } from "@/lib/firebase/session";
import { someQueryFunction } from "@/lib/queries/...";
import { someSchema } from "@/lib/validators/...";

export type ActionResult = { error?: string };

export async function doSomethingAction(formData: FormData): Promise<ActionResult> {
  // 1. Extract and validate input
  const parsed = someSchema.safeParse({ ... });
  if (!parsed.success) {
    return { error: parsed.error.issues[0].message };
  }

  // 2. Authenticate
  const user = await getSessionUser();
  if (!user) {
    return { error: "You must be logged in" };
  }

  // 3. Perform mutation via query function
  const result = await someQueryFunction({ user_id: user.uid, ...parsed.data });
  if (!result) {
    return { error: "Something went wrong" };
  }

  // 4. Revalidate and redirect
  revalidatePath("/relevant-path");
  redirect("/destination");
}
```

## Query Functions Pattern

All read/write operations go through query functions in `src/lib/queries/`. Follow this pattern:

```typescript
import { adminDb } from "@/lib/firebase/admin";
import type { SomeType } from "@/types";

function isConfigured(): boolean {
  return !!(
    process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID ||
    process.env.FIREBASE_PROJECT_ID
  );
}

export async function getSomething(): Promise<SomeType[]> {
  if (!isConfigured()) return [];

  try {
    const snap = await adminDb
      .collection("something")
      .where("status", "==", "active")
      .orderBy("created_at", "desc")
      .get();

    return snap.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    })) as SomeType[];
  } catch (error) {
    console.error("Error fetching something:", error);
    return [];
  }
}
```

## Authentication Pattern

Firebase Auth runs **client-side**. After sign-in, the client sends the ID token to create a server-side session cookie:

```typescript
// Client-side (login/signup forms):
const credential = await signInWithEmailAndPassword(auth, email, password);
const idToken = await credential.user.getIdToken();
await fetch("/api/auth/session", {
  method: "POST",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify({ idToken }),
});

// Server-side (Server Components / Server Actions):
import { getSessionUser } from "@/lib/firebase/session";

const user = await getSessionUser();
if (!user) { /* redirect or return error */ }
// user.uid, user.email, user.displayName
```

## Validation

- All schemas live in `src/lib/validators/`.
- Every user input must be validated with Zod before use.
- Schemas are shared between server actions (server-side) and form components (client-side via `@hookform/resolvers`).
- Always validate on the server even if client-side validation exists.

### Validator Modules
| File | Schemas |
|------|---------|
| `auth.ts` | loginSchema, registerSchema, forgotPasswordSchema, magicLinkSchema |
| `product.ts` | productFilterSchema, searchSchema, addProductSchema |
| `checkout.ts` | checkoutSchema |
| `address.ts` | addressSchema |
| `marketplace.ts` | marketplaceSchema, pluginSchema, skillSchema, agentSchema, commandSchema |
| `index.ts` | Re-exports all validators |

## Styling

### CSS Utility Classes
| Class | Effect |
|-------|--------|
| `.neon-glow` | Neon pink box-shadow glow |
| `.neon-glow-cyan` | Cyan box-shadow glow |
| `.neon-glow-purple` | Purple box-shadow glow |
| `.neon-text` | Neon pink text-shadow |
| `.neon-text-cyan` | Cyan text-shadow |
| `.retro-grid-bg` | Perspective grid background |
| `.scanline-overlay` | CRT scanline effect overlay |
| `.gradient-border` | Animated gradient border |

### Styling Rules
- Always use `cn()` from `@/lib/utils` to compose Tailwind classes.
- Dark-only theme. Never add light mode variants.
- Use CSS variables defined in `globals.css` for theme colors.
- Headings use `font-heading` (Press Start 2P). Body text uses `font-body` (Fira Code).
- Keep border-radius low (0.25rem / `rounded`) for the retro pixel aesthetic.
- Prefer the neon utility classes over ad-hoc shadow/glow styles.

### Color Palette (CSS Variables)
- Primary: Neon pink (`hsl(330, 100%, 60%)`)
- Accent: Neon cyan (`hsl(180, 100%, 50%)`)
- Background: Deep space dark
- Cards/surfaces: Slightly lighter dark with subtle borders

## State Management

| What | Where | Why |
|------|-------|-----|
| Cart | Zustand (`src/lib/stores/cart-store.ts`) | Client-only, persisted to localStorage |
| Product filters | nuqs (URL search params) | Shareable URLs, SSR-compatible |
| Auth session | Firebase session cookie (server-side) | Verified via `getSessionUser()` |
| Client auth state | Firebase `onAuthStateChanged` (Header) | Real-time UI updates on login/logout |
| All other data | Server Components (direct fetch) | No client cache needed |

**Rules:**
- Never use React state (`useState`) for data that should be in the URL.
- Never use Zustand for server-fetched data.
- The cart store key is `"retrocomeback-cart"`. Do not change it (breaks existing user carts).

## Error Handling

- Server actions return `{ error?: string }`. Display errors in the UI via form state or toast.
- Query functions return empty arrays/null on error. No throwing in queries.
- API routes return appropriate HTTP status codes with JSON error bodies.
- Firebase connection errors are caught gracefully (app still renders with empty data via `isConfigured()` checks).

## Imports

Preferred import order (enforced by convention, not linter):
1. React / Next.js
2. Third-party libraries
3. `@/lib/` utilities
4. `@/components/`
5. `@/types`
6. Relative imports (same directory only)
