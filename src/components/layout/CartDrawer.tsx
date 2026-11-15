import { Link } from "@tanstack/react-router";
import { Minus, Plus, Trash2 } from "lucide-react";
import { Sheet, SheetContent, SheetTitle } from "@/components/ui/sheet";
import { Sparkle } from "@/components/home/icons";
import { formatTaka } from "@/lib/catalog";
import { FREE_SHIPPING_OVER, MAX_QTY } from "@/lib/commerce";
import { useCart } from "@/lib/store";

export function QtyStepper({
  qty,
  onChange,
  label,
}: {
  qty: number;
  onChange: (next: number) => void;
  label: string;
}) {
  return (
    <div className="inline-flex items-center rounded-full border border-border">
      <button
        type="button"
        onClick={() => onChange(qty - 1)}
        disabled={qty <= 1}
        aria-label={`Decrease ${label}`}
        className="grid h-8 w-8 place-items-center rounded-l-full transition-colors hover:bg-accent disabled:opacity-40"
      >
        <Minus className="h-3.5 w-3.5" strokeWidth={2} />
      </button>
      <span className="w-7 text-center text-sm tabular-nums" aria-live="polite">
        {qty}
      </span>
      <button
        type="button"
        onClick={() => onChange(qty + 1)}
        disabled={qty >= MAX_QTY}
        aria-label={`Increase ${label}`}
        className="grid h-8 w-8 place-items-center rounded-r-full transition-colors hover:bg-accent disabled:opacity-40"
      >
        <Plus className="h-3.5 w-3.5" strokeWidth={2} />
      </button>
    </div>
  );
}

export function CartDrawer() {
  const {
    lines,
    cartOpen,
    closeCart,
    setQty,
    removeLine,
    subtotal,
    shipping,
    total,
    count,
  } = useCart();

  const toFreeShipping = Math.max(0, FREE_SHIPPING_OVER - subtotal);

  return (
    <Sheet open={cartOpen} onOpenChange={(open) => (open ? undefined : closeCart())}>
      <SheetContent side="right" className="flex w-full flex-col gap-0 p-0 sm:max-w-md">
        <SheetTitle className="border-b border-border px-6 pb-4 pt-5 pr-12 text-lg font-semibold">
          Your Bag {count > 0 && <span className="text-muted-foreground">({count})</span>}
        </SheetTitle>

        {lines.length === 0 ? (
          <div className="flex flex-1 flex-col items-center justify-center gap-4 px-8 text-center">
            <Sparkle className="h-10 w-10 text-lime" />
            <div>
              <p className="font-display text-xl font-semibold">Nothing in the bag yet.</p>
              <p className="mt-1 text-sm text-muted-foreground">
                Add something you'll actually wear.
              </p>
            </div>
            <Link
              to="/shop"
              onClick={closeCart}
              className="rounded-full bg-ink px-5 py-2.5 text-sm font-medium text-ink-foreground transition-colors hover:bg-foreground"
            >
              Shop the collection
            </Link>
          </div>
        ) : (
          <>
            <ul className="flex-1 divide-y divide-border overflow-y-auto px-6">
              {lines.map((l) => (
                <li key={l.key} className="flex gap-4 py-4">
                  <img
                    src={l.image}
                    alt={l.name}
                    width={96}
                    height={96}
                    className="h-20 w-20 shrink-0 rounded-lg object-cover"
                  />
                  <div className="min-w-0 flex-1">
                    <div className="flex items-start justify-between gap-2">
                      <p className="text-sm font-medium leading-snug">{l.name}</p>
                      <button
                        type="button"
                        onClick={() => removeLine(l.key)}
                        aria-label={`Remove ${l.name} from bag`}
                        className="shrink-0 text-muted-foreground transition-colors hover:text-foreground"
                      >
                        <Trash2 className="h-4 w-4" strokeWidth={1.6} />
                      </button>
                    </div>
                    <p className="mt-0.5 text-xs text-muted-foreground">
                      {l.color} · Size {l.size}
                    </p>
                    <div className="mt-2 flex items-center justify-between gap-2">
                      <QtyStepper qty={l.qty} onChange={(n) => setQty(l.key, n)} label={l.name} />
                      <p className="text-sm font-medium tabular-nums">{formatTaka(l.price * l.qty)}</p>
                    </div>
                  </div>
                </li>
              ))}
            </ul>

            <div className="border-t border-border px-6 pb-6 pt-4">
              {toFreeShipping > 0 ? (
                <p className="mb-3 rounded-lg bg-panel px-3 py-2 text-xs text-muted-foreground">
                  Add {formatTaka(toFreeShipping)} more for free delivery.
                </p>
              ) : (
                <p className="mb-3 rounded-lg bg-lime px-3 py-2 text-xs font-medium text-primary-foreground">
                  Free delivery unlocked.
                </p>
              )}
              <dl className="space-y-1.5 text-sm">
                <div className="flex justify-between">
                  <dt className="text-muted-foreground">Subtotal</dt>
                  <dd className="tabular-nums">{formatTaka(subtotal)}</dd>
                </div>
                <div className="flex justify-between">
                  <dt className="text-muted-foreground">Delivery</dt>
                  <dd className="tabular-nums">{shipping === 0 ? "Free" : formatTaka(shipping)}</dd>
                </div>
                <div className="flex justify-between border-t border-border pt-2 text-base font-semibold">
                  <dt>Total</dt>
                  <dd className="tabular-nums">{formatTaka(total)}</dd>
                </div>
              </dl>
              <Link
                to="/checkout"
                onClick={closeCart}
                className="mt-4 block rounded-full bg-lime py-3 text-center text-sm font-semibold text-primary-foreground transition-transform hover:scale-[1.01]"
              >
                Checkout
              </Link>
              <Link
                to="/cart"
                onClick={closeCart}
                className="mt-2 block rounded-full border border-border py-3 text-center text-sm font-medium transition-colors hover:bg-accent"
              >
                View full bag
              </Link>
            </div>
          </>
        )}
      </SheetContent>
    </Sheet>
  );
}
