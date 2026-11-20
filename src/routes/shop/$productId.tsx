import { useState } from "react";
import { createFileRoute, Link, notFound, useRouter, type ErrorComponentProps } from "@tanstack/react-router";
import { Check, ChevronRight, Heart, RotateCcw, ShieldCheck, Star, Truck } from "lucide-react";
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
import { formatTaka, galleryViews } from "@/lib/catalog";
import { MAX_QTY } from "@/lib/commerce";
import { useCart } from "@/lib/store";
import { cn } from "@/lib/utils";
import { fetchPublicProduct, fetchPublicProducts } from "@/lib/public-store";
import { Stepper } from "@/components/ui/stepper";
import { AnimatedImage } from "@/components/ui/animated-image";

export const Route = createFileRoute("/shop/$productId")({
  loader: async ({ params }) => {
    const product = await fetchPublicProduct(params.productId);
    if (!product) throw notFound({ data: { productId: params.productId } });
    const catalogue = await fetchPublicProducts();
    const related = catalogue.filter((item) => item.category === product.category && item.id !== product.id).slice(0, 4);
    return { ...product, related };
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
  const related = product.related;
  const { addItem, openCart, toggleWish, isWished } = useCart();
  const allViews = galleryViews(product);
  const [size, setSize] = useState<string | null>(null);
  const [color, setColor] = useState(product.colors[0]?.name ?? "");
  const selectedColour = product.colors.find((item) => item.name === color);
  const assignedColourImages = selectedColour?.images ?? [];
  const assignedColourVideos = selectedColour?.videos ?? [];
  const colourHasMedia = assignedColourImages.length > 0 || assignedColourVideos.length > 0;
  const colourViews = [
    ...allViews.filter((item) => assignedColourImages.includes(item.src)),
    ...assignedColourVideos.map((src, index) => ({ label: `Colour video ${index + 1}`, position: "50% 50%", src, video: true })),
  ];
  const views = colourHasMedia ? colourViews : allViews;
  const [view, setView] = useState(0);
  const [qty, setQty] = useState(1);
  const [sizeError, setSizeError] = useState(false);

  const wished = isWished(product.id);
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
          {/* gallery */}
          <div className="flex gap-3 md:gap-4">
            <ul className="hidden shrink-0 flex-col gap-3 sm:flex">
              {views.map((v, i) => (
                <li key={v.label}>
                  <button
                    type="button"
                    onClick={() => setView(i)}
                    aria-label={`Show ${v.label} view`}
                    aria-pressed={view === i}
                    className={cn(
                      "block h-20 w-16 overflow-hidden rounded-lg border-2 transition-colors",
                      view === i ? "border-ink" : "border-transparent hover:border-border",
                    )}
                  >
                    {"video" in v && v.video ? <video src={v.src} muted playsInline className="h-full w-full object-cover" /> : <img src={v.src} alt="" aria-hidden="true" width={64} height={80} className="h-full w-full object-cover" style={{ objectPosition: v.position }} />}
                  </button>
                </li>
              ))}
            </ul>

            <figure className="min-w-0 flex-1">
              <div className="overflow-hidden rounded-xl bg-card">
                {views[view] && "video" in views[view] && views[view].video ? <video src={views[view].src} controls autoPlay muted loop playsInline poster={product.image} className="aspect-[4/5] w-full object-cover md:aspect-[3/2.4]" /> : <AnimatedImage src={views[view]?.src ?? product.image} alt={product.alt} width={1024} height={640} className="aspect-[4/5] w-full object-cover transition-[object-position] duration-500 md:aspect-[3/2.4]" style={{ objectPosition: views[view]?.position ?? "50% 25%" }} />}
              </div>
              <ul className="mt-3 flex gap-2 sm:hidden">
                {views.map((v, i) => (
                  <li key={v.label}>
                    <button
                      type="button"
                      onClick={() => setView(i)}
                      aria-label={`Show ${v.label} view`}
                      aria-pressed={view === i}
                      className={cn(
                        "h-16 w-14 overflow-hidden rounded-md border-2",
                        view === i ? "border-ink" : "border-transparent",
                      )}
                    >
                      {"video" in v && v.video ? <video src={v.src} muted playsInline className="h-full w-full object-cover" /> : <img src={v.src} alt="" aria-hidden="true" width={56} height={64} className="h-full w-full object-cover" style={{ objectPosition: v.position }} />}
                    </button>
                  </li>
                ))}
              </ul>
            </figure>
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
                        setView(0);
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
      </main>

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
