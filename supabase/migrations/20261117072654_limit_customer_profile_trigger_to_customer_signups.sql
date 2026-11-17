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
  -- Only customer self-registration creates a customer profile.
  -- Admin invitations and other Auth users must not be blocked by this trigger.
  if new.raw_user_meta_data ->> 'account_type' is distinct from 'customer' then
    return new;
  end if;

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

revoke all on function public.handle_new_customer_auth_user() from public, anon, authenticated;