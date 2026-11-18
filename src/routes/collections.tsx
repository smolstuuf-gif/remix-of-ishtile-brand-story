import { createFileRoute } from "@tanstack/react-router";
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
  loader: async () => {
    const items = await fetchHomepageCollections().catch(() => []);
    const liveSlides = items
      .filter((item) => item.image_url || item.video_url)
      .map((item) => {
        const season = ["spring", "summer", "festive", "monsoon", "winter"].find((value) => item.slug.toLowerCase().includes(value));
        return {
          title: item.title,
          image: item.image_url || "",
          video: item.video_url || undefined,
          url: season ? `/lookbook?season=${season}` : "/lookbook",
          linkLabel: `Explore ${item.title}`,
        };
      });
    return liveSlides.length ? liveSlides : collectionSlides;
  },
  component: CollectionsPage,
});

/**
 * Keep this editorial sequence stable for the lifetime of the page.
 * Replacing it asynchronously with the homepage collection query caused
 * ScrollTrigger to tear down and rebuild its pinned section after first paint;
 * depending on the returned homepage rows, it could also collapse the gallery
 * to a single slide and remove the scroll experience altogether.
 */
const collectionSlides = [
  { title: "Spring '25", image: colSpring, url: "/lookbook?season=spring", linkLabel: "Explore Spring" },
  { title: "Summer Essentials '25", image: colSummer, url: "/lookbook?season=summer", linkLabel: "Explore Summer" },
  { title: "Festive Collection '25", image: colFestive, url: "/lookbook?season=festive", linkLabel: "Explore Festive" },
  { title: "Monsoon '25", image: colMonsoon, url: "/lookbook?season=monsoon", linkLabel: "Explore Monsoon" },
  { title: "Winter Collection", image: cardWinter, url: "/lookbook?season=winter", linkLabel: "Explore Winter" },
];

function CollectionsPage() {
  const slides = Route.useLoaderData();
  return (
    <div className="min-h-screen bg-[#F0EAE0] text-[#171717]">
      <main>
        <ScrollGallery
          slides={slides}
          variant="studio"
          stripsCount={20}
          scrollPerTransition={120}
          timing={{ initialDelay: 70, finalDelay: 70 }}
          prefixLabel="ISHTILE+ / COLLECTIONS"
          linkLabel="Explore"
        />
      </main>
    </div>
  );
}
