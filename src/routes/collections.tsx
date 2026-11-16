import { createFileRoute } from "@tanstack/react-router";
import { Footer } from "@/components/home/Footer";
import { ScrollGallery } from "@/components/ui/scroll-gallery";
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
  { title: "Spring '25", image: colSpring, url: "/shop", linkLabel: "Explore Spring" },
  { title: "Summer Essentials '25", image: colSummer, url: "/shop", linkLabel: "Explore Summer" },
  { title: "Festive Collection '25", image: colFestive, url: "/shop", linkLabel: "Explore Festive" },
  { title: "Monsoon '25", image: colMonsoon, url: "/shop", linkLabel: "Explore Monsoon" },
  { title: "Winter Collection", image: cardWinter, url: "/shop", linkLabel: "Explore Winter" },
];

function CollectionsPage() {
  return (
    <div className="min-h-screen">
      <main>
        <ScrollGallery slides={slides} variant="studio" prefixLabel="ISHTILE+ / COLLECTIONS" linkLabel="Explore" />
      </main>
      <Footer />
    </div>
  );
}
