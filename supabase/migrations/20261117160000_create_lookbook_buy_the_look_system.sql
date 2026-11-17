create table if not exists public.lookbook_looks (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique,
  title text not null,
  description text,
  image_url text not null,
  alt_text text,
  sort_order integer not null default 0,
  is_active boolean not null default true,
  starts_at timestamptz,
  ends_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint lookbook_looks_schedule_check check (ends_at is null or starts_at is null or ends_at > starts_at)
);
create table if not exists public.lookbook_look_products (
  look_id uuid not null references public.lookbook_looks(id) on delete cascade,
  product_id uuid not null references public.products(id) on delete cascade,
  sort_order integer not null default 0,
  default_size text,
  default_color text,
  default_quantity integer not null default 1 check (default_quantity between 1 and 10),
  created_at timestamptz not null default now(),
  primary key (look_id, product_id),
  unique (look_id, sort_order)
);
create index if not exists lookbook_looks_active_order_idx on public.lookbook_looks (sort_order, created_at desc) where is_active = true;
create index if not exists lookbook_look_products_product_idx on public.lookbook_look_products (product_id);
alter table public.lookbook_looks enable row level security;
alter table public.lookbook_look_products enable row level security;
grant select on public.lookbook_looks, public.lookbook_look_products to anon, authenticated;
grant insert, update, delete on public.lookbook_looks, public.lookbook_look_products to authenticated;
create policy "Public can read scheduled lookbook looks" on public.lookbook_looks for select to anon using (is_active and (starts_at is null or starts_at <= now()) and (ends_at is null or ends_at > now()));
create policy "Authenticated can read lookbook looks or admin content" on public.lookbook_looks for select to authenticated using ((is_active and (starts_at is null or starts_at <= now()) and (ends_at is null or ends_at > now())) or (select private.is_admin()));
create policy "Admins manage lookbook looks" on public.lookbook_looks for all to authenticated using ((select private.is_admin())) with check ((select private.is_admin()));
create policy "Public can read products in scheduled looks" on public.lookbook_look_products for select to anon using (exists (select 1 from public.lookbook_looks l where l.id = look_id and l.is_active and (l.starts_at is null or l.starts_at <= now()) and (l.ends_at is null or l.ends_at > now())));
create policy "Authenticated can read look products or admin content" on public.lookbook_look_products for select to authenticated using (exists (select 1 from public.lookbook_looks l where l.id = look_id and l.is_active and (l.starts_at is null or l.starts_at <= now()) and (l.ends_at is null or l.ends_at > now())) or (select private.is_admin()));
create policy "Admins manage lookbook look products" on public.lookbook_look_products for all to authenticated using ((select private.is_admin())) with check ((select private.is_admin()));