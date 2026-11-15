import { useCallback, useEffect, useState } from "react";
import { ArrowLeft, ArrowRight, Menu, Search, ShoppingBag } from "lucide-react";
import heroDesktop from "@/assets/hero-desktop.jpg";
import heroMobile from "@/assets/hero-mobile.jpg";
import cardNewArrivals from "@/assets/card-new-arrivals.jpg";
import brandFarak from "@/assets/brand-farak.jpg";
import cardWinter from "@/assets/card-winter.jpg";
import { cn } from "@/lib/utils";
import { useCart } from "@/lib/store";
import { Logo } from "./Logo";


function Headline({ className }: { className?: string }) {
  return (
    <h1
      className={cn(
        "font-headline font-extrabold italic uppercase tracking-[-0.03em] [&>span]:leading-[0.9]",
        className,
      )}
    >
      <span className="block text-ink-foreground">More</span>
      <span className="block text-ink-foreground">Fashion.</span>
      <span className="block text-lime">More You.</span>
    </h1>
  );
}

export function DesktopHero() {
  return (
    <section data-header-theme="dark" className="relative hidden w-full overflow-hidden bg-ink md:block">
      <img
        src={heroDesktop}
        alt="Model in sunglasses with a lime crown sketch, lotus and colour arcs collage"
        width={1920}
        height={640}
        className="absolute inset-0 h-full w-full object-cover object-right"
      />
      <div className="relative z-10 aspect-[1570/410] min-h-[360px]">
        <div className="absolute left-[5.5%] top-[17%]">
          <Headline className="text-[clamp(3rem,5.3vw,6rem)]" />
          <a
            href="#shop"
            className="group mt-[clamp(1.25rem,2.6vw,2.5rem)] inline-flex items-center gap-3 text-[clamp(1rem,1.35vw,1.3rem)] font-medium text-ink-foreground"
          >
            <span className="underline decoration-1 underline-offset-[6px] group-hover:decoration-lime">
              Discover Beyond Labels.
            </span>
            <ArrowRight className="h-5 w-5" />
            <ArrowRight className="h-5 w-5 text-lime transition-transform group-hover:translate-x-1" strokeWidth={2.6} />
          </a>
        </div>
      </div>
    </section>
  );
}

const slides = [
  { image: heroMobile, alt: "Model in sunglasses looking up, black and white", lines: ["More", "Fashion."], accent: "More You." },
  { image: cardNewArrivals, alt: "Model with dreadlocks on a beige wall", lines: ["New", "Arrivals."], accent: "Just Dropped." },
  { image: brandFarak, alt: "Model in a black dress against a lilac wall", lines: ["Different", "Brands."], accent: "One Universe." },
  { image: cardWinter, alt: "Model wrapped in a paisley shawl", lines: ["Winter", "Edit."], accent: "Wrap Up." },
];

export function MobileHero() {
  const { openSearch, openCart, openMenu } = useCart();
  const [index, setIndex] = useState(0);
  const go = useCallback((dir: number) => setIndex((i) => (i + dir + slides.length) % slides.length), []);

  useEffect(() => {
    const t = setInterval(() => go(1), 6000);
    return () => clearInterval(t);
  }, [go, index]);

  return (
    <section data-header-theme="dark" className="relative overflow-hidden bg-ink md:hidden" aria-roledescription="carousel">

      <div className="relative aspect-[1185/1680]">
        {slides.map((s, i) => (
          <div
            key={s.alt}
            className={cn(
              "absolute inset-0 transition-opacity duration-700",
              i === index ? "opacity-100" : "pointer-events-none opacity-0",
            )}
            aria-hidden={i !== index}
          >
            <img
              src={s.image}
              alt={s.alt}
              className="h-full w-full object-cover grayscale"
              loading={i === 0 ? "eager" : "lazy"}
            />
            <div className="absolute inset-0 bg-gradient-to-b from-ink/30 via-transparent to-ink/80" />
            <div className="absolute bottom-[12%] left-[7%] right-[6%] origin-bottom-left -rotate-[7deg]">
              <h2 className="font-headline text-[12.6vw] font-extrabold italic uppercase tracking-[-0.035em] [&>span]:leading-[0.88]">
                {s.lines.map((l) => (
                  <span key={l} className="block text-ink-foreground">
                    {l}
                  </span>
                ))}
                <span className="block text-lime">{s.accent}</span>
              </h2>
              <a
                href="#shop"
                className="mt-4 inline-block text-[5.6vw] font-semibold text-ink-foreground underline decoration-lime decoration-2 underline-offset-[7px]"
              >
                Discover Beyond Labels.
              </a>
            </div>
          </div>
        ))}

        <div className="absolute bottom-[5.5%] right-4 z-10 flex items-center gap-3 text-ink-foreground">
          <span className="mr-1 text-sm font-medium tabular-nums">
            {index + 1} / {slides.length}
          </span>
          <button
            onClick={() => go(-1)}
            aria-label="Previous slide"
            className="grid h-8 w-8 place-items-center rounded-full border border-ink-foreground/80"
          >
            <ArrowLeft className="h-4 w-4" />
          </button>
          <button
            onClick={() => go(1)}
            aria-label="Next slide"
            className="grid h-8 w-8 place-items-center rounded-full border border-ink-foreground/80"
          >
            <ArrowRight className="h-4 w-4" />
          </button>
        </div>
      </div>

      {/* soft wave into the paper background */}
      <svg
        viewBox="0 0 390 28"
        preserveAspectRatio="none"
        className="absolute inset-x-0 -bottom-px h-6 w-full fill-background"
        aria-hidden="true"
      >
        <path d="M0 14C60 2 120 2 190 12C260 22 320 24 390 8V28H0Z" />
      </svg>
    </section>
  );
}
