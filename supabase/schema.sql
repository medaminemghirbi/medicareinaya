-- ============================================================
-- MedicareInaya — Supabase Schema + RLS Policies
-- Run this in: Supabase Dashboard → SQL Editor
-- ============================================================

-- USERS (extends auth.users)
CREATE TABLE IF NOT EXISTS public.users (
  id          UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email       TEXT NOT NULL,
  first_name  TEXT DEFAULT '',
  last_name   TEXT DEFAULT '',
  phone       TEXT DEFAULT '',
  role        TEXT DEFAULT 'client' CHECK (role IN ('admin', 'client')),
  created_at  TIMESTAMPTZ DEFAULT NOW(),
  updated_at  TIMESTAMPTZ DEFAULT NOW()
);

-- CATEGORIES
CREATE TABLE IF NOT EXISTS public.categories (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name_fr     TEXT NOT NULL,
  name_ar     TEXT DEFAULT '',
  name_en     TEXT DEFAULT '',
  description TEXT DEFAULT '',
  icon        TEXT DEFAULT '',
  created_at  TIMESTAMPTZ DEFAULT NOW(),
  updated_at  TIMESTAMPTZ DEFAULT NOW()
);

-- PRODUCTS
CREATE TABLE IF NOT EXISTS public.products (
  id                  UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name_fr             TEXT NOT NULL,
  name_ar             TEXT DEFAULT '',
  name_en             TEXT DEFAULT '',
  description_fr      TEXT DEFAULT '',
  description_ar      TEXT DEFAULT '',
  description_en      TEXT DEFAULT '',
  category_id         UUID REFERENCES public.categories(id) ON DELETE SET NULL,
  purchase_price      DECIMAL(10,2) NOT NULL DEFAULT 0,
  selling_price       DECIMAL(10,2) NOT NULL DEFAULT 0,
  stock_quantity      INTEGER DEFAULT 0,
  images              TEXT[] DEFAULT '{}',
  manufacture_date    DATE,
  expiration_date     DATE,
  has_promotion       BOOLEAN DEFAULT FALSE,
  promotion_discount  INTEGER DEFAULT 0,
  status              TEXT DEFAULT 'active' CHECK (status IN ('active', 'inactive')),
  created_at          TIMESTAMPTZ DEFAULT NOW(),
  updated_at          TIMESTAMPTZ DEFAULT NOW()
);

-- BLOG ARTICLES
CREATE TABLE IF NOT EXISTS public.blog_articles (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title_fr    TEXT NOT NULL,
  title_ar    TEXT DEFAULT '',
  title_en    TEXT DEFAULT '',
  content_fr  TEXT DEFAULT '',
  content_ar  TEXT DEFAULT '',
  content_en  TEXT DEFAULT '',
  slug        TEXT DEFAULT '',
  image_url   TEXT DEFAULT '',
  tags        TEXT[] DEFAULT '{}',
  status      TEXT DEFAULT 'draft' CHECK (status IN ('draft', 'published')),
  author_id   UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at  TIMESTAMPTZ DEFAULT NOW(),
  updated_at  TIMESTAMPTZ DEFAULT NOW()
);

-- WIKI PAGES
CREATE TABLE IF NOT EXISTS public.wiki_pages (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title_fr    TEXT NOT NULL,
  title_ar    TEXT DEFAULT '',
  title_en    TEXT DEFAULT '',
  content_fr  TEXT DEFAULT '',
  content_ar  TEXT DEFAULT '',
  content_en  TEXT DEFAULT '',
  slug        TEXT DEFAULT '',
  category    TEXT DEFAULT '',
  tags        TEXT[] DEFAULT '{}',
  status      TEXT DEFAULT 'draft' CHECK (status IN ('draft', 'published')),
  created_at  TIMESTAMPTZ DEFAULT NOW(),
  updated_at  TIMESTAMPTZ DEFAULT NOW()
);

-- CONTACT REQUESTS
CREATE TABLE IF NOT EXISTS public.contact_requests (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  first_name  TEXT NOT NULL,
  last_name   TEXT NOT NULL,
  email       TEXT NOT NULL,
  phone       TEXT DEFAULT '',
  message     TEXT NOT NULL,
  product_id  UUID REFERENCES public.products(id) ON DELETE SET NULL,
  status      TEXT DEFAULT 'new' CHECK (status IN ('new', 'read', 'replied')),
  created_at  TIMESTAMPTZ DEFAULT NOW()
);

-- NOTIFICATIONS
CREATE TABLE IF NOT EXISTS public.notifications (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  type        TEXT NOT NULL,
  title       TEXT DEFAULT '',
  message     TEXT NOT NULL,
  product_id  UUID REFERENCES public.products(id) ON DELETE CASCADE,
  read        BOOLEAN DEFAULT FALSE,
  created_at  TIMESTAMPTZ DEFAULT NOW()
);

-- ORDERS
CREATE TABLE IF NOT EXISTS public.orders (
  id                UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id           UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  user_email        TEXT NOT NULL,
  items             JSONB NOT NULL DEFAULT '[]',
  subtotal          DECIMAL(10,2) NOT NULL DEFAULT 0,
  delivery_fee      DECIMAL(10,2) NOT NULL DEFAULT 8,
  total             DECIMAL(10,2) NOT NULL DEFAULT 0,
  status            TEXT DEFAULT 'pending' CHECK (status IN ('pending','confirmed','shipped','delivered','cancelled')),
  payment_method    TEXT DEFAULT 'cod',
  delivery_address  JSONB NOT NULL DEFAULT '{}',
  notes             TEXT,
  created_at        TIMESTAMPTZ DEFAULT NOW(),
  updated_at        TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================
-- ROW LEVEL SECURITY
-- ============================================================

ALTER TABLE public.users           ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.categories      ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.products        ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.blog_articles   ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.wiki_pages      ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.contact_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notifications   ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.orders          ENABLE ROW LEVEL SECURITY;

-- Helper: check if caller is admin
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS BOOLEAN LANGUAGE sql SECURITY DEFINER AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.users WHERE id = auth.uid() AND role = 'admin'
  );
$$;

-- USERS
CREATE POLICY "users_read_own"   ON public.users FOR SELECT USING (auth.uid() = id OR is_admin());
CREATE POLICY "users_insert_own" ON public.users FOR INSERT WITH CHECK (auth.uid() = id);
CREATE POLICY "users_update_own" ON public.users FOR UPDATE USING (auth.uid() = id OR is_admin());

-- CATEGORIES (public read, admin write)
CREATE POLICY "categories_read_all"    ON public.categories FOR SELECT USING (true);
CREATE POLICY "categories_admin_write" ON public.categories FOR ALL USING (is_admin());

-- PRODUCTS (public read, admin write)
CREATE POLICY "products_read_all"    ON public.products FOR SELECT USING (true);
CREATE POLICY "products_admin_write" ON public.products FOR ALL USING (is_admin());

-- BLOG (public read published, admin all)
CREATE POLICY "blog_read_published" ON public.blog_articles FOR SELECT USING (status = 'published' OR is_admin());
CREATE POLICY "blog_admin_write"    ON public.blog_articles FOR ALL USING (is_admin());

-- WIKI (public read published, admin all)
CREATE POLICY "wiki_read_published" ON public.wiki_pages FOR SELECT USING (status = 'published' OR is_admin());
CREATE POLICY "wiki_admin_write"    ON public.wiki_pages FOR ALL USING (is_admin());

-- CONTACT (anyone can submit, admin reads)
CREATE POLICY "contact_insert_all"  ON public.contact_requests FOR INSERT WITH CHECK (true);
CREATE POLICY "contact_admin_all"   ON public.contact_requests FOR ALL USING (is_admin());

-- NOTIFICATIONS (admin only)
CREATE POLICY "notif_admin_all" ON public.notifications FOR ALL USING (is_admin());

-- ORDERS (user sees own, admin sees all)
CREATE POLICY "orders_read_own"   ON public.orders FOR SELECT USING (user_id = auth.uid() OR is_admin());
CREATE POLICY "orders_insert_own" ON public.orders FOR INSERT WITH CHECK (user_id = auth.uid());
CREATE POLICY "orders_admin_all"  ON public.orders FOR ALL USING (is_admin());
