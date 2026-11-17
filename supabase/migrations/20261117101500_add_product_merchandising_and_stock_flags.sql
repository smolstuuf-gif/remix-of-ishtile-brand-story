alter table public.products
  add column if not exists is_featured boolean not null default false,
  add column if not exists is_out_of_stock boolean not null default false,
  add column if not exists tags text[] not null default '{}'::text[];

create index if not exists products_featured_active_idx
  on public.products (is_featured, created_at desc)
  where is_active = true;
