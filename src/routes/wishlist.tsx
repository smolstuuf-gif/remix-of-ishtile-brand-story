import { createFileRoute, Link } from "@tanstack/react-router";
import { PageShell, pageHead } from "@/components/layout/PageShell";
import { ProductCard } from "@/components/shop/ProductCard";
import { productById } from "@/lib/catalog";
import { useCart } from "@/lib/store";

export const Route = createFileRoute("/wishlist")({
  head: () => pageHead("Wishlist", "The ISHTILE+ pieces you've saved for later — move them to your bag when you're ready."),
  component: WishlistPage,
});

function WishlistPage() {
  const { wishlist } = useCart();
  const items = wishlist.map((id) => productById(id)).filter((p) => p !== undefined);
  return (
    <PageShell eyebrow="Saved" title="Wishlist" intro="Pieces you've hearted. Tap one to choose a size and add it to your bag.">
      {items.length === 0 ? (
        <div className="rounded-2xl border border-border bg-card p-10 text-center">
          <p className="text-lg font-semibold">Nothing saved yet</p>
          <p className="mt-1 text-muted-foreground">Tap the heart on any product to keep it here.</p>
          <Link to="/shop" className="mt-6 inline-flex rounded-full bg-ink px-6 py-3 font-medium text-ink-foreground">Browse the shop</Link>
        </div>
      ) : (
        <div className="grid grid-cols-2 gap-3 md:grid-cols-3 lg:grid-cols-4">
          {items.map((p) => <ProductCard key={p.id} product={p} />)}
        </div>
      )}
    </PageShell>
  );
}
