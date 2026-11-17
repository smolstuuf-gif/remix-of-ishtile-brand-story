import { useEffect, useMemo, useState } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowLeft, LoaderCircle } from "lucide-react";
import PortalCarousel from "@/components/ui/portal-carousel";
import { BuyTheLookButton, LookProductsDrawer } from "@/components/lookbook/LookProductsDrawer";
import { fetchPublicLooks, type PublicLook } from "@/lib/public-store";
import { productById } from "@/lib/catalog";

export const Route = createFileRoute("/lookbook")({
  head: () => ({ meta: [
    { title: "The Lookbook — ISHTILE+" },
    { name: "description", content: "Shop complete outfits styled by ISHTILE+." },
    { name: "robots", content: "index,follow" },
  ] }),
  component: LookbookPage,
});

type Season = "spring" | "summer" | "festive" | "monsoon" | "winter";
const seasonNames: Record<Season, string> = {
  spring: "Spring", summer: "Summer", festive: "Festive", monsoon: "Monsoon", winter: "Winter",
};
const demoLooks: PublicLook[] = [
  {
    id: "demo-look-spring", slug: "spring-city-uniform", title: "The City Uniform",
    description: "A considered everyday uniform. Clean layers, quiet details, and room to move.",
    image_url: "https://images.unsplash.com/photo-1539109136881-3be0616acf4b?auto=format&fit=crop&w=1800&q=85",
    alt_text: "Editorial streetwear look in a neutral city setting", season: "spring", sort_order: 1,
    products: ["essentials-tee", "shorts"].map((id, index) => ({
      product: productById(id)!, defaultSize: "M", defaultColor: index === 0 ? "Black" : "Beige",
      defaultQuantity: 1, sortOrder: index,
    })),
  },
  {
    id: "demo-look-summer", slug: "summer-soft-structure", title: "Soft Structure",
    description: "Easy tailoring with a softer point of view. Made for long, unhurried days.",
    image_url: "https://images.unsplash.com/photo-1529139574466-a303027c1d8b?auto=format&fit=crop&w=1800&q=85",
    alt_text: "Minimal fashion editorial with relaxed contemporary styling", season: "summer", sort_order: 2,
    products: ["linen-shirt", "shorts"].map((id, index) => ({
      product: productById(id)!, defaultSize: "M", defaultColor: index === 0 ? "Off White" : "Beige",
      defaultQuantity: 1, sortOrder: index,
    })),
  },
  {
    id: "demo-look-festive", slug: "festive-after-hours", title: "After Hours",
    description: "A sharper layer for the hours after dark. Understated, with just enough attitude.",
    image_url: "https://images.unsplash.com/photo-1483985988355-763728e1935b?auto=format&fit=crop&w=1800&q=85",
    alt_text: "Contemporary fashion editorial with layered dark looks", season: "festive", sort_order: 3,
    products: ["farak-slip-dress", "mocha-kurta"].map((id, index) => ({
      product: productById(id)!, defaultSize: "M", defaultColor: index === 0 ? "Black" : "Off White",
      defaultQuantity: 1, sortOrder: index,
    })),
  },
  {
    id: "demo-look-monsoon", slug: "monsoon-utility", title: "Monsoon Utility",
    description: "Functional layers and grounded tones for unpredictable weather.",
    image_url: "https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?auto=format&fit=crop&w=1800&q=85",
    alt_text: "Contemporary layered streetwear editorial", season: "monsoon", sort_order: 4,
    products: ["hoodie", "cargo-pants"].map((id, index) => ({
      product: productById(id)!, defaultSize: "M", defaultColor: index === 0 ? "Black" : "Olive",
      defaultQuantity: 1, sortOrder: index,
    })),
  },
  {
    id: "demo-look-winter", slug: "winter-layering", title: "Winter Layers",
    description: "A considered outer layer with texture and warmth for cooler days.",
    image_url: "https://images.unsplash.com/photo-1483985988355-763728e1935b?auto=format&fit=crop&w=1800&q=85",
    alt_text: "Winter fashion editorial with layered outerwear", season: "winter", sort_order: 5,
    products: ["onen-jacket", "paisley-shawl"].map((id, index) => ({
      product: productById(id)!, defaultSize: "M", defaultColor: "Black",
      defaultQuantity: 1, sortOrder: index,
    })),
  },
].filter((look) => look.products.every((item) => !!item.product));

function LookbookPage() {
  const [looks, setLooks] = useState<PublicLook[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeIndex, setActiveIndex] = useState(0);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [season] = useState<Season | null>(() => {
    if (typeof window === "undefined") return null;
    const value = new URLSearchParams(window.location.search).get("season");
    return value && Object.keys(seasonNames).includes(value) ? value as Season : null;
  });
  useEffect(() => {
    let live = true;
    fetchPublicLooks().then((items) => { if (live) setLooks(items ?? []); }).catch(() => { if (live) setLooks([]); }).finally(() => { if (live) setLoading(false); });
    return () => { live = false; };
  }, []);
  const displayLooks = looks.length ? looks : demoLooks;
  const isDemo = looks.length === 0;
  const seasonalLooks = season ? displayLooks.filter((look) => look.season === season) : displayLooks;
  const images = useMemo(() => seasonalLooks.map((look) => ({ src: look.image_url, alt: look.alt_text || look.title, title: look.title })), [seasonalLooks]);
  const activeLook = seasonalLooks[activeIndex] ?? null;

  if (loading) return <main className="grid min-h-[80svh] place-items-center bg-[#171717] text-[#F0EAE0]"><LoaderCircle className="h-7 w-7 animate-spin" aria-label="Loading lookbook" /></main>;
  if (!seasonalLooks.length) return (
    <main className="grid min-h-screen place-items-center bg-[#171717] px-6 text-center text-[#F0EAE0]">
      <div className="max-w-md">
        <p className="text-[9px] font-bold uppercase tracking-[.24em] text-[#D5FE00]">ISHTILE+ / {season ? seasonNames[season] : "THE LOOKBOOK"}</p>
        <h1 className="mt-5 font-display text-3xl font-black tracking-tight md:text-5xl">A new edit is on its way.</h1>
        <p className="mt-3 text-sm leading-6 text-white/55">There are no published looks for this season yet. Check back soon.</p>
        <Link to="/lookbook" className="mt-7 inline-flex border border-[#D5FE00] px-5 py-3 text-[10px] font-bold uppercase tracking-wider text-[#D5FE00] transition hover:bg-[#D5FE00] hover:text-[#171717]">View all looks</Link>
      </div>
    </main>
  );

  if (season) return (
    <main className="min-h-screen bg-[#171717] px-5 pb-16 pt-24 text-[#F0EAE0] md:px-10 md:pt-28">
      <div className="mx-auto max-w-[1600px]">
        <div className="mb-10 flex flex-wrap items-end justify-between gap-5">
          <div>
            <p className="text-[9px] font-bold uppercase tracking-[.24em] text-[#D5FE00]">ISHTILE+ / THE LOOKBOOK</p>
            <h1 className="mt-3 font-display text-4xl font-black uppercase tracking-tight md:text-6xl">{seasonNames[season]} EDIT</h1>
            <p className="mt-3 max-w-xl text-sm text-white/55">Three considered looks, styled for the season.</p>
          </div>
          <Link to="/collections" className="inline-flex items-center gap-2 border border-white/25 px-4 py-3 text-[9px] font-bold uppercase tracking-[.16em] text-white/80 transition hover:border-[#D5FE00] hover:text-[#D5FE00]"><ArrowLeft className="h-3.5 w-3.5" /> Collections</Link>
        </div>
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 xl:grid-cols-3">
          {seasonalLooks.map((look, index) => (
            <article key={look.id} className="group min-w-0">
              <button type="button" onClick={() => { setActiveIndex(index); setDrawerOpen(true); }} className="block w-full text-left focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#D5FE00]">
                <div className="relative aspect-[3/4] overflow-hidden bg-white/5">
                  <img src={look.image_url} alt={look.alt_text || look.title} loading="lazy" className="h-full w-full object-cover transition duration-700 group-hover:scale-[1.025]" />
                  <span className="absolute bottom-4 left-4 bg-[#D5FE00] px-3 py-2 text-[9px] font-black uppercase tracking-[.14em] text-[#171717]">BUY THE LOOK</span>
                  <span className="absolute right-4 top-4 bg-[#171717]/80 px-2 py-1 text-[9px] font-bold tabular-nums text-white">{String(index + 1).padStart(2, "0")} / {String(seasonalLooks.length).padStart(2, "0")}</span>
                </div>
                <div className="flex items-start justify-between gap-4 border-b border-white/20 py-4">
                  <div>
                    <h2 className="text-lg font-extrabold uppercase tracking-tight md:text-xl">{look.title}</h2>
                    {look.description && <p className="mt-1 max-w-md text-xs leading-5 text-white/50">{look.description}</p>}
                  </div>
                  <span className="mt-1 text-[10px] font-bold uppercase tracking-widest text-[#D5FE00]">VIEW +</span>
                </div>
              </button>
            </article>
          ))}
        </div>
      </div>
      <LookProductsDrawer look={activeLook} open={drawerOpen} onOpenChange={setDrawerOpen} />
    </main>
  );

  return <main className="relative min-h-screen bg-[#171717]">
    <PortalCarousel images={images} label="NEXT LOOK" thumbWidth={190} followSpeed={0.16} duration={1.15} onIndexChange={setActiveIndex}>
      <div className="absolute left-6 top-7 text-[9px] font-bold uppercase tracking-[.24em] text-white/75 md:left-10 md:top-9">ISHTILE+ <span className="text-[#D5FE00]">/</span> THE LOOKBOOK{isDemo && <span className="ml-3 text-[#D5FE00]">· DEMO PREVIEW</span>}</div>
      <Link to="/collections" className="pointer-events-auto absolute right-6 top-7 inline-flex items-center gap-2 text-[9px] font-bold uppercase tracking-[.16em] text-white/80 transition hover:text-[#D5FE00] md:right-10 md:top-9"><ArrowLeft className="h-3.5 w-3.5" /> Collections</Link>
    </PortalCarousel>
    {!drawerOpen && activeLook && <BuyTheLookButton onClick={() => setDrawerOpen(true)} />}
    <LookProductsDrawer look={activeLook} open={drawerOpen} onOpenChange={setDrawerOpen} />
  </main>;
}
