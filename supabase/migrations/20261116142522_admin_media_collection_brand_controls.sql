-- ISHTILE admin media, collection, and brand workspace controls.
-- Applied to Supabase project cpgyooelhvaxnzawwdqv on 2026-11-16.

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
  id uuid primary key default gen_random_uuid(),
  title text,
  subtitle text,
  image_url text not null,
  mobile_image_url text,
  link_url text,
  sort_order integer not null default 0,
  is_active boolean not null default true,
  starts_at timestamptz,
  ends_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint hero_schedule_valid check (ends_at is null or starts_at is null or ends_at > starts_at)
);

create table if not exists public.collections (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique,
  title text not null,
  description text,
  image_url text,
  campaign_label text,
  show_homepage boolean not null default false,
  is_active boolean not null default true,
  starts_at timestamptz,
  ends_at timestamptz,
  sort_order integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint collection_schedule_valid check (ends_at is null or starts_at is null or ends_at > starts_at)
);

create table if not exists public.collection_products (
  collection_id uuid not null references public.collections(id) on delete cascade,
  product_id uuid not null references public.products(id) on delete cascade,
  sort_order integer not null default 0,
  primary key (collection_id, product_id)
);

create table if not exists public.site_brand_info (
  id integer primary key default 1 check (id = 1),
  social_links jsonb not null default '{}'::jsonb,
  contact_numbers text[] not null default '{}',
  address text,
  motto text,
  about_text text,
  logo_url text,
  symbol_url text,
  updated_at timestamptz not null default now()
);

insert into public.site_brand_info (id) values (1) on conflict (id) do nothing;

alter table public.hero_slides enable row level security;
alter table public.collections enable row level security;
alter table public.collection_products enable row level security;
alter table public.site_brand_info enable row level security;

drop policy if exists "Public can read scheduled hero slides" on public.hero_slides;
create policy "Public can read scheduled hero slides" on public.hero_slides
for select to anon, authenticated
using ((is_active and (starts_at is null or starts_at <= now()) and (ends_at is null or ends_at > now())) or (select private.is_admin()));
drop policy if exists "Admins manage hero slides" on public.hero_slides;
create policy "Admins manage hero slides" on public.hero_slides
for all to authenticated using ((select private.is_admin())) with check ((select private.is_admin()));

drop policy if exists "Public can read homepage collections" on public.collections;
create policy "Public can read homepage collections" on public.collections
for select to anon, authenticated
using ((is_active and (starts_at is null or starts_at <= now()) and (ends_at is null or ends_at > now())) or (select private.is_admin()));
drop policy if exists "Admins manage collections" on public.collections;
create policy "Admins manage collections" on public.collections
for all to authenticated using ((select private.is_admin())) with check ((select private.is_admin()));

drop policy if exists "Public can read collection products" on public.collection_products;
create policy "Public can read collection products" on public.collection_products
for select to anon, authenticated using (
  exists (select 1 from public.collections c where c.id = collection_id and c.is_active
    and (c.starts_at is null or c.starts_at <= now()) and (c.ends_at is null or c.ends_at > now()))
  or (select private.is_admin())
);
drop policy if exists "Admins manage collection products" on public.collection_products;
create policy "Admins manage collection products" on public.collection_products
for all to authenticated using ((select private.is_admin())) with check ((select private.is_admin()));

drop policy if exists "Public can read site brand info" on public.site_brand_info;
create policy "Public can read site brand info" on public.site_brand_info
for select to anon, authenticated using (true);
drop policy if exists "Admins manage site brand info" on public.site_brand_info;
create policy "Admins manage site brand info" on public.site_brand_info
for all to authenticated using ((select private.is_admin())) with check ((select private.is_admin()));

drop policy if exists "Admins can update customer profiles" on public.customer_profiles;
create policy "Admins can update customer profiles" on public.customer_profiles
for update to authenticated using ((select private.is_admin())) with check ((select private.is_admin()));
drop policy if exists "Admins can delete customer profiles" on public.customer_profiles;
create policy "Admins can delete customer profiles" on public.customer_profiles
for delete to authenticated using ((select private.is_admin()));

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
create policy "Admins upload ISHTILE media" on storage.objects for insert to authenticated with check (bucket_id = 'ishtile-media' and (select private.is_admin()));
drop policy if exists "Admins update ISHTILE media" on storage.objects;
create policy "Admins update ISHTILE media" on storage.objects for update to authenticated using (bucket_id = 'ishtile-media' and (select private.is_admin())) with check (bucket_id = 'ishtile-media' and (select private.is_admin()));
drop policy if exists "Admins delete ISHTILE media" on storage.objects;
create policy "Admins delete ISHTILE media" on storage.objects for delete to authenticated using (bucket_id = 'ishtile-media' and (select private.is_admin()));
