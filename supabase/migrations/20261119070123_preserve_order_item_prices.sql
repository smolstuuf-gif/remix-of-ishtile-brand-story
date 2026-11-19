create or replace function public.admin_update_store_order(
  p_order_id uuid,
  p_order jsonb,
  p_items jsonb
)
returns void
language plpgsql
security invoker
set search_path = public, pg_temp
as $$
declare
  v_item jsonb;
  v_product record;
  v_qty integer;
  v_unit_price numeric(12,2);
  v_subtotal numeric(12,2) := 0;
  v_shipping numeric(12,2);
begin
  if not coalesce(private.is_admin(), false) then raise exception 'Administrator access required.' using errcode = '42501'; end if;
  if jsonb_typeof(p_items) <> 'array' then raise exception 'Order items must be a list.' using errcode = '22023'; end if;
  if length(trim(coalesce(p_order->>'customer_name',''))) < 2 or length(trim(coalesce(p_order->>'customer_phone',''))) < 8 or length(trim(coalesce(p_order->>'shipping_address',''))) < 6 then raise exception 'Customer name, mobile and delivery address are required.' using errcode = '22023'; end if;
  if coalesce(p_order->>'payment_method','') not in ('bKash','Nagad','Card Payment','Cash on Delivery') then raise exception 'Invalid payment method.' using errcode = '22023'; end if;
  if coalesce(p_order->>'payment_status','') not in ('pending','paid','failed','refunded') then raise exception 'Invalid payment status.' using errcode = '22023'; end if;
  if coalesce(p_order->>'fulfillment_status','') not in ('new','confirmed','processing','shipped','delivered','cancelled','returned') then raise exception 'Invalid fulfilment status.' using errcode = '22023'; end if;
  for v_item in select value from jsonb_array_elements(p_items) loop
    v_qty := (v_item->>'quantity')::integer; v_unit_price := (v_item->>'unit_price')::numeric;
    if v_qty < 1 or v_qty > 99 or v_unit_price < 0 then raise exception 'Invalid order item quantity or price.' using errcode = '22023'; end if;
    select p.id,p.name,b.name as brand_name into v_product from public.products p join public.brands b on b.id=p.brand_id where p.id=(v_item->>'product_id')::uuid limit 1;
    if not found then raise exception 'A selected product no longer exists.' using errcode = '22023'; end if;
    v_subtotal := v_subtotal + v_unit_price * v_qty;
  end loop;
  v_shipping := greatest(0, coalesce((p_order->>'shipping_fee')::numeric,0));
  update public.orders set customer_name=trim(p_order->>'customer_name'),customer_phone=trim(p_order->>'customer_phone'),customer_email=nullif(trim(coalesce(p_order->>'customer_email','')),''),shipping_address=trim(p_order->>'shipping_address'),shipping_city=nullif(trim(coalesce(p_order->>'shipping_city','')),''),shipping_postal=nullif(trim(coalesce(p_order->>'shipping_postal','')),''),payment_method=p_order->>'payment_method',payment_status=p_order->>'payment_status',fulfillment_status=p_order->>'fulfillment_status',special_note=nullif(trim(coalesce(p_order->>'special_note','')),''),subtotal=v_subtotal,shipping_fee=v_shipping,total=v_subtotal+v_shipping,updated_at=now() where id=p_order_id;
  if not found then raise exception 'Order not found.' using errcode = 'P0002'; end if;
  delete from public.order_items where order_id=p_order_id;
  for v_item in select value from jsonb_array_elements(p_items) loop
    v_qty := (v_item->>'quantity')::integer; v_unit_price := (v_item->>'unit_price')::numeric;
    select p.id,p.name,b.name as brand_name into v_product from public.products p join public.brands b on b.id=p.brand_id where p.id=(v_item->>'product_id')::uuid limit 1;
    insert into public.order_items(order_id,product_id,product_name,brand_name,season,unit_price,quantity,size,color,line_total)
    values(p_order_id,v_product.id,v_product.name,v_product.brand_name,(select ll.season from public.lookbook_look_products lp join public.lookbook_looks ll on ll.id=lp.look_id where lp.product_id=v_product.id and ll.season is not null order by ll.sort_order asc,ll.created_at desc limit 1),v_unit_price,v_qty,nullif(v_item->>'size',''),nullif(v_item->>'color',''),v_unit_price*v_qty);
  end loop;
end;
$$;