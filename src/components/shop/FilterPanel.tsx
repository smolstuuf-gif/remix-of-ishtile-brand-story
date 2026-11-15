import { brands, categories, colors, priceCeiling, sizes, type Filters } from "@/lib/catalog";
import { formatTaka } from "@/lib/catalog";
import { cn } from "@/lib/utils";

function toggle(list: string[], value: string) {
  return list.includes(value) ? list.filter((v) => v !== value) : [...list, value];
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="border-b border-border py-5 first:pt-0 last:border-0">
      <h3 className="text-xs uppercase tracking-[0.16em] text-muted-foreground">{title}</h3>
      <div className="mt-3">{children}</div>
    </div>
  );
}

const pill =
  "rounded-full border px-3.5 py-1.5 text-sm transition-colors hover:border-foreground";

export function FilterPanel({
  filters,
  patch,
  onClear,
}: {
  filters: Filters;
  patch: (next: Partial<Filters>) => void;
  onClear: () => void;
}) {
  const active =
    filters.category !== "All" ||
    filters.brand !== "All" ||
    filters.colors.length > 0 ||
    filters.sizes.length > 0 ||
    filters.maxPrice < priceCeiling;

  return (
    <div>
      <div className="flex items-center justify-between pr-10">
        <h2 className="font-display text-xl font-semibold tracking-[-0.02em]">Filters</h2>
        <button
          type="button"
          onClick={onClear}
          disabled={!active}
          className="text-xs underline underline-offset-4 disabled:opacity-40"
        >
          Clear all
        </button>
      </div>

      <Section title="Category">
        <ul className="flex flex-col items-start gap-1.5">
          {categories.map((c) => (
            <li key={c}>
              <button
                type="button"
                onClick={() => patch({ category: c })}
                aria-pressed={filters.category === c}
                className={cn(
                  "text-[15px] transition-colors hover:text-foreground",
                  filters.category === c ? "font-semibold text-foreground" : "text-muted-foreground",
                )}
              >
                {c}
              </button>
            </li>
          ))}
        </ul>
      </Section>

      <Section title="Brand">
        <div className="flex flex-wrap gap-2">
          {brands.map((b) => (
            <button
              key={b}
              type="button"
              onClick={() => patch({ brand: b })}
              aria-pressed={filters.brand === b}
              className={cn(
                pill,
                filters.brand === b ? "border-ink bg-ink text-ink-foreground" : "border-border",
              )}
            >
              {b}
            </button>
          ))}
        </div>
      </Section>

      <Section title="Price">
        <input
          type="range"
          min={1000}
          max={priceCeiling}
          step={100}
          value={filters.maxPrice}
          onChange={(e) => patch({ maxPrice: Number(e.target.value) })}
          aria-label="Maximum price"
          className="w-full accent-lime"
        />
        <p className="mt-1 text-sm tabular-nums text-muted-foreground">
          Up to {formatTaka(filters.maxPrice)}
        </p>
      </Section>

      <Section title="Colour">
        <ul className="flex flex-wrap gap-2.5">
          {colors.map((c) => {
            const on = filters.colors.includes(c.name);
            return (
              <li key={c.name}>
                <button
                  type="button"
                  onClick={() => patch({ colors: toggle(filters.colors, c.name) })}
                  aria-label={c.name}
                  aria-pressed={on}
                  className={cn(
                    "h-7 w-7 rounded-full border transition-transform hover:scale-110",
                    on ? "border-foreground ring-2 ring-foreground ring-offset-2 ring-offset-background" : "border-border",
                  )}
                  style={{ backgroundColor: c.hex }}
                />
              </li>
            );
          })}
        </ul>
      </Section>

      <Section title="Size">
        <div className="flex flex-wrap gap-2">
          {sizes.map((s) => (
            <button
              key={s}
              type="button"
              onClick={() => patch({ sizes: toggle(filters.sizes, s) })}
              aria-pressed={filters.sizes.includes(s)}
              className={cn(
                "h-9 w-11 rounded-md border text-sm transition-colors",
                filters.sizes.includes(s) ? "border-ink bg-ink text-ink-foreground" : "border-border hover:border-foreground",
              )}
            >
              {s}
            </button>
          ))}
        </div>
      </Section>
    </div>
  );
}
