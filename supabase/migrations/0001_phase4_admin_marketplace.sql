-- THE BHANU — Phase 4: Admin Dashboard & Product Studio Schema
-- Versioned, idempotent migration for PostgreSQL + Supabase Auth + Storage

create extension if not exists pgcrypto;

-- 1. Updated-at trigger helper
create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = timezone('utc', now());
  return new;
end;
$$;

-- 2. User Profiles (RBAC)
create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  email text not null unique,
  role text not null default 'customer' check (role in ('admin', 'customer')),
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now())
);

drop trigger if exists trg_profiles_updated_at on public.profiles;
create trigger trg_profiles_updated_at
  before update on public.profiles
  for each row execute function public.set_updated_at();

-- Helper function for RLS policies
create or replace function public.is_admin()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1
    from public.profiles
    where id = auth.uid()
      and role = 'admin'
  );
$$;

-- 3. Product Categories
create table if not exists public.categories (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique,
  name text not null,
  description text not null default '',
  icon_name text not null default 'Layers',
  display_order integer not null default 0,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now())
);

drop trigger if exists trg_categories_updated_at on public.categories;
create trigger trg_categories_updated_at
  before update on public.categories
  for each row execute function public.set_updated_at();

create index if not exists idx_categories_order on public.categories (display_order asc, name asc);

-- 4. Digital Products
create table if not exists public.products (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique,
  name text not null,
  short_description text not null,
  full_description text not null default '',
  category_id uuid not null references public.categories(id) on delete restrict,
  product_type text not null default 'Digital Product',
  status text not null default 'Under Development' check (
    status in ('Available', 'Coming Soon', 'Under Development', 'Unavailable')
  ),
  published boolean not null default false,
  featured boolean not null default false,
  is_demo_record boolean not null default false,
  thumbnail_url text,
  thumbnail_alt text,
  thumbnail_storage_path text,
  features text[] not null default '{}',
  technologies text[] not null default '{}',
  preview_url text,
  live_demo_url text,
  documentation_url text,
  seo_title text not null default '',
  seo_description text not null default '',
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now())
);

drop trigger if exists trg_products_updated_at on public.products;
create trigger trg_products_updated_at
  before update on public.products
  for each row execute function public.set_updated_at();

create index if not exists idx_products_category on public.products (category_id);
create index if not exists idx_products_public_listing on public.products (published, status, featured, created_at desc);

-- 5. Product Gallery Images
create table if not exists public.product_images (
  id uuid primary key default gen_random_uuid(),
  product_id uuid not null references public.products(id) on delete cascade,
  url text not null,
  storage_path text,
  alt text not null default '',
  caption text,
  sort_order integer not null default 0,
  created_at timestamptz not null default timezone('utc', now())
);

create index if not exists idx_product_images_product on public.product_images (product_id, sort_order asc);

-- 6. Row Level Security (RLS)
alter table public.profiles enable row level security;
alter table public.categories enable row level security;
alter table public.products enable row level security;
alter table public.product_images enable row level security;

-- Profiles policies
drop policy if exists "Users can view own profile" on public.profiles;
create policy "Users can view own profile"
  on public.profiles for select
  using (auth.uid() = id or public.is_admin());

drop policy if exists "Admins can manage profiles" on public.profiles;
create policy "Admins can manage profiles"
  on public.profiles for all
  using (public.is_admin())
  with check (public.is_admin());

-- Categories policies
drop policy if exists "Public can read categories" on public.categories;
create policy "Public can read categories"
  on public.categories for select
  using (true);

drop policy if exists "Admins can manage categories" on public.categories;
create policy "Admins can manage categories"
  on public.categories for all
  using (public.is_admin())
  with check (public.is_admin());

-- Products policies
drop policy if exists "Public can read published products" on public.products;
create policy "Public can read published products"
  on public.products for select
  using (
    (published = true and status <> 'Unavailable')
    or public.is_admin()
  );

drop policy if exists "Admins can manage products" on public.products;
create policy "Admins can manage products"
  on public.products for all
  using (public.is_admin())
  with check (public.is_admin());

-- Product images policies
drop policy if exists "Public can read images of published products" on public.product_images;
create policy "Public can read images of published products"
  on public.product_images for select
  using (
    exists (
      select 1
      from public.products p
      where p.id = product_images.product_id
        and ((p.published = true and p.status <> 'Unavailable') or public.is_admin())
    )
  );

drop policy if exists "Admins can manage product images" on public.product_images;
create policy "Admins can manage product images"
  on public.product_images for all
  using (public.is_admin())
  with check (public.is_admin());

-- 7. Storage Bucket & Policies for Product Media
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'product-media',
  'product-media',
  true,
  5242880,
  array['image/png', 'image/jpeg', 'image/webp', 'image/svg+xml']
)
on conflict (id) do update
set
  public = excluded.public,
  file_size_limit = excluded.file_size_limit,
  allowed_mime_types = excluded.allowed_mime_types;

drop policy if exists "Public can view product media" on storage.objects;
create policy "Public can view product media"
  on storage.objects for select
  using (bucket_id = 'product-media');

drop policy if exists "Admins can upload product media" on storage.objects;
create policy "Admins can upload product media"
  on storage.objects for insert
  with check (bucket_id = 'product-media' and public.is_admin());

drop policy if exists "Admins can update product media" on storage.objects;
create policy "Admins can update product media"
  on storage.objects for update
  using (bucket_id = 'product-media' and public.is_admin())
  with check (bucket_id = 'product-media' and public.is_admin());

drop policy if exists "Admins can delete product media" on storage.objects;
create policy "Admins can delete product media"
  on storage.objects for delete
  using (bucket_id = 'product-media' and public.is_admin());

-- 8. Explicit Schema & Table Privileges (RLS remains enforced)
grant usage on schema public to anon, authenticated, service_role;
grant select on public.categories, public.products, public.product_images to anon, authenticated;
grant all on public.profiles, public.categories, public.products, public.product_images to authenticated;
grant all on public.profiles, public.categories, public.products, public.product_images to service_role;
grant all on all sequences in schema public to service_role;
