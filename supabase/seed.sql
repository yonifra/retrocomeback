-- =============================================
-- RETROCOMEBACK SEED DATA
-- 4 Categories, 20 Products, Variants, Images
-- =============================================

-- Clean existing seed data (in reverse dependency order)
TRUNCATE variant_options, product_images, product_variants, products, categories CASCADE;

-- =====================
-- CATEGORIES
-- =====================
INSERT INTO categories (id, name, slug, description, image_url, sort_order) VALUES
  ('c0000001-0000-4000-a000-000000000001', 'Retro Stickers', 'retro-stickers', 'Totally tubular sticker packs straight from the rad side of the 80s! Slap these bad boys on your laptop, skateboard, or boombox.', 'https://placehold.co/400x400/ff00ff/ffffff?text=Retro+Stickers', 1),
  ('c0000001-0000-4000-a000-000000000002', 'Vintage Tech', 'vintage-tech', 'Radical retro tech vibes for the modern age! These gnarly gadgets and prints bring the synthwave aesthetic to your desk.', 'https://placehold.co/400x400/00ffff/0a0a1a?text=Vintage+Tech', 2),
  ('c0000001-0000-4000-a000-000000000003', 'Apparel', 'apparel', 'Bodacious threads that scream 1985! Rock these fresh fits and let the world know you''re living in the best decade ever.', 'https://placehold.co/400x400/b100e8/ffffff?text=Apparel', 3),
  ('c0000001-0000-4000-a000-000000000004', 'Home & Decor', 'home-decor', 'Transform your crib into a neon-soaked paradise! These righteous decor pieces bring the arcade to your living room.', 'https://placehold.co/400x400/ffe81f/0a0a1a?text=Home+Decor', 4);


-- =====================
-- PRODUCTS
-- =====================

-- === RETRO STICKERS (5 products) ===
INSERT INTO products (id, slug, title, description, short_description, category_id, brand, tags, retail_price, compare_at_price, status, featured) VALUES
  ('p0000001-0000-4000-a000-000000000001', 'vhs-vibes-sticker-pack', 'VHS Vibes Sticker Pack',
   'Rewind to the totally awesome era of VHS tapes with this gnarly sticker pack! Featuring 10 rad designs inspired by your favorite video rental store. Each sticker is waterproof, scratch-resistant, and ready to stick on anything that needs more retro flavor. Be kind, rewind... and slap these babies everywhere!',
   'A totally tubular 10-pack of VHS-inspired waterproof stickers!',
   'c0000001-0000-4000-a000-000000000001', 'RetroComeBack', ARRAY['sticker', 'vinyl', 'retro', 'vhs', '80s', 'waterproof'],
   9.99, 12.99, 'active', true),

  ('p0000001-0000-4000-a000-000000000002', 'arcade-hero-sticker-sheet', 'Arcade Hero Sticker Sheet',
   'Power up your style with this radical arcade-inspired sticker sheet! 15 pixel-perfect designs featuring joysticks, power-ups, high scores, and 8-bit heroes. These stickers are made with premium vinyl that won''t fade even after you''ve beaten the final boss a thousand times. Game on, dude!',
   'Radical 15-piece sticker sheet with pixel-perfect arcade designs!',
   'c0000001-0000-4000-a000-000000000001', 'RetroComeBack', ARRAY['sticker', 'vinyl', 'retro', 'arcade', 'pixel-art', '8-bit', 'gaming'],
   7.99, NULL, 'active', false),

  ('p0000001-0000-4000-a000-000000000003', 'cassette-tape-holographic-sticker', 'Cassette Tape Holographic Sticker',
   'This holographic cassette tape sticker is like, totally the most righteous thing since mixtapes! Watch it shimmer and shift colors in the light like a boombox-powered rainbow. Premium holographic vinyl with a super strong adhesive. One sticker, infinite vibes. Press play on awesome!',
   'A gnarly holographic cassette tape sticker that shimmers like a rainbow!',
   'c0000001-0000-4000-a000-000000000001', 'RetroComeBack', ARRAY['sticker', 'holographic', 'retro', 'cassette', 'music', '80s', 'vinyl'],
   4.99, NULL, 'active', false),

  ('p0000001-0000-4000-a000-000000000004', 'neon-grid-runner-sticker', 'Neon Grid Runner Sticker',
   'Run the neon grid like a total cyber warrior! This bodacious sticker features a synthwave runner blazing across an infinite neon grid under a purple sunset. High-quality matte finish with UV protection so the colors stay as vivid as your dreams of cruising in a DeLorean. Radical!',
   'Bodacious synthwave runner sticker with UV-protected matte finish!',
   'c0000001-0000-4000-a000-000000000001', 'RetroComeBack', ARRAY['sticker', 'synthwave', 'neon', 'retro', 'cyberpunk', 'vinyl', 'matte'],
   5.99, 7.99, 'active', false),

  ('p0000001-0000-4000-a000-000000000005', 'pixel-heart-sticker-bundle', 'Pixel Heart Sticker Bundle',
   'Show some 8-bit love with this mega bundle of pixel heart stickers! Comes with 20 hearts in 5 totally awesome neon colors. Perfect for spreading retro love on notebooks, water bottles, phone cases, or your best friend''s forehead. Each heart is die-cut for that crispy pixel edge. Gag me with a spoon, these are cute!',
   'A mega bundle of 20 pixel hearts in 5 neon colors!',
   'c0000001-0000-4000-a000-000000000001', 'RetroComeBack', ARRAY['sticker', 'pixel-art', '8-bit', 'retro', 'hearts', 'neon', 'bundle'],
   11.99, 14.99, 'active', true),

-- === VINTAGE TECH (5 products) ===
  ('p0000002-0000-4000-a000-000000000001', 'retro-wave-pixel-art-print', 'Retro Wave Pixel Art Print',
   'Hang this radical pixel art print on your wall and watch your room transform into an 8-bit paradise! Each print is museum-quality giclée on thick matte paper. The design features a tubular sunset over a pixel ocean with palm trees swaying in the digital breeze. Available in multiple sizes. Cowabunga!',
   'Museum-quality pixel art print featuring a tubular synthwave sunset!',
   'c0000001-0000-4000-a000-000000000002', 'PixelWave Studio', ARRAY['print', 'pixel-art', 'synthwave', 'retro', 'wall-art', '8-bit', 'sunset'],
   24.99, 29.99, 'active', true),

  ('p0000002-0000-4000-a000-000000000002', 'synthwave-sunset-digital-frame', 'Synthwave Sunset Digital Frame',
   'This ain''t your grandma''s picture frame, dude! This digital frame cycles through 12 sick synthwave sunset animations that''ll make your desk look like it belongs in a Tron movie. USB-C powered, 7-inch IPS display, and a vaporwave aesthetic that''s totally fresh. The future is now... and it looks like 1985!',
   'A 7-inch digital frame with 12 animated synthwave scenes. Totally fresh!',
   'c0000001-0000-4000-a000-000000000002', 'NeonByte', ARRAY['digital-frame', 'synthwave', 'neon', 'tech', 'retro', 'animation', 'desk'],
   49.99, NULL, 'active', true),

  ('p0000002-0000-4000-a000-000000000003', '8-bit-sound-machine', '8-Bit Sound Machine',
   'Blast those chiptune beats with this totally excellent 8-bit sound machine! Features 50 classic retro sound effects from power-ups to game overs. Pocket-sized with a built-in speaker and headphone jack. Perfect for pranking your friends, making music, or just reliving the golden age of gaming. Bleep bloop, baby!',
   'Pocket-sized sound machine with 50 classic 8-bit sound effects!',
   'c0000001-0000-4000-a000-000000000002', 'PixelWave Studio', ARRAY['sound', 'chiptune', '8-bit', 'retro', 'gaming', 'gadget', 'portable'],
   19.99, 24.99, 'active', false),

  ('p0000002-0000-4000-a000-000000000004', 'neon-clock-widget', 'Neon Clock Widget',
   'Tell time like it''s 1989 with this gnarly neon clock widget! Features a retro LED display with customizable neon colors (hot pink, electric blue, laser green, or sunset orange). Alarm function plays a chiptune wake-up melody that''ll have you jumping out of bed ready to crush it. USB-C powered. Radical time-telling!',
   'A gnarly LED clock with customizable neon colors and chiptune alarm!',
   'c0000001-0000-4000-a000-000000000002', 'NeonByte', ARRAY['clock', 'neon', 'LED', 'retro', 'gadget', 'desk', 'chiptune'],
   29.99, NULL, 'active', false),

  ('p0000002-0000-4000-a000-000000000005', 'retro-gaming-mousepad', 'Retro Gaming Mousepad',
   'Level up your desk game with this extended retro gaming mousepad! Features a sick neon grid design with pixel art mountains and a synthwave sunset. Anti-slip rubber base keeps it locked in place during the most intense gaming sessions. Smooth micro-weave surface for precision mouse tracking. XL size (35x15 inches) fits your whole setup. Totally boss!',
   'XL synthwave mousepad with anti-slip base. Totally boss!',
   'c0000001-0000-4000-a000-000000000002', 'RetroComeBack', ARRAY['mousepad', 'gaming', 'synthwave', 'neon', 'retro', 'desk', 'pixel-art'],
   14.99, 19.99, 'active', false),

-- === APPAREL (5 products) ===
  ('p0000003-0000-4000-a000-000000000001', 'synthwave-sunset-tee', 'Synthwave Sunset Tee',
   'Wear the sunset, dude! This bodacious tee features a killer synthwave sunset design with palm trees, a DeLorean, and a chrome grid horizon. Printed on super-soft 100% combed cotton with water-based inks that won''t crack or fade. Available in S through XL. The vibes are immaculate, the fit is fresh, and the retro energy is off the charts!',
   'Bodacious synthwave sunset tee on super-soft 100% combed cotton!',
   'c0000001-0000-4000-a000-000000000003', 'RetroComeBack', ARRAY['tee', 'apparel', 'synthwave', 'retro', 'sunset', '80s', 'fashion'],
   29.99, 34.99, 'active', true),

  ('p0000003-0000-4000-a000-000000000002', 'neon-nights-hoodie', 'Neon Nights Hoodie',
   'Stay warm and look totally rad in this Neon Nights hoodie! Features a glowing neon cityscape across the chest with reflective ink that actually shines under blacklight. Made from heavyweight 80/20 cotton-poly blend with a brushed fleece interior softer than a synthesizer solo. Kangaroo pocket, ribbed cuffs, and a drawstring hood. Gnarly!',
   'Heavyweight hoodie with blacklight-reactive neon cityscape print!',
   'c0000001-0000-4000-a000-000000000003', 'RetroComeBack', ARRAY['hoodie', 'apparel', 'neon', 'retro', 'cityscape', '80s', 'blacklight'],
   49.99, NULL, 'active', true),

  ('p0000003-0000-4000-a000-000000000003', 'retro-arcade-cap', 'Retro Arcade Cap',
   'Top off your retro look with this excellent arcade-inspired cap! Features an embroidered pixel joystick on the front panel and "INSERT COIN" text on the back. Classic snapback design with an adjustable closure that fits most radical heads. Structured crown, curved brim, and breathable mesh back. Game face: ON.',
   'Snapback cap with embroidered pixel joystick and INSERT COIN back detail!',
   'c0000001-0000-4000-a000-000000000003', 'RetroComeBack', ARRAY['cap', 'hat', 'apparel', 'arcade', 'retro', 'pixel-art', 'snapback'],
   22.99, NULL, 'active', false),

  ('p0000003-0000-4000-a000-000000000004', 'pixel-shades-sunglasses', 'Pixel Shades Sunglasses',
   'Deal with it! These pixel shades are THE ultimate retro flex. Inspired by the iconic 8-bit "deal with it" meme, these sunglasses feature a chunky pixel frame with UV400 protection lenses. They''re not just for memes though — they''re fully functional shades that block harmful rays while you''re looking absolutely tubular. Mic drop.',
   'Iconic 8-bit pixel sunglasses with UV400 protection. Deal with it!',
   'c0000001-0000-4000-a000-000000000003', 'PixelWave Studio', ARRAY['sunglasses', 'apparel', 'pixel-art', '8-bit', 'retro', 'meme', 'UV-protection'],
   12.99, 15.99, 'active', false),

  ('p0000003-0000-4000-a000-000000000005', '80s-workout-headband', '80s Workout Headband',
   'Get physical with this totally outrageous 80s workout headband! Terry cloth construction absorbs sweat while you''re doing your Jane Fonda moves. Features a bold neon stripe pattern that screams "I work out to synth pop." One size fits all heads — from aerobics instructors to couch potatoes pretending to exercise. Let''s get physical!',
   'Terry cloth headband with neon stripes. Let''s get physical!',
   'c0000001-0000-4000-a000-000000000003', 'RetroComeBack', ARRAY['headband', 'apparel', 'workout', '80s', 'neon', 'retro', 'fitness'],
   8.99, NULL, 'active', false),

-- === HOME & DECOR (5 products) ===
  ('p0000004-0000-4000-a000-000000000001', 'neon-flamingo-led-sign', 'Neon Flamingo LED Sign',
   'Light up your life with this radical neon flamingo LED sign! This pink beauty stands 18 inches tall and bathes your room in that perfect retro glow. Energy-efficient LED with adjustable brightness and a built-in dimmer. Wall-mountable or freestanding. USB powered so you can plug it in anywhere. Your room is about to get totally flamazing!',
   'An 18-inch LED neon flamingo sign with adjustable brightness!',
   'c0000001-0000-4000-a000-000000000004', 'NeonByte', ARRAY['LED', 'neon', 'flamingo', 'decor', 'retro', 'sign', 'lighting'],
   39.99, 49.99, 'active', true),

  ('p0000004-0000-4000-a000-000000000002', 'retro-grid-poster-set', 'Retro Grid Poster Set',
   'Transform your walls into a synthwave dreamscape with this set of 3 retro grid posters! Each poster features a different neon color scheme — hot pink, electric cyan, and laser purple — with the iconic infinite grid stretching into a sunset horizon. Printed on heavyweight 250gsm satin paper. Size: 18x24 inches each. Tubular wall vibes guaranteed!',
   'Set of 3 synthwave grid posters in neon pink, cyan, and purple!',
   'c0000001-0000-4000-a000-000000000004', 'RetroComeBack', ARRAY['poster', 'wall-art', 'synthwave', 'neon', 'retro', 'grid', 'print'],
   19.99, 24.99, 'active', false),

  ('p0000004-0000-4000-a000-000000000003', 'vhs-tape-bookends', 'VHS Tape Bookends',
   'Keep your books in check with these gnarly VHS tape bookends! Cast in heavy resin and painted to look like oversized VHS tapes — one labeled "BE KIND" and the other "REWIND." Each bookend weighs 2 lbs so your books aren''t going anywhere. Non-slip felt base protects your shelves. The perfect gift for any video store nostalgia junkie!',
   'Heavy resin VHS tape bookends — BE KIND, REWIND!',
   'c0000001-0000-4000-a000-000000000004', 'RetroComeBack', ARRAY['bookends', 'VHS', 'retro', 'decor', 'resin', 'desk', 'nostalgia'],
   34.99, NULL, 'active', false),

  ('p0000004-0000-4000-a000-000000000004', 'arcade-cabinet-coasters', 'Arcade Cabinet Coasters',
   'Protect your surfaces in style with these choice arcade cabinet coasters! Set of 4 coasters shaped like mini arcade cabinets, each featuring a different classic game-inspired design. Made from premium cork with a glossy laminated top. Heat-resistant, waterproof, and totally excellent. Your coffee table just leveled up!',
   'Set of 4 cork coasters shaped like mini arcade cabinets!',
   'c0000001-0000-4000-a000-000000000004', 'PixelWave Studio', ARRAY['coasters', 'arcade', 'retro', 'decor', 'cork', 'gaming', 'kitchen'],
   16.99, NULL, 'active', false),

  ('p0000004-0000-4000-a000-000000000005', 'synthwave-wall-clock', 'Synthwave Wall Clock',
   'Time flies when you''re living in the retro zone! This far-out synthwave wall clock features a neon grid horizon with a chrome sun at the 12 o''clock position. 12-inch diameter with a silent quartz movement (no ticking to harsh your mellow). Glossy acrylic face, sturdy ABS frame, and a hook for easy wall mounting. Every second is a vibe!',
   'A 12-inch silent wall clock with synthwave neon grid design!',
   'c0000001-0000-4000-a000-000000000004', 'RetroComeBack', ARRAY['clock', 'wall-art', 'synthwave', 'neon', 'retro', 'decor', 'silent'],
   27.99, 32.99, 'active', false);


-- =====================
-- PRODUCT VARIANTS
-- =====================

-- --- RETRO STICKERS VARIANTS ---

-- VHS Vibes Sticker Pack — Color variants
INSERT INTO product_variants (id, product_id, sku, title, price_override, stock_quantity, sort_order) VALUES
  ('v0000001-0001-4000-a000-000000000001', 'p0000001-0000-4000-a000-000000000001', 'VHS-VIBES-NEONPNK', 'Neon Pink', NULL, 45, 1),
  ('v0000001-0001-4000-a000-000000000002', 'p0000001-0000-4000-a000-000000000001', 'VHS-VIBES-ELECBLU', 'Electric Blue', NULL, 38, 2),
  ('v0000001-0001-4000-a000-000000000003', 'p0000001-0000-4000-a000-000000000001', 'VHS-VIBES-LASRPRP', 'Laser Purple', NULL, 30, 3);

-- Arcade Hero Sticker Sheet — Color variants
INSERT INTO product_variants (id, product_id, sku, title, price_override, stock_quantity, sort_order) VALUES
  ('v0000001-0002-4000-a000-000000000001', 'p0000001-0000-4000-a000-000000000002', 'ARC-HERO-CLASSIC', 'Classic', NULL, 50, 1),
  ('v0000001-0002-4000-a000-000000000002', 'p0000001-0000-4000-a000-000000000002', 'ARC-HERO-HOLOGRAM', 'Holographic', 9.99, 25, 2);

-- Cassette Tape Holographic Sticker — Size variants
INSERT INTO product_variants (id, product_id, sku, title, price_override, stock_quantity, sort_order) VALUES
  ('v0000001-0003-4000-a000-000000000001', 'p0000001-0000-4000-a000-000000000003', 'CASS-HOLO-SM', 'Small (3")', NULL, 50, 1),
  ('v0000001-0003-4000-a000-000000000002', 'p0000001-0000-4000-a000-000000000003', 'CASS-HOLO-LG', 'Large (5")', 6.99, 35, 2);

-- Neon Grid Runner Sticker — Color variants
INSERT INTO product_variants (id, product_id, sku, title, price_override, stock_quantity, sort_order) VALUES
  ('v0000001-0004-4000-a000-000000000001', 'p0000001-0000-4000-a000-000000000004', 'NEON-GRID-PINK', 'Neon Pink', NULL, 40, 1),
  ('v0000001-0004-4000-a000-000000000002', 'p0000001-0000-4000-a000-000000000004', 'NEON-GRID-CYAN', 'Electric Cyan', NULL, 40, 2),
  ('v0000001-0004-4000-a000-000000000003', 'p0000001-0000-4000-a000-000000000004', 'NEON-GRID-GOLD', 'Gold', NULL, 25, 3);

-- Pixel Heart Sticker Bundle — Color variants
INSERT INTO product_variants (id, product_id, sku, title, price_override, stock_quantity, sort_order) VALUES
  ('v0000001-0005-4000-a000-000000000001', 'p0000001-0000-4000-a000-000000000005', 'PIX-HEART-MULTI', 'Multi-Color Pack', NULL, 35, 1),
  ('v0000001-0005-4000-a000-000000000002', 'p0000001-0000-4000-a000-000000000005', 'PIX-HEART-PINK', 'All Pink', NULL, 20, 2),
  ('v0000001-0005-4000-a000-000000000003', 'p0000001-0000-4000-a000-000000000005', 'PIX-HEART-BLUE', 'All Blue', NULL, 20, 3);

-- --- VINTAGE TECH VARIANTS ---

-- Retro Wave Pixel Art Print — Size variants
INSERT INTO product_variants (id, product_id, sku, title, price_override, stock_quantity, sort_order) VALUES
  ('v0000002-0001-4000-a000-000000000001', 'p0000002-0000-4000-a000-000000000001', 'RETRO-PXL-8X10', '8x10"', NULL, 30, 1),
  ('v0000002-0001-4000-a000-000000000002', 'p0000002-0000-4000-a000-000000000001', 'RETRO-PXL-12X16', '12x16"', 29.99, 20, 2),
  ('v0000002-0001-4000-a000-000000000003', 'p0000002-0000-4000-a000-000000000001', 'RETRO-PXL-18X24', '18x24"', 39.99, 15, 3);

-- Synthwave Sunset Digital Frame — Color variants
INSERT INTO product_variants (id, product_id, sku, title, price_override, stock_quantity, sort_order) VALUES
  ('v0000002-0002-4000-a000-000000000001', 'p0000002-0000-4000-a000-000000000002', 'SYNTH-FRM-BLK', 'Matte Black', NULL, 20, 1),
  ('v0000002-0002-4000-a000-000000000002', 'p0000002-0000-4000-a000-000000000002', 'SYNTH-FRM-WHT', 'Retro White', NULL, 15, 2);

-- 8-Bit Sound Machine — single default variant
INSERT INTO product_variants (id, product_id, sku, title, price_override, stock_quantity, sort_order) VALUES
  ('v0000002-0003-4000-a000-000000000001', 'p0000002-0000-4000-a000-000000000003', 'SND-8BIT-BLK', 'Classic Black', NULL, 40, 1),
  ('v0000002-0003-4000-a000-000000000002', 'p0000002-0000-4000-a000-000000000003', 'SND-8BIT-GRY', 'Retro Gray', NULL, 25, 2);

-- Neon Clock Widget — Color variants
INSERT INTO product_variants (id, product_id, sku, title, price_override, stock_quantity, sort_order) VALUES
  ('v0000002-0004-4000-a000-000000000001', 'p0000002-0000-4000-a000-000000000004', 'CLK-NEON-PINK', 'Hot Pink', NULL, 20, 1),
  ('v0000002-0004-4000-a000-000000000002', 'p0000002-0000-4000-a000-000000000004', 'CLK-NEON-BLUE', 'Electric Blue', NULL, 25, 2),
  ('v0000002-0004-4000-a000-000000000003', 'p0000002-0000-4000-a000-000000000004', 'CLK-NEON-GRN', 'Laser Green', NULL, 18, 3);

-- Retro Gaming Mousepad — Size variants
INSERT INTO product_variants (id, product_id, sku, title, price_override, stock_quantity, sort_order) VALUES
  ('v0000002-0005-4000-a000-000000000001', 'p0000002-0000-4000-a000-000000000005', 'MPAD-RETRO-STD', 'Standard', NULL, 30, 1),
  ('v0000002-0005-4000-a000-000000000002', 'p0000002-0000-4000-a000-000000000005', 'MPAD-RETRO-XL', 'XL Extended', 19.99, 25, 2);

-- --- APPAREL VARIANTS (S/M/L minimum) ---

-- Synthwave Sunset Tee — Size variants
INSERT INTO product_variants (id, product_id, sku, title, price_override, stock_quantity, sort_order) VALUES
  ('v0000003-0001-4000-a000-000000000001', 'p0000003-0000-4000-a000-000000000001', 'SYNTH-TEE-S', 'Small', NULL, 25, 1),
  ('v0000003-0001-4000-a000-000000000002', 'p0000003-0000-4000-a000-000000000001', 'SYNTH-TEE-M', 'Medium', NULL, 40, 2),
  ('v0000003-0001-4000-a000-000000000003', 'p0000003-0000-4000-a000-000000000001', 'SYNTH-TEE-L', 'Large', NULL, 35, 3),
  ('v0000003-0001-4000-a000-000000000004', 'p0000003-0000-4000-a000-000000000001', 'SYNTH-TEE-XL', 'X-Large', NULL, 20, 4);

-- Neon Nights Hoodie — Size variants
INSERT INTO product_variants (id, product_id, sku, title, price_override, stock_quantity, sort_order) VALUES
  ('v0000003-0002-4000-a000-000000000001', 'p0000003-0000-4000-a000-000000000002', 'NEON-HOOD-S', 'Small', NULL, 20, 1),
  ('v0000003-0002-4000-a000-000000000002', 'p0000003-0000-4000-a000-000000000002', 'NEON-HOOD-M', 'Medium', NULL, 35, 2),
  ('v0000003-0002-4000-a000-000000000003', 'p0000003-0000-4000-a000-000000000002', 'NEON-HOOD-L', 'Large', NULL, 30, 3),
  ('v0000003-0002-4000-a000-000000000004', 'p0000003-0000-4000-a000-000000000002', 'NEON-HOOD-XL', 'X-Large', NULL, 15, 4);

-- Retro Arcade Cap — Color variants
INSERT INTO product_variants (id, product_id, sku, title, price_override, stock_quantity, sort_order) VALUES
  ('v0000003-0003-4000-a000-000000000001', 'p0000003-0000-4000-a000-000000000003', 'ARC-CAP-BLK', 'Black', NULL, 30, 1),
  ('v0000003-0003-4000-a000-000000000002', 'p0000003-0000-4000-a000-000000000003', 'ARC-CAP-PRP', 'Purple', NULL, 25, 2),
  ('v0000003-0003-4000-a000-000000000003', 'p0000003-0000-4000-a000-000000000003', 'ARC-CAP-PNK', 'Neon Pink', NULL, 20, 3);

-- Pixel Shades Sunglasses — Color variants
INSERT INTO product_variants (id, product_id, sku, title, price_override, stock_quantity, sort_order) VALUES
  ('v0000003-0004-4000-a000-000000000001', 'p0000003-0000-4000-a000-000000000004', 'PIX-SHDS-BLK', 'Classic Black', NULL, 50, 1),
  ('v0000003-0004-4000-a000-000000000002', 'p0000003-0000-4000-a000-000000000004', 'PIX-SHDS-WHT', 'White', NULL, 30, 2),
  ('v0000003-0004-4000-a000-000000000003', 'p0000003-0000-4000-a000-000000000004', 'PIX-SHDS-PNK', 'Hot Pink', NULL, 25, 3);

-- 80s Workout Headband — Color variants
INSERT INTO product_variants (id, product_id, sku, title, price_override, stock_quantity, sort_order) VALUES
  ('v0000003-0005-4000-a000-000000000001', 'p0000003-0000-4000-a000-000000000005', 'HBAND-80S-NEON', 'Neon Multi', NULL, 40, 1),
  ('v0000003-0005-4000-a000-000000000002', 'p0000003-0000-4000-a000-000000000005', 'HBAND-80S-PNK', 'Hot Pink', NULL, 35, 2),
  ('v0000003-0005-4000-a000-000000000003', 'p0000003-0000-4000-a000-000000000005', 'HBAND-80S-CYAN', 'Electric Cyan', NULL, 30, 3);

-- --- HOME & DECOR VARIANTS ---

-- Neon Flamingo LED Sign — Color variants
INSERT INTO product_variants (id, product_id, sku, title, price_override, stock_quantity, sort_order) VALUES
  ('v0000004-0001-4000-a000-000000000001', 'p0000004-0000-4000-a000-000000000001', 'FLMGO-LED-PNK', 'Pink', NULL, 15, 1),
  ('v0000004-0001-4000-a000-000000000002', 'p0000004-0000-4000-a000-000000000001', 'FLMGO-LED-WHT', 'Warm White', NULL, 12, 2);

-- Retro Grid Poster Set — single variant
INSERT INTO product_variants (id, product_id, sku, title, price_override, stock_quantity, sort_order) VALUES
  ('v0000004-0002-4000-a000-000000000001', 'p0000004-0000-4000-a000-000000000002', 'GRID-POST-18X24', '18x24" Set of 3', NULL, 25, 1),
  ('v0000004-0002-4000-a000-000000000002', 'p0000004-0000-4000-a000-000000000002', 'GRID-POST-11X17', '11x17" Set of 3', 14.99, 30, 2);

-- VHS Tape Bookends — Color variants
INSERT INTO product_variants (id, product_id, sku, title, price_override, stock_quantity, sort_order) VALUES
  ('v0000004-0003-4000-a000-000000000001', 'p0000004-0000-4000-a000-000000000003', 'VHS-BOOK-BLK', 'Classic Black', NULL, 20, 1),
  ('v0000004-0003-4000-a000-000000000002', 'p0000004-0000-4000-a000-000000000003', 'VHS-BOOK-WHT', 'Retro White', NULL, 15, 2);

-- Arcade Cabinet Coasters — single set variant
INSERT INTO product_variants (id, product_id, sku, title, price_override, stock_quantity, sort_order) VALUES
  ('v0000004-0004-4000-a000-000000000001', 'p0000004-0000-4000-a000-000000000004', 'ARC-COAST-4PK', 'Set of 4', NULL, 35, 1),
  ('v0000004-0004-4000-a000-000000000002', 'p0000004-0000-4000-a000-000000000004', 'ARC-COAST-8PK', 'Set of 8', 29.99, 15, 2);

-- Synthwave Wall Clock — Frame variants
INSERT INTO product_variants (id, product_id, sku, title, price_override, stock_quantity, sort_order) VALUES
  ('v0000004-0005-4000-a000-000000000001', 'p0000004-0000-4000-a000-000000000005', 'SYNCLK-BLK', 'Black Frame', NULL, 20, 1),
  ('v0000004-0005-4000-a000-000000000002', 'p0000004-0000-4000-a000-000000000005', 'SYNCLK-CHR', 'Chrome Frame', 32.99, 10, 2);


-- =====================
-- VARIANT OPTIONS
-- =====================

-- VHS Vibes Sticker Pack
INSERT INTO variant_options (variant_id, option_name, option_value) VALUES
  ('v0000001-0001-4000-a000-000000000001', 'Color', 'Neon Pink'),
  ('v0000001-0001-4000-a000-000000000002', 'Color', 'Electric Blue'),
  ('v0000001-0001-4000-a000-000000000003', 'Color', 'Laser Purple');

-- Arcade Hero Sticker Sheet
INSERT INTO variant_options (variant_id, option_name, option_value) VALUES
  ('v0000001-0002-4000-a000-000000000001', 'Style', 'Classic'),
  ('v0000001-0002-4000-a000-000000000002', 'Style', 'Holographic');

-- Cassette Tape Holographic Sticker
INSERT INTO variant_options (variant_id, option_name, option_value) VALUES
  ('v0000001-0003-4000-a000-000000000001', 'Size', 'Small (3")'),
  ('v0000001-0003-4000-a000-000000000002', 'Size', 'Large (5")');

-- Neon Grid Runner Sticker
INSERT INTO variant_options (variant_id, option_name, option_value) VALUES
  ('v0000001-0004-4000-a000-000000000001', 'Color', 'Neon Pink'),
  ('v0000001-0004-4000-a000-000000000002', 'Color', 'Electric Cyan'),
  ('v0000001-0004-4000-a000-000000000003', 'Color', 'Gold');

-- Pixel Heart Sticker Bundle
INSERT INTO variant_options (variant_id, option_name, option_value) VALUES
  ('v0000001-0005-4000-a000-000000000001', 'Color', 'Multi-Color'),
  ('v0000001-0005-4000-a000-000000000002', 'Color', 'All Pink'),
  ('v0000001-0005-4000-a000-000000000003', 'Color', 'All Blue');

-- Retro Wave Pixel Art Print
INSERT INTO variant_options (variant_id, option_name, option_value) VALUES
  ('v0000002-0001-4000-a000-000000000001', 'Size', '8x10"'),
  ('v0000002-0001-4000-a000-000000000002', 'Size', '12x16"'),
  ('v0000002-0001-4000-a000-000000000003', 'Size', '18x24"');

-- Synthwave Sunset Digital Frame
INSERT INTO variant_options (variant_id, option_name, option_value) VALUES
  ('v0000002-0002-4000-a000-000000000001', 'Color', 'Matte Black'),
  ('v0000002-0002-4000-a000-000000000002', 'Color', 'Retro White');

-- 8-Bit Sound Machine
INSERT INTO variant_options (variant_id, option_name, option_value) VALUES
  ('v0000002-0003-4000-a000-000000000001', 'Color', 'Classic Black'),
  ('v0000002-0003-4000-a000-000000000002', 'Color', 'Retro Gray');

-- Neon Clock Widget
INSERT INTO variant_options (variant_id, option_name, option_value) VALUES
  ('v0000002-0004-4000-a000-000000000001', 'Color', 'Hot Pink'),
  ('v0000002-0004-4000-a000-000000000002', 'Color', 'Electric Blue'),
  ('v0000002-0004-4000-a000-000000000003', 'Color', 'Laser Green');

-- Retro Gaming Mousepad
INSERT INTO variant_options (variant_id, option_name, option_value) VALUES
  ('v0000002-0005-4000-a000-000000000001', 'Size', 'Standard'),
  ('v0000002-0005-4000-a000-000000000002', 'Size', 'XL Extended');

-- Synthwave Sunset Tee
INSERT INTO variant_options (variant_id, option_name, option_value) VALUES
  ('v0000003-0001-4000-a000-000000000001', 'Size', 'Small'),
  ('v0000003-0001-4000-a000-000000000002', 'Size', 'Medium'),
  ('v0000003-0001-4000-a000-000000000003', 'Size', 'Large'),
  ('v0000003-0001-4000-a000-000000000004', 'Size', 'X-Large');

-- Neon Nights Hoodie
INSERT INTO variant_options (variant_id, option_name, option_value) VALUES
  ('v0000003-0002-4000-a000-000000000001', 'Size', 'Small'),
  ('v0000003-0002-4000-a000-000000000002', 'Size', 'Medium'),
  ('v0000003-0002-4000-a000-000000000003', 'Size', 'Large'),
  ('v0000003-0002-4000-a000-000000000004', 'Size', 'X-Large');

-- Retro Arcade Cap
INSERT INTO variant_options (variant_id, option_name, option_value) VALUES
  ('v0000003-0003-4000-a000-000000000001', 'Color', 'Black'),
  ('v0000003-0003-4000-a000-000000000002', 'Color', 'Purple'),
  ('v0000003-0003-4000-a000-000000000003', 'Color', 'Neon Pink');

-- Pixel Shades Sunglasses
INSERT INTO variant_options (variant_id, option_name, option_value) VALUES
  ('v0000003-0004-4000-a000-000000000001', 'Color', 'Classic Black'),
  ('v0000003-0004-4000-a000-000000000002', 'Color', 'White'),
  ('v0000003-0004-4000-a000-000000000003', 'Color', 'Hot Pink');

-- 80s Workout Headband
INSERT INTO variant_options (variant_id, option_name, option_value) VALUES
  ('v0000003-0005-4000-a000-000000000001', 'Color', 'Neon Multi'),
  ('v0000003-0005-4000-a000-000000000002', 'Color', 'Hot Pink'),
  ('v0000003-0005-4000-a000-000000000003', 'Color', 'Electric Cyan');

-- Neon Flamingo LED Sign
INSERT INTO variant_options (variant_id, option_name, option_value) VALUES
  ('v0000004-0001-4000-a000-000000000001', 'Color', 'Pink'),
  ('v0000004-0001-4000-a000-000000000002', 'Color', 'Warm White');

-- Retro Grid Poster Set
INSERT INTO variant_options (variant_id, option_name, option_value) VALUES
  ('v0000004-0002-4000-a000-000000000001', 'Size', '18x24"'),
  ('v0000004-0002-4000-a000-000000000002', 'Size', '11x17"');

-- VHS Tape Bookends
INSERT INTO variant_options (variant_id, option_name, option_value) VALUES
  ('v0000004-0003-4000-a000-000000000001', 'Color', 'Classic Black'),
  ('v0000004-0003-4000-a000-000000000002', 'Color', 'Retro White');

-- Arcade Cabinet Coasters
INSERT INTO variant_options (variant_id, option_name, option_value) VALUES
  ('v0000004-0004-4000-a000-000000000001', 'Set', 'Set of 4'),
  ('v0000004-0004-4000-a000-000000000002', 'Set', 'Set of 8');

-- Synthwave Wall Clock
INSERT INTO variant_options (variant_id, option_name, option_value) VALUES
  ('v0000004-0005-4000-a000-000000000001', 'Frame', 'Black'),
  ('v0000004-0005-4000-a000-000000000002', 'Frame', 'Chrome');


-- =====================
-- PRODUCT IMAGES
-- =====================

-- === RETRO STICKERS IMAGES ===

-- VHS Vibes Sticker Pack
INSERT INTO product_images (product_id, url, alt_text, position, is_primary) VALUES
  ('p0000001-0000-4000-a000-000000000001', 'https://placehold.co/600x600/ff00ff/ffffff?text=VHS+Vibes', 'VHS Vibes Sticker Pack', 0, true),
  ('p0000001-0000-4000-a000-000000000001', 'https://placehold.co/600x600/b100e8/ffffff?text=VHS+Detail', 'VHS Vibes sticker detail', 1, false),
  ('p0000001-0000-4000-a000-000000000001', 'https://placehold.co/600x600/0a0a1a/ff00ff?text=VHS+Pack', 'VHS Vibes full pack view', 2, false);

-- Arcade Hero Sticker Sheet
INSERT INTO product_images (product_id, url, alt_text, position, is_primary) VALUES
  ('p0000001-0000-4000-a000-000000000002', 'https://placehold.co/600x600/00ffff/0a0a1a?text=Arcade+Hero', 'Arcade Hero Sticker Sheet', 0, true),
  ('p0000001-0000-4000-a000-000000000002', 'https://placehold.co/600x600/ff00ff/ffffff?text=Arcade+Detail', 'Arcade Hero sticker detail', 1, false);

-- Cassette Tape Holographic Sticker
INSERT INTO product_images (product_id, url, alt_text, position, is_primary) VALUES
  ('p0000001-0000-4000-a000-000000000003', 'https://placehold.co/600x600/b100e8/ffffff?text=Cassette+Holo', 'Cassette Tape Holographic Sticker', 0, true),
  ('p0000001-0000-4000-a000-000000000003', 'https://placehold.co/600x600/ffe81f/0a0a1a?text=Cassette+Shine', 'Holographic effect close-up', 1, false);

-- Neon Grid Runner Sticker
INSERT INTO product_images (product_id, url, alt_text, position, is_primary) VALUES
  ('p0000001-0000-4000-a000-000000000004', 'https://placehold.co/600x600/0a0a1a/00ffff?text=Grid+Runner', 'Neon Grid Runner Sticker', 0, true),
  ('p0000001-0000-4000-a000-000000000004', 'https://placehold.co/600x600/ff00ff/ffffff?text=Runner+Detail', 'Grid Runner detail view', 1, false);

-- Pixel Heart Sticker Bundle
INSERT INTO product_images (product_id, url, alt_text, position, is_primary) VALUES
  ('p0000001-0000-4000-a000-000000000005', 'https://placehold.co/600x600/ff00ff/ffffff?text=Pixel+Hearts', 'Pixel Heart Sticker Bundle', 0, true),
  ('p0000001-0000-4000-a000-000000000005', 'https://placehold.co/600x600/00ffff/0a0a1a?text=Hearts+Multi', 'Multi-color pixel hearts', 1, false),
  ('p0000001-0000-4000-a000-000000000005', 'https://placehold.co/600x600/b100e8/ffffff?text=Hearts+Detail', 'Pixel Heart detail', 2, false);

-- === VINTAGE TECH IMAGES ===

-- Retro Wave Pixel Art Print
INSERT INTO product_images (product_id, url, alt_text, position, is_primary) VALUES
  ('p0000002-0000-4000-a000-000000000001', 'https://placehold.co/600x600/ff00ff/ffffff?text=Retro+Wave', 'Retro Wave Pixel Art Print', 0, true),
  ('p0000002-0000-4000-a000-000000000001', 'https://placehold.co/600x600/0a0a1a/ffe81f?text=Wave+Framed', 'Retro Wave framed on wall', 1, false);

-- Synthwave Sunset Digital Frame
INSERT INTO product_images (product_id, url, alt_text, position, is_primary) VALUES
  ('p0000002-0000-4000-a000-000000000002', 'https://placehold.co/600x600/0a0a1a/ff00ff?text=Digital+Frame', 'Synthwave Sunset Digital Frame', 0, true),
  ('p0000002-0000-4000-a000-000000000002', 'https://placehold.co/600x600/b100e8/ffffff?text=Frame+Side', 'Digital Frame side view', 1, false),
  ('p0000002-0000-4000-a000-000000000002', 'https://placehold.co/600x600/00ffff/0a0a1a?text=Frame+Sunset', 'Sunset animation preview', 2, false);

-- 8-Bit Sound Machine
INSERT INTO product_images (product_id, url, alt_text, position, is_primary) VALUES
  ('p0000002-0000-4000-a000-000000000003', 'https://placehold.co/600x600/ffe81f/0a0a1a?text=8-Bit+Sound', '8-Bit Sound Machine', 0, true),
  ('p0000002-0000-4000-a000-000000000003', 'https://placehold.co/600x600/ff00ff/ffffff?text=Sound+Buttons', 'Sound Machine button detail', 1, false);

-- Neon Clock Widget
INSERT INTO product_images (product_id, url, alt_text, position, is_primary) VALUES
  ('p0000002-0000-4000-a000-000000000004', 'https://placehold.co/600x600/0a0a1a/00ffff?text=Neon+Clock', 'Neon Clock Widget', 0, true),
  ('p0000002-0000-4000-a000-000000000004', 'https://placehold.co/600x600/0a0a1a/ff00ff?text=Clock+Pink', 'Clock in hot pink mode', 1, false),
  ('p0000002-0000-4000-a000-000000000004', 'https://placehold.co/600x600/0a0a1a/ffe81f?text=Clock+Orange', 'Clock in sunset orange mode', 2, false);

-- Retro Gaming Mousepad
INSERT INTO product_images (product_id, url, alt_text, position, is_primary) VALUES
  ('p0000002-0000-4000-a000-000000000005', 'https://placehold.co/600x600/0a0a1a/b100e8?text=Retro+Mousepad', 'Retro Gaming Mousepad', 0, true),
  ('p0000002-0000-4000-a000-000000000005', 'https://placehold.co/600x600/ff00ff/ffffff?text=Mousepad+Desk', 'Mousepad on desk setup', 1, false);

-- === APPAREL IMAGES ===

-- Synthwave Sunset Tee
INSERT INTO product_images (product_id, url, alt_text, position, is_primary) VALUES
  ('p0000003-0000-4000-a000-000000000001', 'https://placehold.co/600x600/0a0a1a/ff00ff?text=Sunset+Tee', 'Synthwave Sunset Tee front', 0, true),
  ('p0000003-0000-4000-a000-000000000001', 'https://placehold.co/600x600/0a0a1a/00ffff?text=Tee+Back', 'Synthwave Sunset Tee back', 1, false),
  ('p0000003-0000-4000-a000-000000000001', 'https://placehold.co/600x600/b100e8/ffffff?text=Tee+Detail', 'Print detail close-up', 2, false);

-- Neon Nights Hoodie
INSERT INTO product_images (product_id, url, alt_text, position, is_primary) VALUES
  ('p0000003-0000-4000-a000-000000000002', 'https://placehold.co/600x600/0a0a1a/b100e8?text=Neon+Hoodie', 'Neon Nights Hoodie front', 0, true),
  ('p0000003-0000-4000-a000-000000000002', 'https://placehold.co/600x600/0a0a1a/ff00ff?text=Hoodie+Back', 'Neon Nights Hoodie back', 1, false),
  ('p0000003-0000-4000-a000-000000000002', 'https://placehold.co/600x600/0a0a1a/00ffff?text=Hoodie+Glow', 'Blacklight reactive detail', 2, false);

-- Retro Arcade Cap
INSERT INTO product_images (product_id, url, alt_text, position, is_primary) VALUES
  ('p0000003-0000-4000-a000-000000000003', 'https://placehold.co/600x600/ff00ff/ffffff?text=Arcade+Cap', 'Retro Arcade Cap front', 0, true),
  ('p0000003-0000-4000-a000-000000000003', 'https://placehold.co/600x600/0a0a1a/ffe81f?text=Cap+Back', 'INSERT COIN back detail', 1, false);

-- Pixel Shades Sunglasses
INSERT INTO product_images (product_id, url, alt_text, position, is_primary) VALUES
  ('p0000003-0000-4000-a000-000000000004', 'https://placehold.co/600x600/ffe81f/0a0a1a?text=Pixel+Shades', 'Pixel Shades Sunglasses front', 0, true),
  ('p0000003-0000-4000-a000-000000000004', 'https://placehold.co/600x600/0a0a1a/ffe81f?text=Shades+Side', 'Pixel Shades side view', 1, false);

-- 80s Workout Headband
INSERT INTO product_images (product_id, url, alt_text, position, is_primary) VALUES
  ('p0000003-0000-4000-a000-000000000005', 'https://placehold.co/600x600/ff00ff/ffe81f?text=80s+Headband', '80s Workout Headband', 0, true),
  ('p0000003-0000-4000-a000-000000000005', 'https://placehold.co/600x600/00ffff/0a0a1a?text=Headband+Worn', 'Headband worn view', 1, false);

-- === HOME & DECOR IMAGES ===

-- Neon Flamingo LED Sign
INSERT INTO product_images (product_id, url, alt_text, position, is_primary) VALUES
  ('p0000004-0000-4000-a000-000000000001', 'https://placehold.co/600x600/0a0a1a/ff00ff?text=Flamingo+LED', 'Neon Flamingo LED Sign lit', 0, true),
  ('p0000004-0000-4000-a000-000000000001', 'https://placehold.co/600x600/ff00ff/ffffff?text=Flamingo+Off', 'Flamingo sign unlit', 1, false),
  ('p0000004-0000-4000-a000-000000000001', 'https://placehold.co/600x600/0a0a1a/b100e8?text=Flamingo+Room', 'Flamingo sign in room', 2, false);

-- Retro Grid Poster Set
INSERT INTO product_images (product_id, url, alt_text, position, is_primary) VALUES
  ('p0000004-0000-4000-a000-000000000002', 'https://placehold.co/600x600/b100e8/ffffff?text=Grid+Posters', 'Retro Grid Poster Set', 0, true),
  ('p0000004-0000-4000-a000-000000000002', 'https://placehold.co/600x600/00ffff/0a0a1a?text=Poster+Cyan', 'Cyan grid poster detail', 1, false),
  ('p0000004-0000-4000-a000-000000000002', 'https://placehold.co/600x600/ff00ff/ffffff?text=Poster+Pink', 'Pink grid poster detail', 2, false);

-- VHS Tape Bookends
INSERT INTO product_images (product_id, url, alt_text, position, is_primary) VALUES
  ('p0000004-0000-4000-a000-000000000003', 'https://placehold.co/600x600/0a0a1a/ffe81f?text=VHS+Bookends', 'VHS Tape Bookends', 0, true),
  ('p0000004-0000-4000-a000-000000000003', 'https://placehold.co/600x600/0a0a1a/ff00ff?text=Bookend+Detail', 'BE KIND label detail', 1, false);

-- Arcade Cabinet Coasters
INSERT INTO product_images (product_id, url, alt_text, position, is_primary) VALUES
  ('p0000004-0000-4000-a000-000000000004', 'https://placehold.co/600x600/00ffff/0a0a1a?text=Arcade+Coasters', 'Arcade Cabinet Coasters set', 0, true),
  ('p0000004-0000-4000-a000-000000000004', 'https://placehold.co/600x600/ff00ff/ffffff?text=Coaster+Detail', 'Single coaster detail', 1, false);

-- Synthwave Wall Clock
INSERT INTO product_images (product_id, url, alt_text, position, is_primary) VALUES
  ('p0000004-0000-4000-a000-000000000005', 'https://placehold.co/600x600/0a0a1a/00ffff?text=Synth+Clock', 'Synthwave Wall Clock front', 0, true),
  ('p0000004-0000-4000-a000-000000000005', 'https://placehold.co/600x600/0a0a1a/ff00ff?text=Clock+Wall', 'Clock mounted on wall', 1, false),
  ('p0000004-0000-4000-a000-000000000005', 'https://placehold.co/600x600/ffe81f/0a0a1a?text=Clock+Detail', 'Chrome sun detail at 12 o''clock', 2, false);
