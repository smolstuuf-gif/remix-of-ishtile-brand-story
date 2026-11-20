import { useCallback, useEffect, useMemo, useState } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import { AccountAccess } from "@/components/account/AccountAccess";
import { PageShell, pageHead } from "@/components/layout/PageShell";
import { formatTaka } from "@/lib/catalog";
import { supabase } from "@/integrations/supabase/client";
import { useCart } from "@/lib/store";

type OrderItem = {
  id: string; product_name: string; brand_name: string; season: string | null;
  unit_price: number; quantity: number; size: string | null; color: string | null; line_total: number;
};
type CustomerOrder = {
  id: string; order_number: string; created_at: string; customer_name: string;
  customer_phone: string; shipping_address: string; shipping_city: string | null;
  shipping_postal: string | null; payment_method: string; payment_status: string;
  fulfillment_status: string; subtotal: number; shipping_fee: number; total: number;
  special_note: string | null; order_items: OrderItem[];
};

export const Route = createFileRoute("/account")({
  head: () => pageHead("My Account", "Your ISHTILE+ orders, saved pieces and delivery details in one place."),
  component: AccountPage,
});

function AccountPage() {
  const { wishlist } = useCart();
  const [userId, setUserId] = useState<string | null>(null);
  const [orders, setOrders] = useState<CustomerOrder[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState("");
  const [phone, setPhone] = useState("");
  const [otp, setOtp] = useState("");
  const [otpSent, setOtpSent] = useState(false);
  const [claimMessage, setClaimMessage] = useState("");
  const [claimError, setClaimError] = useState("");
  const [claiming, setClaiming] = useState(false);
  const [status, setStatus] = useState("all");

  const loadOrders = useCallback(async (uid: string) => {
    setLoading(true);
    setLoadError("");
    const [{ data: sessionData }, baseValue, keyValue] = await Promise.all([
      supabase.auth.getSession(),
      Promise.resolve(import.meta.env["VITE_SUPABASE_URL"] as string | undefined),
      Promise.resolve(import.meta.env["VITE_SUPABASE_PUBLISHABLE_KEY"] as string | undefined),
    ]);
    const token = sessionData.session?.access_token;
    if (!token || !baseValue || !keyValue) { setOrders([]); setLoading(false); return; }
    const base = baseValue.replace(/\/$/, "");
    const query = "select=id,order_number,created_at,customer_name,customer_phone,shipping_address,shipping_city,shipping_postal,payment_method,payment_status,fulfillment_status,subtotal,shipping_fee,total,special_note,order_items(id,product_name,brand_name,season,unit_price,quantity,size,color,line_total)&user_id=eq." + encodeURIComponent(uid) + "&order=created_at.desc";
    const response = await fetch(base + "/rest/v1/orders?" + query, {
      headers: { apikey: keyValue, Authorization: "Bearer " + token },
    });
    if (!response.ok) throw new Error("We couldn't load your order history. Please refresh and try again.");
    setOrders(await response.json() as CustomerOrder[]);
    setLoading(false);
  }, []);

  useEffect(() => {
    let active = true;
    supabase.auth.getSession().then(async ({ data }) => {
      if (!active) return;
      const uid = data.session?.user.id ?? null;
      setUserId(uid);
      if (uid) {
        try { await loadOrders(uid); }
        catch (error) { if (active) { setLoadError(error instanceof Error ? error.message : "Unable to load orders."); setLoading(false); } }
      } else setLoading(false);
    });
    const { data: listener } = supabase.auth.onAuthStateChange((_event, session) => {
      const uid = session?.user.id ?? null;
      setUserId(uid);
      if (uid) loadOrders(uid).catch((error: unknown) => { setLoadError(error instanceof Error ? error.message : "Unable to load orders."); setLoading(false); });
      else { setOrders([]); setLoading(false); }
    });
    return () => { active = false; listener.subscription.unsubscribe(); };
  }, [loadOrders]);

  const filteredOrders = useMemo(
    () => status === "all" ? orders : orders.filter((order) => order.fulfillment_status.toLowerCase() === status),
    [orders, status],
  );

  const sendPhoneCode = async () => {
    setClaimError(""); setClaimMessage(""); setClaiming(true);
    try {
      const normalized = phone.replace(/[\s().-]/g, "");
      const value = normalized.startsWith("+") ? normalized : normalized.startsWith("880") ? "+" + normalized : "+88" + normalized;
      const { error } = await supabase.auth.updateUser({ phone: value });
      if (error) throw error;
      setPhone(value);
      setOtpSent(true);
      setClaimMessage("SMS code sent. Enter it below to verify this mobile number.");
    } catch (error) {
      setClaimError(error instanceof Error ? error.message : "Could not send the verification code.");
    } finally { setClaiming(false); }
  };

  const verifyAndClaim = async () => {
    setClaimError(""); setClaimMessage(""); setClaiming(true);
    try {
      const { error } = await supabase.auth.verifyOtp({ phone, token: otp.trim(), type: "phone_change" });
      if (error) throw error;
      const { data: sessionData } = await supabase.auth.getSession();
      const base = (import.meta.env["VITE_SUPABASE_URL"] as string).replace(/\/$/, "");
      const key = import.meta.env["VITE_SUPABASE_PUBLISHABLE_KEY"] as string;
      const response = await fetch(base + "/rest/v1/rpc/claim_guest_orders_for_verified_phone", {
        method: "POST",
        headers: { apikey: key, Authorization: "Bearer " + sessionData.session?.access_token, "Content-Type": "application/json" },
        body: "{}",
      });
      if (!response.ok) throw new Error("Your mobile number was verified, but previous orders could not be linked. Please try again.");
      const count = await response.json() as number;
      setClaimMessage(count + " previous guest order(s) securely linked to your account.");
      if (userId) await loadOrders(userId);
      setOtpSent(false); setOtp("");
    } catch (error) {
      setClaimError(error instanceof Error ? error.message : "Could not verify and link previous orders.");
    } finally { setClaiming(false); }
  };

  return (
    <>
      <AccountAccess />
      {userId && (
        <PageShell eyebrow="Account" title="Your orders" intro="Every order placed while signed in, with its full receipt and delivery details.">
          <div className="grid gap-6 lg:grid-cols-[2fr_1fr]">
            <section className="space-y-4">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <h2 className="text-xl font-semibold">Order history ({orders.length})</h2>
                <select value={status} onChange={(event) => setStatus(event.target.value)} className="rounded-full border border-border bg-background px-4 py-2 text-sm">
                  <option value="all">All orders</option><option value="new">New</option><option value="pending">Pending</option><option value="processing">Processing</option><option value="shipped">Shipped</option><option value="delivered">Delivered</option><option value="cancelled">Cancelled</option><option value="returned">Returned</option>
                </select>
              </div>
              {loading ? <p className="py-8 text-sm text-muted-foreground">Loading your orders…</p> : loadError ? <p role="alert" className="rounded-xl border border-destructive/30 p-4 text-sm">{loadError}</p> : filteredOrders.length === 0 ? <div className="rounded-xl border border-dashed border-border p-8 text-center"><p className="font-medium">No orders found.</p><Link to="/shop" className="mt-3 inline-block underline">Start shopping</Link></div> : filteredOrders.map((order) => (
                <details key={order.id} className="rounded-xl border border-border bg-card p-5">
                  <summary className="flex cursor-pointer list-none flex-wrap items-center justify-between gap-3">
                    <span><strong>{order.order_number}</strong><span className="mt-1 block text-xs text-muted-foreground">{new Date(order.created_at).toLocaleString()} · {order.payment_method}</span></span>
                    <span className="text-right"><strong>{formatTaka(Number(order.total))}</strong><span className="mt-1 block text-xs uppercase text-muted-foreground">{order.fulfillment_status} · Payment {order.payment_status}</span></span>
                  </summary>
                  <div className="mt-5 border-t border-border pt-4">
                    <h3 className="text-sm font-semibold">Items</h3>
                    <ul className="mt-3 divide-y divide-border">{(order.order_items ?? []).map((item) => <li key={item.id} className="flex flex-wrap justify-between gap-2 py-3 text-sm"><span><strong>{item.product_name}</strong><span className="block text-xs text-muted-foreground">{item.brand_name}{item.season ? " · " + item.season : ""} · {item.color ?? "Colour not specified"} · {item.size ?? "Size not specified"} · Qty {item.quantity}</span></span><span>{formatTaka(Number(item.line_total))}</span></li>)}</ul>
                    <div className="mt-4 grid gap-4 sm:grid-cols-2"><div><h3 className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Delivery details</h3><p className="mt-2 text-sm leading-6">{order.customer_name}<br/>{order.customer_phone}<br/>{order.shipping_address}<br/>{[order.shipping_city,order.shipping_postal].filter(Boolean).join(" ")}</p></div><div><h3 className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Payment & totals</h3><p className="mt-2 text-sm">Method: {order.payment_method}<br/>Payment: {order.payment_status}<br/>Subtotal: {formatTaka(Number(order.subtotal))}<br/>Delivery: {Number(order.shipping_fee) === 0 ? "Free" : formatTaka(Number(order.shipping_fee))}<br/><strong>Total: {formatTaka(Number(order.total))}</strong></p></div></div>
                    {order.special_note && <p className="mt-4 rounded-lg bg-muted p-3 text-sm"><strong>Order note:</strong> {order.special_note}</p>}
                  </div>
                </details>
              ))}
            </section>
            <aside className="space-y-5">
              <div className="rounded-2xl bg-ink p-6 text-ink-foreground"><h2 className="text-xl font-semibold">Wishlist</h2><p className="mt-2 text-ink-foreground/80">{wishlist.length} saved piece{wishlist.length === 1 ? "" : "s"}</p><Link to="/wishlist" className="mt-5 inline-flex rounded-full bg-lime px-5 py-2.5 font-medium text-ink">View wishlist</Link></div>
              <div className="rounded-2xl border border-border bg-card p-5"><h2 className="font-semibold">Find previous guest orders</h2><p className="mt-2 text-sm text-muted-foreground">Verify the mobile number used on your earlier orders. Only orders with that verified number can be linked to this account.</p><label className="mt-4 block text-sm font-medium">Mobile number<input value={phone} onChange={(event) => setPhone(event.target.value)} placeholder="+8801XXXXXXXXX" className="mt-2 h-11 w-full rounded-lg border border-border bg-background px-3"/></label>{otpSent ? <><label className="mt-3 block text-sm font-medium">SMS verification code<input value={otp} onChange={(event) => setOtp(event.target.value)} inputMode="numeric" autoComplete="one-time-code" className="mt-2 h-11 w-full rounded-lg border border-border bg-background px-3"/></label><button disabled={claiming || otp.trim().length < 4} onClick={verifyAndClaim} className="mt-3 w-full rounded-full bg-ink px-4 py-3 text-sm font-medium text-ink-foreground disabled:opacity-50">{claiming ? "Verifying…" : "Verify & link orders"}</button></> : <button disabled={claiming || phone.replace(/\D/g,"").length < 10} onClick={sendPhoneCode} className="mt-3 w-full rounded-full bg-ink px-4 py-3 text-sm font-medium text-ink-foreground disabled:opacity-50">{claiming ? "Sending code…" : "Send verification code"}</button>}{claimMessage && <p role="status" className="mt-3 text-sm text-green-700">{claimMessage}</p>}{claimError && <p role="alert" className="mt-3 text-sm text-destructive">{claimError}</p>}</div>
            </aside>
          </div>
        </PageShell>
      )}
    </>
  );
}
