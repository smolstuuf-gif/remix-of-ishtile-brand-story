import { useCallback, useEffect, useState } from "react";
import { ArrowLeft, ArrowRight, Menu, Search, ShoppingBag, User } from "lucide-react";
import heroDesktop from "@/assets/hero-desktop.jpg";
import heroMobile from "@/assets/hero-mobile.jpg";
import cardNewArrivals from "@/assets/card-new-arrivals.jpg";
import brandFarak from "@/assets/brand-farak.jpg";
import cardWinter from "@/assets/card-winter.jpg";
import { cn } from "@/lib/utils";
import { useCart } from "@/lib/store";
import { Logo } from "./Logo";

const nav = ["Shop", "Brands", "Editorial", "Culture", "About"];

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
  const { openSearch, openCart, openMenu, count } = useCart();
  return (
    <section className="relative hidden overflow-hidden rounded-2xl bg-ink md:block">
      <img
        src={heroDesktop}
        alt="Model in sunglasses with a lime crown sketch, lotus and colour arcs collage"
        width={1920}
        height={640}
        className="absolute inset-0 h-full w-full object-cover object-right"
      />
      <header className="relative z-10 flex items-center justify-between px-[3%] pt-6">
        <a href="/" aria-label="ISHTILE+ home" className="text-[1.35rem] text-ink-foreground">
          <Logo />
        </a>
        <nav className="absolute left-1/2 hidden -translate-x-1/2 items-center gap-10 lg:flex">
          {nav.map((item) => (
            <a
              key={item}
              href={`#${item.toLowerCase()}`}
              className="text-[15px] font-medium text-ink-foreground transition-colors hover:text-lime"
            >
              {item}
            </a>
          ))}
        </nav>
        <div className="flex items-center gap-6 text-ink-foreground">
          <button aria-label="Search" onClick={openSearch} className="transition-colors hover:text-lime">
            <Search className="h-6 w-6" strokeWidth={1.7} />
          </button>
          <button aria-label="Account" onClick={openMenu} className="transition-colors hover:text-lime">
            <User className="h-6 w-6" strokeWidth={1.7} />
          </button>
          <button
            aria-label={`Bag, ${count} item${count === 1 ? "" : "s"}`}
            onClick={openCart}
            className="relative transition-colors hover:text-lime"
          >
            <ShoppingBag className="h-6 w-6" strokeWidth={1.7} />
            {count > 0 && (
              <span className="absolute -right-1.5 -top-1.5 grid h-4 min-w-4 place-items-center rounded-full bg-lime px-1 text-[10px] font-semibold tabular-nums text-primary-foreground">
                {count > 99 ? "99+" : count}
              </span>
            )}
          </button>
        </div>
      </header>
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
    <section className="relative overflow-hidden bg-ink md:hidden" aria-roledescription="carousel">
      {/* minimal overlay header */}
      <header className="absolute inset-x-0 top-0 z-20 flex items-center justify-between px-5 pt-5 text-ink-foreground">
        <a href="/" aria-label="ISHTILE+ home" className="text-lg">
          <Logo />
        </a>
        <div className="flex items-center gap-4">
          <button aria-label="Search" onClick={openSearch}>
            <Search className="h-5 w-5" strokeWidth={1.8} />
          </button>
          <button aria-label="Bag" onClick={openCart}>
            <ShoppingBag className="h-5 w-5" strokeWidth={1.8} />
          </button>
          <button aria-label="Menu" onClick={openMenu}>
            <Menu className="h-5 w-5" strokeWidth={1.8} />
          </button>
        </div>
      </header>

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
