alter table public.customer_profiles
  add column if not exists user_id uuid references auth.users(id) on delete cascade,
  add column if not exists email text,
  add column if not exists username text;

create unique index if not exists customer_profiles_user_id_uidx
  on public.customer_profiles(user_id) where user_id is not null;
create unique index if not exists customer_profiles_email_lower_uidx
  on public.customer_profiles(lower(email)) where email is not null;
create unique index if not exists customer_profiles_username_lower_uidx
  on public.customer_profiles(lower(username)) where username is not null;

alter table public.customer_profiles
  add constraint customer_profiles_username_format_check
  check (username is null or username ~ '^[a-zA-Z0-9_]{3,24}$');

drop policy if exists "Anyone can create a customer profile" on public.customer_profiles;

create policy "Customers can view own profile"
  on public.customer_profiles for select to authenticated
  using ((select auth.uid()) = user_id);

create policy "Customers can update own profile"
  on public.customer_profiles for update to authenticated
  using ((select auth.uid()) = user_id)
  with check ((select auth.uid()) = user_id);

grant select, update on public.customer_profiles to authenticated;
revoke insert on public.customer_profiles from anon, authenticated;

create or replace function public.handle_new_customer_auth_user()
returns trigger
language plpgsql
security definer
set search_path = public, pg_temp
as $$
declare
  profile_name text;
  profile_phone text;
  profile_address text;
  profile_username text;
begin
  profile_name := nullif(trim(new.raw_user_meta_data ->> 'full_name'), '');
  profile_phone := nullif(trim(new.raw_user_meta_data ->> 'mobile_number'), '');
  profile_address := nullif(trim(new.raw_user_meta_data ->> 'delivery_address'), '');
  profile_username := nullif(lower(trim(new.raw_user_meta_data ->> 'username')), '');

  if profile_name is null or profile_phone is null or profile_address is null or profile_username is null or new.email is null then
    raise exception 'Customer registration details are incomplete';
  end if;

  insert into public.customer_profiles (user_id, full_name, mobile_number, delivery_address, email, username)
  values (new.id, profile_name, profile_phone, profile_address, lower(trim(new.email)), profile_username);

  return new;
end;
$$;

drop trigger if exists on_auth_user_created_customer_profile on auth.users;
create trigger on_auth_user_created_customer_profile
  after insert on auth.users
  for each row execute function public.handle_new_customer_auth_user();

revoke all on function public.handle_new_customer_auth_user() from public, anon, authenticated;
