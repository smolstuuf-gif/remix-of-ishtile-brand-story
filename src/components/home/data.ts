import essentialsTee from "@/assets/products/essentials-tee.jpg";
import essentialsShirt from "@/assets/products/essentials-shirt.jpg";
import polo from "@/assets/products/polo.jpg";
import checkShirt from "@/assets/products/check-shirt.jpg";
import sportsTee from "@/assets/products/sports-tee.jpg";
import basicTee from "@/assets/products/basic-tee.jpg";
import hoodie from "@/assets/products/hoodie.jpg";
import logoTee from "@/assets/products/logo-tee.jpg";
import overshirt from "@/assets/products/overshirt.jpg";
import linenShirt from "@/assets/products/linen-shirt.jpg";
import cargoPants from "@/assets/products/cargo-pants.jpg";
import shorts from "@/assets/products/shorts.jpg";

export type Product = { id: string; name: string; price: number; image: string };

export const products: Product[] = [
  { id: "essentials-tee", name: "ISHTILE Essentials Tee", price: 2490, image: essentialsTee },
  { id: "essentials-shirt", name: "ISHTILE Essentials Shirt", price: 2990, image: essentialsShirt },
  { id: "polo", name: "ISHTILE Polo", price: 2990, image: polo },
  { id: "check-shirt", name: "ISHTILE Check Shirt", price: 2990, image: checkShirt },
  { id: "sports-tee", name: "ISHTILE Sports Tee", price: 1990, image: sportsTee },
  { id: "basic-tee", name: "ISHTILE Basic Tee", price: 1490, image: basicTee },
  { id: "hoodie", name: "ISHTILE Hoodie", price: 3490, image: hoodie },
  { id: "logo-tee", name: "ISHTILE Logo Tee", price: 1990, image: logoTee },
  { id: "overshirt", name: "ISHTILE Overshirt", price: 3990, image: overshirt },
  { id: "linen-shirt", name: "ISHTILE Linen Shirt", price: 3490, image: linenShirt },
  { id: "cargo-pants", name: "ISHTILE Cargo Pants", price: 3990, image: cargoPants },
  { id: "shorts", name: "ISHTILE Shorts", price: 1990, image: shorts },
];

/** Prices are shown in Bangladeshi taka, e.g. "৳ 2,490". */
export function formatTaka(amount: number) {
  return `৳ ${amount.toLocaleString("en-US")}`;
}

export const footerLinks = {
  Shop: ["All Products", "New Arrivals", "Best Sellers", "On Sale"],
  Brands: ["ONEN +", "FARAK", "MOCHA +", "PILGRIM", "More Brands"],
  Explore: ["Editorial", "Culture", "Stores", "About", "Account"],
  About: ["Our Story", "Careers", "Contact", "Help & FAQ"],
} as const;
