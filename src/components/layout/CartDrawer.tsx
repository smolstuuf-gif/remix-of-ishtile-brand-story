import { Link } from "@tanstack/react-router";
import { Trash2 } from "lucide-react";
import { Sheet, SheetContent, SheetTitle } from "@/components/ui/sheet";
import { Sparkle } from "@/components/home/icons";
import { formatTaka } from "@/lib/catalog";
import { FREE_SHIPPING_OVER, MAX_QTY } from "@/lib/commerce";
import { useCart } from "@/lib/store";
import { Stepper } from "@/components/ui/stepper";
import { AnimatedImage } from "@/components/ui/animated-image";

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
    <Stepper
      value={qty}
      min={1}
      max={MAX_QTY}
      onChange={onChange}
      label={label}
      size="sm"
    />
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
      <SheetContent
        side="right"
        className="flex h-[100dvh] max-h-[100dvh] min-h-0 w-full flex-col gap-0 overflow-hidden p-0 sm:max-w-md"
      >
        <SheetTitle className="shrink-0 border-b border-border px-5 pb-4 pt-[calc(1.25rem+env(safe-area-inset-top))] pr-16 text-lg font-semibold sm:px-6 sm:pr-16">
          Your Bag {count > 0 && <span className="text-muted-foreground">({count})</span>}
        </SheetTitle>

        {lines.length === 0 ? (
          <div className="flex min-h-0 flex-1 flex-col items-center justify-center gap-4 overflow-y-auto px-8 text-center">
            <Sparkle className="h-10 w-10 shrink-0 text-lime" />
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
            <ul className="min-h-0 flex-1 divide-y divide-border overflow-x-hidden overflow-y-auto overscroll-contain px-5 sm:px-6">
              {lines.map((l) => (
                <li key={l.key} className="flex gap-3 py-4 sm:gap-4">
                  <AnimatedImage
                    src={l.image}
                    alt={l.name}
                    width={96}
                    height={96}
                    className="h-20 w-20 shrink-0 rounded-lg object-cover"
                  />
                  <div className="min-w-0 flex-1">
                    <div className="flex items-start justify-between gap-2">
                      <p className="min-w-0 break-words text-sm font-medium leading-snug">{l.name}</p>
                      <button
                        type="button"
                        onClick={() => removeLine(l.key)}
                        aria-label={`Remove ${l.name} from bag`}
                        className="flex h-10 w-10 shrink-0 -mr-2 items-center justify-center rounded-full text-muted-foreground transition-colors hover:bg-accent hover:text-foreground"
                      >
                        <Trash2 className="h-4 w-4" strokeWidth={1.6} />
                      </button>
                    </div>
                    <p className="mt-0.5 text-xs text-muted-foreground">
                      {l.color} · Size {l.size}
                    </p>
                    <div className="mt-2 flex flex-wrap items-center justify-between gap-2">
                      <QtyStepper qty={l.qty} onChange={(n) => setQty(l.key, n)} label={l.name} />
                      <p className="text-sm font-medium tabular-nums">{formatTaka(l.price * l.qty)}</p>
                    </div>
                  </div>
                </li>
              ))}
            </ul>

            <div className="shrink-0 border-t border-border bg-background px-5 pb-[calc(1.25rem+env(safe-area-inset-bottom))] pt-4 sm:px-6 sm:pb-6">
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
