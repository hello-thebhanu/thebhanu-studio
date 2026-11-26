-- THE BHANU — Phase 7: Complete Backend & Database Infrastructure
-- Extends Profiles, adds Projects, Project Updates, Project Files, RLS, and Storage Buckets

-- 1. Extend Profiles for Customer Records
alter table public.profiles
  add column if not exists full_name text not null default '',
  add column if not exists company text not null default '',
  add column if not exists phone text not null default '',
  add column if not exists admin_notes text not null default '';

-- 2. Projects Table (Lifecycle aligned with Phase 8)
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

-- 3. Project Updates & Communication History
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

-- 4. Project Files & Deliverables Metadata
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

-- 5. Ownership Helper Function for RLS
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

-- 6. Row Level Security (RLS)
alter table public.projects enable row level security;
alter table public.project_updates enable row level security;
alter table public.project_files enable row level security;

-- Projects policies
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
  on public.projects for all
  using (public.is_admin())
  with check (public.is_admin());

-- Project Updates policies
drop policy if exists "Customers can view non-internal project updates" on public.project_updates;
create policy "Customers can view non-internal project updates"
  on public.project_updates for select
  using (
    public.is_admin()
    or (is_internal = false and public.is_project_owner(project_id))
  );

drop policy if exists "Customers can post project messages" on public.project_updates;
create policy "Customers can post project messages"
  on public.project_updates for insert
  with check (
    public.is_admin()
    or (
      is_internal = false
      and author_role = 'customer'
      and author_id = auth.uid()
      and public.is_project_owner(project_id)
    )
  );

drop policy if exists "Admins can manage project updates" on public.project_updates;
create policy "Admins can manage project updates"
  on public.project_updates for all
  using (public.is_admin())
  with check (public.is_admin());

-- Project Files policies
drop policy if exists "Customers can view own project files" on public.project_files;
create policy "Customers can view own project files"
  on public.project_files for select
  using (
    public.is_admin()
    or public.is_project_owner(project_id)
  );

drop policy if exists "Customers can upload own project files" on public.project_files;
create policy "Customers can upload own project files"
  on public.project_files for insert
  with check (
    public.is_admin()
    or (
      is_deliverable = false
      and uploaded_by = auth.uid()
      and public.is_project_owner(project_id)
    )
  );

drop policy if exists "Admins can manage project files" on public.project_files;
create policy "Admins can manage project files"
  on public.project_files for all
  using (public.is_admin())
  with check (public.is_admin());

-- 7. Storage Buckets & Policies
insert into storage.buckets (id, name, public, file_size_limit)
values
  ('ui-assets', 'ui-assets', true, 10485760),
  ('project-files', 'project-files', false, 26214400)
on conflict (id) do update
set
  public = excluded.public,
  file_size_limit = excluded.file_size_limit;

-- ui-assets storage policies
drop policy if exists "Public can view ui assets files" on storage.objects;
create policy "Public can view ui assets files"
  on storage.objects for select
  using (bucket_id = 'ui-assets');

drop policy if exists "Admins can manage ui assets files" on storage.objects;
create policy "Admins can manage ui assets files"
  on storage.objects for all
  using (bucket_id = 'ui-assets' and public.is_admin())
  with check (bucket_id = 'ui-assets' and public.is_admin());

-- project-files private storage policies
drop policy if exists "Admins can manage all project files storage" on storage.objects;
create policy "Admins can manage all project files storage"
  on storage.objects for all
  using (bucket_id = 'project-files' and public.is_admin())
  with check (bucket_id = 'project-files' and public.is_admin());

-- 8. Explicit Grants
grant usage on schema public to anon, authenticated, service_role;
grant all on public.projects, public.project_updates, public.project_files to authenticated;
grant all on public.projects, public.project_updates, public.project_files to service_role;
