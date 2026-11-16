-- Speed up reverse lookups when products are removed or collection assignments are queried.
create index if not exists collection_products_product_id_idx on public.collection_products(product_id);
