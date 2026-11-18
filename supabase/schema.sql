-- ISHTILE Supabase baseline schema
-- Applied to project cpgyooelhvaxnzawwdqv on 2026-11-16.
-- This file is the checked-in schema snapshot; no service-role key belongs in the client.

create schema if not exists private;

create table if not exists public.brands (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique,
  name text not null unique,
  description text,
  is_active boolean not null default true,
  sort_order integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.products (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique,
  name text not null,
  brand_id uuid not null references public.brands(id) on delete restrict,
  category text not null,
  price numeric(12,2) not null check (price >= 0),
  image_url text,
  description text,
  sizes text[] not null default '{}',
  colors jsonb not null default '[]'::jsonb,
  stock_quantity integer check (stock_quantity is null or stock_quantity >= 0),
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.customer_profiles (
  id uuid primary key default gen_random_uuid(),
  full_name text not null check (char_length(trim(full_name)) between 2 and 120),
  mobile_number text not null unique check (char_length(trim(mobile_number)) between 8 and 20),
  delivery_address text not null check (char_length(trim(delivery_address)) between 6 and 500),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.admin_users (
  user_id uuid primary key references auth.users(id) on delete cascade,
  created_at timestamptz not null default now()
);

create table if not exists public.orders (
  id uuid primary key default gen_random_uuid(),
  order_number text not null unique,
  customer_name text not null,
  customer_phone text not null,
  customer_email text not null,
  shipping_address text not null,
  shipping_city text not null,
  shipping_postal text not null,
  payment_method text not null,
  payment_status text not null default 'pending'
    check (payment_status in ('pending','paid','failed','refunded')),
  fulfillment_status text not null default 'new'
    check (fulfillment_status in ('new','confirmed','processing','shipped','delivered','cancelled','returned')),
  subtotal numeric(12,2) not null check (subtotal >= 0),
  shipping_fee numeric(12,2) not null default 0 check (shipping_fee >= 0),
  total numeric(12,2) not null check (total >= 0),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.order_items (
  id uuid primary key default gen_random_uuid(),
  order_id uuid not null references public.orders(id) on delete cascade,
  product_id uuid references public.products(id) on delete set null,
  product_name text not null,
  brand_name text not null,
  unit_price numeric(12,2) not null check (unit_price >= 0),
  quantity integer not null check (quantity > 0),
  size text,
  color text,
  line_total numeric(12,2) not null check (line_total >= 0),
  created_at timestamptz not null default now()
);

create index if not exists products_brand_id_idx on public.products(brand_id);
create index if not exists orders_created_at_idx on public.orders(created_at desc);
create index if not exists orders_status_idx on public.orders(fulfillment_status, payment_status);
create index if not exists order_items_order_id_idx on public.order_items(order_id);
create index if not exists order_items_brand_name_idx on public.order_items(brand_name);

create or replace function private.is_admin()
returns boolean language sql stable security definer set search_path = ''
as $$
  select exists (
    select 1 from public.admin_users au
    where au.user_id = (select auth.uid())
  );
$$;
revoke all on function private.is_admin() from public;
grant usage on schema private to authenticated;
grant execute on function private.is_admin() to authenticated;

alter table public.brands enable row level security;
alter table public.products enable row level security;
alter table public.admin_users enable row level security;
alter table public.customer_profiles enable row level security;
alter table public.orders enable row level security;
alter table public.order_items enable row level security;

drop policy if exists "Public can read active brands" on public.brands;
create policy "Public can read active brands" on public.brands
for select to anon, authenticated using (is_active or (select private.is_admin()));
drop policy if exists "Admins manage brands" on public.brands;
create policy "Admins manage brands" on public.brands
for all to authenticated using ((select private.is_admin())) with check ((select private.is_admin()));

drop policy if exists "Public can read active products" on public.products;
create policy "Public can read active products" on public.products
for select to anon, authenticated using (is_active or (select private.is_admin()));
drop policy if exists "Admins manage products" on public.products;
create policy "Admins manage products" on public.products
for all to authenticated using ((select private.is_admin())) with check ((select private.is_admin()));

drop policy if exists "Anyone can create a customer profile" on public.customer_profiles;
create policy "Anyone can create a customer profile" on public.customer_profiles
for insert to anon, authenticated with check (true);
drop policy if exists "Admins can view customer profiles" on public.customer_profiles;
create policy "Admins can view customer profiles" on public.customer_profiles
for select to authenticated using ((select private.is_admin()));

drop policy if exists "Admins can read own admin record" on public.admin_users;
create policy "Admins can read own admin record" on public.admin_users
for select to authenticated using (user_id = (select auth.uid()) or (select private.is_admin()));
drop policy if exists "Admins manage admin records" on public.admin_users;
create policy "Admins manage admin records" on public.admin_users
for all to authenticated using ((select private.is_admin())) with check ((select private.is_admin()));

drop policy if exists "Admins manage orders" on public.orders;
create policy "Admins manage orders" on public.orders
for all to authenticated using ((select private.is_admin())) with check ((select private.is_admin()));
drop policy if exists "Admins manage order items" on public.order_items;
create policy "Admins manage order items" on public.order_items
for all to authenticated using ((select private.is_admin())) with check ((select private.is_admin()));

grant select on public.brands, public.products to anon, authenticated;
revoke all on table public.customer_profiles from public, anon, authenticated;
grant insert on table public.customer_profiles to anon, authenticated;
grant select on table public.customer_profiles to authenticated;
grant select, insert, update, delete on public.brands, public.products, public.admin_users, public.orders, public.order_items to authenticated;

insert into public.brands (slug, name, description, sort_order) values
  ('ishtile','ISHTILE','The house label.',1),
  ('onen-plus','ONEN+','Contemporary essentials and outerwear.',2),
  ('farak','FARAK','Independent womenswear label.',3),
  ('mocha-plus','MOCHA+','Modern traditional wear.',4),
  ('pilgrim','PILGRIM','Accessories and considered essentials.',5)
on conflict (slug) do update set name=excluded.name, description=excluded.description, sort_order=excluded.sort_order;

-- Product seed values mirror src/lib/catalog.ts. Stock is deliberately NULL until counted.
insert into public.products (slug,name,brand_id,category,price,description,sizes,colors)
select v.slug,v.name,b.id,v.category,v.price,v.description,v.sizes,v.colors::jsonb
from (values
('essentials-tee','ISHTILE Essentials Tee','ishtile','Men',2490,'Heavyweight cotton tee with a clean chest print.',array['S','M','L','XL','XXL'],'[{"name":"Black","hex":"#141414"},{"name":"Off White","hex":"#EFE9DE"},{"name":"Beige","hex":"#D8CBB4"},{"name":"Olive","hex":"#6C7049"}]'),
('essentials-shirt','ISHTILE Essentials Shirt','ishtile','Men',2990,'Crisp cotton shirt, cut to be worn open or buttoned.',array['S','M','L','XL','XXL'],'[{"name":"Off White","hex":"#EFE9DE"},{"name":"Black","hex":"#141414"},{"name":"Navy","hex":"#20293F"}]'),
('polo','ISHTILE Polo','ishtile','Men',2990,'Piqué polo with a structured collar.',array['S','M','L','XL','XXL'],'[{"name":"Black","hex":"#141414"},{"name":"Off White","hex":"#EFE9DE"},{"name":"Navy","hex":"#20293F"},{"name":"Olive","hex":"#6C7049"}]'),
('check-shirt','ISHTILE Check Shirt','ishtile','Men',2990,'Brushed flannel check with a double chest pocket.',array['S','M','L','XL','XXL'],'[{"name":"Black","hex":"#141414"},{"name":"Rust","hex":"#9C4A2F"},{"name":"Beige","hex":"#D8CBB4"}]'),
('sports-tee','ISHTILE Sports Tee','ishtile','Men',1990,'Lightweight performance tee that moves with you.',array['S','M','L','XL','XXL'],'[{"name":"Black","hex":"#141414"},{"name":"Off White","hex":"#EFE9DE"},{"name":"Lime","hex":"#CFF23A"}]'),
('basic-tee','ISHTILE Basic Tee','ishtile','Men',1490,'Soft-washed cotton, no print.',array['S','M','L','XL','XXL'],'[{"name":"Black","hex":"#141414"},{"name":"Off White","hex":"#EFE9DE"},{"name":"Beige","hex":"#D8CBB4"},{"name":"Navy","hex":"#20293F"},{"name":"Olive","hex":"#6C7049"},{"name":"Rust","hex":"#9C4A2F"}]'),
('hoodie','ISHTILE Hoodie','ishtile','Men',3490,'Brushed-back fleece hoodie with a double-layer hood.',array['S','M','L','XL','XXL'],'[{"name":"Black","hex":"#141414"},{"name":"Beige","hex":"#D8CBB4"},{"name":"Olive","hex":"#6C7049"},{"name":"Lilac","hex":"#C9BBE0"}]'),
('logo-tee','ISHTILE Logo Tee','ishtile','Men',1990,'Statement chest print on the house weight.',array['S','M','L','XL','XXL'],'[{"name":"Black","hex":"#141414"},{"name":"Off White","hex":"#EFE9DE"}]'),
('overshirt','ISHTILE Overshirt','ishtile','Men',3990,'A shirt-jacket in heavy twill.',array['S','M','L','XL','XXL'],'[{"name":"Black","hex":"#141414"},{"name":"Olive","hex":"#6C7049"},{"name":"Navy","hex":"#20293F"}]'),
('linen-shirt','ISHTILE Linen Shirt','ishtile','Men',3490,'Pure linen, cut loose for warm weather.',array['S','M','L','XL','XXL'],'[{"name":"Off White","hex":"#EFE9DE"},{"name":"Beige","hex":"#D8CBB4"},{"name":"Lilac","hex":"#C9BBE0"}]'),
('cargo-pants','ISHTILE Cargo Pants','ishtile','Men',3990,'Six-pocket ripstop cargo with an adjustable hem.',array['S','M','L','XL','XXL'],'[{"name":"Black","hex":"#141414"},{"name":"Olive","hex":"#6C7049"},{"name":"Beige","hex":"#D8CBB4"}]'),
('shorts','ISHTILE Shorts','ishtile','Men',1990,'Washed cotton short with a drawcord waist.',array['S','M','L','XL','XXL'],'[{"name":"Black","hex":"#141414"},{"name":"Beige","hex":"#D8CBB4"},{"name":"Olive","hex":"#6C7049"},{"name":"Navy","hex":"#20293F"}]'),
('farak-slip-dress','FARAK Slip Dress','farak','Women',4990,'Bias-cut slip in FARAK signature drape.',array['S','M','L','XL','XXL'],'[{"name":"Black","hex":"#141414"},{"name":"Lilac","hex":"#C9BBE0"},{"name":"Rust","hex":"#9C4A2F"}]'),
('mocha-kurta','MOCHA+ Kurta','mocha-plus','Traditional',3790,'Everyday kurta in handloom cotton.',array['S','M','L','XL','XXL'],'[{"name":"Off White","hex":"#EFE9DE"},{"name":"Beige","hex":"#D8CBB4"},{"name":"Olive","hex":"#6C7049"}]'),
('onen-jacket','ONEN+ Trainer Jacket','onen-plus','Men',5490,'Structured trainer jacket in neoprene-backed cotton.',array['S','M','L','XL','XXL'],'[{"name":"Black","hex":"#141414"},{"name":"Navy","hex":"#20293F"}]'),
('paisley-shawl','PILGRIM Paisley Shawl','pilgrim','Accessories',2690,'Oversized paisley shawl with a brushed wool blend.',array['One Size'],'[{"name":"Rust","hex":"#9C4A2F"},{"name":"Black","hex":"#141414"},{"name":"Beige","hex":"#D8CBB4"}]')
) as v(slug,name,brand_slug,category,price,description,sizes,colors)
join public.brands b on b.slug=v.brand_slug
on conflict (slug) do update set name=excluded.name,brand_id=excluded.brand_id,category=excluded.category,
price=excluded.price,description=excluded.description,sizes=excluded.sizes,colors=excluded.colors,updated_at=now();


-- Admin workspace additions (also tracked as timestamped migrations).
alter table public.brands
  add column if not exists logo_url text,
  add column if not exists image_url text,
  add column if not exists website_url text,
  add column if not exists instagram_url text,
  add column if not exists facebook_url text,
  add column if not exists contact_email text,
  add column if not exists contact_phone text,
  add column if not exists contact_address text,
  add column if not exists motto text,
  add column if not exists social_links jsonb not null default '{}'::jsonb;

alter table public.products
  add column if not exists sku text,
  add column if not exists image_urls text[] not null default '{}';
create unique index if not exists products_sku_unique_idx
  on public.products (lower(sku)) where sku is not null and trim(sku) <> '';

create table if not exists public.hero_slides (
  id uuid primary key default gen_random_uuid(), title text, subtitle text, image_url text not null,
  mobile_image_url text, link_url text, sort_order integer not null default 0,
  is_active boolean not null default true, starts_at timestamptz, ends_at timestamptz,
  created_at timestamptz not null default now(), updated_at timestamptz not null default now(),
  constraint hero_schedule_valid check (ends_at is null or starts_at is null or ends_at > starts_at)
);
create table if not exists public.collections (
  id uuid primary key default gen_random_uuid(), slug text not null unique, title text not null,
  description text, image_url text, campaign_label text, show_homepage boolean not null default false,
  is_active boolean not null default true, starts_at timestamptz, ends_at timestamptz,
  sort_order integer not null default 0, created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint collection_schedule_valid check (ends_at is null or starts_at is null or ends_at > starts_at)
);
create table if not exists public.collection_products (
  collection_id uuid not null references public.collections(id) on delete cascade,
  product_id uuid not null references public.products(id) on delete cascade,
  sort_order integer not null default 0, primary key (collection_id, product_id)
);
create table if not exists public.site_brand_info (
  id integer primary key default 1 check (id = 1), social_links jsonb not null default '{}'::jsonb,
  contact_numbers text[] not null default '{}', address text, motto text, about_text text,
  logo_url text, symbol_url text,
  homepage_editorial_image_url text, homepage_summer_image_url text,
  editorial_fashion_image_url text, editorial_art_image_url text, stores_image_url text,
  footer_building_image_url text, footer_band_image_url text,
  hero_autoplay_ms integer not null default 5000
    check (hero_autoplay_ms between 1000 and 15000),
  updated_at timestamptz not null default now()
);
insert into public.site_brand_info (id) values (1) on conflict (id) do nothing;

alter table public.hero_slides enable row level security;
alter table public.collections enable row level security;
alter table public.collection_products enable row level security;
alter table public.site_brand_info enable row level security;

drop policy if exists "Public can read scheduled hero slides" on public.hero_slides;
create policy "Public can read scheduled hero slides" on public.hero_slides for select to anon, authenticated
using ((is_active and (starts_at is null or starts_at <= now()) and (ends_at is null or ends_at > now())) or (select private.is_admin()));
drop policy if exists "Admins manage hero slides" on public.hero_slides;
create policy "Admins manage hero slides" on public.hero_slides for all to authenticated
using ((select private.is_admin())) with check ((select private.is_admin()));
drop policy if exists "Public can read homepage collections" on public.collections;
create policy "Public can read homepage collections" on public.collections for select to anon, authenticated
using ((is_active and (starts_at is null or starts_at <= now()) and (ends_at is null or ends_at > now())) or (select private.is_admin()));
drop policy if exists "Admins manage collections" on public.collections;
create policy "Admins manage collections" on public.collections for all to authenticated
using ((select private.is_admin())) with check ((select private.is_admin()));
drop policy if exists "Public can read collection products" on public.collection_products;
create policy "Public can read collection products" on public.collection_products for select to anon, authenticated
using (exists (select 1 from public.collections c where c.id = collection_id and c.is_active
  and (c.starts_at is null or c.starts_at <= now()) and (c.ends_at is null or c.ends_at > now()))
  or (select private.is_admin()));
drop policy if exists "Admins manage collection products" on public.collection_products;
create policy "Admins manage collection products" on public.collection_products for all to authenticated
using ((select private.is_admin())) with check ((select private.is_admin()));
drop policy if exists "Public can read site brand info" on public.site_brand_info;
create policy "Public can read site brand info" on public.site_brand_info for select to anon, authenticated using (true);
drop policy if exists "Admins manage site brand info" on public.site_brand_info;
create policy "Admins manage site brand info" on public.site_brand_info for all to authenticated
using ((select private.is_admin())) with check ((select private.is_admin()));

drop policy if exists "Admins can update customer profiles" on public.customer_profiles;
create policy "Admins can update customer profiles" on public.customer_profiles for update to authenticated
using ((select private.is_admin())) with check ((select private.is_admin()));
drop policy if exists "Admins can delete customer profiles" on public.customer_profiles;
create policy "Admins can delete customer profiles" on public.customer_profiles for delete to authenticated
using ((select private.is_admin()));

grant select on public.hero_slides, public.collections, public.collection_products, public.site_brand_info to anon, authenticated;
grant insert, update, delete on public.hero_slides, public.collections, public.collection_products, public.site_brand_info to authenticated;
grant select, insert, update, delete on public.customer_profiles to authenticated;
grant select, insert, update, delete on public.brands, public.products to authenticated;

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values ('ishtile-media', 'ishtile-media', true, 12582912, array['image/jpeg','image/png','image/webp','image/avif','image/svg+xml'])
on conflict (id) do update set public = true, file_size_limit = excluded.file_size_limit, allowed_mime_types = excluded.allowed_mime_types;
drop policy if exists "Public can view ISHTILE media" on storage.objects;
create policy "Public can view ISHTILE media" on storage.objects for select to anon, authenticated using (bucket_id = 'ishtile-media');
drop policy if exists "Admins upload ISHTILE media" on storage.objects;
create policy "Admins upload ISHTILE media" on storage.objects for insert to authenticated
with check (bucket_id = 'ishtile-media' and (select private.is_admin()));
drop policy if exists "Admins update ISHTILE media" on storage.objects;
create policy "Admins update ISHTILE media" on storage.objects for update to authenticated
using (bucket_id = 'ishtile-media' and (select private.is_admin()))
with check (bucket_id = 'ishtile-media' and (select private.is_admin()));
drop policy if exists "Admins delete ISHTILE media" on storage.objects;
create policy "Admins delete ISHTILE media" on storage.objects for delete to authenticated
using (bucket_id = 'ishtile-media' and (select private.is_admin()));

-- Public API grants: keep admin-only brand contacts and internal product fields private.
-- Keep private brand contact details and internal product fields out of the public Data API.
revoke select on public.brands from anon;
grant select (id, slug, name, description, is_active, sort_order, logo_url, image_url, website_url, instagram_url, facebook_url, motto, social_links)
on public.brands to anon;

revoke select on public.products from anon;
grant select (id, slug, name, brand_id, category, price, image_url, image_urls, description, sizes, colors, is_active, created_at, updated_at)
on public.products to anon;

-- Speed up reverse lookups when products are removed or collection assignments are queried.
create index if not exists collection_products_product_id_idx on public.collection_products(product_id);

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


-- Persistent checkout order submission and order-management support.
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


-- The public order RPC validates availability using the stock merchandising flag.
grant select (is_out_of_stock) on public.products to anon, authenticated;


-- Keep public order submission separate from admin order management.
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
