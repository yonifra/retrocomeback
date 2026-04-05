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
import { createClient } from "@/lib/supabase/server";
import { someSchema } from "@/lib/validators/...";

export type ActionResult = { error?: string };

export async function doSomethingAction(formData: FormData): Promise<ActionResult> {
  // 1. Extract and validate input
  const parsed = someSchema.safeParse({ ... });
  if (!parsed.success) {
    return { error: parsed.error.issues[0].message };
  }

  // 2. Authenticate
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    return { error: "You must be logged in" };
  }

  // 3. Perform mutation
  const { error } = await supabase.from("table").insert({ ... });
  if (error) {
    return { error: "Something went wrong" };
  }

  // 4. Revalidate and redirect
  revalidatePath("/relevant-path");
  redirect("/destination");
}
```

## Query Functions Pattern

All read operations go through query functions in `src/lib/queries/`. Follow this pattern:

```typescript
import { createClient } from "@/lib/supabase/server";

/** Graceful fallback when Supabase is not configured. */
async function getSupabase() {
  try {
    return await createClient();
  } catch {
    return null;
  }
}

export async function getSomething(): Promise<SomeType[]> {
  const supabase = await getSupabase();
  if (!supabase) return [];

  const { data, error } = await supabase
    .from("table")
    .select("...")
    .eq("status", "active");

  if (error || !data) return [];
  return data;
}
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
| `product.ts` | productFilterSchema, searchSchema |
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
| Auth session | Supabase (cookies, middleware) | Server-side, automatic refresh |
| All other data | Server Components (direct fetch) | No client cache needed |

**Rules:**
- Never use React state (`useState`) for data that should be in the URL.
- Never use Zustand for server-fetched data.
- The cart store key is `"retrocomeback-cart"`. Do not change it (breaks existing user carts).

## Error Handling

- Server actions return `{ error?: string }`. Display errors in the UI via form state or toast.
- Query functions return empty arrays/null on error. No throwing in queries.
- API routes return appropriate HTTP status codes with JSON error bodies.
- Supabase connection errors are caught gracefully (app still renders with empty data).

## Imports

Preferred import order (enforced by convention, not linter):
1. React / Next.js
2. Third-party libraries
3. `@/lib/` utilities
4. `@/components/`
5. `@/types`
6. Relative imports (same directory only)
