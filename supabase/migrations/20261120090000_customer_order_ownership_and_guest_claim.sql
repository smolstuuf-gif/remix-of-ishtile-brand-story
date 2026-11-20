alter table public.orders add column if not exists user_id uuid references auth.users(id) on delete set null;
create index if not exists orders_user_id_created_at_idx on public.orders(user_id, created_at desc);

drop policy if exists "Customers read own orders" on public.orders;
create policy "Customers read own orders" on public.orders
for select to authenticated using (user_id = (select auth.uid()));

drop policy if exists "Customers read own order items" on public.order_items;
create policy "Customers read own order items" on public.order_items
for select to authenticated using (
  exists (select 1 from public.orders o where o.id = order_items.order_id and o.user_id = (select auth.uid()))
);

create or replace function public.claim_guest_orders_for_verified_phone()
returns integer
language plpgsql
security definer
set search_path = public, auth, pg_temp
as $function$
declare
  v_user_id uuid := auth.uid();
  v_phone text;
  v_digits text;
  v_count integer := 0;
begin
  if v_user_id is null then
    raise exception 'Sign in before claiming previous orders.' using errcode = '28000';
  end if;

  select phone into v_phone
  from auth.users
  where id = v_user_id
    and phone_confirmed_at is not null;

  if v_phone is null then
    raise exception 'Verify your mobile number with the SMS code first.' using errcode = '22023';
  end if;

  v_digits := regexp_replace(v_phone, '\D', '', 'g');
  if length(v_digits) >= 12 and left(v_digits, 3) = '880' then
    v_digits := substring(v_digits from 4);
  end if;
  if left(v_digits, 1) = '0' then
    v_digits := substring(v_digits from 2);
  end if;

  update public.orders
  set user_id = v_user_id, updated_at = now()
  where user_id is null
    and right(regexp_replace(customer_phone, '\D', '', 'g'), 10) = right(v_digits, 10);

  get diagnostics v_count = row_count;
  return v_count;
end;
$function$;

revoke all on function public.claim_guest_orders_for_verified_phone() from public, anon;
grant execute on function public.claim_guest_orders_for_verified_phone() to authenticated;

create or replace function public.submit_store_order(p_customer jsonb, p_items jsonb, p_payment_method text)
returns jsonb
language plpgsql
set search_path to 'public', 'pg_temp'
as $function$
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
  if jsonb_typeof(p_items) <> 'array' or jsonb_array_length(p_items) = 0 then
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
    id, user_id, order_number, customer_name, customer_phone, customer_email,
    shipping_address, shipping_city, shipping_postal, payment_method,
    payment_status, fulfillment_status, subtotal, shipping_fee, total, created_at, updated_at
  ) values (
    v_order_id, auth.uid(), v_order_number, trim(p_customer->>'name'), trim(p_customer->>'phone'),
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
$function$;
