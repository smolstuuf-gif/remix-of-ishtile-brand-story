create or replace function public.assign_product_code()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  if new.sku is null or btrim(new.sku) = '' then
    new.sku := 'ISH-' || upper(replace(new.slug, '-', ''));
  else
    new.sku := upper(btrim(new.sku));
  end if;
  return new;
end;
$$;

drop trigger if exists products_assign_product_code on public.products;
create trigger products_assign_product_code
before insert or update of slug, sku on public.products
for each row execute function public.assign_product_code();

revoke all on function public.assign_product_code() from public, anon, authenticated;
