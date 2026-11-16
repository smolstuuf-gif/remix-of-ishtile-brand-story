import { createFileRoute, Link } from "@tanstack/react-router";
import { AccountAccess } from "@/components/account/AccountAccess";
import { PageShell, pageHead } from "@/components/layout/PageShell";
import { formatTaka } from "@/lib/catalog";
import { useCart } from "@/lib/store";

export const Route = createFileRoute("/account")({
  head: () => pageHead("My Account", "Your ISHTILE+ orders, saved pieces and delivery details in one place."),
  component: AccountPage,
});

function AccountPage() {
  const { orders, wishlist } = useCart();
  return (
    <>
    <AccountAccess />
    <PageShell eyebrow="Account" title="My Account" intro="Orders placed on this device are listed here.">
      <div className="grid gap-6 lg:grid-cols-[2fr_1fr]">
        <section className="rounded-2xl border border-border bg-card p-6">
          <h2 className="text-xl font-semibold">Orders</h2>
          {orders.length === 0 ? (
            <p className="mt-3 text-muted-foreground">No orders yet. <Link to="/shop" className="underline">Start shopping</Link>.</p>
          ) : (
            <ul className="mt-4 divide-y divide-border">
              {orders.map((o) => (
                <li key={o.number} className="flex flex-wrap items-center justify-between gap-2 py-4">
                  <div>
                    <p className="font-semibold">{o.number}</p>
                    <p className="text-sm text-muted-foreground">{new Date(o.placedAt).toLocaleDateString()} · {o.method}</p>
                  </div>
                  <p className="font-semibold">{formatTaka(o.total)}</p>
                </li>
              ))}
            </ul>
          )}
        </section>
        <aside className="rounded-2xl bg-ink p-6 text-ink-foreground">
          <h2 className="text-xl font-semibold">Wishlist</h2>
          <p className="mt-2 text-ink-foreground/80">{wishlist.length} saved piece{wishlist.length === 1 ? "" : "s"}</p>
          <Link to="/wishlist" className="mt-5 inline-flex rounded-full bg-lime px-5 py-2.5 font-medium text-ink">View wishlist</Link>
        </aside>
      </div>
    </PageShell>
    </>
  );
}
