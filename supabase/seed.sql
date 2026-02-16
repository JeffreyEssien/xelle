-- ==============================================
-- XELLÉ Seed Data
-- Run AFTER schema.sql in Supabase SQL Editor
-- ==============================================

-- Categories
INSERT INTO categories (name, slug, image, description) VALUES
  ('Handbags',    'handbags',    'https://images.unsplash.com/photo-1584917865442-de89df76afd3?w=600&q=80', 'Crafted for the modern woman.'),
  ('Jewelry',     'jewelry',     'https://images.unsplash.com/photo-1515562141589-67f0d569b6c2?w=600&q=80', 'Timeless pieces, effortless elegance.'),
  ('Fragrances',  'fragrances',  'https://images.unsplash.com/photo-1541643600914-78b084683601?w=600&q=80', 'Scents that leave a lasting impression.'),
  ('Accessories', 'accessories', 'https://images.unsplash.com/photo-1606760227091-3dd870d97f1d?w=600&q=80', 'The finishing touch to every look.');

-- Products
INSERT INTO products (slug, name, description, price, category, brand, stock, images, is_featured, is_new) VALUES
  (
    'velvet-noir-clutch',
    'Velvet Noir Clutch',
    'An exquisite velvet clutch in deep noir, featuring a gold-tone clasp and satin-lined interior. Perfect for evening soirées.',
    285.00, 'handbags', 'XELLÉ', 12,
    ARRAY['https://images.unsplash.com/photo-1584917865442-de89df76afd3?w=800&q=80', 'https://images.unsplash.com/photo-1566150905458-1bf1fc113f0d?w=800&q=80'],
    true, true
  ),
  (
    'lilac-dream-tote',
    'Lilac Dream Tote',
    'A spacious tote in our signature lilac, crafted from Italian pebbled leather with brushed silver hardware.',
    425.00, 'handbags', 'XELLÉ', 3,
    ARRAY['https://images.unsplash.com/photo-1590874103328-eac38a683ce7?w=800&q=80', 'https://images.unsplash.com/photo-1594223274512-ad4803739b7c?w=800&q=80'],
    true, true
  ),
  (
    'aurora-pendant-necklace',
    'Aurora Pendant Necklace',
    'A delicate pendant necklace featuring a hand-set amethyst stone on an 18k gold vermeil chain.',
    195.00, 'jewelry', 'XELLÉ', 8,
    ARRAY['https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?w=800&q=80', 'https://images.unsplash.com/photo-1515562141589-67f0d569b6c2?w=800&q=80'],
    false, true
  ),
  (
    'midnight-orchid-eau-de-parfum',
    'Midnight Orchid Eau de Parfum',
    'Top notes of bergamot and black currant, a heart of night-blooming orchid, base of sandalwood and musk.',
    165.00, 'fragrances', 'XELLÉ', 20,
    ARRAY['https://images.unsplash.com/photo-1541643600914-78b084683601?w=800&q=80', 'https://images.unsplash.com/photo-1587017539504-67cfbddac569?w=800&q=80'],
    true, false
  ),
  (
    'silk-scarf-imperial',
    'Silk Scarf — Imperial',
    'Hand-rolled edges on 100% mulberry silk, featuring our Imperial print in purple and gold tones.',
    140.00, 'accessories', 'XELLÉ', 2,
    ARRAY['https://images.unsplash.com/photo-1606760227091-3dd870d97f1d?w=800&q=80', 'https://images.unsplash.com/photo-1601924921557-45e8e0e9a8b7?w=800&q=80'],
    false, true
  ),
  (
    'crystal-drop-earrings',
    'Crystal Drop Earrings',
    'Swarovski crystal teardrops set in rhodium-plated sterling silver. Elegant, lightweight, and luminous.',
    120.00, 'jewelry', 'XELLÉ', 15,
    ARRAY['https://images.unsplash.com/photo-1535632066927-ab7c9ab60908?w=800&q=80', 'https://images.unsplash.com/photo-1573408301185-9146fe634ad0?w=800&q=80'],
    true, false
  ),
  (
    'cashmere-wrap-dusk',
    'Cashmere Wrap — Dusk',
    'Ultra-soft Mongolian cashmere in a gradient dusk colourway, from lilac to deep plum.',
    310.00, 'accessories', 'XELLÉ', 4,
    ARRAY['https://images.unsplash.com/photo-1601924921557-45e8e0e9a8b7?w=800&q=80'],
    false, false
  ),
  (
    'structured-satchel-ivory',
    'Structured Satchel — Ivory',
    'A refined satchel in creamy ivory leather with a structured silhouette, polished brass hardware, and suede interior.',
    475.00, 'handbags', 'XELLÉ', 6,
    ARRAY['https://images.unsplash.com/photo-1566150905458-1bf1fc113f0d?w=800&q=80', 'https://images.unsplash.com/photo-1594223274512-ad4803739b7c?w=800&q=80'],
    true, true
  );
