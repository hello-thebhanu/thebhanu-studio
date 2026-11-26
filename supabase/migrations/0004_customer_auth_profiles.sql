-- THE BHANU — Universal User Auth & Profile Trigger

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

-- Allow signed-in customers to view their own submitted enquiries
drop policy if exists "Customers can view own enquiries" on public.enquiries;
create policy "Customers can view own enquiries"
  on public.enquiries for select
  using (
    lower(customer_email) = lower(coalesce(auth.jwt() ->> 'email', ''))
    or public.is_admin()
  );
