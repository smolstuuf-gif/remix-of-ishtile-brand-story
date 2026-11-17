import { useEffect, useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { ArrowDown, LoaderCircle } from "lucide-react";
import { Footer } from "@/components/home/Footer";
import { ScrollGallery } from "@/components/ui/scroll-gallery";
import { ProductCard } from "@/components/shop/ProductCard";
import { fetchPublicProducts } from "@/lib/public-store";
import { products as catalogProducts, type Product } from "@/lib/catalog";
import colSpring from "@/assets/col-spring.jpg";
import colSummer from "@/assets/col-summer.jpg";
import colFestive from "@/assets/col-festive.jpg";
import colMonsoon from "@/assets/col-monsoon.jpg";
import cardWinter from "@/assets/card-winter.jpg";

export const Route = createFileRoute("/collections")({
  head: () => ({
    meta: [
      { title: "Collections — ISHTILE+" },
      { name: "description", content: "Explore the seasonal collections and shop the current ISHTILE+ selection." },
      { property: "og:title", content: "Collections — ISHTILE+" },
      { property: "og:description", content: "Seasonal collections and considered edits from ISHTILE+." },
      { property: "og:type", content: "website" },
    ],
  }),
  component: CollectionsPage,
});

const slides = [
  { title: "Spring '25", image: colSpring, url: "/lookbook", linkLabel: "Explore Spring" },
  { title: "Summer Essentials '25", image: colSummer, url: "/lookbook", linkLabel: "Explore Summer" },
  { title: "Festive Collection '25", image: colFestive, url: "/lookbook", linkLabel: "Explore Festive" },
  { title: "Monsoon '25", image: colMonsoon, url: "/lookbook", linkLabel: "Explore Monsoon" },
  { title: "Winter Collection", image: cardWinter, url: "/lookbook", linkLabel: "Explore Winter" },
];

function CollectionsPage() {
  const [currentProducts, setCurrentProducts] = useState<Product[]>(catalogProducts);
  const [productsLoading, setProductsLoading] = useState(true);

  useEffect(() => {
    let active = true;
    fetchPublicProducts()
      .then((items) => {
        if (active && items) setCurrentProducts(items);
      })
      .catch(() => {
        // Keep the bundled catalog visible if the public catalogue is temporarily unavailable.
      })
      .finally(() => {
        if (active) setProductsLoading(false);
      });
    return () => {
      active = false;
    };
  }, []);

  return (
    <div className="min-h-screen bg-[#F0EAE0] text-[#171717]">
      <main>
        <ScrollGallery slides={slides} variant="studio" prefixLabel="ISHTILE+ / COLLECTIONS" linkLabel="Explore" />

        <section className="px-5 pb-20 pt-16 md:px-10 md:pb-28 md:pt-24">
          <div className="mx-auto max-w-[1600px]">
            <div className="mb-8 flex items-end justify-between gap-5 border-b border-[#171717]/20 pb-5 md:mb-12 md:pb-7">
              <div>
                <p className="mb-3 text-[9px] font-bold uppercase tracking-[.24em] text-[#171717]/50">ISHTILE+ / THE CURRENT EDIT</p>
                <h2 className="font-wide text-3xl font-extrabold uppercase leading-[.95] tracking-tight md:text-5xl">Shop the collection</h2>
                <p className="mt-3 max-w-lg text-xs leading-5 text-[#171717]/60 md:text-sm">Explore the pieces currently available across our labels.</p>
              </div>
              <a href="#collection-products" className="mb-1 hidden items-center gap-2 text-[10px] font-bold uppercase tracking-[.14em] transition hover:text-[#657800] sm:inline-flex">
                Discover pieces <ArrowDown className="h-4 w-4" />
              </a>
            </div>

            {productsLoading && currentProducts.length === 0 ? (
              <div className="grid min-h-48 place-items-center">
                <LoaderCircle className="h-6 w-6 animate-spin" aria-label="Loading products" />
              </div>
            ) : currentProducts.length ? (
              <>
                <div className="mb-5 flex items-center justify-between text-[10px] font-semibold uppercase tracking-[.14em] text-[#171717]/50">
                  <span>Current selection</span>
                  <span>{String(currentProducts.length).padStart(2, "0")} pieces</span>
                </div>
                <div id="collection-products" className="grid grid-cols-2 gap-x-3 gap-y-6 sm:grid-cols-2 sm:gap-x-5 md:grid-cols-3 md:gap-y-9 lg:grid-cols-4">
                  {currentProducts.map((product) => (
                    <ProductCard key={product.id} product={product} className="rounded-none shadow-none" />
                  ))}
                </div>
              </>
            ) : (
              <p className="py-16 text-center text-sm text-[#171717]/55">No products are available right now. Please check back soon.</p>
            )}
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
}
