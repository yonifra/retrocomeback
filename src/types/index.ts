// ─── App-Level Types ───
// Matches the Supabase schema defined in migrations

export interface Category {
  id: string;
  name: string;
  slug: string;
  parent_id: string | null;
  description: string | null;
  image_url: string | null;
  sort_order: number;
  created_at: string;
  updated_at: string;
}

export interface Product {
  id: string;
  slug: string;
  title: string;
  description: string | null;
  short_description: string | null;
  category_id: string | null;
  brand: string | null;
  tags: string[];
  retail_price: number;
  compare_at_price: number | null;
  status: "draft" | "active" | "archived";
  featured: boolean;
  seo_title: string | null;
  seo_description: string | null;
  search_vector: string | null;
  created_at: string;
  updated_at: string;
}

export interface ProductVariant {
  id: string;
  product_id: string;
  sku: string | null;
  title: string;
  price_override: number | null;
  stock_quantity: number;
  weight: number | null;
  sort_order: number;
  created_at: string;
  updated_at: string;
}

export interface VariantOption {
  id: string;
  variant_id: string;
  option_name: string;
  option_value: string;
}

export interface ProductImage {
  id: string;
  product_id: string;
  variant_id: string | null;
  url: string;
  alt_text: string | null;
  position: number;
  is_primary: boolean;
  created_at: string;
}

/** Product with its relations joined (for listing and detail pages) */
export interface ProductWithDetails extends Product {
  category: Category | null;
  images: ProductImage[];
  variants: (ProductVariant & { options: VariantOption[] })[];
}

/** Lightweight product for grid cards */
export interface ProductCard {
  id: string;
  slug: string;
  title: string;
  short_description: string | null;
  retail_price: number;
  compare_at_price: number | null;
  brand: string | null;
  featured: boolean;
  primary_image: string | null;
  primary_image_alt: string | null;
  category_name: string | null;
  category_slug: string | null;
  total_stock: number;
}

export interface Profile {
  id: string;
  display_name: string | null;
  avatar_url: string | null;
  phone: string | null;
  created_at: string;
  updated_at: string;
}

export interface Address {
  id: string;
  user_id: string;
  type: "shipping" | "billing";
  name: string;
  street: string;
  city: string;
  state: string;
  zip: string;
  country: string;
  is_default: boolean;
  created_at: string;
  updated_at: string;
}

export interface Order {
  id: string;
  user_id: string | null;
  order_number: string;
  status: "pending" | "confirmed" | "processing" | "shipped" | "delivered" | "cancelled" | "refunded";
  email: string;
  subtotal: number;
  tax: number;
  shipping_cost: number;
  total: number;
  currency: string;
  shipping_address: Record<string, unknown>;
  billing_address: Record<string, unknown> | null;
  stripe_payment_intent_id: string | null;
  stripe_customer_id: string | null;
  notes: string | null;
  created_at: string;
  updated_at: string;
}

export interface OrderItem {
  id: string;
  order_id: string;
  product_id: string | null;
  variant_id: string | null;
  quantity: number;
  unit_price: number;
  total_price: number;
  product_title_snapshot: string;
  variant_title_snapshot: string | null;
  product_image_snapshot: string | null;
  created_at: string;
}

export interface Review {
  id: string;
  user_id: string;
  product_id: string;
  order_id: string | null;
  rating: number;
  title: string | null;
  body: string | null;
  status: "pending" | "approved" | "rejected";
  created_at: string;
  updated_at: string;
}

// ─── Pagination ───

export interface PaginatedResult<T> {
  data: T[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
}
