-- Separate admin write policies from public read policies to avoid duplicate SELECT policy evaluation.
drop policy if exists "Admins manage hero slides" on public.hero_slides;
drop policy if exists "Admins insert hero slides" on public.hero_slides;
create policy "Admins insert hero slides" on public.hero_slides for insert to authenticated with check ((select private.is_admin()));
create policy "Admins update hero slides" on public.hero_slides for update to authenticated using ((select private.is_admin())) with check ((select private.is_admin()));
create policy "Admins delete hero slides" on public.hero_slides for delete to authenticated using ((select private.is_admin()));

drop policy if exists "Admins manage collections" on public.collections;
drop policy if exists "Admins insert collections" on public.collections;
create policy "Admins insert collections" on public.collections for insert to authenticated with check ((select private.is_admin()));
create policy "Admins update collections" on public.collections for update to authenticated using ((select private.is_admin())) with check ((select private.is_admin()));
create policy "Admins delete collections" on public.collections for delete to authenticated using ((select private.is_admin()));

drop policy if exists "Admins manage collection products" on public.collection_products;
drop policy if exists "Admins insert collection products" on public.collection_products;
create policy "Admins insert collection products" on public.collection_products for insert to authenticated with check ((select private.is_admin()));
create policy "Admins update collection products" on public.collection_products for update to authenticated using ((select private.is_admin())) with check ((select private.is_admin()));
create policy "Admins delete collection products" on public.collection_products for delete to authenticated using ((select private.is_admin()));

drop policy if exists "Admins manage site brand info" on public.site_brand_info;
drop policy if exists "Admins insert site brand info" on public.site_brand_info;
create policy "Admins insert site brand info" on public.site_brand_info for insert to authenticated with check ((select private.is_admin()));
create policy "Admins update site brand info" on public.site_brand_info for update to authenticated using ((select private.is_admin())) with check ((select private.is_admin()));
create policy "Admins delete site brand info" on public.site_brand_info for delete to authenticated using ((select private.is_admin()));
