drop policy if exists "Admins manage orders" on public.orders;
create policy "Admins read orders" on public.orders
  for select to authenticated using ((select private.is_admin()));
create policy "Admins update orders" on public.orders
  for update to authenticated using ((select private.is_admin())) with check ((select private.is_admin()));
create policy "Admins delete orders" on public.orders
  for delete to authenticated using ((select private.is_admin()));

drop policy if exists "Admins manage order items" on public.order_items;
create policy "Admins read order items" on public.order_items
  for select to authenticated using ((select private.is_admin()));
create policy "Admins update order items" on public.order_items
  for update to authenticated using ((select private.is_admin())) with check ((select private.is_admin()));
create policy "Admins delete order items" on public.order_items
  for delete to authenticated using ((select private.is_admin()));

create index if not exists order_items_product_id_idx on public.order_items(product_id);
