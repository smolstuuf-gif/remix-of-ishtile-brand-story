import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowUpRight } from "lucide-react";
import { Footer } from "@/components/home/Footer";
import colSpring from "@/assets/col-spring.jpg";
import colSummer from "@/assets/col-summer.jpg";
import colFestive from "@/assets/col-festive.jpg";
import colMonsoon from "@/assets/col-monsoon.jpg";
import cardWinter from "@/assets/card-winter.jpg";

export const Route = createFileRoute("/collections")({
  head: () => ({
    meta: [
      { title: "Collections — ISHTILE+" },
      { name: "description", content: "Explore the seasonal collections and curated edits from ISHTILE+. Discover fresh fits, summer essentials, festive style and more." },
      { property: "og:title", content: "Collections — ISHTILE+" },
      { property: "og:description", content: "Seasonal collections and considered edits from ISHTILE+." },
      { property: "og:type", content: "website" },
    ],
  }),
  component: CollectionsPage,
});

const collections = [
  { title: "Spring '25", subtitle: "Fresh fits. New vibes.", image: colSpring, alt: "Spring collection editorial", tone: "light" },
  { title: "Summer Essentials '25", subtitle: "Lightweight. Breathable. Effortless.", image: colSummer, alt: "Summer essentials collection editorial", tone: "dark" },
  { title: "Festive Collection '25", subtitle: "Celebrate in style.", image: colFestive, alt: "Festive collection editorial", tone: "light" },
  { title: "Monsoon '25", subtitle: "Stay stylish. Even in the rain.", image: colMonsoon, alt: "Monsoon collection editorial", tone: "light" },
  { title: "Winter Collection", subtitle: "Wrap in style.", image: cardWinter, alt: "Winter collection editorial", tone: "light" },
];

function CollectionsPage() {
  return (
    <div className="min-h-screen">
      <main className="mx-auto max-w-[1600px] px-4 pb-16 pt-7 md:px-6 md:pt-12">
        <nav aria-label="Breadcrumb" className="text-sm text-muted-foreground">
          <ol className="flex items-center gap-2">
            <li><Link to="/" className="hover:text-foreground">Home</Link></li>
            <li aria-hidden="true">/</li>
            <li aria-current="page" className="text-foreground">Collections</li>
          </ol>
        </nav>

        <header className="mt-7 flex flex-col justify-between gap-5 border-b border-border pb-7 md:mt-10 md:flex-row md:items-end md:pb-10">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.24em] text-muted-foreground">The ISHTILE+ edit</p>
            <h1 className="mt-3 font-headline text-[clamp(2.8rem,8vw,7rem)] font-extrabold uppercase italic leading-[0.86] tracking-[-0.055em]">Collections<span className="text-lime">.</span></h1>
          </div>
          <p className="max-w-md text-base leading-relaxed text-muted-foreground md:text-lg">
            A considered edit for every season, mood and moment. Explore what’s new, find your next favourite and discover beyond labels.
          </p>
        </header>

        <section aria-label="Featured collections" className="mt-7 grid grid-cols-1 gap-4 sm:grid-cols-2 md:mt-10 md:gap-6">
          {collections.map((collection, index) => (
            <article key={collection.title} className="group">
              <Link to="/shop" aria-label={`Explore ${collection.title}`} className="relative block overflow-hidden rounded-xl bg-muted">
                <img src={collection.image} alt={collection.alt} loading={index < 2 ? "eager" : "lazy"} className="aspect-[1.55/1] w-full object-cover transition-transform duration-700 group-hover:scale-[1.025] sm:aspect-[1.45/1]" />
                <span className="absolute bottom-4 right-4 grid h-11 w-11 place-items-center rounded-full bg-background text-foreground transition-transform duration-300 group-hover:-translate-y-1 group-hover:translate-x-1 md:bottom-6 md:right-6 md:h-14 md:w-14">
                  <ArrowUpRight className="h-5 w-5 md:h-6 md:w-6" />
                </span>
              </Link>
              <div className="flex items-start justify-between gap-3 px-1 pt-3 md:pt-4">
                <div>
                  <h2 className="font-display text-xl font-semibold tracking-tight md:text-2xl">{collection.title}</h2>
                  <p className="mt-1 text-sm text-muted-foreground md:text-base">{collection.subtitle}</p>
                </div>
                <span className="pt-1 text-xs tabular-nums text-muted-foreground">0{index + 1}</span>
              </div>
            </article>
          ))}
        </section>

        <div className="mt-14 flex flex-col items-start justify-between gap-5 rounded-2xl bg-ink px-6 py-8 text-ink-foreground md:mt-20 md:flex-row md:items-center md:px-10 md:py-10">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.22em] text-lime">Find your next favourite</p>
            <h2 className="mt-2 font-headline text-3xl font-extrabold uppercase italic tracking-tight md:text-4xl">The whole edit. One place.</h2>
          </div>
          <Link to="/shop" className="inline-flex items-center gap-3 rounded-full bg-lime px-6 py-3 text-sm font-semibold text-primary-foreground transition-transform hover:-translate-y-0.5">
            Shop all pieces <ArrowUpRight className="h-4 w-4" />
          </Link>
        </div>
      </main>
      <Footer />
    </div>
  );
}
