-- Add affiliate/external-link fields to products
ALTER TABLE products
  ADD COLUMN affiliate_url TEXT,
  ADD COLUMN source_url TEXT,
  ADD COLUMN source_platform TEXT CHECK (source_platform IN ('amazon', 'aliexpress', 'other'));

-- Index for quick filtering by platform
CREATE INDEX products_source_platform_idx ON products (source_platform) WHERE source_platform IS NOT NULL;

COMMENT ON COLUMN products.affiliate_url IS 'The full affiliate link (with tag/tracking) that customers are redirected to when buying';
COMMENT ON COLUMN products.source_url IS 'The original product URL on the source marketplace (without affiliate tag)';
COMMENT ON COLUMN products.source_platform IS 'Which marketplace the product is sourced from';
