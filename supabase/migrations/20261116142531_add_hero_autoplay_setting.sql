-- Admin-configurable hero carousel interval.
alter table public.site_brand_info
  add column if not exists hero_autoplay_ms integer not null default 5000
  check (hero_autoplay_ms between 1000 and 15000);
