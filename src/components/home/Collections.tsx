import { useEffect, useState } from "react";
import { ArrowRight } from "lucide-react";
import { Link } from "@tanstack/react-router";
import colSpring from "@/assets/col-spring.jpg";
import colSummer from "@/assets/col-summer.jpg";
import colFestive from "@/assets/col-festive.jpg";
import colMonsoon from "@/assets/col-monsoon.jpg";
import cardNewArrivals from "@/assets/card-new-arrivals.jpg";
import cardSummer from "@/assets/card-summer.jpg";
import cardWinter from "@/assets/card-winter.jpg";
import { Logo } from "./Logo";
import { fetchHomepageCollections } from "@/lib/public-store";
import { AutoplayVideo } from "@/components/ui/autoplay-video";

const desktopCollections = [
  { image: colSpring, alt: "Spring '25 — Fresh Fits. New Vibes.", w: 751, h: 370 },
  { image: colSummer, alt: "Summer Essentials '25 — Lightweight. Breathable. Effortless.", w: 751, h: 370 },
  { image: colFestive, alt: "Festive Collection '25 — Celebrate in Style.", w: 503, h: 247 },
  { image: colMonsoon, alt: "Monsoon Collection '25 — Stay Stylish. Even in the Rain.", w: 503, h: 247 },
];

export function DesktopCollections() {
  const [liveCollections, setLiveCollections] = useState<typeof desktopCollections | null>(null);
  useEffect(() => { let live = true; fetchHomepageCollections().then((items) => { if (live && items.length) setLiveCollections(items.filter((item) => item.show_homepage && (item.video_url || item.image_url)).map((item) => ({ image: item.image_url || "", video: item.video_url || undefined, alt: item.title, w: 751, h: 370 }))); }).catch(() => undefined); return () => { live = false; }; }, []);
  const visibleCollections = liveCollections ?? desktopCollections;
  if (liveCollections && !liveCollections.length) return null;
  return (
    <section aria-label="Collections" className="hidden gap-3 md:grid md:grid-cols-2 lg:grid-cols-4">
      {visibleCollections.map((c) => (
        <Link
          key={c.alt}
          to="/collections"
          aria-label={`Explore ${c.alt}`}
          className="group block overflow-hidden rounded-xl bg-ink shadow-[0_1px_0_0_var(--border)]"
        >
          {c.video ? <AutoplayVideo src={c.video} poster={c.image} className="aspect-[2.03/1] w-full object-cover transition-transform duration-500 group-hover:scale-[1.03]" /> : <img src={c.image} alt={c.alt} width={c.w} height={c.h} loading="lazy" className="aspect-[2.03/1] w-full object-cover transition-transform duration-500 group-hover:scale-[1.03]" />}
        </Link>
      ))}
    </section>
  );
}

function TextCard({ image, alt, title }: { image: string; alt: string; title: [string, string] }) {
  return (
    <Link
      to="/collections"
      aria-label={`Explore ${title.join(" ")}`}
      className="relative block aspect-[6/7] w-[42%] shrink-0 snap-start overflow-hidden rounded-2xl"
    >
      <img src={image} alt={alt} loading="lazy" className="absolute inset-0 h-full w-full object-cover" />
      <div className="absolute inset-x-[12%] top-[38%]">
        <p className="text-[6.2vw] font-semibold leading-[1.08] tracking-[-0.02em] text-foreground">
          {title[0]}
          <br />
          {title[1]}
        </p>
        <ArrowRight className="mt-[18%] h-7 w-7 text-foreground" strokeWidth={2.2} />
      </div>
    </Link>
  );
}

export function MobileCollections() {
  const [liveCollections, setLiveCollections] = useState<{ id: string; image: string; video?: string; title: string }[] | null>(null);
  useEffect(() => { let live = true; fetchHomepageCollections().then((items) => { if (live && items.length) setLiveCollections(items.filter((item) => item.show_homepage && item.image_url).map((item) => ({ id: item.id, image: item.image_url || "", video: item.video_url || undefined, title: item.title }))); }).catch(() => undefined); return () => { live = false; }; }, []);
  if (liveCollections?.length) return (
    <section aria-label="Collections" className="md:hidden"><div className="no-scrollbar -mr-3 flex snap-x snap-mandatory gap-3 overflow-x-auto pr-3">{liveCollections.map((item) => <Link key={item.id} to="/collections" aria-label={`Explore ${item.title}`} className="relative block aspect-[6/7] w-[42%] shrink-0 snap-start overflow-hidden rounded-2xl">{item.video ? <AutoplayVideo src={item.video} poster={item.image} className="absolute inset-0 h-full w-full object-cover" /> : <img src={item.image} alt={item.title} loading="lazy" className="absolute inset-0 h-full w-full object-cover" />}<div className="absolute inset-x-[10%] bottom-[12%] text-white"><p className="text-[6vw] font-bold leading-tight">{item.title}</p><ArrowRight className="mt-3 h-6 w-6" /></div></Link>)}</div></section>
  );
  if (liveCollections && !liveCollections.length) return null;
  return (
    <section aria-label="Collections" className="md:hidden">
      <div className="no-scrollbar -mr-3 flex snap-x snap-mandatory gap-3 overflow-x-auto pr-3">
        <TextCard image={cardNewArrivals} alt="New arrivals" title={["New", "Arrivals"]} />
        <TextCard image={cardSummer} alt="Summer essentials" title={["Summer", "Essentials"]} />
        <Link
          to="/collections"
          aria-label="Explore Winter Collection"
          className="relative block aspect-[6/7] w-[42%] shrink-0 snap-start overflow-hidden rounded-2xl"
        >
          <img src={cardWinter} alt="Winter collection" loading="lazy" className="absolute inset-0 h-full w-full object-cover" />
          <div className="absolute inset-x-[10%] top-[12%] text-foreground">
            <Logo className="text-[3.6vw]" />
            <p className="mt-[16%] font-wide text-[8.4vw] font-extrabold uppercase leading-[0.9] tracking-[-0.03em]">
              Winter
              <br />
              Collection
            </p>
            <p className="mt-3 text-[2.6vw] font-semibold uppercase tracking-[0.3em]">Wrap in style</p>
            <span className="mt-4 inline-flex rounded-full bg-ink px-3 py-1.5 text-[2.8vw] font-medium text-ink-foreground">
              Explore
            </span>
          </div>
        </Link>
      </div>
    </section>
  );
}
