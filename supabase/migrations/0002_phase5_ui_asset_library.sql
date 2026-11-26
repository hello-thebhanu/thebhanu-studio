-- THE BHANU — Phase 5: UI Components & Digital Asset Library Schema

create table if not exists public.asset_categories (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique,
  name text not null,
  description text not null default '',
  display_order integer not null default 0,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now())
);

drop trigger if exists trg_asset_categories_updated_at on public.asset_categories;
create trigger trg_asset_categories_updated_at
  before update on public.asset_categories
  for each row execute function public.set_updated_at();

create index if not exists idx_asset_categories_order
  on public.asset_categories (display_order asc, name asc);

create table if not exists public.ui_assets (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique,
  name text not null,
  summary text not null,
  usage_instructions text not null default '',
  category_id uuid not null references public.asset_categories(id) on delete restrict,
  asset_type text not null default 'UI Component',
  preview_key text not null default 'glass-card',
  code_snippet text not null default '',
  code_language text not null default 'tsx',
  resource_url text,
  dependencies text[] not null default '{}',
  tags text[] not null default '{}',
  status text not null default 'Available' check (
    status in ('Available', 'Coming Soon', 'Under Development', 'Unavailable')
  ),
  published boolean not null default false,
  featured boolean not null default false,
  is_demo_record boolean not null default false,
  seo_title text not null default '',
  seo_description text not null default '',
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now())
);

drop trigger if exists trg_ui_assets_updated_at on public.ui_assets;
create trigger trg_ui_assets_updated_at
  before update on public.ui_assets
  for each row execute function public.set_updated_at();

create index if not exists idx_ui_assets_category on public.ui_assets (category_id);
create index if not exists idx_ui_assets_public on public.ui_assets (published, status, featured, created_at desc);

-- Row Level Security
alter table public.asset_categories enable row level security;
alter table public.ui_assets enable row level security;

drop policy if exists "Public can read asset categories" on public.asset_categories;
create policy "Public can read asset categories"
  on public.asset_categories for select
  using (true);

drop policy if exists "Admins can manage asset categories" on public.asset_categories;
create policy "Admins can manage asset categories"
  on public.asset_categories for all
  using (public.is_admin())
  with check (public.is_admin());

drop policy if exists "Public can read published ui assets" on public.ui_assets;
create policy "Public can read published ui assets"
  on public.ui_assets for select
  using (
    (published = true and status <> 'Unavailable')
    or public.is_admin()
  );

drop policy if exists "Admins can manage ui assets" on public.ui_assets;
create policy "Admins can manage ui assets"
  on public.ui_assets for all
  using (public.is_admin())
  with check (public.is_admin());

-- Explicit Schema & Table Privileges
grant usage on schema public to anon, authenticated, service_role;
grant select on public.asset_categories, public.ui_assets to anon, authenticated;
grant all on public.asset_categories, public.ui_assets to authenticated;
grant all on public.asset_categories, public.ui_assets to service_role;
