import { useEffect, useMemo, useState } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import { SlidersHorizontal } from "lucide-react";
import { Sheet, SheetContent, SheetDescription, SheetTitle } from "@/components/ui/sheet";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Footer } from "@/components/home/Footer";
import { FilterPanel } from "@/components/shop/FilterPanel";
import { ProductCard } from "@/components/shop/ProductCard";
import {
  brands,
  categories,
  defaultFilters,
  filterProducts,
  formatTaka,
  priceCeiling,
  sortLabels,
  sortProducts,
  type Filters,
  type SortKey,
  type Product,
} from "@/lib/catalog";
import { fetchPublicProducts } from "@/lib/public-store";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/shop/")({
  head: () => ({
    meta: [
      { title: "Shop — ISHTILE+" },
      {
        name: "description",
        content:
          "Browse ISHTILE+ tees, shirts, hoodies, cargos and traditional pieces from ONEN+, FARAK, MOCHA+ and PILGRIM. Filter by size, colour and price.",
      },
      { property: "og:title", content: "Shop — ISHTILE+" },
      {
        property: "og:description",
        content: "Every ISHTILE+ piece in one place. Filter by category, brand, colour, size and price.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: ShopPage,
});

function ShopPage() {
  const [liveProducts, setLiveProducts] = useState<Product[] | null>(null);
  const [loadError, setLoadError] = useState("");
  useEffect(() => { let live = true; fetchPublicProducts().then((items) => { if (live) setLiveProducts(items); }).catch((error: unknown) => { if (live) setLoadError(error instanceof Error ? error.message : "The live catalogue is unavailable."); }); return () => { live = false; }; }, []);
  const catalogue = liveProducts ?? [];
  const [filters, setFilters] = useState<Filters>(() => {
    const requestedBrand = typeof window !== "undefined" ? new URLSearchParams(window.location.search).get("brand") : null;
    return requestedBrand && (brands as readonly string[]).includes(requestedBrand)
      ? { ...defaultFilters, brand: requestedBrand as Filters["brand"] }
      : defaultFilters;
  });
  const [sort, setSort] = useState<SortKey>("newest");
  const [sheetOpen, setSheetOpen] = useState(false);

  const patch = (next: Partial<Filters>) => setFilters((f) => ({ ...f, ...next }));
  const clear = () => setFilters({ ...defaultFilters, maxPrice: priceCeiling });

  const visible = useMemo(() => sortProducts(filterProducts(catalogue, filters), sort), [catalogue, filters, sort]);

  return (
    <div className="min-h-screen">
      <main className="mx-auto max-w-[1600px] px-4 pb-10 pt-6 md:px-6 md:pt-8">
        <nav aria-label="Breadcrumb" className="text-sm text-muted-foreground">
          <ol className="flex items-center gap-2">
            <li>
              <Link to="/" className="hover:text-foreground">
                Home
              </Link>
            </li>
            <li aria-hidden="true">/</li>
            <li aria-current="page" className="text-foreground">
              Shop
            </li>
          </ol>
        </nav>

        <div className="mt-4 flex flex-wrap items-end justify-between gap-4">
          <div>
            <h1 className="font-display text-[2.2rem] font-bold leading-none tracking-[-0.03em] md:text-[2.8rem]">
              Shop All.
            </h1>
            <p className="mt-2 max-w-md text-sm text-muted-foreground md:text-[15px]">
              {visible.length} {visible.length === 1 ? "piece" : "pieces"} — essentials, seasonal
              drops and the labels we curate.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => setSheetOpen(true)}
              className="inline-flex items-center gap-2 rounded-full border border-border px-4 py-2 text-sm font-medium md:hidden"
            >
              <SlidersHorizontal className="h-4 w-4" strokeWidth={1.8} />
              Filter
            </button>
            <Select value={sort} onValueChange={(v) => setSort(v as SortKey)}>
              <SelectTrigger className="w-[190px] rounded-full border-border bg-transparent md:w-[210px]">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {(Object.keys(sortLabels) as SortKey[]).map((k) => (
                  <SelectItem key={k} value={k}>
                    {sortLabels[k]}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* mobile category pills */}
        <ul className="no-scrollbar -mx-4 mt-5 flex gap-2 overflow-x-auto px-4 md:hidden">
          {categories.map((c) => (
            <li key={c} className="shrink-0">
              <button
                type="button"
                onClick={() => patch({ category: c })}
                aria-pressed={filters.category === c}
                className={cn(
                  "rounded-full border px-4 py-2 text-sm whitespace-nowrap transition-colors",
                  filters.category === c
                    ? "border-ink bg-ink text-ink-foreground"
                    : "border-border text-muted-foreground",
                )}
              >
                {c}
              </button>
            </li>
          ))}
        </ul>

        <div className="mt-6 grid gap-8 md:grid-cols-[220px_1fr] lg:grid-cols-[240px_1fr]">
          <aside className="hidden md:block">
            <div className="sticky top-24">
              <FilterPanel filters={filters} patch={patch} onClear={clear} />
            </div>
          </aside>

          <div>
            {loadError ? (
              <div role="alert" className="rounded-xl border border-destructive/30 bg-card px-6 py-12 text-center"><p className="font-display text-xl font-semibold">The shop is temporarily unavailable.</p><p className="mt-2 text-sm text-muted-foreground">{loadError}</p><button type="button" onClick={() => window.location.reload()} className="mt-5 rounded-full bg-ink px-5 py-2.5 text-sm font-medium text-ink-foreground">Try again</button></div>
            ) : liveProducts === null ? (
              <div className="py-20 text-center text-sm text-muted-foreground" role="status">Loading the latest products…</div>
            ) : visible.length === 0 ? (
              <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-border py-20 text-center">
                <p className="font-display text-xl font-semibold">No pieces match those filters.</p>
                <p className="mt-1 max-w-xs text-sm text-muted-foreground">
                  Try widening the price or clearing a colour.
                </p>
                <button
                  type="button"
                  onClick={clear}
                  className="mt-5 rounded-full bg-ink px-5 py-2.5 text-sm font-medium text-ink-foreground"
                >
                  Clear filters
                </button>
              </div>
            ) : (
              <ul className="grid grid-cols-2 gap-3 md:grid-cols-3 md:gap-x-6 md:gap-y-5 xl:grid-cols-4">
                {visible.map((p) => (
                  <li key={p.id}>
                    <ProductCard product={p} />
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>
      </main>

      <Footer />

      {/* mobile filter sheet */}
      <Sheet open={sheetOpen} onOpenChange={setSheetOpen}>
        <SheetContent
          side="bottom"
          className="max-h-[82dvh] gap-0 overflow-y-auto rounded-t-2xl p-6 pb-10"
        >
          <SheetTitle className="sr-only">Filters</SheetTitle>
          <SheetDescription className="sr-only">
            Narrow the catalog by category, brand, price, colour and size.
          </SheetDescription>
          <FilterPanel filters={filters} patch={patch} onClear={clear} />
          <button
            type="button"
            onClick={() => setSheetOpen(false)}
            className="mt-6 w-full rounded-full bg-lime py-3 text-sm font-semibold text-primary-foreground"
          >
            Show {visible.length} {visible.length === 1 ? "piece" : "pieces"} ·{" "}
            {visible.length > 0 && `from ${formatTaka(Math.min(...visible.map((p) => p.price)))}`}
          </button>
        </SheetContent>
      </Sheet>
    </div>
  );
}
