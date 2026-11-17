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
import brandFarak from "@/assets/brand-farak.jpg";
import brandMocha from "@/assets/brand-mocha.jpg";
import brandOnen from "@/assets/brand-onen.jpg";
import cardWinter from "@/assets/card-winter.jpg";

export type ProductColor = { name: string; hex: string };

export type Product = {
  id: string;
  name: string;
  price: number;
  image: string;
  galleryImages?: string[];
  alt: string;
  category: "Men" | "Women" | "Accessories" | "Traditional";
  brand: "ISHTILE" | "ONEN+" | "FARAK" | "MOCHA+" | "PILGRIM";
  sizes: string[];
  colors: ProductColor[];
  rating: number;
  reviews: number;
  badge?: string;\n  tags?: string[];\n  isFeatured?: boolean;\n  isOutOfStock?: boolean;
  blurb: string;
  details: string[];
  care: string;
  /** ISO date — drives "Newest First". */
  added: string;
};

const SIZES = ["S", "M", "L", "XL", "XXL"];

const BLACK = { name: "Black", hex: "#141414" };
const OFF_WHITE = { name: "Off White", hex: "#EFE9DE" };
const BEIGE = { name: "Beige", hex: "#D8CBB4" };
const OLIVE = { name: "Olive", hex: "#6C7049" };
const NAVY = { name: "Navy", hex: "#20293F" };
const LILAC = { name: "Lilac", hex: "#C9BBE0" };
const RUST = { name: "Rust", hex: "#9C4A2F" };
const LIME = { name: "Lime", hex: "#CFF23A" };

export const products: Product[] = [
  {
    id: "essentials-tee",
    name: "ISHTILE Essentials Tee",
    price: 2490,
    image: essentialsTee,
    alt: "ISHTILE Essentials Tee laid flat on warm beige plaster",
    category: "Men",
    brand: "ISHTILE",
    sizes: SIZES,
    colors: [BLACK, OFF_WHITE, BEIGE, OLIVE],
    rating: 4.8,
    reviews: 214,
    badge: "Best Seller",
    blurb: "Heavyweight cotton tee with a clean chest print and a fit that holds its shape.",
    details: [
      "240 GSM combed cotton jersey",
      "Ribbed collar with shoulder-to-shoulder tape",
      "Regular fit — take one size up for a boxier look",
    ],
    care: "Machine wash cold inside out. Line dry. Warm iron reverse.",
    added: "2025-08-02",
  },
  {
    id: "essentials-shirt",
    name: "ISHTILE Essentials Shirt",
    price: 2990,
    image: essentialsShirt,
    alt: "ISHTILE Essentials Shirt laid flat on warm beige plaster",
    category: "Men",
    brand: "ISHTILE",
    sizes: SIZES,
    colors: [OFF_WHITE, BLACK, NAVY],
    rating: 4.7,
    reviews: 156,
    blurb: "The everyday shirt — crisp cotton, single chest pocket, cut to be worn open or buttoned.",
    details: [
      "Breathable cotton poplin",
      "Mother-of-pearl style buttons",
      "Cuffed sleeve with adjustable placket",
    ],
    care: "Machine wash cold. Tumble dry low. Iron on medium.",
    added: "2025-07-18",
  },
  {
    id: "polo",
    name: "ISHTILE Polo",
    price: 2990,
    image: polo,
    alt: "ISHTILE Polo shirt laid flat on warm beige plaster",
    category: "Men",
    brand: "ISHTILE",
    sizes: SIZES,
    colors: [BLACK, OFF_WHITE, NAVY, OLIVE],
    rating: 4.6,
    reviews: 98,
    blurb: "Piqué polo with a structured collar that stays up, and a small embroidered mark at the chest.",
    details: ["Cotton piqué", "Three-button placket", "Reinforced side vents"],
    care: "Machine wash cold with like colours. Do not bleach.",
    added: "2025-06-30",
  },
  {
    id: "check-shirt",
    name: "ISHTILE Check Shirt",
    price: 2990,
    image: checkShirt,
    alt: "ISHTILE Check Shirt laid flat on warm beige plaster",
    category: "Men",
    brand: "ISHTILE",
    sizes: SIZES,
    colors: [BLACK, RUST, BEIGE],
    rating: 4.5,
    reviews: 74,
    blurb: "Brushed flannel check with a double chest pocket — layer it over a tee through October.",
    details: ["Brushed cotton flannel", "Two chest pockets", "Button front"],
    care: "Machine wash cold separately first wash. Line dry.",
    added: "2025-08-11",
  },
  {
    id: "sports-tee",
    name: "ISHTILE Sports Tee",
    price: 1990,
    image: sportsTee,
    alt: "ISHTILE Sports Tee laid flat on warm beige plaster",
    category: "Men",
    brand: "ISHTILE",
    sizes: SIZES,
    colors: [BLACK, OFF_WHITE, LIME],
    rating: 4.4,
    reviews: 132,
    blurb: "Lightweight performance tee that moves with you and dries fast.",
    details: ["Quick-dry knit", "Flatlock seams", "Regular fit"],
    care: "Machine wash cold. No fabric softener. Line dry.",
    added: "2025-05-22",
  },
  {
    id: "basic-tee",
    name: "ISHTILE Basic Tee",
    price: 1490,
    image: basicTee,
    alt: "ISHTILE Basic Tee laid flat on warm beige plaster",
    category: "Men",
    brand: "ISHTILE",
    sizes: SIZES,
    colors: [BLACK, OFF_WHITE, BEIGE, NAVY, OLIVE, RUST],
    rating: 4.3,
    reviews: 301,
    blurb: "The plain one. Soft-washed cotton, no print, built to be bought in threes.",
    details: ["180 GSM cotton", "Pre-shrunk", "Unisex sizing"],
    care: "Machine wash cold. Tumble dry low.",
    added: "2025-04-14",
  },
  {
    id: "hoodie",
    name: "ISHTILE Hoodie",
    price: 3490,
    image: hoodie,
    alt: "ISHTILE Hoodie laid flat on warm beige plaster",
    category: "Men",
    brand: "ISHTILE",
    sizes: SIZES,
    colors: [BLACK, BEIGE, OLIVE, LILAC],
    rating: 4.9,
    reviews: 187,
    badge: "New",
    blurb: "Brushed-back fleece hoodie with a double-layer hood and a kangaroo pocket.",
    details: ["340 GSM brushed fleece", "Double-layer hood", "Ribbed cuffs and hem"],
    care: "Machine wash cold inside out. Line dry. Do not iron print.",
    added: "2025-08-20",
  },
  {
    id: "logo-tee",
    name: "ISHTILE Logo Tee",
    price: 1990,
    image: logoTee,
    alt: "ISHTILE Logo Tee laid flat on warm beige plaster",
    category: "Men",
    brand: "ISHTILE",
    sizes: SIZES,
    colors: [BLACK, OFF_WHITE],
    rating: 4.5,
    reviews: 143,
    blurb: "Statement chest print on the house weight — the simplest way to wear the mark.",
    details: ["240 GSM cotton", "Water-based print", "Regular fit"],
    care: "Machine wash cold inside out. Iron print side down.",
    added: "2025-07-05",
  },
  {
    id: "overshirt",
    name: "ISHTILE Overshirt",
    price: 3990,
    image: overshirt,
    alt: "ISHTILE Overshirt laid flat on warm beige plaster",
    category: "Men",
    brand: "ISHTILE",
    sizes: SIZES,
    colors: [BLACK, OLIVE, NAVY],
    rating: 4.7,
    reviews: 61,
    badge: "Limited",
    blurb: "A shirt-jacket in heavy twill — the piece that carries a whole week of getting dressed.",
    details: ["Heavy cotton twill", "Four pockets", "Relaxed fit"],
    care: "Machine wash cold. Line dry. Warm iron.",
    added: "2025-08-16",
  },
  {
    id: "linen-shirt",
    name: "ISHTILE Linen Shirt",
    price: 3490,
    image: linenShirt,
    alt: "ISHTILE Linen Shirt laid flat on warm beige plaster",
    category: "Men",
    brand: "ISHTILE",
    sizes: SIZES,
    colors: [OFF_WHITE, BEIGE, LILAC],
    rating: 4.6,
    reviews: 88,
    blurb: "Pure linen, cut loose for the months when nothing else feels fair.",
    details: ["100% European linen", "Camp collar", "Relaxed fit"],
    care: "Machine wash cold on gentle. Line dry. Iron damp.",
    added: "2025-06-08",
  },
  {
    id: "cargo-pants",
    name: "ISHTILE Cargo Pants",
    price: 3990,
    image: cargoPants,
    alt: "ISHTILE Cargo Pants laid flat on warm beige plaster",
    category: "Men",
    brand: "ISHTILE",
    sizes: SIZES,
    colors: [BLACK, OLIVE, BEIGE],
    rating: 4.6,
    reviews: 112,
    blurb: "Six-pocket ripstop cargo with an adjustable hem — straight through from day to night.",
    details: ["Ripstop cotton blend", "Six pockets", "Adjustable ankle hem"],
    care: "Machine wash cold. Tumble dry low.",
    added: "2025-07-27",
  },
  {
    id: "shorts",
    name: "ISHTILE Shorts",
    price: 1990,
    image: shorts,
    alt: "ISHTILE Shorts laid flat on warm beige plaster",
    category: "Men",
    brand: "ISHTILE",
    sizes: SIZES,
    colors: [BLACK, BEIGE, OLIVE, NAVY],
    rating: 4.2,
    reviews: 96,
    blurb: "7-inch short in washed cotton with a drawcord waist.",
    details: ["Washed cotton twill", "Drawcord waist", "Side and back pockets"],
    care: "Machine wash cold. Tumble dry low.",
    added: "2025-05-02",
  },
  {
    id: "farak-slip-dress",
    name: "FARAK Slip Dress",
    price: 4990,
    image: brandFarak,
    alt: "Model wearing the FARAK slip dress against a lilac wall",
    category: "Women",
    brand: "FARAK",
    sizes: SIZES,
    colors: [BLACK, LILAC, RUST],
    rating: 4.8,
    reviews: 47,
    badge: "New",
    blurb: "Bias-cut slip in FARAK's signature drape — cut close, falls clean.",
    details: ["Fluid viscose crepe", "Bias cut", "Adjustable straps"],
    care: "Hand wash cold or dry clean. Hang to dry.",
    added: "2025-08-18",
  },
  {
    id: "mocha-kurta",
    name: "MOCHA+ Kurta",
    price: 3790,
    image: brandMocha,
    alt: "Model wearing the MOCHA+ kurta in cream",
    category: "Traditional",
    brand: "MOCHA+",
    sizes: SIZES,
    colors: [OFF_WHITE, BEIGE, OLIVE],
    rating: 4.7,
    reviews: 132,
    blurb: "A everyday kurta in handloom cotton — for Fridays, iftar evenings and everything after.",
    details: ["Handloom cotton", "Side slits", "Placket neck with button closure"],
    care: "Hand wash first wash, then machine wash cold. Iron on medium.",
    added: "2025-08-06",
  },
  {
    id: "onen-jacket",
    name: "ONEN+ Trainer Jacket",
    price: 5490,
    image: brandOnen,
    alt: "Model wearing the ONEN+ trainer jacket in black",
    category: "Men",
    brand: "ONEN+",
    sizes: SIZES,
    colors: [BLACK, NAVY],
    rating: 4.9,
    reviews: 38,
    badge: "Limited",
    blurb: "Structured trainer jacket in neoprene-backed cotton — ONEN+'s house silhouette.",
    details: ["Neoprene-backed cotton", "Ribbed collar and cuffs", "Two welt pockets"],
    care: "Wipe clean or dry clean. Do not tumble dry.",
    added: "2025-08-22",
  },
  {
    id: "paisley-shawl",
    name: "PILGRIM Paisley Shawl",
    price: 2690,
    image: cardWinter,
    alt: "Model wrapped in the PILGRIM paisley shawl",
    category: "Accessories",
    brand: "PILGRIM",
    sizes: ["One Size"],
    colors: [RUST, BLACK, BEIGE],
    rating: 4.5,
    reviews: 54,
    blurb: "Oversized paisley shawl — the one thing that makes a winter evening wearable.",
    details: ["Brushed wool blend", "190 x 70 cm", "Hand-finished fringe"],
    care: "Dry clean only. Store folded.",
    added: "2025-08-14",
  },
];

export const productById = (id: string) => products.find((p) => p.id === id);

export const categories = ["All", "Men", "Women", "Traditional", "Accessories"] as const;
export const brands = ["All", "ISHTILE", "ONEN+", "FARAK", "MOCHA+", "PILGRIM"] as const;
export const sizes = SIZES;
export const colors: ProductColor[] = [BLACK, OFF_WHITE, BEIGE, OLIVE, NAVY, LILAC, RUST, LIME];
export const priceCeiling = Math.max(...products.map((p) => p.price));

export type Filters = {
  category: (typeof categories)[number];
  brand: (typeof brands)[number];
  /** Colour names; empty means "any". */
  colors: string[];
  /** Size labels; empty means "any". */
  sizes: string[];
  maxPrice: number;
  query: string;
};

export const defaultFilters: Filters = {
  category: "All",
  brand: "All",
  colors: [],
  sizes: [],
  maxPrice: priceCeiling,
  query: "",
};

export function filterProducts(list: Product[], f: Filters) {
  const q = f.query.trim().toLowerCase();
  return list.filter((p) => {
    if (f.category !== "All" && p.category !== f.category) return false;
    if (f.brand !== "All" && p.brand !== f.brand) return false;
    if (p.price > f.maxPrice) return false;
    if (f.sizes.length && !f.sizes.some((s) => p.sizes.includes(s))) return false;
    if (f.colors.length && !f.colors.some((c) => p.colors.some((pc) => pc.name === c))) return false;
    if (q && !`${p.name} ${p.brand} ${p.category} ${p.blurb}`.toLowerCase().includes(q)) return false;
    return true;
  });
}

export type SortKey = "newest" | "price-asc" | "price-desc" | "rating";

export const sortLabels: Record<SortKey, string> = {
  newest: "Newest First",
  "price-asc": "Price: Low to High",
  "price-desc": "Price: High to Low",
  rating: "Best Rated",
};

export function sortProducts(list: Product[], sort: SortKey) {
  const out = [...list];
  switch (sort) {
    case "price-asc":
      return out.sort((a, b) => a.price - b.price);
    case "price-desc":
      return out.sort((a, b) => b.price - a.price);
    case "rating":
      return out.sort((a, b) => b.rating - a.rating);
    default:
      return out.sort((a, b) => b.added.localeCompare(a.added));
  }
}

/** Prices are shown in Bangladeshi taka, e.g. "৳ 2,490". */
export function formatTaka(amount: number) {
  return `৳ ${amount.toLocaleString("en-US")}`;
}

/**
 * Four gallery views from the one photo we have per product: the flat shot plus
 * three crops of it. Swap for real photography when the owner sends it.
 */
export function galleryViews(p: Product) {
  if (p.galleryImages && p.galleryImages.length > 1) {
    return p.galleryImages.map((src, index) => ({
      label: index === 0 ? "Full" : `View ${index + 1}`,
      position: "50% 50%",
      src,
    }));
  }
  return [
    { label: "Full", position: "50% 50%" },
    { label: "Top", position: "50% 12%" },
    { label: "Detail", position: "50% 60%" },
    { label: "Fabric", position: "50% 88%" },
  ].map((v) => ({ ...v, src: p.image }));
}
