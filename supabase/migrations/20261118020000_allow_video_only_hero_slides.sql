-- Hero slides can use a video without requiring a still-image poster.
ALTER TABLE public.hero_slides
  ALTER COLUMN image_url DROP NOT NULL;
