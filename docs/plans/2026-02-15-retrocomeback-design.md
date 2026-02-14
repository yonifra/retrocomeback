# Retrocomeback.com - MVP Design Document

**Date:** 2026-02-15
**Status:** Approved
**MVP Scope:** Phase 1-5 (Browse & Buy)

## Overview

An 80s retro product e-commerce store. Customers browse a neon-themed catalog of retro merchandise, add items to cart, and check out via Stripe. US-only market, guest checkout supported.

## Tech Stack

- **Framework:** Next.js 15 (App Router, TypeScript strict, Tailwind CSS)
- **Database/Auth/Storage:** Supabase (local dev for development, us-east-1 for production)
- **Payments:** Stripe (PaymentIntent + Elements)
- **UI:** shadcn/ui components
- **State:** Zustand (cart), nuqs (URL search params)
- **Validation:** Zod + react-hook-form
- **Icons:** lucide-react
- **Theme:** next-themes (locked to dark mode)

## Project Structure

```
retrocomeback/
src/
  app/
    (storefront)/          # Public: homepage, products, categories, search, cart, checkout
    (auth)/                # Login, register, forgot-password
    (account)/             # Protected user pages (orders, profile, watchlist)
    auth/callback/         # OAuth callback
    api/webhooks/stripe/   # Stripe webhook handler
    api/checkout/          # Checkout API routes
    layout.tsx             # Root layout
    globals.css
  components/
    ui/                    # shadcn/ui primitives
    layout/                # Header, Footer, MobileNav
    products/              # ProductCard, ProductGrid, filters
    cart/                  # CartDrawer, CartItem
    checkout/              # CheckoutForm, payment
    shared/                # Breadcrumbs, SearchCommand
  lib/
    supabase/              # client.ts, server.ts, middleware.ts
    stripe/                # client.ts, server.ts
    stores/cart-store.ts   # Zustand cart store
    validators/            # Zod schemas
    utils.ts               # cn() helper
  types/
    database.types.ts      # Generated from Supabase
    index.ts               # App-level types
supabase/
  config.toml
  migrations/
  seed.sql
```

## Theme: Synthwave/Neon 80s

### Colors (CSS Custom Properties)
- Background: `#0a0a1a` (deep space dark)
- Surface: `#1a1a2e` (cards, panels)
- Neon Pink: `#ff00ff` (primary accent, CTAs)
- Neon Cyan: `#00ffff` (secondary accent, links)
- Neon Purple: `#b100e8` (tertiary, highlights)
- Retro Yellow: `#ffe81f` (warnings, sale badges)
- Text: `#e0e0e0` (body), `#ffffff` (headings)

### Typography
- **Headings:** Press Start 2P (pixelated retro)
- **Body:** Fira Code (modern-retro hacker aesthetic with ligatures)
- Loaded via `next/font/google`

### Visual Effects (CSS Utilities)
- `.neon-glow` - box-shadow with neon color spread
- `.neon-text` - text-shadow glow effect
- `.retro-grid-bg` - perspective grid background
- `.scanline-overlay` - CRT scanline effect (optional)
- `.gradient-border` - animated gradient borders

### shadcn/ui Overrides
- Sharp corners (low border-radius, pixelated feel)
- Neon palette CSS variable overrides
- Neon glow on button hover
- Dark surface cards with neon borders
- Neon cyan focus rings on inputs

### Dark-only
No light mode. The retro aesthetic is inherently dark.

## Database Schema (MVP)

### Tables

| Table | Purpose |
|-------|---------|
| `profiles` | User profiles, auto-created on signup |
| `addresses` | Shipping/billing, US-only |
| `categories` | Product categories, self-ref parent_id |
| `products` | Product catalog, full-text search |
| `product_variants` | Size/color variants, stock tracking |
| `variant_options` | Option key-value pairs |
| `product_images` | Product photos, position ordering |
| `carts` | Cart headers (user_id OR session_id) |
| `cart_items` | Cart line items, price snapshot |
| `orders` | Order records, JSONB addresses, Stripe IDs |
| `order_items` | Order line items, product data snapshots |
| `order_status_history` | Status change audit trail |
| `watchlist` | Saved products (user_id + product_id) |
| `reviews` | Product reviews, 1-5 rating, moderation |

### Deferred Tables (Phase 7+)
- `review_images`, `review_helpful_votes`
- `product_imports`, `admin_activity_log`
- `user_preferences`

### Key Schema Features
- RLS on all tables
- GIN index on `products.tags`
- Full-text search (tsvector) on `products(title, description)`
- `generate_order_number()` function (e.g., RC-000001)
- Auth trigger: auto-create profile on user signup
- Admin role via `app_metadata.role = 'admin'`

## Authentication

- **Methods:** Email/Password, Google OAuth, Magic Link
- **Middleware:** Protects `/account/*` routes
- **Guest checkout:** Allowed (email required, no account needed)
- **Post-login redirect:** Returns to intended page
- **Profile creation:** Automatic via database trigger on signup

## Cart System

### Guest Cart
- Zustand store + localStorage
- Session ID in cookie (UUID)

### Logged-in Cart
- Zustand for immediate UI responsiveness
- Synced to Supabase `carts` + `cart_items` tables

### Cart Merge
- On login, merge localStorage cart into DB cart
- New items added, higher quantities kept on conflicts

### Cart UI
- **Cart drawer:** Sheet component, opens on "Add to Cart"
- **Full cart page:** `/cart` for detailed review
- **Validation:** Re-verify prices and stock at checkout

## Checkout

- Single-page checkout (not multi-step)
- Sections: Contact -> Shipping -> Payment -> Review -> Place Order
- Stripe Elements (CardElement) embedded in form
- Server action creates PaymentIntent
- Stripe webhook as backup confirmation
- Flat-rate shipping for MVP
- Order confirmation page + email

## Product Browsing

### Homepage
- Hero banner (retro VHS/arcade theme)
- Featured products carousel
- Category grid
- New arrivals (latest 8)

### Product Listing (`/products`)
- Server Component for SSR (SEO)
- Filter sidebar: category, price range, brand, tags
- Sort: price, newest, name
- Grid/list toggle
- URL-driven filters via `nuqs`
- Server-side pagination

### Product Detail (`/products/[slug]`)
- ISR (60s revalidate)
- Image gallery with thumbnails
- Variant selector
- Reviews section
- Related products
- SEO: meta tags, OG image, JSON-LD

### Search
- Cmd+K command palette (shadcn Command)
- PostgreSQL full-text search
- `/search?q=...` results page
- Debounced autocomplete

## Seed Data

~20 retro-themed products across categories:
- Retro Stickers (VHS, cassette, arcade)
- Vintage Tech (retro gadgets, pixel art prints)
- Apparel (synthwave tees, neon accessories)
- Home & Decor (neon signs, retro posters)

## Key Decisions

| Decision | Choice | Rationale |
|----------|--------|-----------|
| MVP Scope | Phase 1-5 | Working store before admin panel |
| Approach | Schema-First | Build UI against real data |
| Body Font | Fira Code | Readable hacker aesthetic |
| Theme | Dark-only | Retro aesthetic is inherently dark |
| Cart | Zustand + Supabase sync | Fast UX, persistent storage |
| Checkout | Single-page | Simpler UX, fewer page loads |
| Pagination | Server-side | Better SEO, simpler implementation |
| Shipping | Flat-rate | MVP simplicity |
| Tax | Stripe Tax or flat % | MVP simplicity |
| Guest checkout | Enabled | Lower friction, higher conversion |

## Out of Scope (Future Phases)

- Admin panel (Phase 7)
- Product import pipeline (Phase 7)
- Discount codes / coupons
- Gift cards
- Email marketing
- Analytics dashboard
- A/B testing
- Internationalization
- Real-time features
- Review images / helpful votes
- Light mode
