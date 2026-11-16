import { useEffect, useRef, useState } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import { gsap } from "gsap";
import { ArrowDown, ArrowLeft, ArrowRight, ArrowUpRight, Pause, Play } from "lucide-react";
import { Footer } from "@/components/home/Footer";
import brandOnen from "@/assets/brand-onen.jpg";
import brandFarak from "@/assets/brand-farak.jpg";
import brandMocha from "@/assets/brand-mocha.jpg";

export const Route = createFileRoute("/brands")({
  head: () => ({
    meta: [
      { title: "Our Brands — ISHTILE+" },
      { name: "description", content: "Meet the independent labels shaping the ISHTILE+ universe: ONEN+, FARAK and MOCHA+." },
      { property: "og:title", content: "Our Brands — ISHTILE+" },
      { property: "og:description", content: "A curated universe of fashion, culture and individual expression." },
    ],
  }),
  component: BrandsPage,
});

const brands = [
  {
    name: "ONEN",
    suffix: "+",
    category: "Contemporary essentials",
    statement: "A quieter kind of confidence.",
    description: "Clean lines, considered details and everyday pieces made to move with you. ONEN+ keeps the focus on form, fit and the things that last.",
    image: brandOnen,
    alt: "ONEN+ campaign portrait in a black jacket and sunglasses",
    number: "01",
    accent: "#D5FE00",
  },
  {
    name: "FARAK",
    suffix: "",
    category: "Modern expression",
    statement: "Made to stand apart.",
    description: "FARAK is for the moments when personal style takes the lead: expressive silhouettes, confident choices and a point of view that feels entirely your own.",
    image: brandFarak,
    alt: "FARAK fashion campaign portrait in a black outfit",
    number: "02",
    accent: "#F0EAE0",
  },
  {
    name: "MOCHA",
    suffix: "+",
    category: "Contemporary heritage",
    statement: "Tradition, with a new rhythm.",
    description: "MOCHA+ brings familiar craft into the present. Thoughtful everyday dressing with a respect for heritage and an eye on what comes next.",
    image: brandMocha,
    alt: "MOCHA+ campaign portrait in a cream kurta",
    number: "03",
    accent: "#D5FE00",
  },
];

function BrandsPage() {
  const [active, setActive] = useState(0);
  const [playing, setPlaying] = useState(true);
  const rootRef = useRef<HTMLDivElement>(null);
  const imageRef = useRef<HTMLImageElement>(null);
  const copyRef = useRef<HTMLDivElement>(null);
  const brand = brands[active];

  const goTo = (next: number) => setActive((next + brands.length) % brands.length);
  const next = () => goTo(active + 1);
  const previous = () => goTo(active - 1);

  useEffect(() => {
    if (!playing) return;
    const timer = window.setInterval(() => setActive((current) => (current + 1) % brands.length), 7200);
    return () => window.clearInterval(timer);
  }, [playing]);

  useEffect(() => {
    const image = imageRef.current;
    const copy = copyRef.current;
    if (!image || !copy) return;
    const ctx = gsap.context(() => {
      gsap.fromTo(image, { opacity: 0.45, scale: 1.075, x: 28 }, {
        opacity: 1, scale: 1, x: 0, duration: 1.05, ease: "power3.out", clearProps: "transform",
      });
      gsap.fromTo(copy.children, { opacity: 0, y: 24 }, {
        opacity: 1, y: 0, duration: 0.72, stagger: 0.075, ease: "power3.out", delay: 0.12,
      });
    }, rootRef);
    return () => ctx.revert();
  }, [active]);

  return (
    <div ref={rootRef} className="min-h-screen bg-[#F0EAE0] text-[#171717]">
      <main>
        <section data-header-theme="dark" aria-label="Featured brands" className="relative isolate flex min-h-[calc(100svh-4rem)] flex-col overflow-hidden bg-[#171717] text-[#F0EAE0] md:min-h-[calc(100svh-4.5rem)]">
          <div className="pointer-events-none absolute inset-0 -z-10 opacity-[0.12]" style={{ backgroundImage: "radial-gradient(#F0EAE0 0.65px, transparent 0.65px)", backgroundSize: "7px 7px" }} />
          <div className="mx-auto flex w-full max-w-[1600px] flex-1 flex-col px-5 pb-7 pt-8 md:px-10 md:pb-9 md:pt-10">
            <div className="mb-7 flex items-center justify-between md:mb-5">
              <p className="text-[10px] font-semibold uppercase tracking-[0.28em] text-[#F0EAE0]/55 md:text-xs">ISHTILE+ / The brand universe</p>
              <span className="hidden text-[10px] uppercase tracking-[0.24em] text-[#F0EAE0]/50 md:block">Independent labels · One point of view</span>
            </div>

            <div className="grid flex-1 items-center gap-7 md:grid-cols-[0.88fr_1.12fr] md:gap-10">
              <div ref={copyRef} className="relative z-10 order-2 flex flex-col items-start md:order-1 md:py-8">
                <p className="mb-4 text-[10px] font-semibold uppercase tracking-[0.24em] text-[#D5FE00] md:text-xs">{brand.number} / {brand.category}</p>
                <h1 className="font-display text-[clamp(4.4rem,13vw,11.5rem)] font-black leading-[0.76] tracking-[-0.09em] text-[#F0EAE0]">
                  {brand.name}<span className="text-[#D5FE00]">{brand.suffix}</span>
                </h1>
                <p className="mt-7 max-w-[520px] font-display text-[clamp(1.4rem,3vw,2.5rem)] font-bold leading-[1.02] tracking-[-0.045em] text-[#D5FE00] md:mt-9">
                  {brand.statement}
                </p>
                <p className="mt-4 max-w-[430px] text-sm leading-[1.7] text-[#F0EAE0]/72 md:mt-5 md:text-base">
                  {brand.description}
                </p>
                <Link to="/shop" className="group mt-7 inline-flex items-center gap-3 border-b border-[#F0EAE0]/55 pb-2 text-xs font-bold uppercase tracking-[0.16em] text-[#F0EAE0] transition-colors hover:border-[#D5FE00] hover:text-[#D5FE00] md:mt-9">
                  Explore the label <ArrowUpRight className="h-4 w-4 transition-transform group-hover:translate-x-1 group-hover:-translate-y-1" />
                </Link>
              </div>

              <div className="relative order-1 min-h-[42svh] overflow-hidden bg-[#292929] md:order-2 md:min-h-[min(68svh,720px)]">
                <img
                  ref={imageRef}
                  key={brand.name}
                  src={brand.image}
                  alt={brand.alt}
                  fetchPriority="high"
                  className="absolute inset-0 h-full w-full object-cover object-center"
                />
                <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-[#171717]/40 via-transparent to-transparent md:bg-gradient-to-r md:from-[#171717]/10 md:via-transparent md:to-transparent" />
                <div className="absolute bottom-4 left-4 flex items-center gap-2 md:bottom-6 md:left-6">
                  <span className="h-2 w-2 rounded-full bg-[#D5FE00]" />
                  <span className="text-[9px] font-semibold uppercase tracking-[0.22em] text-white">Featured label</span>
                </div>
                <span className="absolute right-4 top-4 font-display text-5xl font-black tracking-[-0.08em] text-white/75 md:right-7 md:top-6 md:text-7xl">{brand.number}</span>
              </div>
            </div>

            <div className="mt-8 flex items-end justify-between gap-4 border-t border-[#F0EAE0]/20 pt-5 md:mt-7 md:pt-6">
              <div className="flex flex-1 items-center gap-3 md:gap-5">
                {brands.map((item, index) => (
                  <button key={item.name} type="button" onClick={() => goTo(index)} aria-label={`Show ${item.name}`} aria-current={active === index ? "true" : undefined} className="group flex min-w-0 flex-1 flex-col items-start gap-2 text-left">
                    <span className="h-[2px] w-full overflow-hidden bg-[#F0EAE0]/20">
                      <span className={`block h-full bg-[#D5FE00] transition-[width] duration-300 ${active === index ? "w-full" : "w-0 group-hover:w-1/3"}`} />
                    </span>
                    <span className={`text-[10px] font-bold uppercase tracking-[0.15em] transition-colors md:text-xs ${active === index ? "text-[#D5FE00]" : "text-[#F0EAE0]/48 group-hover:text-[#F0EAE0]"}`}>{item.name}{item.suffix}</span>
                  </button>
                ))}
              </div>
              <div className="flex shrink-0 items-center gap-3">
                <button type="button" onClick={() => setPlaying((value) => !value)} aria-label={playing ? "Pause slideshow" : "Play slideshow"} className="hidden h-9 w-9 items-center justify-center rounded-full border border-[#F0EAE0]/25 text-[#F0EAE0] transition-colors hover:border-[#D5FE00] hover:text-[#D5FE00] sm:flex">
                  {playing ? <Pause className="h-3.5 w-3.5" /> : <Play className="h-3.5 w-3.5" />}
                </button>
                <span className="font-display text-sm font-bold tabular-nums text-[#F0EAE0]/55">{brand.number}<span className="px-1.5 text-[#F0EAE0]/25">/</span>0{brands.length}</span>
                <button type="button" onClick={previous} aria-label="Previous brand" className="grid h-9 w-9 place-items-center rounded-full border border-[#F0EAE0]/25 transition-colors hover:border-[#D5FE00] hover:text-[#D5FE00]"><ArrowLeft className="h-4 w-4" /></button>
                <button type="button" onClick={next} aria-label="Next brand" className="grid h-9 w-9 place-items-center rounded-full bg-[#D5FE00] text-[#171717] transition-transform hover:scale-105"><ArrowRight className="h-4 w-4" /></button>
              </div>
            </div>
          </div>
          <a href="#label-directory" aria-label="Scroll to brand directory" className="absolute bottom-[6.8rem] right-5 hidden items-center gap-2 text-[9px] font-semibold uppercase tracking-[0.2em] text-[#F0EAE0]/50 xl:flex">
            Discover all labels <ArrowDown className="h-3.5 w-3.5" />
          </a>
        </section>

        <section id="label-directory" className="mx-auto max-w-[1600px] px-5 py-16 md:px-10 md:py-24">
          <div className="mb-9 flex flex-col justify-between gap-4 md:mb-12 md:flex-row md:items-end">
            <div>
              <p className="text-[10px] font-bold uppercase tracking-[0.25em] text-[#777166]">A considered selection</p>
              <h2 className="mt-3 font-display text-5xl font-black leading-[0.9] tracking-[-0.07em] md:text-7xl">Different names.<br />Shared curiosity.</h2>
            </div>
            <p className="max-w-sm text-sm leading-relaxed text-[#514c43] md:text-base">Explore the labels in the ISHTILE+ universe. Each has its own character, perspective and way of seeing style.</p>
          </div>
          <div className="grid gap-4 md:grid-cols-3 md:gap-5">
            {brands.map((item, index) => (
              <button key={item.name} type="button" onClick={() => { goTo(index); window.scrollTo({ top: 0, behavior: "smooth" }); }} className="group text-left">
                <div className="relative aspect-[4/5] overflow-hidden bg-[#ded7ca]">
                  <img src={item.image} alt={item.alt} loading="lazy" className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-[1.035]" />
                  <span className="absolute left-4 top-4 bg-[#171717] px-3 py-1.5 text-[9px] font-bold uppercase tracking-[0.2em] text-[#F0EAE0]">{item.category}</span>
                  <span className="absolute bottom-4 right-4 grid h-10 w-10 place-items-center rounded-full bg-[#D5FE00] text-[#171717] transition-transform group-hover:rotate-45"><ArrowUpRight className="h-4 w-4" /></span>
                </div>
                <div className="flex items-baseline justify-between border-b border-[#171717]/20 py-4">
                  <h3 className="font-display text-3xl font-black tracking-[-0.06em]">{item.name}{item.suffix}</h3>
                  <span className="text-[10px] font-semibold uppercase tracking-[0.18em] text-[#777166]">0{index + 1}</span>
                </div>
                <p className="pt-3 text-sm leading-relaxed text-[#514c43]">{item.statement}</p>
              </button>
            ))}
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
}
