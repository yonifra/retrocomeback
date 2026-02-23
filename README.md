This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

## Environment Variables

Copy `.env.example` to `.env.local` and fill in your values:

```env
# Supabase
NEXT_PUBLIC_SUPABASE_URL=your-supabase-url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key

# Stripe
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=your-stripe-publishable-key
STRIPE_SECRET_KEY=your-stripe-secret-key
STRIPE_WEBHOOK_SECRET=your-stripe-webhook-secret

# App
NEXT_PUBLIC_APP_URL=http://localhost:3000

# Affiliate Tags
AMAZON_AFFILIATE_TAG=your-amazon-tag-20
ALIEXPRESS_AFFILIATE_ID=your-aliexpress-affiliate-id

# Admin API (protects /api/admin/* routes)
ADMIN_API_KEY=generate-a-strong-random-key
```

## Adding Products to the Store

Products can be added using an Amazon or AliExpress URL. The system automatically detects the platform and appends your affiliate tag/ID so every purchase earns you a commission.

### Option 1: CLI Script

The easiest way to add a product:

```bash
npm run add-product -- \
  --url "https://www.amazon.com/dp/B08N5WRWNW" \
  --title "Retro Bluetooth Speaker" \
  --price 29.99 \
  --category vintage-tech \
  --image "https://example.com/speaker.jpg" \
  --tags "retro,bluetooth,speaker" \
  --description "A totally radical retro speaker"
```

#### CLI Parameters

| Parameter         | Required | Description                                     |
| ----------------- | -------- | ----------------------------------------------- |
| `--url`           | Yes      | Amazon or AliExpress product URL                |
| `--title`         | Yes      | Product title shown on the store                |
| `--price`         | Yes      | Retail price (e.g., `29.99`)                    |
| `--slug`          | No       | URL slug (auto-generated from title if omitted) |
| `--category`      | No       | Category slug (e.g., `retro-stickers`)          |
| `--brand`         | No       | Brand name                                      |
| `--description`   | No       | Full product description                        |
| `--short`         | No       | Short description for product cards             |
| `--image`         | No       | Primary image URL                               |
| `--compare-price` | No       | Original price to show as crossed out           |
| `--tags`          | No       | Comma-separated tags                            |
| `--featured`      | No       | Flag to mark as featured (no value needed)      |
| `--status`        | No       | `draft` or `active` (default: `active`)         |

### Option 2: Admin API

Send a POST request to `/api/admin/products` with a Bearer token:

```bash
curl -X POST https://yoursite.com/api/admin/products \
  -H "Authorization: Bearer YOUR_ADMIN_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{
    "url": "https://www.amazon.com/dp/B08N5WRWNW",
    "title": "Retro Bluetooth Speaker",
    "price": 29.99,
    "category": "vintage-tech",
    "image_url": "https://example.com/speaker.jpg",
    "tags": ["retro", "bluetooth", "speaker"],
    "description": "A totally radical retro speaker"
  }'
```

The API accepts the same fields as the CLI (use `image_url` instead of `--image`, and `short_description` instead of `--short`). Set the `ADMIN_API_KEY` environment variable to protect this endpoint.

### How Affiliate Links Work

- **Amazon**: Your `AMAZON_AFFILIATE_TAG` is appended as `?tag=your-tag-20` to the product URL.
- **AliExpress**: Your `ALIEXPRESS_AFFILIATE_ID` is appended as `?aff_id=your-id` to the product URL.
- The original URL is stored in `source_url` and the tagged version in `affiliate_url`.
- On every product page, the "Add to Cart" button is replaced with a **"Buy on Amazon"** or **"Buy on AliExpress"** button that opens the affiliate link in a new tab.

## Database Migrations

After pulling new changes, apply migrations:

```bash
supabase db push
```

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.
