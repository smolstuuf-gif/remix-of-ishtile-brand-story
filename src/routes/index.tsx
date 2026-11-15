import { createFileRoute } from "@tanstack/react-router";
import { DesktopHero, MobileHero } from "@/components/home/Hero";
import { DesktopCollections, MobileCollections } from "@/components/home/Collections";
import { FeaturedProducts } from "@/components/home/FeaturedProducts";
import { Banners } from "@/components/home/Banners";
import { Brands, TrustBar } from "@/components/home/Brands";
import { Footer } from "@/components/home/Footer";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "ISHTILE+ — More Fashion. More You." },
      {
        name: "description",
        content:
          "Shop ISHTILE+ essentials, seasonal collections and curated labels like ONEN+, FARAK and MOCHA+. Discover beyond labels.",
      },
      { property: "og:title", content: "ISHTILE+ — More Fashion. More You." },
      {
        property: "og:description",
        content: "Essentials, seasonal collections and curated fashion labels. Discover beyond labels.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Index,
});

function Index() {
  return (
    <div className="min-h-screen">
      <MobileHero />
      <DesktopHero />
      <main className="mx-auto flex max-w-[1600px] flex-col gap-4 px-3 pb-6 pt-3 md:gap-4 md:px-6 md:pt-6">
        <DesktopCollections />
        <MobileCollections />
        <div className="pt-4 md:pt-2">
          <FeaturedProducts />
        </div>
        <div className="mt-4 flex flex-col gap-3 md:mt-2">
          <Banners />
          <Brands />
          <TrustBar />
        </div>
      </main>
      <Footer />
    </div>
  );
}
