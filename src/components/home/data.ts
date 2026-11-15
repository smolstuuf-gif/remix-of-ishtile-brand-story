/**
 * Homepage data. The catalog itself now lives in `@/lib/catalog` so the shop,
 * product and checkout pages all read the same products and price formatter.
 */
export { products, formatTaka } from "@/lib/catalog";
export type { Product } from "@/lib/catalog";

export const footerLinks = {
  Shop: ["All Products", "New Arrivals", "Best Sellers", "On Sale"],
  Brands: ["ONEN +", "FARAK", "MOCHA +", "PILGRIM", "More Brands"],
  Explore: ["Editorial", "Culture", "Stores", "About", "Account"],
  About: ["Our Story", "Careers", "Contact", "Help & FAQ"],
} as const;
