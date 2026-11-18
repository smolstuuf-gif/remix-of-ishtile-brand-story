import type { CartLine } from "@/lib/commerce";

const SUPABASE_URL = import.meta.env["VITE_SUPABASE_URL"] as string | undefined;
const SUPABASE_KEY = import.meta.env["VITE_SUPABASE_PUBLISHABLE_KEY"] as string | undefined;

export type SavedOrder = {
  id: string;
  order_number: string;
  created_at: string;
  subtotal: number;
  shipping_fee: number;
  total: number;
};

export async function submitStoreOrder(
  customer: { name: string; phone: string; email: string; address: string; city: string; postal: string },
  lines: CartLine[],
  paymentMethod: string,
): Promise<SavedOrder> {
  if (!SUPABASE_URL || !SUPABASE_KEY) {
    throw new Error("Checkout is temporarily unavailable. Please try again in a moment.");
  }

  const headers: Record<string, string> = {
    apikey: SUPABASE_KEY,
    "Content-Type": "application/json",
  };
  if (!SUPABASE_KEY.startsWith("sb_publishable_")) {
    headers["Authorization"] = `Bearer ${SUPABASE_KEY}`;
  }

  const response = await fetch(`${SUPABASE_URL.replace(/\/$/, "")}/rest/v1/rpc/submit_store_order`, {
    method: "POST",
    headers,
    body: JSON.stringify({
      p_customer: customer,
      p_items: lines.map(({ productId, qty, size, color }) => ({ productId, qty, size, color })),
      p_payment_method: paymentMethod,
    }),
  });
  const body = await response.json().catch(() => ({})) as Partial<SavedOrder> & { message?: string; details?: string; hint?: string };
  if (!response.ok) {
    throw new Error(body.message || body.details || "We couldn't save your order. Your bag is still here — please try again.");
  }
  if (!body.order_number || !body.created_at) {
    throw new Error("The order was submitted but its receipt could not be confirmed. Please contact the store before trying again.");
  }
  return body as SavedOrder;
}
