"use client";

import { useEffect, useMemo, useState } from "react";
import { Shirt, ShoppingBag } from "lucide-react";
import { Sheet, SheetContent, SheetDescription, SheetTitle } from "@/components/ui/sheet";
import { useCart } from "@/lib/store";
import { fetchPublicProducts } from "@/lib/public-store";
import { toast } from "sonner";
import { formatTaka, type Product } from "@/lib/catalog";
import type { PublicLook } from "@/lib/public-store";

type Selection = { selected: boolean; size: string; color: string; qty: number };
export function BuyTheLookButton({ onClick }: { onClick: () => void }) {
  return <button type="button" onClick={onClick} aria-label="Buy the look" className="fixed bottom-8 right-4 z-40 inline-flex h-11 w-11 items-center justify-center rounded-full bg-[#D5FE00] p-0 text-[#171717] shadow-[0_8px_35px_rgba(0,0,0,.3)] transition-transform hover:scale-[1.04] animate-pulse focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#D5FE00] md:bottom-9 md:right-9 md:h-auto md:w-auto md:gap-2 md:px-5 md:py-3.5 md:text-xs md:animate-none"><Shirt className="h-[18px] w-[18px] md:h-4 md:w-4" strokeWidth={2.2} /><span className="hidden md:inline">Buy the look</span></button>;
}
export function LookProductsDrawer({ look, open, onOpenChange }: { look: PublicLook | null; open: boolean; onOpenChange: (open: boolean) => void }) {
  const { addItem, openCart } = useCart();
  const [selection, setSelection] = useState<Record<string, Selection>>({});
  const [adding, setAdding] = useState(false);
  useEffect(() => {
    if (!look) return;
    const next: Record<string, Selection> = {};
    look.products.forEach(({ product, defaultSize, defaultColor, defaultQuantity }) => {
      next[product.id] = { selected: true, size: defaultSize || product.sizes[0] || "One Size", color: defaultColor || product.colors[0]?.name || "Default", qty: Math.max(1, Math.min(10, defaultQuantity || 1, product.stockQuantity ?? 10)) };
    });
    setSelection(next);
  }, [look?.id, open]);
  const available = useMemo(() => (look?.products ?? []).filter(({ product }) => !product.isOutOfStock && product.stockQuantity !== 0), [look]);
  const total = (look?.products ?? []).reduce((sum, { product }) => {
    const state = selection[product.id];
    return sum + (state?.selected && !product.isOutOfStock && product.stockQuantity !== 0 ? product.price * state.qty : 0);
  }, 0);
  const selectedCount = available.filter(({ product }) => selection[product.id]?.selected).length;
  function patch(product: Product, value: Partial<Selection>) {
    setSelection((current) => ({ ...current, [product.id]: { ...current[product.id], ...value } }));
  }
  async function addLook() {
    if (!look || adding) return;
    setAdding(true);
    try {
    const latestProducts = await fetchPublicProducts();
    if (!latestProducts) {
      toast.error("We couldn't verify current product availability. Please try again.");
      return;
    }
    let added = 0;
    let unavailable = 0;
    for (const { product } of look.products) {
      const item = selection[product.id];
      if (!item?.selected) continue;
      const latest = latestProducts.find((candidate) => candidate.id === product.id);
      if (!latest || latest.isOutOfStock || latest.stockQuantity === 0) {
        unavailable += 1;
        continue;
      }
      const size = latest.sizes.includes(item.size) ? item.size : latest.sizes[0] || "One Size";
      const color = latest.colors.some((candidate) => candidate.name === item.color) ? item.color : latest.colors[0]?.name || "Default";
      const quantity = Math.min(item.qty, latest.stockQuantity ?? 10, 10);
      if (quantity < 1) { unavailable += 1; continue; }
      addItem(latest, { size, color, qty: quantity });
      added += 1;
    }
    if (!added) {
      toast.error("The selected pieces are no longer available.");
      return;
    }
    if (unavailable) toast.warning(`${unavailable} piece(s) were unavailable and weren't added.`);
    onOpenChange(false);
    openCart();
    } catch {
      toast.error("Something went wrong while adding this look. Please try again.");
    } finally {
      setAdding(false);
    }
  }
  return <Sheet open={open} onOpenChange={onOpenChange}>
    <SheetContent side="right" className="flex w-full flex-col gap-0 border-l border-[#171717]/10 bg-[#F0EAE0] p-0 text-[#171717] sm:max-w-[520px]">
      <div className="border-b border-[#171717]/15 px-5 pb-4 pr-12 pt-6 md:px-7 md:pr-12">
        <div className="flex items-start justify-between gap-4"><div><p className="text-[9px] font-bold uppercase tracking-[.22em] text-[#171717]/45">ISHTILE+ / Styling edit</p><SheetTitle className="mt-2 font-wide text-2xl font-extrabold uppercase tracking-tight">{look?.title ?? "The look"}</SheetTitle><SheetDescription className="mt-1 text-xs text-[#171717]/55">Select the pieces you want from this complete outfit.</SheetDescription></div></div>
      </div>
      <div className="flex-1 space-y-4 overflow-y-auto px-5 py-5 md:px-7">
        {look?.description && <p className="text-sm leading-6 text-[#171717]/65">{look.description}</p>}
        {(look?.products ?? []).map(({ product }) => {
          const item = selection[product.id] ?? { selected: true, size: product.sizes[0] ?? "One Size", color: product.colors[0]?.name ?? "Default", qty: 1 };
          const soldOut = !!product.isOutOfStock || product.stockQuantity === 0;
          return <article key={product.id} className={`border border-[#171717]/12 bg-white/45 p-3 ${soldOut ? "opacity-60" : ""}`}>
            <div className="flex gap-3">
              <label className="mt-1"><input type="checkbox" checked={item.selected && !soldOut} disabled={soldOut} onChange={(event) => patch(product, { selected: event.target.checked })} aria-label={`Include ${product.name}`} /></label>
              <img src={product.image} alt={product.name} className="h-24 w-20 shrink-0 bg-[#E7E0D5] object-cover" />
              <div className="min-w-0 flex-1"><div className="flex items-start justify-between gap-2"><p className="text-xs font-bold leading-5">{product.name}</p><p className="shrink-0 text-xs font-bold tabular-nums">{formatTaka(product.price)}</p></div>
                {soldOut ? <p className="mt-2 text-[10px] font-bold uppercase tracking-wider text-red-700">Out of stock</p> : <div className="mt-3 grid grid-cols-2 gap-2">
                  <label className="text-[9px] font-bold uppercase tracking-wider text-[#171717]/50">Size<select value={item.size} onChange={(event) => patch(product, { size: event.target.value })} className="mt-1 w-full border border-[#171717]/15 bg-transparent px-2 py-2 text-xs text-[#171717]">{(product.sizes.length ? product.sizes : ["One Size"]).map((size) => <option key={size}>{size}</option>)}</select></label>
                  <label className="text-[9px] font-bold uppercase tracking-wider text-[#171717]/50">Colour<select value={item.color} onChange={(event) => patch(product, { color: event.target.value })} className="mt-1 w-full border border-[#171717]/15 bg-transparent px-2 py-2 text-xs text-[#171717]">{(product.colors.length ? product.colors : [{ name: "Default", hex: "#777777" }]).map((color) => <option key={color.name}>{color.name}</option>)}</select></label>
                </div>}
              </div>
            </div>
            {!soldOut && <div className="mt-3 flex items-center justify-between border-t border-[#171717]/10 pt-2"><span className="text-[10px] text-[#171717]/50">Quantity</span><div className="flex items-center gap-3"><button type="button" onClick={() => patch(product, { qty: Math.max(1, item.qty - 1) })} className="grid h-7 w-7 place-items-center border border-[#171717]/20" aria-label="Decrease quantity">−</button><span className="w-4 text-center text-xs tabular-nums">{item.qty}</span><button type="button" onClick={() => patch(product, { qty: Math.min(10, item.qty + 1, product.stockQuantity ?? 10) })} className="grid h-7 w-7 place-items-center border border-[#171717]/20" aria-label="Increase quantity">+</button></div></div>}
          </article>;
        })}
        {!look?.products.length && <p className="py-12 text-center text-sm text-[#171717]/50">No products have been assigned to this look yet.</p>}
      </div>
      <div className="border-t border-[#171717]/15 px-5 pb-6 pt-4 md:px-7">
        <div className="mb-3 flex items-center justify-between text-xs"><span className="text-[#171717]/55">{selectedCount} of {available.length} available pieces selected</span><span className="font-bold tabular-nums">{formatTaka(total)}</span></div>
        <button type="button" disabled={!selectedCount || adding} onClick={() => { void addLook(); }} className="flex w-full items-center justify-center gap-2 bg-[#171717] py-4 text-xs font-black uppercase tracking-[.1em] text-[#F0EAE0] transition hover:bg-black disabled:cursor-not-allowed disabled:opacity-40"><ShoppingBag className="h-4 w-4" /> {adding ? "Checking availability…" : "Buy the look · Add to bag"}</button>
        <p className="mt-2 text-center text-[9px] leading-4 text-[#171717]/45">Your selections are added to your existing bag. Review the bag before checkout.</p>
      </div>
    </SheetContent>
  </Sheet>;
}
