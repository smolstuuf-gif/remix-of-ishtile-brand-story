import { useEffect, useRef, useState } from "react";
import { ArrowRight, ChevronLeft, ChevronRight, ShieldCheck, Truck } from "lucide-react";
import brandOnen from "@/assets/brand-onen.jpg";
import brandFarak from "@/assets/brand-farak.jpg";
import brandMocha from "@/assets/brand-mocha.jpg";
import { cn } from "@/lib/utils";
import { Hanger, Sparkle, ThinPlus } from "./icons";
<video src={brand.video_url} autoPlay muted loop playsInline poster={brand.image_url || undefined} className="absolute inset-0 h-full w-full object-cover transition-transform duration-500 group-hover:scale-105" />

type Tile =
  | { kind: "name"; name: string; plus: "after" | "above" }
  | { kind: "photo"; image: string; alt: string }
  | { kind: "more" };

const tiles: Tile[] = [
  { kind: "name", name: "ONEN", plus: "after" },
  { kind: "photo", image: brandOnen, alt: "ONEN+ — man in sunglasses and black jacket" },
  { kind: "name", name: "FARAK", plus: "above" },
  { kind: "photo", image: brandFarak, alt: "FARAK — woman in a black dress" },
  { kind: "name", name: "MOCHA", plus: "after" },
  { kind: "photo", image: brandMocha, alt: "MOCHA+ — man in a cream kurta" },
  { kind: "more" },
];

const tileBase =
  "relative aspect-[29/31] w-[23vw] min-w-[84px] shrink-0 snap-start overflow-hidden rounded-xl md:w-auto md:min-w-0 md:flex-1";

function BrandTile({ tile }: { tile: Tile }) {
  if (tile.kind === "photo") {
    return (
      <a href="/brands" className={cn(tileBase, "group")}>
        <img
          src={tile.image}
          alt={tile.alt}
          width={816}
          height={816}
          loading="lazy"
          className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
        />
      </a>
    );
  }
  if (tile.kind === "more") {
    return (
      <a href="/brands" className={cn(tileBase, "group hidden bg-ink md:block")}>
        <div className="absolute -bottom-6 -right-6 h-16 w-16 rotate-12 bg-[repeating-linear-gradient(135deg,var(--lime)_0_3px,transparent_3px_7px)] opacity-80" />
        <span className="absolute inset-0 flex flex-col items-start justify-center px-[22%] text-[clamp(0.85rem,1vw,1rem)] font-medium leading-tight text-ink-foreground">
          More
          <span className="inline-flex items-center gap-1.5">
            Brands <ArrowRight className="h-4 w-4 text-lime transition-transform group-hover:translate-x-1" />
          </span>
        </span>
      </a>
    );
  }
  return (
    <a href="/brands" className={cn(tileBase, "group bg-ink")}>
      <span className="absolute inset-0 flex flex-col items-center justify-center text-ink-foreground">
        {tile.plus === "above" && <ThinPlus className="mb-1.5 h-3 w-3" />}
        <span className="inline-flex items-start text-[clamp(0.95rem,4.6vw,1.35rem)] font-medium tracking-[0.02em] md:text-[clamp(0.95rem,1.25vw,1.3rem)]">
          {tile.name}
          {tile.plus === "after" && <ThinPlus className="-mt-2 ml-0.5 h-3.5 w-3.5" />}
        </span>
      </span>
    </a>
  );
}

export function Brands() {
  const scroller = useRef<HTMLDivElement>(null);
  const [liveBrands, setLiveBrands] = useState<{ id: string; name: string; logo_url: string | null; image_url: string | null; video_url?: string | null }[] | null>(null);
  useEffect(() => { let live = true; fetchPublicBrands().then((items) => { if (live && items.length) setLiveBrands(items); }).catch(() => undefined); return () => { live = false; }; }, []);
  const scrollBy = (dir: number) =>
    scroller.current?.scrollBy({ left: dir * scroller.current.clientWidth * 0.6, behavior: "smooth" });

  return (
    <section
      id="brands"
      aria-labelledby="brands-title"
      className="flex items-center gap-3 rounded-xl py-6 md:gap-[2%] md:border md:border-border/70 md:bg-panel/60 md:px-[3.5%] md:py-3"
    >
      <div className="w-[34%] shrink-0 md:w-[17%]">
        <h2 id="brands-title" className="font-display text-[2.1rem] font-bold leading-[0.95] tracking-[-0.035em] md:text-[clamp(1.6rem,2.1vw,2.1rem)]">
          Our <br className="md:hidden" />
          Brands.
        </h2>
        <p className="mt-3 text-[13px] leading-snug text-muted-foreground md:text-[clamp(0.8rem,1vw,0.95rem)]">
          Discover a universe of curated fashion labels.
        </p>
        <a href="/brands" className="mt-4 inline-flex items-center gap-1.5 text-[13px] font-medium md:mt-6 md:text-[15px]">
          <span className="underline underline-offset-4 md:no-underline">Explore All</span>
          <ArrowRight className="h-4 w-4" />
        </a>
      </div>

      <button
        onClick={() => scrollBy(-1)}
        aria-label="Previous brands"
        className="shrink-0 text-foreground md:hidden"
      >
        <ChevronLeft className="h-5 w-5" strokeWidth={1.6} />
      </button>

      <div
        ref={scroller}
        className="no-scrollbar -mr-3 flex min-w-0 flex-1 snap-x snap-mandatory gap-2.5 overflow-x-auto pr-3 md:mr-0 md:gap-[1.2%] md:overflow-visible md:pr-0"
      >
        {liveBrands?.some((brand) => brand.video_url || brand.image_url || brand.logo_url) ? liveBrands.map((brand) => (
          <a key={brand.id} href="/brands" aria-label={`Explore ${brand.name}`} className={cn(tileBase, "group flex items-center justify-center bg-ink p-3 text-ink-foreground")}>
            {brand.video_url ? <video src={brand.video_url} autoPlay muted loop playsInline poster={brand.image_url || undefined} className="absolute inset-0 h-full w-full object-cover transition-transform duration-500 group-hover:scale-105" /> : brand.image_url ? <img src={brand.image_url} alt={brand.name} className="absolute inset-0 h-full w-full object-cover transition-transform duration-500 group-hover:scale-105" /> : brand.logo_url ? <img src={brand.logo_url} alt={brand.name} className="max-h-[55%] max-w-[80%] object-contain" /> : <span className="text-center text-[clamp(.9rem,1.4vw,1.35rem)] font-semibold">{brand.name}</span>}
          </a>
        )) : tiles.map((t, i) => (
          <BrandTile key={i} tile={t} />
        ))}
      </div>

      <a href="/brands" aria-label="All brands" className="hidden shrink-0 md:block">
        <ChevronRight className="h-6 w-6" strokeWidth={1.6} />
      </a>
    </section>
  );
}

const perks = [
  { icon: Sparkle, top: "Premium", bottom: "Quality", iconClass: "h-6 w-6" },
  { icon: Truck, top: "Fast", bottom: "Delivery", iconClass: "h-7 w-7" },
  { icon: ShieldCheck, top: "Easy", bottom: "Returns", iconClass: "h-7 w-7" },
  { icon: Hanger, top: "Shop with", bottom: "Confidence", iconClass: "h-7 w-7" },
];

export function TrustBar() {
  return (
    <section aria-label="Why shop with us" className="rounded-xl bg-panel/60 py-4 md:py-5">
      <ul className="grid grid-cols-4 items-center">
        {perks.map(({ icon: Icon, top, bottom, iconClass }, i) => (
          <li
            key={top}
            className={cn(
              "flex items-center justify-center gap-1.5 md:gap-5",
              i > 0 && "border-l border-foreground/25",
            )}
          >
            <Icon className={cn("shrink-0 max-md:h-4 max-md:w-4", iconClass)} strokeWidth={1.5} />
            <span className="text-[10px] leading-tight md:text-[15px]">
              {top}
              <br />
              {bottom}
            </span>
          </li>
        ))}
      </ul>
    </section>
  );
}
