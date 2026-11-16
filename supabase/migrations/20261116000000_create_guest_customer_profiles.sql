create table if not exists public.customer_profiles (
  id uuid primary key default gen_random_uuid(),
  full_name text not null check (char_length(trim(full_name)) between 2 and 120),
  mobile_number text not null unique check (char_length(trim(mobile_number)) between 8 and 20),
  delivery_address text not null check (char_length(trim(delivery_address)) between 6 and 500),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists customer_profiles_created_at_idx
  on public.customer_profiles (created_at desc);

alter table public.customer_profiles enable row level security;

create policy "Anyone can create a customer profile"
  on public.customer_profiles for insert to anon, authenticated
  with check (true);

create policy "Admins can view customer profiles"
  on public.customer_profiles for select to authenticated
  using ((select private.is_admin()));

grant insert on public.customer_profiles to anon, authenticated;
grant select on public.customer_profiles to authenticated;