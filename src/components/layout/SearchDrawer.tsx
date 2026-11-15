import { useState } from "react";
import { Link } from "@tanstack/react-router";
import { Search, X } from "lucide-react";
import { Sheet, SheetContent, SheetDescription, SheetTitle } from "@/components/ui/sheet";
import { defaultFilters, filterProducts, formatTaka, products } from "@/lib/catalog";
import { useCart } from "@/lib/store";

const popular = ["Hoodie", "Kurta", "Linen", "Cargo", "Polo", "Slip Dress"];

export function SearchDrawer() {
  const { searchOpen, closeSearch } = useCart();
  const [query, setQuery] = useState("");

  const results = query.trim()
    ? filterProducts(products, { ...defaultFilters, query }).slice(0, 6)
    : [];

  return (
    <Sheet open={searchOpen} onOpenChange={(open) => (open ? undefined : closeSearch())}>
      <SheetContent side="top" className="max-h-[min(88dvh,620px)] gap-0 overflow-y-auto p-0">
        <SheetTitle className="sr-only">Search ISHTILE+</SheetTitle>
        <SheetDescription className="sr-only">
          Search the catalog by product name, brand or category.
        </SheetDescription>

        <div className="mx-auto max-w-3xl px-4 pb-8 pt-6 md:px-6">
          <div className="flex h-14 items-center gap-3 rounded-full border border-border bg-panel px-5 focus-within:border-lime">
            <Search className="h-5 w-5 shrink-0 text-muted-foreground" strokeWidth={1.8} />
            <input
              autoFocus
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search products, brands, categories…"
              aria-label="Search products"
              className="min-w-0 flex-1 bg-transparent text-base outline-none placeholder:text-muted-foreground"
            />
            {query && (
              <button
                type="button"
                onClick={() => setQuery("")}
                aria-label="Clear search"
                className="text-muted-foreground hover:text-foreground"
              >
                <X className="h-4 w-4" />
              </button>
            )}
          </div>

          {!query && (
            <div className="mt-6">
              <p className="text-xs uppercase tracking-[0.14em] text-muted-foreground">Popular right now</p>
              <ul className="mt-3 flex flex-wrap gap-2">
                {popular.map((tag) => (
                  <li key={tag}>
                    <button
                      type="button"
                      onClick={() => setQuery(tag)}
                      className="rounded-full border border-border px-3.5 py-1.5 text-sm transition-colors hover:border-lime hover:bg-lime/25"
                    >
                      {tag}
                    </button>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {query && results.length === 0 && (
            <p className="mt-6 text-sm text-muted-foreground">
              Nothing matched “{query}”. Try a brand like FARAK or a piece like hoodie.
            </p>
          )}

          {results.length > 0 && (
            <ul className="mt-6 divide-y divide-border">
              {results.map((p) => (
                <li key={p.id}>
                  <Link
                    to="/shop/$productId"
                    params={{ productId: p.id }}
                    onClick={closeSearch}
                    className="flex items-center gap-4 py-3 transition-colors hover:bg-panel"
                  >
                    <img
                      src={p.image}
                      alt={p.alt}
                      width={64}
                      height={64}
                      className="h-14 w-14 shrink-0 rounded-lg object-cover"
                    />
                    <span className="min-w-0 flex-1">
                      <span className="block truncate text-sm font-medium">{p.name}</span>
                      <span className="block text-xs text-muted-foreground">
                        {p.brand} · {p.category}
                      </span>
                    </span>
                    <span className="text-sm tabular-nums">{formatTaka(p.price)}</span>
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </div>
      </SheetContent>
    </Sheet>
  );
}
