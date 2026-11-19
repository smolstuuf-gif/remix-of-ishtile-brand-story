-- Assign unique, readable product codes and allow admins to create orders from the order desk.
update public.products
set sku = 'ISH-' || upper(replace(slug, '-', ''))
where sku is null or btrim(sku) = '';

create unique index if not exists products_sku_unique_ci_idx
on public.products (lower(btrim(sku)))
where sku is not null and btrim(sku) <> '';

create or replace function public.admin_create_store_order(p_order jsonb, p_items jsonb)
returns jsonb
language plpgsql
set search_path = ''
as $$
declare
  v_order_id uuid := gen_random_uuid();
  v_order_number text;
  v_created_at timestamptz := now();
  v_item jsonb;
  v_product record;
  v_qty integer;
  v_unit_price numeric(12,2);
  v_subtotal numeric(12,2) := 0;
  v_shipping numeric(12,2);
begin
  if not coalesce(private.is_admin(), false) then
    raise exception 'Administrator access required.' using errcode = '42501';
  end if;
  if jsonb_typeof(p_items) <> 'array' or jsonb_array_length(p_items) = 0 then
    raise exception 'An order must contain at least one product.' using errcode = '22023';
  end if;
  if length(trim(coalesce(p_order->>'customer_name',''))) < 2
     or length(trim(coalesce(p_order->>'customer_phone',''))) < 8
     or length(trim(coalesce(p_order->>'shipping_address',''))) < 6 then
    raise exception 'Customer name, mobile and delivery address are required.' using errcode = '22023';
  end if;
  if coalesce(p_order->>'payment_method','') not in ('bKash','Nagad','Card Payment','Cash on Delivery') then
    raise exception 'Invalid payment method.' using errcode = '22023';
  end if;
  if coalesce(p_order->>'payment_status','pending') not in ('pending','paid','failed','refunded') then
    raise exception 'Invalid payment status.' using errcode = '22023';
  end if;
  if coalesce(p_order->>'fulfillment_status','new') not in ('new','confirmed','processing','shipped','delivered','cancelled','returned') then
    raise exception 'Invalid fulfilment status.' using errcode = '22023';
  end if;

  for v_item in select value from jsonb_array_elements(p_items)
  loop
    v_qty := (v_item->>'quantity')::integer;
    v_unit_price := coalesce((v_item->>'unit_price')::numeric, 0);
    if v_qty < 1 or v_qty > 99 or v_unit_price < 0 then
      raise exception 'Invalid order item quantity or price.' using errcode = '22023';
    end if;
    select p.id, p.name, b.name as brand_name into v_product
    from public.products p join public.brands b on b.id = p.brand_id
    where p.id = (v_item->>'product_id')::uuid and p.is_active limit 1;
    if not found then raise exception 'A selected product is unavailable or no longer exists.' using errcode = '22023'; end if;
    v_subtotal := v_subtotal + v_unit_price * v_qty;
  end loop;

  v_shipping := greatest(0, coalesce((p_order->>'shipping_fee')::numeric, 0));
  v_order_number := '#IS' || to_char(v_created_at at time zone 'Asia/Dhaka','YYMM')
    || upper(substr(replace(gen_random_uuid()::text,'-',''),1,6));

  insert into public.orders (
    id, order_number, customer_name, customer_phone, customer_email, shipping_address,
    shipping_city, shipping_postal, payment_method, payment_status, fulfillment_status,
    subtotal, shipping_fee, total, special_note, created_at, updated_at
  ) values (
    v_order_id, v_order_number, trim(p_order->>'customer_name'), trim(p_order->>'customer_phone'),
    nullif(trim(coalesce(p_order->>'customer_email','')),''),
    trim(p_order->>'shipping_address'), nullif(trim(coalesce(p_order->>'shipping_city','')),''),
    nullif(trim(coalesce(p_order->>'shipping_postal','')),''), p_order->>'payment_method',
    coalesce(p_order->>'payment_status','pending'), coalesce(p_order->>'fulfillment_status','new'),
    v_subtotal, v_shipping, v_subtotal + v_shipping,
    nullif(trim(coalesce(p_order->>'special_note','')),''), v_created_at, v_created_at
  );

  for v_item in select value from jsonb_array_elements(p_items)
  loop
    v_qty := (v_item->>'quantity')::integer;
    v_unit_price := coalesce((v_item->>'unit_price')::numeric, 0);
    select p.id, p.name, b.name as brand_name into v_product
    from public.products p join public.brands b on b.id = p.brand_id
    where p.id = (v_item->>'product_id')::uuid;
    insert into public.order_items (
      order_id, product_id, product_name, brand_name, season, unit_price,
      quantity, size, color, line_total
    ) values (
      v_order_id, v_product.id, v_product.name, v_product.brand_name,
      (select ll.season from public.lookbook_look_products lp
       join public.lookbook_looks ll on ll.id = lp.look_id
       where lp.product_id = v_product.id and ll.season is not null
       order by ll.sort_order asc, ll.created_at desc limit 1),
      v_unit_price, v_qty, nullif(v_item->>'size',''), nullif(v_item->>'color',''),
      v_unit_price * v_qty
    );
  end loop;

  return jsonb_build_object('id', v_order_id, 'order_number', v_order_number,
    'created_at', v_created_at, 'subtotal', v_subtotal, 'shipping_fee', v_shipping,
    'total', v_subtotal + v_shipping);
end;
$$;

revoke all on function public.admin_create_store_order(jsonb, jsonb) from public, anon;
grant execute on function public.admin_create_store_order(jsonb, jsonb) to authenticated;
