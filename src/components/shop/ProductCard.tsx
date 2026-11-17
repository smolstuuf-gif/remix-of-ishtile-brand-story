import { Link } from "@tanstack/react-router";
import { Plus, Star } from "lucide-react";
import { cn } from "@/lib/utils";
import { formatTaka, type Product } from "@/lib/catalog";
import { useCart } from "@/lib/store";
import { FavoriteButton } from "@/components/ui/favorite-button";

/** Product tile used on the catalog, the bag page and the product page's related row. */
export function ProductCard({ product, className }: { product: Product; className?: string }) {
  const { addItem, openCart, toggleWish, isWished } = useCart();
  const wished = isWished(product.id);
  const defaultSize = product.sizes[0] ?? "";
  const defaultColor = product.colors[0]?.name ?? "";

  const add = () => {
    if (product.isOutOfStock) return;
    addItem(product, { size: defaultSize, color: defaultColor });
    openCart();
  };

  return (
    <article
      className={cn(
        "group flex h-full flex-col overflow-hidden rounded-xl bg-card shadow-[0_1px_2px_0_color-mix(in_oklab,var(--foreground)_6%,transparent)]",
        className,
      )}
    >
      <div className="relative overflow-hidden">
        <Link to="/shop/$productId" params={{ productId: product.id }} aria-label={product.name}>
          <img
            src={product.image}
            alt={product.alt}
            width={1024}
            height={640}
            loading="lazy"
            className="aspect-[1.75/1] w-full object-cover object-[50%_25%] transition-transform duration-500 group-hover:scale-[1.04] md:aspect-[2.3/1]"
          />
        </Link>

        {(product.isOutOfStock || product.isFeatured || product.tags?.length) && (
          <div className="absolute left-2.5 top-2.5 flex max-w-[80%] flex-wrap gap-1.5">
            {product.isOutOfStock && <span className="rounded-full bg-[#171717] px-2.5 py-1 text-[10px] font-bold uppercase tracking-wide text-white">Sold Out</span>}
            {product.isFeatured && !product.isOutOfStock && <span className="rounded-full bg-[#D5FE00] px-2.5 py-1 text-[10px] font-bold uppercase tracking-wide text-[#171717]">Featured</span>}
            {(product.tags ?? []).slice(0, 2).map((tag) => <span key={tag} className="rounded-full bg-[#F0EAE0] px-2.5 py-1 text-[10px] font-bold uppercase tracking-wide text-[#171717]">{tag}</span>)}
          </div>
        )}

        <FavoriteButton
          active={wished}
          onToggle={() => toggleWish(product.id)}
          label={wished ? `Remove ${product.name} from wishlist` : `Add ${product.name} to wishlist`}
        />

        <button
          type="button"
          onClick={add}
          disabled={product.isOutOfStock}
          className="absolute bottom-2.5 right-2.5 inline-flex items-center gap-1.5 rounded-full bg-ink px-3.5 py-2 text-[13px] font-medium text-ink-foreground opacity-0 transition-[opacity,transform,box-shadow] duration-200 hover:-translate-y-0.5 hover:shadow-lg active:translate-y-px active:scale-[0.97] group-hover:opacity-100 focus-visible:opacity-100 disabled:cursor-not-allowed disabled:opacity-100"
        >
          <Plus className="h-3.5 w-3.5" strokeWidth={2.4} />
          {product.isOutOfStock ? "Out of Stock" : "Add to Bag"}
        </button>
      </div>

      <div className="flex flex-1 flex-col justify-between gap-2 px-2.5 pb-3 pt-2.5 md:px-3">
        <div>
          <p className="text-[11px] uppercase tracking-[0.14em] text-muted-foreground">{product.brand}</p>
          <h3 className="mt-1 max-w-[10rem] text-[15px] font-medium leading-snug tracking-[-0.01em]">
            <Link to="/shop/$productId" params={{ productId: product.id }} className="hover:underline">
              {product.name}
            </Link>
          </h3>
        </div>
        <div className="flex items-center justify-between gap-2">
          <p className="text-[15px] font-medium tabular-nums md:text-base">{formatTaka(product.price)}</p>
          <span className="inline-flex items-center gap-1 text-[12px] text-muted-foreground tabular-nums">
            <Star className="h-3.5 w-3.5 fill-foreground text-foreground" strokeWidth={0} />
            {product.rating.toFixed(1)}
          </span>
        </div>
      </div>
    </article>
  );
}
