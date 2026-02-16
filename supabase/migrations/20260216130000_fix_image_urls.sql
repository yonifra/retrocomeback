-- Fix placehold.co image URLs to use .png format
-- placehold.co returns SVG by default which breaks Next.js Image optimization.
-- Adding .png extension ensures proper raster image responses.

-- Fix product_images URLs
UPDATE product_images
SET url = regexp_replace(url, 'placehold\.co/(\d+x\d+)/([^/]+)/([^?.]+)\?', 'placehold.co/\1/\2/\3.png?')
WHERE url LIKE '%placehold.co%'
  AND url NOT LIKE '%.png?%';

-- Fix category image_url
UPDATE categories
SET image_url = regexp_replace(image_url, 'placehold\.co/(\d+x\d+)/([^/]+)/([^?.]+)\?', 'placehold.co/\1/\2/\3.png?')
WHERE image_url LIKE '%placehold.co%'
  AND image_url NOT LIKE '%.png?%';
