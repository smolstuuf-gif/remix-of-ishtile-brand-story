import { useState } from "react";
import {
  createStoreOrder,
  type AdminSession,
  type EditableOrder,
  type EditableOrderItem,
  type ProductRecord,
} from "@/lib/supabase-admin";

const money = (value: number) => new Intl.NumberFormat("en-BD", {
  style: "currency", currency: "BDT", maximumFractionDigits: 0,
}).format(value);

type Props = {
  products: ProductRecord[];
  session: AdminSession;
  onCancel: () => void;
  onCreated: (orderNumber: string) => void;
};

export function CreateOrderForm({ products, session, onCancel, onCreated }: Props) {
  const [draft, setDraft] = useState<EditableOrder>({
    customer_name: "", customer_phone: "", customer_email: "", shipping_address: "",
    shipping_city: "", shipping_postal: "", payment_method: "Cash on Delivery",
    payment_status: "pending", fulfillment_status: "new", shipping_fee: 80, special_note: "",
  });
  const [items, setItems] = useState<EditableOrderItem[]>([]);
  const [query, setQuery] = useState("");
  const [selectedId, setSelectedId] = useState("");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const matches = products.filter((p) => p.is_active && (p.sku + " " + p.name + " " + p.slug).toLowerCase().includes(query.toLowerCase()));
  const update = (key: keyof EditableOrder, value: string | number | null) => setDraft((current) => ({ ...current, [key]: value }));
  const add = () => {
    const product = products.find((p) => p.id === selectedId);
    if (!product) return;
    setItems((current) => [...current, { product_id: product.id, quantity: 1, unit_price: Number(product.price), size: "", color: "" }]);
    setSelectedId("");
    setQuery("");
  };
  const submit = async () => {
    if (draft.customer_name.trim().length < 2 || draft.customer_phone.trim().length < 8 || draft.shipping_address.trim().length < 6) {
      setError("Customer name, mobile number and delivery address are required.");
      return;
    }
    if (!items.length) { setError("Add at least one product to this order."); return; }
    setSaving(true); setError("");
    try {
      const result = await createStoreOrder(session, draft, items);
      onCreated(result.order_number);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Could not create this order.");
    } finally { setSaving(false); }
  };
  const field = "mt-1 h-10 w-full border border-black/15 bg-[#F7F3EC] px-3 text-xs outline-none focus:border-black";
  const label = "block text-[9px] font-bold uppercase tracking-[0.12em] text-black/45";
  const subtotal = items.reduce((sum, item) => sum + item.unit_price * item.quantity, 0);
  return <div className="fixed inset-0 z-[70] flex items-start justify-center overflow-y-auto bg-[#171717]/60 p-3 backdrop-blur-sm md:items-center md:p-6">
    <section role="dialog" aria-modal="true" aria-labelledby="create-order-title" className="my-4 w-full max-w-5xl border border-black/15 bg-[#F0EAE0] text-[#171717] shadow-2xl">
      <header className="flex items-center justify-between border-b border-black/10 px-4 py-4 md:px-6">
        <div><p className="text-[9px] font-bold uppercase tracking-[0.18em] text-black/45">Order desk</p><h3 id="create-order-title" className="mt-1 text-lg font-black">Create order</h3></div>
        <button type="button" onClick={onCancel} disabled={saving} className="border border-black/20 px-3 py-2 text-[10px] font-bold uppercase">Close</button>
      </header>
      <div className="grid gap-5 p-4 md:grid-cols-[1fr_1fr] md:p-6">
        <div className="space-y-3">
          <p className="text-[9px] font-black uppercase tracking-[0.15em] text-black/45">Customer and delivery</p>
          <div className="grid gap-3 sm:grid-cols-2">
            <label className={label}>Customer name<input className={field} value={draft.customer_name} onChange={(e) => update("customer_name", e.target.value)} /></label>
            <label className={label}>Mobile number<input className={field} value={draft.customer_phone} onChange={(e) => update("customer_phone", e.target.value)} /></label>
            <label className={label}>Email (optional)<input className={field} value={draft.customer_email ?? ""} onChange={(e) => update("customer_email", e.target.value)} /></label>
            <label className={label}>City (optional)<input className={field} value={draft.shipping_city ?? ""} onChange={(e) => update("shipping_city", e.target.value)} /></label>
            <label className={label + " sm:col-span-2"}>Delivery address<textarea rows={2} className="mt-1 w-full border border-black/15 bg-[#F7F3EC] px-3 py-2 text-xs outline-none focus:border-black" value={draft.shipping_address} onChange={(e) => update("shipping_address", e.target.value)} /></label>
            <label className={label}>Postal code<input className={field} value={draft.shipping_postal ?? ""} onChange={(e) => update("shipping_postal", e.target.value)} /></label>
            <label className={label}>Delivery fee (৳)<input type="number" min="0" className={field} value={String(draft.shipping_fee)} onChange={(e) => update("shipping_fee", Number(e.target.value))} /></label>
          </div>
          <div className="grid gap-3 sm:grid-cols-3">
            <label className={label}>Payment method<select className={field} value={draft.payment_method} onChange={(e) => update("payment_method", e.target.value)}><option>Cash on Delivery</option><option>bKash</option><option>Nagad</option><option>Card Payment</option></select></label>
            <label className={label}>Payment status<select className={field} value={draft.payment_status} onChange={(e) => update("payment_status", e.target.value)}><option value="pending">Pending</option><option value="paid">Paid</option><option value="failed">Failed</option><option value="refunded">Refunded</option></select></label>
            <label className={label}>Order status<select className={field} value={draft.fulfillment_status} onChange={(e) => update("fulfillment_status", e.target.value)}><option value="new">New</option><option value="confirmed">Confirmed</option><option value="processing">Processing</option><option value="shipped">Shipped</option><option value="delivered">Delivered</option><option value="cancelled">Cancelled</option><option value="returned">Returned</option></select></label>
          </div>
          <label className={label}>Special note · Admin only<textarea rows={3} maxLength={2000} className="mt-1 w-full border border-black/15 bg-[#F7F3EC] px-3 py-2 text-xs outline-none focus:border-black" value={draft.special_note ?? ""} onChange={(e) => update("special_note", e.target.value)} placeholder="Internal handling notes…" /></label>
        </div>
        <div>
          <p className="text-[9px] font-black uppercase tracking-[0.15em] text-black/45">Add products by product code or name</p>
          <div className="mt-2 grid gap-2 sm:grid-cols-[1fr_1fr_auto]">
            <input type="search" value={query} onChange={(e) => { setQuery(e.target.value); setSelectedId(""); }} placeholder="Search code / product name" className={field + " mt-0"} />
            <select value={selectedId} onChange={(e) => setSelectedId(e.target.value)} className={field + " mt-0"}><option value="">Select product ({matches.length})</option>{matches.map((p) => <option key={p.id} value={p.id}>{p.sku || "No code"} · {p.name}</option>)}</select>
            <button type="button" onClick={add} disabled={!selectedId} className="bg-[#171717] px-3 py-2 text-[10px] font-bold uppercase text-[#F0EAE0] disabled:opacity-40">Add</button>
          </div>
          <div className="mt-3 divide-y divide-black/10 border-y border-black/10">
            {items.map((item, index) => {
              const product = products.find((p) => p.id === item.product_id);
              return <div key={item.product_id + "-" + index} className="flex gap-3 py-3">
                <div className="h-14 w-12 shrink-0 bg-[#E8E1D6]">{product?.image_url && <img src={product.image_url} alt={product.name} className="h-full w-full object-cover" />}</div>
                <div className="min-w-0 flex-1"><p className="truncate text-xs font-bold">{product?.name}</p><p className="text-[9px] text-black/45">{product?.sku} · {money(item.unit_price)}</p>
                  <div className="mt-2 grid grid-cols-3 gap-2">
                    <label className={label}>Qty<input type="number" min="1" max="99" className={field} value={item.quantity} onChange={(e) => setItems((current) => current.map((v, i) => i === index ? { ...v, quantity: Math.max(1, Math.min(99, Number(e.target.value) || 1)) } : v))} /></label>
                    <label className={label}>Size<input className={field} value={item.size} onChange={(e) => setItems((current) => current.map((v, i) => i === index ? { ...v, size: e.target.value } : v))} /></label>
                    <label className={label}>Colour<input className={field} value={item.color} onChange={(e) => setItems((current) => current.map((v, i) => i === index ? { ...v, color: e.target.value } : v))} /></label>
                  </div>
                </div>
                <button type="button" onClick={() => setItems((current) => current.filter((_, i) => i !== index))} className="self-start text-[9px] font-bold uppercase text-red-700 underline">Remove</button>
              </div>;
            })}
            {!items.length && <p className="py-8 text-center text-xs text-black/40">Search a product code or name to add the first item.</p>}
          </div>
          <div className="mt-4 flex justify-between border-t border-black/10 pt-3 text-xs"><span>Subtotal</span><b>{money(subtotal)}</b></div>
          <div className="mt-1 flex justify-between text-xs"><span>Delivery</span><b>{money(Number(draft.shipping_fee) || 0)}</b></div>
          <div className="mt-2 flex justify-between border-t border-black/10 pt-2 text-sm font-black"><span>Total</span><span>{money(subtotal + (Number(draft.shipping_fee) || 0))}</span></div>
        </div>
      </div>
      <footer className="flex flex-wrap items-center justify-between gap-3 border-t border-black/10 px-4 py-4 md:px-6">
        <div className="max-w-xl text-xs text-red-700" role="alert">{error}</div>
        <div className="flex gap-2"><button type="button" disabled={saving} onClick={onCancel} className="border border-black/20 px-4 py-2.5 text-[10px] font-bold uppercase">Cancel</button><button type="button" disabled={saving || !items.length} onClick={() => void submit()} className="bg-[#D5FE00] px-5 py-2.5 text-[10px] font-black uppercase disabled:opacity-50">{saving ? "Creating…" : "Create order"}</button></div>
      </footer>
    </section>
  </div>;
}
