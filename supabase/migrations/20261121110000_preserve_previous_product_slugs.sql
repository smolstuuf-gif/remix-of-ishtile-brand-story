ALTER TABLE public.products
  ADD COLUMN IF NOT EXISTS previous_slugs text[] NOT NULL DEFAULT '{}';

UPDATE public.products
SET previous_slugs = ARRAY(
  SELECT DISTINCT value
  FROM unnest(COALESCE(previous_slugs, '{}'::text[]) || ARRAY['essentials-tee']) AS value
)
WHERE id = '3cfd4d8b-0eb0-4d1f-bd60-376cab2ab157'
  AND slug = 'talukder-lungi';

GRANT SELECT (previous_slugs) ON public.products TO anon;

CREATE OR REPLACE FUNCTION internal_rpc.remember_product_slug()
RETURNS trigger
LANGUAGE plpgsql
SECURITY INVOKER
SET search_path TO 'public', 'pg_temp'
AS $function$
BEGIN
  IF OLD.slug IS DISTINCT FROM NEW.slug THEN
    NEW.previous_slugs := ARRAY(
      SELECT DISTINCT value
      FROM unnest(COALESCE(NEW.previous_slugs, '{}'::text[]) || ARRAY[OLD.slug]) AS value
    );
  END IF;
  RETURN NEW;
END;
$function$;

DROP TRIGGER IF EXISTS remember_product_slug_before_update ON public.products;
CREATE TRIGGER remember_product_slug_before_update
BEFORE UPDATE OF slug ON public.products
FOR EACH ROW
EXECUTE FUNCTION internal_rpc.remember_product_slug();
