import { useEffect, useRef, useState } from "react";
import { createFileRoute, Link, notFound, useRouter, type ErrorComponentProps } from "@tanstack/react-router";
import { ChevronDown, ChevronRight, ChevronUp, Heart, RotateCcw, ShieldCheck, Star, Truck } from "lucide-react";
import { toast } from "sonner";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Footer } from "@/components/home/Footer";
import { Logo } from "@/components/home/Logo";
import { Hanger } from "@/components/home/icons";
import { ProductCard } from "@/components/shop/ProductCard";
import { formatTaka, galleryViews, productById, products } from "@/lib/catalog";
import { MAX_QTY } from "@/lib/commerce";
import { useCart } from "@/lib/store";
import { cn } from "@/lib/utils";
import { fetchProductCollections, fetchPublicProduct, type PublicProductCollection } from "@/lib/public-store";
import { Stepper } from "@/components/ui/stepper";
import { AnimatedImage } from "@/components/ui/animated-image";

export const Route = createFileRoute("/shop/$productId")({
  loader: async ({ params }) => {
    const remoteProduct = await fetchPublicProduct(params.productId);
    if (remoteProduct === null) throw notFound({ data: { productId: params.productId } });
    const product = remoteProduct ?? productById(params.productId);
    if (!product) throw notFound({ data: { productId: params.productId } });
    return product;
  },
  head: ({ loaderData }) => {
    const name = loaderData?.name ?? "Product";
    return {
      meta: [
        { title: `${name} — ISHTILE+` },
        {
          name: "description",
          content: loaderData
            ? `${loaderData.blurb} ${loaderData.brand} · ${loaderData.category}.`
            : "This piece is no longer available.",
        },
        { property: "og:title", content: `${name} — ISHTILE+` },
        {
          property: "og:description",
          content: loaderData ? `${loaderData.blurb}` : "This piece is no longer available.",
        },
        { property: "og:type", content: "product" },
        { name: "twitter:card", content: "summary_large_image" },
      ],
    };
  },
  component: ProductPage,
  notFoundComponent: ProductNotFound,
  errorComponent: ProductError,
});

function ProductNotFound() {
  const { productId } = Route.useParams();
  return (
    <div className="flex min-h-[60vh] flex-col items-center justify-center px-4 text-center">
      <p className="font-display text-6xl font-bold">404</p>
      <h1 className="mt-3 font-display text-2xl font-semibold">
        We don't stock “{productId}”.
      </h1>
      <p className="mt-2 max-w-sm text-sm text-muted-foreground">
        The link may be old, or the piece sold out and moved on.
      </p>
      <Link
        to="/shop"
        className="mt-6 rounded-full bg-ink px-6 py-3 text-sm font-medium text-ink-foreground"
      >
        Back to the shop
      </Link>
    </div>
  );
}

function ProductError({ error, reset }: ErrorComponentProps) {
  const router = useRouter();
  return (
    <div className="flex min-h-[60vh] flex-col items-center justify-center px-4 text-center">
      <h1 className="font-display text-2xl font-semibold">This product didn't load.</h1>
      <p className="mt-2 max-w-sm text-sm text-muted-foreground">
        {error instanceof Error ? error.message : "Something went wrong on our end."}
      </p>
      <button
        onClick={() => {
          router.invalidate();
          reset();
        }}
        className="mt-6 rounded-full bg-ink px-6 py-3 text-sm font-medium text-ink-foreground"
      >
        Try again
      </button>
    </div>
  );
}

const trust = [
  { icon: Hanger, label: "Premium Fabric" },
  { icon: RotateCcw, label: "Easy Returns" },
  { icon: Truck, label: "Fast Delivery" },
];

const sizeGuide = [
  { size: "S", chest: "36–38", length: "27" },
  { size: "M", chest: "39–41", length: "28" },
  { size: "L", chest: "42–44", length: "29" },
  { size: "XL", chest: "45–47", length: "30" },
  { size: "XXL", chest: "48–50", length: "31" },
];

function ProductPage() {
  const product = Route.useLoaderData();
  const { addItem, openCart, toggleWish, isWished } = useCart();
  type ProductGalleryView = { label: string; position: string; src: string; video?: boolean; colorName?: string };
  const baseViews: ProductGalleryView[] = (product.galleryImages?.length || product.videoUrl)
    ? galleryViews(product).map((item) => ({
        ...item,
        colorName: product.colors.find((colour) => colour.images?.includes(item.src))?.name,
      }))
    : [{
        label: "Full",
        position: "50% 50%",
        src: product.image,
        colorName: product.colors.find((colour) => colour.images?.includes(product.image))?.name,
      }];
  const assignedColourViews: ProductGalleryView[] = product.colors.flatMap((colour) => [
    ...(colour.images ?? [])
      .filter((src) => !baseViews.some((item) => item.src === src))
      .map((src, index) => ({ label: `${colour.name} image ${index + 1}`, position: "50% 50%", src, colorName: colour.name })),
    ...(colour.videos ?? []).map((src, index) => ({
      label: `${colour.name} video ${index + 1}`,
      position: "50% 50%",
      src,
      video: true,
      colorName: colour.name,
    })),
  ]);
  const views: ProductGalleryView[] = [...baseViews, ...assignedColourViews];
  const [size, setSize] = useState<string | null>(null);
  const [color, setColor] = useState(product.colors[0]?.name ?? "");
  const [view, setView] = useState(0);
  const galleryRef = useRef<HTMLDivElement>(null);
  const goToView = (index: number) => {
    const gallery = galleryRef.current;
    if (!gallery || !views[index]) return;
    gallery.scrollTo({ top: index * gallery.clientHeight, behavior: "smooth" });
    setView(index);
    if (views[index].colorName) setColor(views[index].colorName!);
  };
  const handleGalleryScroll = () => {
    const gallery = galleryRef.current;
    if (!gallery || !gallery.clientHeight) return;
    const nextView = Math.min(views.length - 1, Math.max(0, Math.round(gallery.scrollTop / gallery.clientHeight)));
    setView((current) => current === nextView ? current : nextView);
    if (views[nextView]?.colorName) setColor((current) => current === views[nextView].colorName ? current : views[nextView].colorName!);
  };
  const [qty, setQty] = useState(1);
  const [sizeError, setSizeError] = useState(false);
  const [productCollections, setProductCollections] = useState<PublicProductCollection[]>([]);
  useEffect(() => {
    let active = true;
    fetchProductCollections(product.id)
      .then((collections) => { if (active) setProductCollections(collections); })
      .catch(() => { if (active) setProductCollections([]); });
    return () => { active = false; };
  }, [product.id]);

  const wished = isWished(product.id);
  const related = products
    .filter((p) => p.category === product.category && p.id !== product.id)
    .slice(0, 4);

  const addToBag = () => {
    if (product.isOutOfStock) return;
    if (!size) {
      setSizeError(true);
      toast.error("Choose a size first");
      return;
    }
    addItem(product, { size, color, qty });
    openCart();
    toast.success(`${product.name} added to your bag`);
  };

  return (
    <div className="min-h-screen">
      <main className="mx-auto max-w-[1600px] px-4 pb-12 pt-6 md:px-6 md:pt-8">
        <nav aria-label="Breadcrumb" className="text-sm text-muted-foreground">
          <ol className="flex flex-wrap items-center gap-2">
            <li>
              <Link to="/" className="hover:text-foreground">
                Home
              </Link>
            </li>
            <li aria-hidden="true">
              <ChevronRight className="h-3 w-3" />
            </li>
            <li>
              <Link to="/shop" className="hover:text-foreground">
                Shop
              </Link>
            </li>
            <li aria-hidden="true">
              <ChevronRight className="h-3 w-3" />
            </li>
            <li aria-current="page" className="text-foreground">
              {product.name}
            </li>
          </ol>
        </nav>

        <div className="mt-5 grid gap-8 lg:grid-cols-[1.15fr_1fr] lg:gap-12">
          {/* vertical product gallery */}
          <div className="flex min-w-0 gap-3 md:gap-4">
            <div className="flex w-7 shrink-0 flex-col items-center gap-3 self-stretch py-1">
              <button
                type="button"
                onClick={() => goToView(Math.max(0, view - 1))}
                disabled={view === 0}
                aria-label="Previous product image"
                className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full border border-border transition-colors hover:bg-accent disabled:opacity-40"
              >
                <ChevronUp className="h-3.5 w-3.5" />
              </button>
              <div className="relative my-1 w-[4px] min-h-0 flex-1 overflow-hidden rounded-full border border-foreground/50 bg-muted">
                <div
                  className="absolute left-0 w-full rounded-full bg-foreground transition-[top,height] duration-300"
                  style={{
                    top: `${(view / Math.max(1, views.length)) * 100}%`,
                    height: `${100 / Math.max(1, views.length)}%`,
                  }}
                />
              </div>
              <button
                type="button"
                onClick={() => goToView(Math.min(views.length - 1, view + 1))}
                disabled={view >= views.length - 1}
                aria-label="Next product image"
                className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full border border-border transition-colors hover:bg-accent disabled:opacity-40"
              >
                <ChevronDown className="h-3.5 w-3.5" />
              </button>
            </div>

            <div
              ref={galleryRef}
              onScroll={handleGalleryScroll}
              aria-label="Product images"
              className="h-[min(76svh,calc((100vw-4.5rem)*1.333333))] min-h-0 flex-1 snap-y snap-mandatory overflow-y-auto overflow-x-hidden overscroll-contain scroll-smooth rounded-xl bg-card [scrollbar-width:none] [&::-webkit-scrollbar]:hidden md:h-[min(76svh,820px)] md:min-h-[420px]"
            >
              {views.map((item, index) => (
                <figure key={`${item.src}-${index}`} className="relative h-full min-h-full w-full snap-start snap-always overflow-hidden">
                  {item.video ? (
                    <video
                      src={item.src}
                      controls
                      muted
                      loop
                      playsInline
                      poster={product.image}
                      className="h-full w-full object-contain bg-card md:object-cover"
                    />
                  ) : (
                    <img
                      src={item.src}
                      alt={index === 0 ? product.alt : `${product.name} — ${item.label}`}
                      width={1200}
                      height={1600}
                      loading={index < 2 ? "eager" : "lazy"}
                      className="h-full w-full object-contain bg-card md:object-cover"
                      style={{ objectPosition: item.position }}
                    />
                  )}
                </figure>
              ))}
            </div>
          </div>

          {/* buy card */}
          <div>
            <p className="text-xs uppercase tracking-[0.16em] text-muted-foreground">
              {product.brand} · {product.category}
            </p>
            <h1 className="mt-2 font-display text-[2rem] font-bold leading-[1.05] tracking-[-0.03em] md:text-[2.4rem]">
              {product.name}
            </h1>

            <div className="mt-3 flex items-center gap-3">
              <span className="inline-flex items-center gap-1.5 text-sm">
                <Star className="h-4 w-4 fill-foreground text-foreground" strokeWidth={0} />
                <span className="font-medium tabular-nums">{product.rating.toFixed(1)}</span>
                <span className="text-muted-foreground">({product.reviews} reviews)</span>
              </span>
              {(product.isOutOfStock || product.isFeatured || product.tags?.length) && (
                <div className="flex flex-wrap gap-1.5">
                  {product.isOutOfStock && <span className="rounded-full bg-[#171717] px-2.5 py-0.5 text-[11px] font-semibold uppercase tracking-wide text-white">Sold Out</span>}
                  {product.isFeatured && !product.isOutOfStock && <span className="rounded-full bg-lime px-2.5 py-0.5 text-[11px] font-semibold uppercase tracking-wide text-primary-foreground">Featured</span>}
                  {(product.tags ?? []).map((tag) => <span key={tag} className="rounded-full border border-border px-2.5 py-0.5 text-[11px] font-semibold uppercase tracking-wide">{tag}</span>)}
                </div>
              )}
            </div>

            <p className="mt-4 text-[26px] font-medium tabular-nums md:text-[30px]">
              {formatTaka(product.price)}
            </p>
            <p className="mt-3 max-w-md text-[15px] leading-relaxed text-muted-foreground">
              {product.blurb}
            </p>

            {/* colour */}
            <div className="mt-7">
              <p className="text-sm font-medium">
                Colour: <span className="text-muted-foreground">{color}</span>
              </p>
              <ul className="mt-2.5 flex gap-2.5">
                {product.colors.map((c) => (
                  <li key={c.name}>
                    <button
                      type="button"
                      onClick={() => {
                        setColor(c.name);
                        const firstColourView = views.findIndex((item) => item.colorName === c.name);
                        if (firstColourView >= 0) goToView(firstColourView);
                      }}
                      aria-label={c.name}
                      aria-pressed={color === c.name}
                      className={cn(
                        "h-8 w-8 rounded-full border transition-transform hover:scale-110",
                        color === c.name
                          ? "border-foreground ring-2 ring-foreground ring-offset-2 ring-offset-background"
                          : "border-border",
                      )}
                      style={{ backgroundColor: c.hex }}
                    />
                  </li>
                ))}
              </ul>
            </div>

            {/* size */}
            <div className="mt-6">
              <div className="flex items-center justify-between">
                <p className="text-sm font-medium">
                  Size: <span className="text-muted-foreground">{size ?? "Select a size"}</span>
                </p>
                <a href="#size-guide" className="text-xs underline underline-offset-4">
                  Size guide
                </a>
              </div>
              <div className="mt-2.5 flex flex-wrap gap-2">
                {product.sizes.map((s) => (
                  <button
                    key={s}
                    type="button"
                    onClick={() => {
                      setSize(s);
                      setSizeError(false);
                    }}
                    aria-pressed={size === s}
                    className={cn(
                      "h-11 min-w-[52px] rounded-md border px-3 text-sm transition-colors",
                      size === s
                        ? "border-ink bg-ink text-ink-foreground"
                        : sizeError
                          ? "border-destructive"
                          : "border-border hover:border-foreground",
                    )}
                  >
                    {s}
                  </button>
                ))}
              </div>
              {sizeError && (
                <p role="alert" className="mt-2 text-sm text-destructive">
                  Pick a size so we send the right one.
                </p>
              )}
            </div>

            {/* qty + add */}
            <div className="mt-7 flex flex-wrap items-center gap-3">
              <Stepper
                value={qty}
                min={1}
                max={MAX_QTY}
                onChange={setQty}
                label="quantity"
              />

              <button
                type="button"
                onClick={addToBag}
                disabled={product.isOutOfStock}
                className="min-w-[200px] flex-1 rounded-full bg-lime px-6 py-3.5 text-sm font-semibold text-primary-foreground transition-transform hover:scale-[1.01] active:scale-[0.99] disabled:cursor-not-allowed disabled:bg-muted disabled:text-muted-foreground"
              >
                {product.isOutOfStock ? "Currently Out of Stock" : `Add to Bag · ${formatTaka(product.price * qty)}`}
              </button>

              <button
                type="button"
                onClick={() => {
                  toggleWish(product.id);
                  toast.success(wished ? "Removed from wishlist" : "Saved to wishlist");
                }}
                aria-pressed={wished}
                className="inline-flex h-12 items-center gap-2 rounded-full border border-border px-5 text-sm font-medium transition-colors hover:bg-accent"
              >
                <Heart className={cn("h-4 w-4", wished && "fill-foreground")} strokeWidth={1.7} />
                {wished ? "Saved" : "Wishlist"}
              </button>
            </div>

            {/* trust */}
            <ul className="mt-7 grid grid-cols-3 gap-2 rounded-xl border border-border bg-panel/60 px-3 py-4">
              {trust.map(({ icon: Icon, label }) => (
                <li key={label} className="flex flex-col items-center gap-1.5 text-center">
                  <Icon className="h-5 w-5" strokeWidth={1.6} />
                  <span className="text-[11px] leading-tight md:text-xs">{label}</span>
                </li>
              ))}
            </ul>

            {/* accordions */}
            <Accordion type="single" collapsible defaultValue="details" className="mt-7">
              <AccordionItem value="details">
                <AccordionTrigger className="text-[15px] font-medium">Details</AccordionTrigger>
                <AccordionContent>
                  <ul className="list-disc space-y-1.5 pl-5 text-sm text-muted-foreground">
                    {product.details.map((d) => (
                      <li key={d}>{d}</li>
                    ))}
                  </ul>
                </AccordionContent>
              </AccordionItem>

              <AccordionItem value="size-guide">
                <AccordionTrigger id="size-guide" className="text-[15px] font-medium">
                  Size Guide
                </AccordionTrigger>
                <AccordionContent>
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="text-left text-xs uppercase tracking-wide text-muted-foreground">
                        <th className="pb-2 font-medium">Size</th>
                        <th className="pb-2 font-medium">Chest (in)</th>
                        <th className="pb-2 font-medium">Length (in)</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-border">
                      {sizeGuide.map((r) => (
                        <tr key={r.size}>
                          <td className="py-2 font-medium">{r.size}</td>
                          <td className="py-2 text-muted-foreground">{r.chest}</td>
                          <td className="py-2 text-muted-foreground">{r.length}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </AccordionContent>
              </AccordionItem>

              <AccordionItem value="shipping">
                <AccordionTrigger className="text-[15px] font-medium">
                  Shipping &amp; Returns
                </AccordionTrigger>
                <AccordionContent>
                  <p className="text-sm leading-relaxed text-muted-foreground">
                    Delivery across Bangladesh in 2–4 working days. {formatTaka(80)} flat, free on
                    orders over {formatTaka(3000)}. Unworn pieces with tags on can be returned within
                    14 days.
                  </p>
                </AccordionContent>
              </AccordionItem>

              <AccordionItem value="care">
                <AccordionTrigger className="text-[15px] font-medium">Care Instructions</AccordionTrigger>
                <AccordionContent>
                  <p className="text-sm leading-relaxed text-muted-foreground">{product.care}</p>
                </AccordionContent>
              </AccordionItem>
            </Accordion>
          </div>
        </div>

        {related.length > 0 && (
          <section className="mt-14" aria-labelledby="related-title">
            <div className="flex items-end justify-between">
              <h2 id="related-title" className="font-display text-[1.7rem] font-bold tracking-[-0.03em]">
                You may also like.
              </h2>
              <Link to="/shop" className="text-sm font-medium underline underline-offset-4">
                View all
              </Link>
            </div>
            <ul className="mt-5 grid grid-cols-2 gap-3 md:grid-cols-4 md:gap-x-6">
              {related.map((p) => (
                <li key={p.id}>
                  <ProductCard product={p} />
                </li>
              ))}
            </ul>
          </section>
        )}

        {productCollections.map((collection) => {
          const collectionProducts = collection.products
            .filter((item) => item.id !== product.id)
            .slice(0, 3);
          const photoshoot = collection.photoshoot.length > 0
            ? collection.photoshoot
            : collection.image_url
              ? [{ id: collection.id, title: collection.title, description: collection.description, image_url: collection.image_url, video_url: null, alt_text: collection.title, sort_order: 0 }]
              : [];
          return (
            <div key={collection.id} className="mt-16">
              {collectionProducts.length > 0 && (
                <section aria-labelledby={`complete-look-${collection.id}`}>
                  <div className="mb-3 flex items-end justify-between border-b border-foreground pb-3">
                    <div>
                      <p className="text-[10px] font-semibold uppercase tracking-[0.14em] text-muted-foreground">
                        {collection.campaign_label || collection.title}
                      </p>
                      <h2 id={`complete-look-${collection.id}`} className="mt-1 font-display text-[1.7rem] font-bold tracking-[-0.03em]">
                        Complete the look.
                      </h2>
                    </div>
                    <Link to="/shop" className="text-xs font-medium underline underline-offset-4">
                      Shop collection
                    </Link>
                  </div>
                  <div className="grid gap-4 lg:grid-cols-[minmax(0,0.9fr)_minmax(0,1.1fr)] lg:gap-6">
                    <div className="min-h-[360px] overflow-hidden bg-card sm:min-h-[480px] lg:min-h-[560px]">
                      {photoshoot[0]?.video_url ? (
                        <video
                          src={photoshoot[0].video_url}
                          poster={photoshoot[0].image_url}
                          muted
                          loop
                          autoPlay
                          playsInline
                          className="h-full max-h-[720px] min-h-[360px] w-full object-cover sm:min-h-[480px] lg:min-h-[560px]"
                        />
                      ) : (
                        <img
                          src={photoshoot[0]?.image_url || collection.image_url || product.image}
                          alt={photoshoot[0]?.alt_text || collection.title}
                          loading="lazy"
                          className="h-full max-h-[720px] min-h-[360px] w-full object-cover sm:min-h-[480px] lg:min-h-[560px]"
                        />
                      )}
                    </div>
                    <ul className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-2 xl:grid-cols-3">
                      {collectionProducts.map((item) => (
                        <li key={item.id} className="min-w-0">
                          <ProductCard product={item} />
                        </li>
                      ))}
                    </ul>
                  </div>
                </section>
              )}

              {photoshoot.length > 0 && (
                <section className="mt-14" aria-label={`${collection.title} photoshoot`}>
                  <div className="mb-3 flex items-end justify-between border-b border-foreground pb-3">
                    <div>
                      <p className="text-[10px] font-semibold uppercase tracking-[0.14em] text-muted-foreground">
                        {collection.campaign_label || "Collection editorial"}
                      </p>
                      <h2 className="mt-1 font-display text-[1.7rem] font-bold tracking-[-0.03em]">
                        The photoshoot.
                      </h2>
                    </div>
                    <span className="text-xs text-muted-foreground">{collection.title}</span>
                  </div>
                  <div className="no-scrollbar flex snap-x snap-mandatory gap-3 overflow-x-auto overscroll-x-contain">
                    {photoshoot.map((look) => (
                      <figure key={look.id} className="relative min-w-full snap-center overflow-hidden bg-card">
                        {look.video_url ? (
                          <video
                            src={look.video_url}
                            poster={look.image_url}
                            controls
                            muted
                            playsInline
                            className="aspect-[16/8] max-h-[760px] w-full object-cover"
                          />
                        ) : (
                          <img
                            src={look.image_url}
                            alt={look.alt_text || look.title || collection.title}
                            loading="lazy"
                            className="aspect-[16/8] max-h-[760px] w-full object-cover"
                          />
                        )}
                        {(look.title || look.description) && (
                          <figcaption className="flex flex-wrap items-center justify-between gap-2 border-b border-x border-border px-4 py-3">
                            <span className="text-xs font-semibold uppercase tracking-wide">{look.title}</span>
                            {look.description && <span className="text-xs text-muted-foreground">{look.description}</span>}
                          </figcaption>
                        )}
                      </figure>
                    ))}
                  </div>
                  {photoshoot.length > 1 && (
                    <p className="mt-2 text-right text-[10px] uppercase tracking-widest text-muted-foreground">
                      Swipe to explore · {photoshoot.length} campaign frames
                    </p>
                  )}
                </section>
              )}
            </div>
          );
        })}      </main>

      <div className="mt-4 flex items-center justify-center gap-3 py-6 text-muted-foreground">
        <ShieldCheck className="h-4 w-4" strokeWidth={1.6} />
        <span className="text-xs">Secure payments · bKash, Nagad, card or cash on delivery</span>
      </div>
      <div className="flex justify-center pb-8">
        <Logo className="text-[1.4rem]" />
      </div>

      <Footer />
    </div>
  );
}
