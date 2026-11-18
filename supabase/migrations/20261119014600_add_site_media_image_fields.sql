alter table public.site_brand_info
  add column if not exists homepage_editorial_image_url text,
  add column if not exists homepage_summer_image_url text,
  add column if not exists editorial_fashion_image_url text,
  add column if not exists editorial_art_image_url text,
  add column if not exists stores_image_url text,
  add column if not exists footer_building_image_url text,
  add column if not exists footer_band_image_url text;
