-- Prevent public clients from inserting arbitrary order lines.
-- Checkout continues through the validated SECURITY DEFINER RPC.
DROP POLICY IF EXISTS "Public can submit order items" ON public.order_items;
CREATE POLICY "Admins insert order items" ON public.order_items
FOR INSERT TO authenticated
WITH CHECK ((SELECT private.is_admin()));
REVOKE INSERT ON TABLE public.order_items FROM PUBLIC, anon;
GRANT INSERT ON TABLE public.order_items TO authenticated;
-- The RPC validates customer details, payment method, product availability and quantity.
-- SECURITY DEFINER lets this controlled write proceed after direct anon inserts are revoked.
ALTER FUNCTION public.submit_store_order(jsonb, jsonb, text) SECURITY DEFINER;
