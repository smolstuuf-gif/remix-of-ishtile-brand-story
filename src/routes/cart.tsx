import { createFileRoute, Link } from "@tanstack/react-router";
import { Heart, Trash2 } from "lucide-react";
import { Footer } from "@/components/home/Footer";
import { QtyStepper } from "@/components/layout/CartDrawer";
import { Sparkle } from "@/components/home/icons";
import { formatTaka, productById } from "@/lib/catalog";
import { FREE_SHIPPING_OVER } from "@/lib/commerce";
import { useCart } from "@/lib/store";

export const Route = createFileRoute("/cart")({
  head: () => ({
    meta: [
      { title: "Your Bag — ISHTILE+" },
      {
        name: "description",
        content:
          "Review the pieces in your ISHTILE+ bag, change quantities and check out with bKash, Nagad, card or cash on delivery.",
      },
      { property: "og:title", content: "Your Bag — ISHTILE+" },
      {
        property: "og:description",
        content: "Your ISHTILE+ bag — update quantities, see delivery, and head to checkout.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: CartPage,
});

function CartPage() {
  const { lines, setQty, removeLine, subtotal, shipping, total, toggleWish, isWished } = useCart();
  const toFreeShipping = Math.max(0, FREE_SHIPPING_OVER - subtotal);

  return (
    <div className="min-h-screen">
      <main className="mx-auto max-w-[1600px] px-4 pb-12 pt-6 md:px-6 md:pt-8">
        <nav aria-label="Breadcrumb" className="text-sm text-muted-foreground">
          <ol className="flex items-center gap-2">
            <li>
              <Link to="/" className="hover:text-foreground">
                Home
              </Link>
            </li>
            <li aria-hidden="true">/</li>
            <li aria-current="page" className="text-foreground">
              Bag
            </li>
          </ol>
        </nav>

        <h1 className="mt-4 font-display text-[2.2rem] font-bold leading-none tracking-[-0.03em] md:text-[2.8rem]">
          Your Bag.
        </h1>

        {lines.length === 0 ? (
          <div className="mt-10 flex flex-col items-center rounded-xl border border-dashed border-border py-20 text-center">
            <Sparkle className="h-10 w-10 text-lime" />
            <p className="mt-4 font-display text-xl font-semibold">Your bag is empty.</p>
            <p className="mt-1 max-w-sm text-sm text-muted-foreground">
              Nothing here yet — the collection is one click away.
            </p>
            <Link
              to="/shop"
              className="mt-6 rounded-full bg-ink px-6 py-3 text-sm font-medium text-ink-foreground transition-colors hover:bg-foreground"
            >
              Shop the collection
            </Link>
          </div>
        ) : (
          <div className="mt-8 grid gap-8 lg:grid-cols-[1fr_360px]">
            <ul className="divide-y divide-border">
              {lines.map((l) => {
                const product = productById(l.productId);
                const wished = isWished(l.productId);
                return (
                  <li key={l.key} className="flex flex-wrap gap-4 py-5 sm:flex-nowrap">
                    <Link to="/shop/$productId" params={{ productId: l.productId }}>
                      <img
                        src={l.image}
                        alt={l.name}
                        width={160}
                        height={160}
                        className="h-28 w-28 shrink-0 rounded-xl object-cover"
                      />
                    </Link>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-start justify-between gap-3">
                        <div>
                          <p className="text-[11px] uppercase tracking-[0.14em] text-muted-foreground">
                            {product?.brand ?? "ISHTILE"}
                          </p>
                          <h2 className="mt-1 text-[17px] font-medium leading-snug">
                            <Link
                              to="/shop/$productId"
                              params={{ productId: l.productId }}
                              className="hover:underline"
                            >
                              {l.name}
                            </Link>
                          </h2>
                          <p className="mt-1 text-sm text-muted-foreground">
                            {l.color} · Size {l.size}
                          </p>
                        </div>
                        <p className="shrink-0 text-[17px] font-medium tabular-nums">
                          {formatTaka(l.price * l.qty)}
                        </p>
                      </div>

                      <div className="mt-4 flex flex-wrap items-center gap-4">
                        <QtyStepper qty={l.qty} onChange={(n) => setQty(l.key, n)} label={l.name} />
                        <button
                          type="button"
                          onClick={() => toggleWish(l.productId)}
                          className="inline-flex items-center gap-1.5 text-sm text-muted-foreground transition-colors hover:text-foreground"
                        >
                          <Heart className={wished ? "h-4 w-4 fill-foreground" : "h-4 w-4"} strokeWidth={1.6} />
                          {wished ? "Saved" : "Save for later"}
                        </button>
                        <button
                          type="button"
                          onClick={() => removeLine(l.key)}
                          className="inline-flex items-center gap-1.5 text-sm text-muted-foreground transition-colors hover:text-foreground"
                        >
                          <Trash2 className="h-4 w-4" strokeWidth={1.6} />
                          Remove
                        </button>
                      </div>
                    </div>
                  </li>
                );
              })}
            </ul>

            <aside>
              <div className="sticky top-24 rounded-xl border border-border bg-panel/70 p-5">
                <h2 className="font-display text-xl font-semibold tracking-[-0.02em]">Summary</h2>
                <dl className="mt-4 space-y-2 text-sm">
                  <div className="flex justify-between">
                    <dt className="text-muted-foreground">Subtotal</dt>
                    <dd className="tabular-nums">{formatTaka(subtotal)}</dd>
                  </div>
                  <div className="flex justify-between">
                    <dt className="text-muted-foreground">Delivery</dt>
                    <dd className="tabular-nums">{shipping === 0 ? "Free" : formatTaka(shipping)}</dd>
                  </div>
                  <div className="flex justify-between border-t border-border pt-3 text-base font-semibold">
                    <dt>Total</dt>
                    <dd className="tabular-nums">{formatTaka(total)}</dd>
                  </div>
                </dl>

                {toFreeShipping > 0 ? (
                  <p className="mt-4 rounded-lg bg-background px-3 py-2 text-xs text-muted-foreground">
                    Add {formatTaka(toFreeShipping)} more for free delivery.
                  </p>
                ) : (
                  <p className="mt-4 rounded-lg bg-lime px-3 py-2 text-xs font-medium text-primary-foreground">
                    Free delivery unlocked.
                  </p>
                )}

                <Link
                  to="/checkout"
                  className="mt-5 block rounded-full bg-lime py-3 text-center text-sm font-semibold text-primary-foreground transition-transform hover:scale-[1.01]"
                >
                  Checkout
                </Link>
                <Link
                  to="/shop"
                  className="mt-2 block rounded-full border border-border py-3 text-center text-sm font-medium transition-colors hover:bg-accent"
                >
                  Keep shopping
                </Link>
              </div>
            </aside>
          </div>
        )}
      </main>

      <Footer />
    </div>
  );
}
