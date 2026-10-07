create table if not exists public.customer_profiles (
  user_id uuid primary key references auth.users(id) on delete cascade,
  customer_id text not null unique,
  email text not null,
  updates_opt_in boolean not null default false,
  created_at timestamptz not null default now()
);

alter table public.customer_profiles enable row level security;

revoke all on table public.customer_profiles from anon, authenticated;
grant select on table public.customer_profiles to authenticated;

drop policy if exists "Customers can view their own profile" on public.customer_profiles;
create policy "Customers can view their own profile"
  on public.customer_profiles for select
  to authenticated
  using ((select auth.uid()) = user_id);

create or replace function public.create_customer_profile()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  insert into public.customer_profiles (user_id, customer_id, email, updates_opt_in)
  values (
    new.id,
    'NG-' || upper(substr(replace(gen_random_uuid()::text, '-', ''), 1, 10)),
    coalesce(new.email, ''),
    coalesce(new.raw_user_meta_data ->> 'updates_opt_in', 'false') = 'true'
  );
  return new;
end;
$$;

drop trigger if exists create_customer_profile_after_signup on auth.users;
create trigger create_customer_profile_after_signup
  after insert on auth.users
  for each row execute function public.create_customer_profile();

create or replace function public.set_customer_updates_opt_in(enabled boolean)
returns boolean
language plpgsql
security definer
set search_path = ''
as $$
declare
  updated_count integer;
begin
  update public.customer_profiles
  set updates_opt_in = enabled
  where user_id = (select auth.uid());

  get diagnostics updated_count = row_count;
  return updated_count = 1;
end;
$$;

revoke all on function public.set_customer_updates_opt_in(boolean) from public, anon;
grant execute on function public.set_customer_updates_opt_in(boolean) to authenticated;
