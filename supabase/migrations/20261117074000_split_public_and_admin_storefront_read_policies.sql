-- Public visitors can read only active, currently scheduled storefront content.
-- Authenticated admins retain access to inactive/future content through the private admin check.
drop policy if exists "Public can read active brands" on public.brands;
create policy "Anon can read active brands" on public.brands for select to anon using (is_active = true);
create policy "Authenticated can read active brands or admin content" on public.brands for select to authenticated using (is_active = true or (select private.is_admin()));

drop policy if exists "Public can read active products" on public.products;
create policy "Anon can read active products" on public.products for select to anon using (is_active = true);
create policy "Authenticated can read active products or admin content" on public.products for select to authenticated using (is_active = true or (select private.is_admin()));

drop policy if exists "Public can read homepage collections" on public.collections;
create policy "Anon can read scheduled homepage collections" on public.collections for select to anon using (
  is_active = true and (starts_at is null or starts_at <= now()) and (ends_at is null or ends_at > now())
);
create policy "Authenticated can read scheduled collections or admin content" on public.collections for select to authenticated using (
  (is_active = true and (starts_at is null or starts_at <= now()) and (ends_at is null or ends_at > now()))
  or (select private.is_admin())
);

drop policy if exists "Public can read scheduled hero slides" on public.hero_slides;
create policy "Anon can read scheduled hero slides" on public.hero_slides for select to anon using (
  is_active = true and (starts_at is null or starts_at <= now()) and (ends_at is null or ends_at > now())
);
create policy "Authenticated can read scheduled hero slides or admin content" on public.hero_slides for select to authenticated using (
  (is_active = true and (starts_at is null or starts_at <= now()) and (ends_at is null or ends_at > now()))
  or (select private.is_admin())
);

drop policy if exists "Public can read collection products" on public.collection_products;
create policy "Anon can read products in scheduled collections" on public.collection_products for select to anon using (
  exists (select 1 from public.collections c where c.id = collection_products.collection_id
    and c.is_active = true and (c.starts_at is null or c.starts_at <= now()) and (c.ends_at is null or c.ends_at > now()))
);
create policy "Authenticated can read collection products or admin content" on public.collection_products for select to authenticated using (
  exists (select 1 from public.collections c where c.id = collection_products.collection_id
    and c.is_active = true and (c.starts_at is null or c.starts_at <= now()) and (c.ends_at is null or c.ends_at > now()))
  or (select private.is_admin())
);
