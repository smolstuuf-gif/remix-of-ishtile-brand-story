-- Starter Buy the Look content for ISHTILE.
-- Uses existing editorial/model imagery and current active catalogue products.
-- Safe to re-run: existing look slugs and look/product pairs are left untouched.

insert into public.lookbook_looks (slug, title, description, image_url, alt_text, sort_order, is_active)
values
  ('everyday-uniform', 'Everyday Uniform', 'A relaxed everyday combination built around the ISHTILE Essentials Tee, easy cargo trousers and a light overshirt.', 'https://raw.githubusercontent.com/smolstuuf-gif/remix-of-ishtile-brand-story/main/src/assets/_ref/brand-man.jpg', 'Model wearing an everyday ISHTILE outfit', 1, true),
  ('city-layers', 'City Layers', 'An easy layered rotation: a clean base tee, relaxed hoodie and utility-ready cargo trousers.', 'https://raw.githubusercontent.com/smolstuuf-gif/remix-of-ishtile-brand-story/main/src/assets/_ref/src_hero_d.jpg', 'ISHTILE editorial model shoot for a layered city outfit', 2, true),
  ('soft-structure', 'Soft Structure', 'A softer statement pairing the FARAK slip dress with the PILGRIM paisley shawl.', 'https://raw.githubusercontent.com/smolstuuf-gif/remix-of-ishtile-brand-story/main/src/assets/_ref/brand-woman.jpg', 'Model wearing a soft structured outfit', 3, true),
  ('sport-utility', 'Sport Utility', 'A practical off-duty mix of the ISHTILE Sports Tee, shorts and ONEN+ Trainer Jacket.', 'https://raw.githubusercontent.com/smolstuuf-gif/remix-of-ishtile-brand-story/main/src/assets/_ref/m-summer.jpg', 'ISHTILE summer campaign model wearing sport-inspired clothing', 4, true)
on conflict (slug) do nothing;

with product_defs (look_slug, product_slug, sort_order, default_size, default_color, default_quantity) as (
  values
    ('everyday-uniform', 'essentials-tee', 0, 'M', 'Black', 1),
    ('everyday-uniform', 'cargo-pants', 1, 'M', 'Olive', 1),
    ('everyday-uniform', 'overshirt', 2, 'M', 'Olive', 1),
    ('city-layers', 'basic-tee', 0, 'M', 'Off White', 1),
    ('city-layers', 'hoodie', 1, 'M', 'Black', 1),
    ('city-layers', 'cargo-pants', 2, 'M', 'Black', 1),
    ('soft-structure', 'farak-slip-dress', 0, 'M', 'Black', 1),
    ('soft-structure', 'paisley-shawl', 1, 'One Size', 'Rust', 1),
    ('sport-utility', 'sports-tee', 0, 'M', 'Black', 1),
    ('sport-utility', 'shorts', 1, 'M', 'Black', 1),
    ('sport-utility', 'onen-jacket', 2, 'M', 'Navy', 1)
)
insert into public.lookbook_look_products (look_id, product_id, sort_order, default_size, default_color, default_quantity)
select l.id, p.id, d.sort_order, d.default_size, d.default_color, d.default_quantity
from product_defs d
join public.lookbook_looks l on l.slug = d.look_slug
join public.products p on p.slug = d.product_slug and p.is_active
where not exists (
  select 1 from public.lookbook_look_products existing
  where existing.look_id = l.id and existing.product_id = p.id
);
