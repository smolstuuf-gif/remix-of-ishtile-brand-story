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
import { fetchHeroContent } from "@/lib/public-store";
import { AutoplayVideo } from "@/components/ui/autoplay-video";
import { AnimatedImage } from "@/components/ui/animated-image";


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

const desktopSlides: { image?: string | undefined; video?: string | undefined; alt: string; lines: string[]; accent: string; tagline: string; link: string; href: string }[] = [
  {
    image: heroDesktop,
    alt: "Model in sunglasses with a lime crown sketch, lotus and colour arcs collage",
    lines: ["More", "Fashion."],
    accent: "More You.",
    tagline: "Discover Beyond Labels.",
    link: "Explore Brands",
    href: "#shop",
  },
  {
    image: cardNewArrivals,
    alt: "New arrivals fashion editorial",
    lines: ["New", "Arrivals."],
    accent: "Just Dropped.",
    tagline: "Fresh perspectives. New essentials.",
    link: "Shop New Arrivals",
    href: "#shop",
  },
  {
    image: brandFarak,
    alt: "FARAK fashion editorial",
    lines: ["Different", "Brands."],
    accent: "One Universe.",
    tagline: "Find your own point of view.",
    link: "Explore Brands",
    href: "#shop",
  },
];

export function DesktopHero() {
  const [slides, setSlides] = useState(desktopSlides);
  const [intervalMs, setIntervalMs] = useState(7000);
  const [index, setIndex] = useState(0);
  useEffect(() => {
    let live = true;
    fetchHeroContent().then(({ slides: remote, interval }) => {
      if (!live) return;
      setIntervalMs(interval);
      if (remote.length) setSlides(remote.map((item) => ({
        image: item.image_url || undefined, video: item.video_url || undefined, alt: item.title || "ISHTILE featured story",
        lines: [item.title || "Discover Beyond Labels"], accent: item.subtitle || "",
        tagline: "", link: "Explore",
        href: item.link_url || "#shop",
      })));
    }).catch(() => undefined);
    return () => { live = false; };
  }, []);
  const go = useCallback((dir: number) => {
    setIndex((current) => (current + dir + slides.length) % slides.length);
  }, [slides.length]);
  useEffect(() => {
    const timer = setInterval(() => go(1), intervalMs);
    return () => clearInterval(timer);
  }, [go, intervalMs]);
  const slide = slides[index] ?? slides[0]!;

  return (
    <section
      data-header-theme="dark"
      className="relative hidden w-full overflow-hidden bg-ink md:block"
      aria-roledescription="carousel"
      aria-label="Featured fashion stories"
    >
      {slides.map((item, i) => (
        <div
          key={item.alt}
          className={cn(
            "absolute inset-0 transition-opacity duration-700",
            i === index ? "opacity-100" : "pointer-events-none opacity-0",
          )}
          aria-hidden={i !== index}
        >
          {item.video ? <AutoplayVideo src={item.video} active={i === index} poster={item.image || undefined} className="h-full w-full object-cover object-center" /> : item.image ? <AnimatedImage src={item.image} alt={item.alt} className="h-full w-full object-cover object-center" loading={i === 0 ? "eager" : "lazy"} /> : <div className="h-full w-full bg-ink" />}
          <div className="absolute inset-0 bg-gradient-to-r from-black/65 via-black/15 to-transparent" />
        </div>
      ))}

      <div className="relative z-10 aspect-[1570/600] min-h-[500px]">
        <div className="absolute bottom-[13%] left-[4.2%] max-w-[48%]">
          <h1 className="font-headline text-[clamp(2.8rem,5.3vw,6rem)] font-extrabold italic uppercase tracking-[-0.03em] [&>span]:block [&>span]:leading-[0.88]">
            {slide.lines.map((line) => (
              <span key={line} className="text-ink-foreground">{line}</span>
            ))}
            {slide.accent && <span className="text-lime">{slide.accent}</span>}
          </h1>
          {slide.tagline && <p className="mt-3 text-[clamp(.9rem,1.25vw,1.2rem)] font-medium text-ink-foreground">{slide.tagline}</p>}
          <a
            href={slide.href}
            className="group mt-5 inline-flex items-center gap-3 text-[clamp(.85rem,1.05vw,1rem)] font-semibold text-ink-foreground underline decoration-1 underline-offset-[6px] transition-colors hover:decoration-lime"
          >
            {slide.link}
            <ArrowRight className="h-4 w-4 text-lime transition-transform group-hover:translate-x-1" />
          </a>
        </div>

        <div className="absolute bottom-[6%] left-[4.2%] z-20 flex items-center gap-3 text-ink-foreground">
          <span className="text-xs font-medium tabular-nums tracking-wider">
            {String(index + 1).padStart(2, "0")}
          </span>
          <span className="h-px w-8 bg-ink-foreground/80" />
          <span className="text-xs font-medium tabular-nums tracking-wider text-ink-foreground/70">
            {String(slides.length).padStart(2, "0")}
          </span>
          <button
            type="button"
            onClick={() => go(-1)}
            aria-label="Previous hero slide"
            className="ml-1 grid h-8 w-8 place-items-center text-ink-foreground transition-colors hover:text-lime"
          >
            <ArrowLeft className="h-4 w-4" />
          </button>
          <button
            type="button"
            onClick={() => go(1)}
            aria-label="Next hero slide"
            className="grid h-8 w-8 place-items-center text-ink-foreground transition-colors hover:text-lime"
          >
            <ArrowRight className="h-4 w-4" />
          </button>
        </div>
      </div>
    </section>
  );
}

const slides: { image?: string | undefined; video?: string | undefined; alt: string; lines: string[]; accent: string; href: string }[] = [
  { image: heroMobile, alt: "Model in sunglasses looking up, black and white", lines: ["More", "Fashion."], accent: "More You.", href: "#shop" },
  { image: cardNewArrivals, alt: "Model with dreadlocks on a beige wall", lines: ["New", "Arrivals."], accent: "Just Dropped.", href: "#shop" },
  { image: brandFarak, alt: "Model in a black dress against a lilac wall", lines: ["Different", "Brands."], accent: "One Universe.", href: "#shop" },
  { image: cardWinter, alt: "Model wrapped in a paisley shawl", lines: ["Winter", "Edit."], accent: "Wrap Up.", href: "#shop" },
];

export function MobileHero() {
  const { openSearch, openCart, openMenu } = useCart();
  const [activeSlides, setActiveSlides] = useState(slides);
  const [intervalMs, setIntervalMs] = useState(6000);
  const [index, setIndex] = useState(0);
  useEffect(() => {
    let live = true;
    fetchHeroContent().then(({ slides: remote, interval }) => {
      if (!live) return;
      setIntervalMs(interval);
      if (remote.length) setActiveSlides(remote.map((item) => ({
        image: item.mobile_image_url || item.image_url || undefined, video: item.mobile_video_url || item.video_url || undefined,
        alt: item.title || "ISHTILE featured story",
        lines: [item.title || "Discover"], accent: item.subtitle || "",
        href: item.link_url || "#shop",
      })));
    }).catch(() => undefined);
    return () => { live = false; };
  }, []);
  const go = useCallback((dir: number) => setIndex((i) => (i + dir + activeSlides.length) % activeSlides.length), [activeSlides.length]);
  useEffect(() => {
    const t = setInterval(() => go(1), intervalMs);
    return () => clearInterval(t);
  }, [go, intervalMs]);

  return (
    <section data-header-theme="dark" className="relative overflow-hidden bg-ink md:hidden" aria-roledescription="carousel">

      <div className="relative aspect-[1185/2200]">
        {activeSlides.map((s, i) => (
          <div
            key={s.alt}
            className={cn(
              "absolute inset-0 transition-opacity duration-700",
              i === index ? "opacity-100" : "pointer-events-none opacity-0",
            )}
            aria-hidden={i !== index}
          >
            {s.video ? <AutoplayVideo src={s.video} active={i === index} poster={s.image || undefined} className="h-full w-full object-cover grayscale" /> : s.image ? <AnimatedImage src={s.image} alt={s.alt} className="h-full w-full object-cover grayscale" loading={i === 0 ? "eager" : "lazy"} /> : <div className="h-full w-full bg-ink" />}
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
                href={s.href || "#shop"}
                className="mt-4 inline-block text-[5.6vw] font-semibold text-ink-foreground underline decoration-lime decoration-2 underline-offset-[7px]"
              >
                Discover Beyond Labels.
              </a>
            </div>
          </div>
        ))}

        <div className="absolute bottom-[5.5%] right-4 z-10 flex items-center gap-3 text-ink-foreground">
          <span className="mr-1 text-sm font-medium tabular-nums">
            {index + 1} / {activeSlides.length}
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
