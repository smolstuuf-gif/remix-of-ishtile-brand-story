import { useState } from "react";
import { ArrowRight, Heart } from "lucide-react";
import { cn } from "@/lib/utils";
import { formatTaka, products } from "./data";

export function FeaturedProducts() {
  const [liked, setLiked] = useState<Record<string, boolean>>({});

  return (
    <section id="shop" aria-labelledby="featured-title" className="rounded-2xl md:border md:border-border/70 md:bg-panel/60 md:px-[4%] md:py-8">
      <div className="mb-5 flex items-end justify-between px-1 md:mb-6 md:px-0">
        <h2 id="featured-title" className="font-display text-[1.9rem] font-bold leading-none tracking-[-0.03em] md:text-[2.1rem]">
          Featured Products.
        </h2>
        <a href="#shop" className="group inline-flex items-center gap-1.5 text-[15px] font-medium md:text-base">
          View All
          <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
        </a>
      </div>

      <ul className="grid grid-cols-2 gap-3 md:grid-cols-3 md:gap-x-8 md:gap-y-4 lg:grid-cols-4">
        {products.map((p, i) => (
          <li key={p.id} className={cn(i >= 6 && "hidden md:block")}>
            <article className="group flex h-full flex-col overflow-hidden rounded-xl bg-card shadow-[0_1px_2px_0_color-mix(in_oklab,var(--foreground)_6%,transparent)]">
              <div className="relative overflow-hidden">
                <img
                  src={p.image}
                  alt={p.name}
                  width={1024}
                  height={640}
                  loading="lazy"
                  className="aspect-[1.75/1] w-full object-cover object-[50%_25%] transition-transform duration-500 group-hover:scale-[1.04] md:aspect-[2.3/1]"
                />
                <button
                  type="button"
                  onClick={() => setLiked((l) => ({ ...l, [p.id]: !l[p.id] }))}
                  aria-label={liked[p.id] ? `Remove ${p.name} from wishlist` : `Add ${p.name} to wishlist`}
                  aria-pressed={!!liked[p.id]}
                  className="absolute right-2.5 top-2.5 grid h-8 w-8 place-items-center rounded-full text-foreground transition-colors hover:bg-background/60"
                >
                  <Heart className={cn("h-[22px] w-[22px]", liked[p.id] && "fill-foreground")} strokeWidth={1.6} />
                </button>
              </div>
              <div className="flex flex-1 flex-col justify-between gap-2 px-2.5 pb-3 pt-2.5 md:px-3">
                <h3 className="max-w-[10rem] text-[15px] font-medium leading-snug tracking-[-0.01em] md:text-[15px]">
                  {p.name}
                </h3>
                <p className="text-[15px] font-medium tabular-nums md:text-base">{formatTaka(p.price)}</p>
              </div>
            </article>
          </li>
        ))}
      </ul>
    </section>
  );
}
