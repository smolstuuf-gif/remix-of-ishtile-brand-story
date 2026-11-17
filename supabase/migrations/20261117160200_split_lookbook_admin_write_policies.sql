drop policy if exists "Admins manage lookbook looks" on public.lookbook_looks;
create policy "Admins insert lookbook looks" on public.lookbook_looks for insert to authenticated with check ((select private.is_admin()));
create policy "Admins update lookbook looks" on public.lookbook_looks for update to authenticated using ((select private.is_admin())) with check ((select private.is_admin()));
create policy "Admins delete lookbook looks" on public.lookbook_looks for delete to authenticated using ((select private.is_admin()));
drop policy if exists "Admins manage lookbook look products" on public.lookbook_look_products;
create policy "Admins insert lookbook look products" on public.lookbook_look_products for insert to authenticated with check ((select private.is_admin()));
create policy "Admins update lookbook look products" on public.lookbook_look_products for update to authenticated using ((select private.is_admin())) with check ((select private.is_admin()));
create policy "Admins delete lookbook look products" on public.lookbook_look_products for delete to authenticated using ((select private.is_admin()));