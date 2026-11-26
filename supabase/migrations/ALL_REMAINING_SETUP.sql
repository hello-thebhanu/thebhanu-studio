-- THE BHANU — Combined Setup Script (Phases 5, 6 & Universal User Auth)
-- Safe & idempotent: paste once in Supabase Dashboard -> SQL Editor and click Run.

-- 1. Phase 5: UI Asset Library
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

alter table public.asset_categories enable row level security;
alter table public.ui_assets enable row level security;

drop policy if exists "Public can read asset categories" on public.asset_categories;
create policy "Public can read asset categories"
  on public.asset_categories for select using (true);

drop policy if exists "Admins can manage asset categories" on public.asset_categories;
create policy "Admins can manage asset categories"
  on public.asset_categories for all using (public.is_admin()) with check (public.is_admin());

drop policy if exists "Public can read published ui assets" on public.ui_assets;
create policy "Public can read published ui assets"
  on public.ui_assets for select
  using ((published = true and status <> 'Unavailable') or public.is_admin());

drop policy if exists "Admins can manage ui assets" on public.ui_assets;
create policy "Admins can manage ui assets"
  on public.ui_assets for all using (public.is_admin()) with check (public.is_admin());

-- 2. Phase 6: Custom Studio Enquiries
create table if not exists public.enquiries (
  id uuid primary key default gen_random_uuid(),
  reference_code text not null unique,
  idempotency_key text unique,
  project_type text not null,
  selected_features text[] not null default '{}',
  tech_preferences text[] not null default '{}',
  project_description text not null,
  budget_range text not null,
  expected_timeline text not null,
  customer_name text not null,
  customer_email text not null,
  customer_company text,
  customer_phone text,
  source_product_slug text,
  status text not null default 'New' check (
    status in ('New', 'Reviewing', 'Proposal Sent', 'Accepted', 'Archived')
  ),
  admin_notes text not null default '',
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now())
);

drop trigger if exists trg_enquiries_updated_at on public.enquiries;
create trigger trg_enquiries_updated_at
  before update on public.enquiries
  for each row execute function public.set_updated_at();

create index if not exists idx_enquiries_status_created
  on public.enquiries (status, created_at desc);

alter table public.enquiries enable row level security;

drop policy if exists "Admins can manage enquiries" on public.enquiries;
create policy "Admins can manage enquiries"
  on public.enquiries for all using (public.is_admin()) with check (public.is_admin());

-- 3. Universal User Auth & Profile Auto-Creation
alter table public.profiles
  add column if not exists full_name text not null default '';

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  user_email text;
  user_name text;
begin
  user_email := lower(coalesce(new.email, ''));
  user_name := coalesce(new.raw_user_meta_data ->> 'full_name', '');

  insert into public.profiles (id, email, full_name, role)
  values (
    new.id,
    user_email,
    user_name,
    case when user_email = 'thebhanuofficial@gmail.com' then 'admin' else 'customer' end
  )
  on conflict (id) do update
  set
    email = excluded.email,
    full_name = case when excluded.full_name <> '' then excluded.full_name else public.profiles.full_name end;

  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

drop policy if exists "Customers can view own enquiries" on public.enquiries;
create policy "Customers can view own enquiries"
  on public.enquiries for select
  using (
    lower(customer_email) = lower(coalesce(auth.jwt() ->> 'email', ''))
    or public.is_admin()
  );

-- 4. Phase 7: Projects, Updates, Project Files & Private Storage
alter table public.profiles
  add column if not exists company text not null default '',
  add column if not exists phone text not null default '',
  add column if not exists admin_notes text not null default '';

create table if not exists public.projects (
  id uuid primary key default gen_random_uuid(),
  project_code text not null unique,
  title text not null,
  description text not null default '',
  project_type text not null default 'Custom Software',
  customer_id uuid references public.profiles(id) on delete set null,
  customer_email text not null,
  enquiry_id uuid references public.enquiries(id) on delete set null,
  status text not null default 'Enquiry Received' check (
    status in (
      'Enquiry Received',
      'Requirements Review',
      'Proposal / Discussion',
      'Approved',
      'In Progress',
      'Under Review',
      'Completed',
      'Delivered'
    )
  ),
  budget text not null default '',
  timeline text not null default '',
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now())
);

drop trigger if exists trg_projects_updated_at on public.projects;
create trigger trg_projects_updated_at
  before update on public.projects
  for each row execute function public.set_updated_at();

create index if not exists idx_projects_customer on public.projects (customer_id, created_at desc);
create index if not exists idx_projects_email on public.projects (lower(customer_email));
create index if not exists idx_projects_status on public.projects (status, updated_at desc);

create table if not exists public.project_updates (
  id uuid primary key default gen_random_uuid(),
  project_id uuid not null references public.projects(id) on delete cascade,
  author_id uuid references public.profiles(id) on delete set null,
  author_role text not null default 'admin' check (author_role in ('admin', 'customer')),
  title text not null default '',
  message text not null,
  is_internal boolean not null default false,
  created_at timestamptz not null default timezone('utc', now())
);

create index if not exists idx_project_updates_project on public.project_updates (project_id, created_at desc);

create table if not exists public.project_files (
  id uuid primary key default gen_random_uuid(),
  project_id uuid not null references public.projects(id) on delete cascade,
  uploaded_by uuid references public.profiles(id) on delete set null,
  file_name text not null,
  storage_path text not null unique,
  mime_type text not null default 'application/octet-stream',
  file_size bigint not null default 0,
  is_deliverable boolean not null default false,
  created_at timestamptz not null default timezone('utc', now())
);

create index if not exists idx_project_files_project on public.project_files (project_id, created_at desc);

create or replace function public.is_project_owner(target_project_id uuid)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1
    from public.projects p
    where p.id = target_project_id
      and (
        p.customer_id = auth.uid()
        or lower(p.customer_email) = lower(coalesce(auth.jwt() ->> 'email', ''))
      )
  );
$$;

alter table public.projects enable row level security;
alter table public.project_updates enable row level security;
alter table public.project_files enable row level security;

drop policy if exists "Customers can view own projects" on public.projects;
create policy "Customers can view own projects"
  on public.projects for select
  using (
    public.is_admin()
    or customer_id = auth.uid()
    or lower(customer_email) = lower(coalesce(auth.jwt() ->> 'email', ''))
  );

drop policy if exists "Admins can manage projects" on public.projects;
create policy "Admins can manage projects"
  on public.projects for all using (public.is_admin()) with check (public.is_admin());

drop policy if exists "Customers can view non-internal project updates" on public.project_updates;
create policy "Customers can view non-internal project updates"
  on public.project_updates for select
  using (public.is_admin() or (is_internal = false and public.is_project_owner(project_id)));

drop policy if exists "Customers can post project messages" on public.project_updates;
create policy "Customers can post project messages"
  on public.project_updates for insert
  with check (
    public.is_admin()
    or (is_internal = false and author_role = 'customer' and author_id = auth.uid() and public.is_project_owner(project_id))
  );

drop policy if exists "Admins can manage project updates" on public.project_updates;
create policy "Admins can manage project updates"
  on public.project_updates for all using (public.is_admin()) with check (public.is_admin());

drop policy if exists "Customers can view own project files" on public.project_files;
create policy "Customers can view own project files"
  on public.project_files for select
  using (public.is_admin() or public.is_project_owner(project_id));

drop policy if exists "Customers can upload own project files" on public.project_files;
create policy "Customers can upload own project files"
  on public.project_files for insert
  with check (
    public.is_admin()
    or (is_deliverable = false and uploaded_by = auth.uid() and public.is_project_owner(project_id))
  );

drop policy if exists "Admins can manage project files" on public.project_files;
create policy "Admins can manage project files"
  on public.project_files for all using (public.is_admin()) with check (public.is_admin());

insert into storage.buckets (id, name, public, file_size_limit)
values
  ('ui-assets', 'ui-assets', true, 10485760),
  ('project-files', 'project-files', false, 26214400)
on conflict (id) do update
set public = excluded.public, file_size_limit = excluded.file_size_limit;

drop policy if exists "Public can view ui assets files" on storage.objects;
create policy "Public can view ui assets files"
  on storage.objects for select using (bucket_id = 'ui-assets');

drop policy if exists "Admins can manage ui assets files" on storage.objects;
create policy "Admins can manage ui assets files"
  on storage.objects for all
  using (bucket_id = 'ui-assets' and public.is_admin())
  with check (bucket_id = 'ui-assets' and public.is_admin());

drop policy if exists "Admins can manage all project files storage" on storage.objects;
create policy "Admins can manage all project files storage"
  on storage.objects for all
  using (bucket_id = 'project-files' and public.is_admin())
  with check (bucket_id = 'project-files' and public.is_admin());

-- 5. Explicit Grants
grant usage on schema public to anon, authenticated, service_role;
grant select on public.asset_categories, public.ui_assets to anon, authenticated;
grant all on public.asset_categories, public.ui_assets, public.enquiries, public.projects, public.project_updates, public.project_files to authenticated;
grant all on public.asset_categories, public.ui_assets, public.enquiries, public.projects, public.project_updates, public.project_files to service_role;
