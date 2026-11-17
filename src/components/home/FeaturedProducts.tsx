import { useEffect, useState } from "react";
import { ArrowRight } from "lucide-react";
import { cn } from "@/lib/utils";
import { formatTaka, products } from "@/lib/catalog";
import { useCart } from "@/lib/store";
import { fetchPublicProducts } from "@/lib/public-store";
import type { Product } from "@/lib/catalog";
import { FavoriteButton } from "@/components/ui/favorite-button";

export function FeaturedProducts() {
  const { toggleWish, isWished } = useCart();
  const [liveProducts, setLiveProducts] = useState<Product[] | null>(null);
  useEffect(() => { let live = true; fetchPublicProducts().then((items) => { if (live && items !== null) setLiveProducts(items); }).catch(() => undefined); return () => { live = false; }; }, []);
  const visibleProducts = liveProducts ? liveProducts.filter((product) => product.isFeatured).slice(0, 8) : products.slice(0, 8);
  if (liveProducts && visibleProducts.length === 0) return null;

  return (
    <section id="shop" aria-labelledby="featured-title" className="rounded-2xl md:border md:border-border/70 md:bg-panel/60 md:px-[4%] md:py-8">
      <div className="mb-5 flex items-end justify-between px-1 md:mb-6 md:px-0">
        <h2 id="featured-title" className="font-display text-[1.9rem] font-bold leading-none tracking-[-0.03em] md:text-[2.1rem]">
          Featured Products.
        </h2>
        <a href="/shop" className="group inline-flex items-center gap-1.5 text-[15px] font-medium md:text-base">
          View All
          <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
        </a>
      </div>

      <ul className="grid grid-cols-2 gap-3 md:grid-cols-3 md:gap-x-8 md:gap-y-4 lg:grid-cols-4">
        {visibleProducts.slice(0, 8).map((p, i) => {
          const wished = isWished(p.id);
          return (
            <li key={p.id} className={cn(i >= 6 && "hidden md:block")}>
              <article className="group flex h-full flex-col overflow-hidden rounded-xl bg-card shadow-[0_1px_2px_0_color-mix(in_oklab,var(--foreground)_6%,transparent)]">
                <div className="relative overflow-hidden">
                  <a href={`/shop/${p.id}`} aria-label={p.name}>
                    <img
                      src={p.image}
                      alt={p.name}
                      width={1024}
                      height={640}
                      loading="lazy"
                      className="aspect-[1.75/1] w-full object-cover object-[50%_25%] transition-transform duration-500 group-hover:scale-[1.04] md:aspect-[2.3/1]"
                    />
                  </a>
                  {(p.isOutOfStock || p.tags?.length) && <div className="absolute left-2.5 top-2.5 flex flex-wrap gap-1.5">{p.isOutOfStock && <span className="rounded-full bg-[#171717] px-2.5 py-1 text-[10px] font-bold uppercase tracking-wide text-white">Sold Out</span>}{(p.tags ?? []).slice(0, 2).map((tag) => <span key={tag} className="rounded-full bg-[#F0EAE0] px-2.5 py-1 text-[10px] font-bold uppercase tracking-wide text-[#171717]">{tag}</span>)}</div>}
                  <FavoriteButton
                    active={wished}
                    onToggle={() => toggleWish(p.id)}
                    label={wished ? `Remove ${p.name} from wishlist` : `Add ${p.name} to wishlist`}
                  />
                </div>
                <div className="flex flex-1 flex-col justify-between gap-2 px-2.5 pb-3 pt-2.5 md:px-3">
                  <h3 className="max-w-[10rem] text-[15px] font-medium leading-snug tracking-[-0.01em] md:text-[15px]">
                    <a href={`/shop/${p.id}`}>{p.name}</a>
                  </h3>
                  <p className="text-[15px] font-medium tabular-nums md:text-base">{formatTaka(p.price)}</p>
                </div>
              </article>
            </li>
          );
        })}
      </ul>
    </section>
  );
}
