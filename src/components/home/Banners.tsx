import { useEffect, useState } from "react";
import { ArrowRight } from "lucide-react";
import editorialArt from "@/assets/editorial-art.jpg";
import summerArt from "@/assets/summer-art.jpg";
import { ThinPlus } from "./icons";
import { fetchPublicBrandInfo, type PublicBrandInfo } from "@/lib/public-store";

export function Banners() {
  const [siteMedia, setSiteMedia] = useState<PublicBrandInfo | null>(null);
  useEffect(() => { let live = true; fetchPublicBrandInfo().then((value) => { if (live) setSiteMedia(value); }).catch(() => undefined); return () => { live = false; }; }, []);
  const editorialImage = siteMedia?.homepage_editorial_image_url || editorialArt;
  const summerImage = siteMedia?.homepage_summer_image_url || summerArt;
  return (
    <section className="grid gap-3 md:grid-cols-[1.18fr_1fr]">
      <a
        id="editorial"
        href="#editorial"
        className="group relative block min-h-[150px] overflow-hidden bg-ink max-md:-mx-3 max-md:rounded-r-2xl md:min-h-[200px] md:rounded-xl"
      >
        <img
          src={editorialImage}
          alt="Brutalist concrete building torn into a black paper collage"
          width={1920}
          height={640}
          loading="lazy"
          className="absolute inset-0 h-full w-full object-cover object-right transition-transform duration-700 group-hover:scale-[1.02]"
        />
        <div className="absolute inset-y-0 left-0 w-[62%] bg-gradient-to-r from-ink via-ink/85 to-transparent md:hidden" />
        <div className="relative px-[6%] py-6 md:py-[7%]">
          <h2 className="font-display text-[2.2rem] font-bold leading-none tracking-[-0.03em] text-ink-foreground md:text-[clamp(2rem,2.6vw,2.6rem)]">
            Editorial.
          </h2>
          <p className="mt-2 max-w-[12rem] text-[15px] leading-snug text-ink-foreground md:text-[clamp(0.95rem,1.25vw,1.2rem)]">
            Fashion, culture and beyond.
          </p>
          <span className="mt-4 inline-flex items-center gap-2 text-[15px] font-medium text-ink-foreground md:mt-5">
            <span className="underline underline-offset-4 group-hover:decoration-lime">Explore Articles</span>
            <ArrowRight className="h-4 w-4" />
          </span>
        </div>
      </a>

      <a
        href="#shop"
        className="group relative hidden min-h-[200px] overflow-hidden rounded-xl bg-lime md:block"
      >
        <img
          src={summerImage}
          alt="Black ISHTILE tee on a lime grunge background with colour arcs"
          width={1280}
          height={512}
          loading="lazy"
          className="absolute inset-0 h-full w-full object-cover object-right transition-transform duration-700 group-hover:scale-[1.02]"
        />
        <div className="relative px-[7%] py-[7%]">
          <h2 className="flex items-start gap-3 font-display text-[clamp(1.8rem,2.4vw,2.4rem)] font-bold leading-[1.02] tracking-[-0.03em] text-primary-foreground">
            <span>
              Summer
              <br />
              Essentials ’25
            </span>
            <ThinPlus className="mt-[1.3em] h-5 w-5" />
          </h2>
          <span className="mt-4 inline-flex items-center gap-2 text-base font-semibold text-primary-foreground">
            <span className="underline underline-offset-4">Shop the Collection</span>
            <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
          </span>
        </div>
      </a>
    </section>
  );
}
