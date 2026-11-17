import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { ScrollGallery } from "@/components/ui/scroll-gallery";
import { fetchHomepageCollections } from "@/lib/public-store";
import colSpring from "@/assets/col-spring.jpg";
import colSummer from "@/assets/col-summer.jpg";
import colFestive from "@/assets/col-festive.jpg";
import colMonsoon from "@/assets/col-monsoon.jpg";
import cardWinter from "@/assets/card-winter.jpg";

export const Route = createFileRoute("/collections")({
  head: () => ({
    meta: [
      { title: "Collections — ISHTILE+" },
      { name: "description", content: "Explore the seasonal collections and curated edits from ISHTILE+." },
      { property: "og:title", content: "Collections — ISHTILE+" },
      { property: "og:description", content: "Seasonal collections and considered edits from ISHTILE+." },
      { property: "og:type", content: "website" },
    ],
  }),
  component: CollectionsPage,
});

const slides = [
  { title: "Spring '25", image: colSpring, url: "/lookbook?season=spring", linkLabel: "Explore Spring" },
  { title: "Summer Essentials '25", image: colSummer, url: "/lookbook?season=summer", linkLabel: "Explore Summer" },
  { title: "Festive Collection '25", image: colFestive, url: "/lookbook?season=festive", linkLabel: "Explore Festive" },
  { title: "Monsoon '25", image: colMonsoon, url: "/lookbook?season=monsoon", linkLabel: "Explore Monsoon" },
  { title: "Winter Collection", image: cardWinter, url: "/lookbook?season=winter", linkLabel: "Explore Winter" },
];

function CollectionsPage() {
  const [liveSlides, setLiveSlides] = useState<typeof slides | null>(null);
  useEffect(() => {
    let live = true;
    fetchHomepageCollections().then((items) => {
      if (!live || !items.length) return;
      const mapped = items.filter((item) => item.is_active !== false && (item.video_url || item.image_url)).map((item) => {
        const slug = item.slug.toLowerCase();
        const season = ["spring", "summer", "festive", "monsoon", "winter"].find((value) => slug.includes(value));
        return { title: item.title, image: item.image_url || "", video: item.video_url || undefined, url: season ? `/lookbook?season=${season}` : `/lookbook`, linkLabel: `Explore ${item.title}` };
      });
      if (mapped.length) setLiveSlides(mapped);
    }).catch(() => undefined);
    return () => { live = false; };
  }, []);
  return (
    <div className="min-h-screen bg-[#F0EAE0] text-[#171717]">
      <main>
        <ScrollGallery
          slides={liveSlides ?? slides}
          variant="studio"
          prefixLabel="ISHTILE+ / COLLECTIONS"
          linkLabel="Explore"
        />
      </main>
    </div>
  );
}
