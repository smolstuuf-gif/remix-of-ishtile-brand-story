revoke all on table public.customer_profiles from public, anon, authenticated;
grant insert on table public.customer_profiles to anon, authenticated;
grant select on table public.customer_profiles to authenticated;
