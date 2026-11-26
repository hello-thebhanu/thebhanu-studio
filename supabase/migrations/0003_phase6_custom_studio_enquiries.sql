-- THE BHANU — Phase 6: Custom Studio & Project Enquiries Schema

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

-- Strictly protect customer PII: only authenticated admins can read/update/delete
drop policy if exists "Admins can manage enquiries" on public.enquiries;
create policy "Admins can manage enquiries"
  on public.enquiries for all
  using (public.is_admin())
  with check (public.is_admin());

grant usage on schema public to authenticated, service_role;
grant all on public.enquiries to authenticated;
grant all on public.enquiries to service_role;
