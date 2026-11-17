import { useEffect, useMemo, useState } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowLeft, LoaderCircle } from "lucide-react";
import PortalCarousel from "@/components/ui/portal-carousel";
import { BuyTheLookButton, LookProductsDrawer } from "@/components/lookbook/LookProductsDrawer";
import { Footer } from "@/components/home/Footer";
import { fetchPublicLooks, type PublicLook } from "@/lib/public-store";

export const Route = createFileRoute("/lookbook")({
  head: () => ({ meta: [
    { title: "The Lookbook — ISHTILE+" },
    { name: "description", content: "Shop complete outfits styled by ISHTILE+." },
    { name: "robots", content: "index,follow" },
  ] }),
  component: LookbookPage,
});

function LookbookPage() {
  const [looks, setLooks] = useState<PublicLook[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeIndex, setActiveIndex] = useState(0);
  const [drawerOpen, setDrawerOpen] = useState(false);
  useEffect(() => {
    let live = true;
    fetchPublicLooks().then((items) => { if (live) setLooks(items ?? []); }).catch(() => { if (live) setLooks([]); }).finally(() => { if (live) setLoading(false); });
    return () => { live = false; };
  }, []);
  const images = useMemo(() => looks.map((look) => ({ src: look.image_url, alt: look.alt_text || look.title, title: look.title })), [looks]);
  const activeLook = looks[activeIndex] ?? null;

  if (loading) return <main className="grid min-h-[80svh] place-items-center bg-[#171717] text-[#F0EAE0]"><LoaderCircle className="h-7 w-7 animate-spin" aria-label="Loading lookbook" /></main>;
  if (!looks.length) return <div className="flex min-h-screen flex-col bg-[#F0EAE0] text-[#171717]"><main className="grid flex-1 place-items-center px-6 text-center"><div><p className="text-[10px] font-bold uppercase tracking-[.25em] text-black/45">ISHTILE+ / LOOKBOOK</p><h1 className="mt-4 font-wide text-4xl font-extrabold uppercase tracking-tight md:text-6xl">The looks are<br />coming together.</h1><p className="mx-auto mt-4 max-w-md text-sm leading-6 text-black/55">Our styling edits will appear here as soon as they are published.</p><Link to="/collections" className="mt-7 inline-flex items-center gap-2 border border-[#171717]/25 px-5 py-3 text-xs font-bold uppercase tracking-wider"><ArrowLeft className="h-4 w-4" /> Back to collections</Link></div></main><Footer /></div>;

  return <main className="relative min-h-screen bg-[#171717]">
    <PortalCarousel images={images} label="NEXT LOOK" thumbWidth={190} followSpeed={0.16} duration={1.15} onIndexChange={setActiveIndex}>
      <div className="absolute left-6 top-7 text-[9px] font-bold uppercase tracking-[.24em] text-white/75 md:left-10 md:top-9">ISHTILE+ <span className="text-[#D5FE00]">/</span> THE LOOKBOOK</div>
      <Link to="/collections" className="pointer-events-auto absolute right-6 top-7 inline-flex items-center gap-2 text-[9px] font-bold uppercase tracking-[.16em] text-white/80 transition hover:text-[#D5FE00] md:right-10 md:top-9"><ArrowLeft className="h-3.5 w-3.5" /> Collections</Link>
    </PortalCarousel>
    {!drawerOpen && <BuyTheLookButton onClick={() => setDrawerOpen(true)} />}
    <LookProductsDrawer look={activeLook} open={drawerOpen} onOpenChange={setDrawerOpen} />
  </main>;
}
