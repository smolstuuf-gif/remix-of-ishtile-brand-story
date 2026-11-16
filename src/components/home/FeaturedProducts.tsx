import { useEffect, useState } from "react";
import { ArrowRight } from "lucide-react";
import { cn } from "@/lib/utils";
import { formatTaka, products } from "@/lib/catalog";
import { useCart } from "@/lib/store";
import { fetchPublicProducts } from "@/lib/public-store";
import type { Product } from "@/lib/catalog";

export function FeaturedProducts() {
  const { toggleWish, isWished } = useCart();
  const [liveProducts, setLiveProducts] = useState<Product[] | null>(null);
  useEffect(() => { let live = true; fetchPublicProducts().then((items) => { if (live && items !== null) setLiveProducts(items); }).catch(() => undefined); return () => { live = false; }; }, []);
  const visibleProducts = liveProducts ?? products;

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
                  <button
                    type="button"
                    onClick={() => toggleWish(p.id)}
                    aria-label={wished ? `Remove ${p.name} from wishlist` : `Add ${p.name} to wishlist`}
                    aria-pressed={wished}
                    className="absolute right-2.5 top-2.5 grid h-8 w-8 place-items-center rounded-full text-foreground transition-colors hover:bg-background/60"
                  >
                    <svg
                      viewBox="0 0 24 24"
                      fill={wished ? "currentColor" : "none"}
                      stroke="currentColor"
                      strokeWidth={1.6}
                      className="h-[22px] w-[22px]"
                      aria-hidden="true"
                    >
                      <path d="M12 20.5s-7.5-4.7-7.5-10a4.5 4.5 0 0 1 7.5-3.3A4.5 4.5 0 0 1 19.5 10.5c0 5.3-7.5 10-7.5 10Z" />
                    </svg>
                  </button>
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
