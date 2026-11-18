alter table public.orders
  alter column customer_email drop not null,
  alter column shipping_city drop not null,
  alter column shipping_postal drop not null;

alter table public.order_items
  add column if not exists season text;

create index if not exists order_items_season_idx on public.order_items (season);

drop policy if exists "Public can submit orders" on public.orders;
create policy "Public can submit orders" on public.orders
  for insert to anon, authenticated with check (
    fulfillment_status = 'new' and payment_status = 'pending'
  );

drop policy if exists "Public can submit order items" on public.order_items;
create policy "Public can submit order items" on public.order_items
  for insert to anon, authenticated with check (true);

grant insert on public.orders, public.order_items to anon, authenticated;

create or replace function public.submit_store_order(p_customer jsonb, p_items jsonb, p_payment_method text)
returns jsonb
language plpgsql
security invoker
set search_path = public, pg_temp
as $$
declare
  v_order_id uuid := gen_random_uuid();
  v_order_number text;
  v_created_at timestamptz := now();
  v_subtotal numeric(12,2) := 0;
  v_shipping numeric(12,2);
  v_total numeric(12,2);
  v_item jsonb;
  v_product record;
  v_qty integer;
  v_season text;
begin
  if coalesce(jsonb_typeof(p_items),'') <> 'array' or jsonb_array_length(p_items) = 0 then
    raise exception 'Your bag is empty.' using errcode = '22023';
  end if;
  if length(trim(coalesce(p_customer->>'name',''))) < 2
     or length(trim(coalesce(p_customer->>'phone',''))) < 8
     or length(trim(coalesce(p_customer->>'address',''))) < 6 then
    raise exception 'Name, mobile number and delivery address are required.' using errcode = '22023';
  end if;
  if p_payment_method not in ('bKash','Nagad','Card Payment','Cash on Delivery') then
    raise exception 'Choose a valid payment method.' using errcode = '22023';
  end if;

  for v_item in select value from jsonb_array_elements(p_items)
  loop
    v_qty := (v_item->>'qty')::integer;
    if v_qty < 1 or v_qty > 10 then
      raise exception 'Invalid item quantity.' using errcode = '22023';
    end if;
    select p.id, p.slug, p.name, p.price, p.is_active, p.is_out_of_stock, b.name as brand_name
      into v_product
      from public.products p
      join public.brands b on b.id = p.brand_id
      where p.slug = v_item->>'productId'
      limit 1;
    if not found or not v_product.is_active or v_product.is_out_of_stock then
      raise exception 'A product in your bag is no longer available.' using errcode = '22023';
    end if;
    v_subtotal := v_subtotal + (v_product.price * v_qty);
  end loop;

  v_shipping := case when v_subtotal >= 3000 then 0 else 80 end;
  v_total := v_subtotal + v_shipping;
  v_order_number := '#IS' || to_char(v_created_at at time zone 'Asia/Dhaka','YYMM')
    || upper(substr(replace(gen_random_uuid()::text,'-',''),1,6));

  insert into public.orders (
    id, order_number, customer_name, customer_phone, customer_email,
    shipping_address, shipping_city, shipping_postal, payment_method,
    payment_status, fulfillment_status, subtotal, shipping_fee, total, created_at, updated_at
  ) values (
    v_order_id, v_order_number, trim(p_customer->>'name'), trim(p_customer->>'phone'),
    nullif(trim(coalesce(p_customer->>'email','')),''),
    trim(p_customer->>'address'), nullif(trim(coalesce(p_customer->>'city','')),''),
    nullif(trim(coalesce(p_customer->>'postal','')),''), p_payment_method,
    'pending', 'new', v_subtotal, v_shipping, v_total, v_created_at, v_created_at
  );

  for v_item in select value from jsonb_array_elements(p_items)
  loop
    v_qty := (v_item->>'qty')::integer;
    select p.id, p.name, p.price, b.name as brand_name
      into v_product
      from public.products p
      join public.brands b on b.id = p.brand_id
      where p.slug = v_item->>'productId'
      limit 1;

    select ll.season into v_season
      from public.lookbook_look_products lp
      join public.lookbook_looks ll on ll.id = lp.look_id
      where lp.product_id = v_product.id and ll.season is not null
      order by ll.sort_order asc, ll.created_at desc
      limit 1;

    insert into public.order_items (
      order_id, product_id, product_name, brand_name, season,
      unit_price, quantity, size, color, line_total
    ) values (
      v_order_id, v_product.id, v_product.name, v_product.brand_name, v_season,
      v_product.price, v_qty, nullif(v_item->>'size',''), nullif(v_item->>'color',''),
      v_product.price * v_qty
    );
    v_season := null;
  end loop;

  return jsonb_build_object(
    'id', v_order_id,
    'order_number', v_order_number,
    'created_at', v_created_at,
    'subtotal', v_subtotal,
    'shipping_fee', v_shipping,
    'total', v_total
  );
end;
$$;

revoke all on function public.submit_store_order(jsonb,jsonb,text) from public;
grant execute on function public.submit_store_order(jsonb,jsonb,text) to anon, authenticated;
