-- ============================================================================
-- Phase 2: Login-Gated Access Control & Row Level Security (RLS)
-- Review carefully and run manually in the Supabase SQL Editor.
-- DO NOT run automatically. Existing migrations are untouched.
-- ============================================================================

-- 1. Ensure RLS is enabled on all gated tables
ALTER TABLE public.categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.product_images ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.asset_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ui_assets ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.enquiries ENABLE ROW LEVEL SECURITY;

-- 2. Drop any overly permissive public/anon read policies if present
DROP POLICY IF EXISTS "Public read categories" ON public.categories;
DROP POLICY IF EXISTS "Public read products" ON public.products;
DROP POLICY IF EXISTS "Public read product_images" ON public.product_images;
DROP POLICY IF EXISTS "Public read asset_categories" ON public.asset_categories;
DROP POLICY IF EXISTS "Public read ui_assets" ON public.ui_assets;
DROP POLICY IF EXISTS "Public insert enquiries" ON public.enquiries;

-- 3. Authenticated-only READ policies (admin writes remain service-role/admin-only)
DROP POLICY IF EXISTS "Authenticated read categories" ON public.categories;
CREATE POLICY "Authenticated read categories"
  ON public.categories
  FOR SELECT
  TO authenticated
  USING (true);

DROP POLICY IF EXISTS "Authenticated read products" ON public.products;
CREATE POLICY "Authenticated read products"
  ON public.products
  FOR SELECT
  TO authenticated
  USING (true);

DROP POLICY IF EXISTS "Authenticated read product_images" ON public.product_images;
CREATE POLICY "Authenticated read product_images"
  ON public.product_images
  FOR SELECT
  TO authenticated
  USING (true);

DROP POLICY IF EXISTS "Authenticated read asset_categories" ON public.asset_categories;
CREATE POLICY "Authenticated read asset_categories"
  ON public.asset_categories
  FOR SELECT
  TO authenticated
  USING (true);

DROP POLICY IF EXISTS "Authenticated read ui_assets" ON public.ui_assets;
CREATE POLICY "Authenticated read ui_assets"
  ON public.ui_assets
  FOR SELECT
  TO authenticated
  USING (true);

-- 4. Enquiries: authenticated customers can insert and read their own rows
DROP POLICY IF EXISTS "Customers read own enquiries" ON public.enquiries;
CREATE POLICY "Customers read own enquiries"
  ON public.enquiries
  FOR SELECT
  TO authenticated
  USING (lower(customer_email) = lower(auth.jwt() ->> 'email'));

DROP POLICY IF EXISTS "Authenticated insert enquiries" ON public.enquiries;
CREATE POLICY "Authenticated insert enquiries"
  ON public.enquiries
  FOR INSERT
  TO authenticated
  WITH CHECK (lower(customer_email) = lower(auth.jwt() ->> 'email'));

-- ============================================================================
-- ROLLBACK (Run only if you need to restore public catalog reads)
-- ============================================================================
-- DROP POLICY IF EXISTS "Authenticated read categories" ON public.categories;
-- DROP POLICY IF EXISTS "Authenticated read products" ON public.products;
-- DROP POLICY IF EXISTS "Authenticated read product_images" ON public.product_images;
-- DROP POLICY IF EXISTS "Authenticated read asset_categories" ON public.asset_categories;
-- DROP POLICY IF EXISTS "Authenticated read ui_assets" ON public.ui_assets;
-- DROP POLICY IF EXISTS "Customers read own enquiries" ON public.enquiries;
-- DROP POLICY IF EXISTS "Authenticated insert enquiries" ON public.enquiries;
-- CREATE POLICY "Public read categories" ON public.categories FOR SELECT TO anon, authenticated USING (true);
-- CREATE POLICY "Public read products" ON public.products FOR SELECT TO anon, authenticated USING (true);
-- CREATE POLICY "Public read product_images" ON public.product_images FOR SELECT TO anon, authenticated USING (true);
-- CREATE POLICY "Public read asset_categories" ON public.asset_categories FOR SELECT TO anon, authenticated USING (true);
-- CREATE POLICY "Public read ui_assets" ON public.ui_assets FOR SELECT TO anon, authenticated USING (true);
