-- Keep private brand contact details and internal product fields out of the public Data API.
revoke select on public.brands from anon;
grant select (id, slug, name, description, is_active, sort_order, logo_url, image_url, website_url, instagram_url, facebook_url, motto, social_links)
on public.brands to anon;

revoke select on public.products from anon;
grant select (id, slug, name, brand_id, category, price, image_url, image_urls, description, sizes, colors, is_active, created_at, updated_at)
on public.products to anon;
