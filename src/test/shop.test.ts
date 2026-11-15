import { QueryClient } from "@tanstack/react-query";
import { createRouter } from "@tanstack/react-router";
import { describe, expect, it } from "vitest";

import { routeTree } from "@/routeTree.gen";
import { defaultFilters, filterProducts, formatTaka, products, sortProducts } from "@/lib/catalog";

describe("catalog", () => {
  it("formats taka with a thousands separator", () => {
    expect(formatTaka(2490)).toBe("৳ 2,490");
    expect(formatTaka(1490)).toBe("৳ 1,490");
  });

  it("keeps every product purchasable with a size and a colour", () => {
    for (const p of products) {
      expect(p.sizes.length).toBeGreaterThan(0);
      expect(p.colors.length).toBeGreaterThan(0);
      expect(p.price).toBeGreaterThan(0);
    }
  });

  it("filters by category", () => {
    const women = filterProducts(products, { ...defaultFilters, category: "Women" });
    expect(women.map((p) => p.id)).toEqual(["farak-slip-dress"]);
  });

  it("filters by size and colour together", () => {
    const result = filterProducts(products, { ...defaultFilters, sizes: ["XXL"], colors: ["Lime"] });
    expect(result.map((p) => p.id)).toEqual(["sports-tee"]);
  });

  it("caps the basket by price", () => {
    const cheap = filterProducts(products, { ...defaultFilters, maxPrice: 1490 });
    expect(cheap.map((p) => p.id)).toEqual(["basic-tee"]);
  });

  it("sorts cheapest first and priciest first", () => {
    const asc = sortProducts(products, "price-asc");
    const desc = sortProducts(products, "price-desc");
    expect(asc[0]?.id).toBe("basic-tee");
    expect(desc[0]?.id).toBe("onen-jacket");
  });

  it("puts the newest drop first", () => {
    expect(sortProducts(products, "newest")[0]?.id).toBe("onen-jacket");
  });
});

describe("shop routing", () => {
  const router = createRouter({ routeTree, context: { queryClient: new QueryClient() } });

  it("serves the catalog at /shop", () => {
    const matches = router.matchRoutes("/shop");
    expect(matches.some((m) => m.routeId === "/shop/")).toBe(true);
  });

  it("serves a product page for a product id", () => {
    const matches = router.matchRoutes("/shop/hoodie");
    expect(matches.some((m) => m.routeId === "/shop/$productId")).toBe(true);
  });

  it("serves the cart and checkout pages", () => {
    expect(router.matchRoutes("/cart").some((m) => m.routeId === "/cart")).toBe(true);
    expect(router.matchRoutes("/checkout").some((m) => m.routeId === "/checkout")).toBe(true);
  });
});
