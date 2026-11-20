-- Keep the SECURITY DEFINER implementation outside the exposed Data API schemas.
CREATE SCHEMA IF NOT EXISTS internal_rpc;
REVOKE ALL ON SCHEMA internal_rpc FROM PUBLIC;
GRANT USAGE ON SCHEMA internal_rpc TO anon, authenticated, service_role;

ALTER FUNCTION public.submit_store_order(jsonb, jsonb, text) SET SCHEMA internal_rpc;
ALTER FUNCTION internal_rpc.submit_store_order(jsonb, jsonb, text) SECURITY DEFINER;
REVOKE ALL ON FUNCTION internal_rpc.submit_store_order(jsonb, jsonb, text) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION internal_rpc.submit_store_order(jsonb, jsonb, text) TO anon, authenticated, service_role;

-- Preserve the public checkout RPC endpoint as a SECURITY INVOKER wrapper.
CREATE OR REPLACE FUNCTION public.submit_store_order(
  p_customer jsonb,
  p_items jsonb,
  p_payment_method text
)
RETURNS jsonb
LANGUAGE sql
SECURITY INVOKER
SET search_path TO 'public', 'pg_temp'
AS $function$
  SELECT internal_rpc.submit_store_order(p_customer, p_items, p_payment_method);
$function$;

REVOKE ALL ON FUNCTION public.submit_store_order(jsonb, jsonb, text) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.submit_store_order(jsonb, jsonb, text) TO anon, authenticated, service_role;
