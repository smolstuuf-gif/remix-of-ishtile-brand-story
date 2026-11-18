import { productById, type Product } from "@/lib/catalog";

const url = (import.meta.env["VITE_SUPABASE_URL"] as string | undefined)?.replace(/\/$/, "");
const key = import.meta.env["VITE_SUPABASE_PUBLISHABLE_KEY"] as string | undefined;

function publicApiHeaders(): HeadersInit {
  // Supabase publishable keys (sb_publishable_...) are API keys, not JWTs.
  // Sending one as a Bearer token causes PostgREST requests to be rejected.
  return key?.startsWith("sb_publishable_")
    ? { apikey: key }
    : { apikey: key ?? "", Authorization: `Bearer ${key ?? ""}` };
}

async function publicRows<T>(path: string): Promise<T[]> {
  if (!url || !key) return [];
  const response = await fetch(`${url}/rest/v1/${path}`, { headers: publicApiHeaders() });
  if (!response.ok) return [];
  return (await response.json()) as T[];
}

export type PublicHeroSlide = {
  id: string; title: string | null; subtitle: string | null; image_url: string;
  mobile_image_url: string | null; video_url: string | null; mobile_video_url: string | null; link_url: string | null;
};
export type PublicCollection = {
  id: string; title: string; image_url: string | null; description: string | null;
  campaign_label: string | null; slug: string; show_homepage: boolean; video_url: string | null;
};

export async function fetchHeroContent() {
  const [slides, settings] = await Promise.all([
    publicRows<PublicHeroSlide>("hero_slides?select=id,title,subtitle,image_url,mobile_image_url,video_url,mobile_video_url,link_url&is_active=eq.true&order=sort_order.asc"),
    publicRows<{ hero_autoplay_ms: number }>("site_brand_info?select=hero_autoplay_ms&id=eq.1&limit=1"),
  ]);
  return { slides, interval: Math.min(15000, Math.max(1000, settings[0]?.hero_autoplay_ms ?? 7000)) };
}

export async function fetchHomepageCollections() {
  return publicRows<PublicCollection>("collections?select=id,title,image_url,video_url,description,campaign_label,slug,show_homepage&is_active=eq.true&order=sort_order.asc");
}

export type PublicBrand = { id: string; name: string; logo_url: string | null; image_url: string | null; video_url: string | null; description: string | null; motto: string | null };
export async function fetchPublicBrands() {
  return publicRows<PublicBrand>("brands?select=id,name,logo_url,image_url,video_url,description,motto&is_active=eq.true&order=sort_order.asc");
}

type DatabaseProduct = {
  slug: string; name: string; price: number | string; image_url: string | null; image_urls: string[] | null; video_url: string | null;
  category: string; sizes: string[] | null; size_guide: { size: string; chest: string; length: string }[] | null; care_instructions: string | null; colors: { name: string; hex: string }[] | null;
  description: string | null; created_at: string; is_featured: boolean; is_out_of_stock: boolean; stock_quantity: number | null; tags: string[]; brands?: { name: string } | null;
};
function toCatalogProduct(row: DatabaseProduct): Product {
  const fallback = productById(row.slug);
  const allowed = ["Men", "Women", "Accessories", "Traditional"] as const;
  return {
    ...(fallback ?? {
      id: row.slug, name: row.name, price: Number(row.price), image: "", alt: row.name,
      category: "Men" as const, brand: "ISHTILE" as const, sizes: [], colors: [],
      rating: 0, reviews: 0, blurb: "", details: [], care: "", added: row.created_at,
      isFeatured: row.is_featured, isOutOfStock: row.is_out_of_stock, stockQuantity: row.stock_quantity ?? null, tags: row.tags ?? [],
    }),
    id: row.slug,
    name: row.name,
    price: Number(row.price),
    image: row.image_url || row.image_urls?.[0] || fallback?.image || "",
    ...(row.image_urls && row.image_urls.length > 1 ? { galleryImages: row.image_urls } : {}),
    ...(row.video_url ? { videoUrl: row.video_url } : {}),
    alt: row.name,
    category: allowed.includes(row.category as (typeof allowed)[number]) ? row.category as Product["category"] : fallback?.category ?? "Men",
    brand: (row.brands?.name || fallback?.brand || "ISHTILE") as Product["brand"],
    sizes: row.sizes?.length ? row.sizes : fallback?.sizes ?? [],
    colors: row.colors?.length ? row.colors : fallback?.colors ?? [],
    rating: fallback?.rating ?? 0,
    reviews: fallback?.reviews ?? 0,
    blurb: row.description || fallback?.blurb || "",
    details: fallback?.details ?? (row.description ? [row.description] : []),
    sizeGuide: row.size_guide ?? [],
    care: row.care_instructions || fallback?.care || "",
    added: row.created_at || fallback?.added || "",
    isFeatured: row.is_featured, isOutOfStock: row.is_out_of_stock, stockQuantity: row.stock_quantity ?? null, tags: row.tags ?? [],
    ...(() => {
      const badge = (row.tags ?? []).find((tag) => ["Best Seller", "Customer Favorite", "New Arrival", "Limited Edition", "Trending", "Staff Pick", "Exclusive"].includes(tag));
      return badge ? { badge } : {};
    })(),
  };
}
export async function fetchPublicProducts(): Promise<Product[] | null> {
  if (!url || !key) return null;
  const response = await fetch(`${url}/rest/v1/products?select=slug,name,price,image_url,image_urls,video_url,category,sizes,size_guide,care_instructions,colors,description,created_at,is_featured,is_out_of_stock,stock_quantity,tags,brands(name)&is_active=eq.true&order=created_at.desc`, {
    headers: publicApiHeaders(),
  });
  if (!response.ok) return null;
  const rows = await response.json() as DatabaseProduct[];
  return rows.map(toCatalogProduct);
}
export async function fetchPublicProduct(slug: string): Promise<Product | null | undefined> {
  if (!url || !key) return undefined;
  const response = await fetch(`${url}/rest/v1/products?select=slug,name,price,image_url,image_urls,category,sizes,size_guide,care_instructions,colors,description,created_at,brands(name)&slug=eq.${encodeURIComponent(slug)}&is_active=eq.true&limit=1`, {
    headers: publicApiHeaders(),
  });
  if (!response.ok) return undefined;
  const rows = await response.json() as DatabaseProduct[];
  return rows[0] ? toCatalogProduct(rows[0]) : null;
}

export type PublicBrandInfo = {
  social_links: Record<string, string>;
  contact_numbers: string[];
  address: string | null;
  motto: string | null;
  about_text: string | null;
  logo_url: string | null;
  symbol_url: string | null;
};
export async function fetchPublicBrandInfo() {
  const rows = await publicRows<PublicBrandInfo>("site_brand_info?select=social_links,contact_numbers,address,motto,about_text,logo_url,symbol_url&id=eq.1&limit=1");
  return rows[0] ?? null;
}

export type PublicLook = {
  id: string; slug: string; title: string; description: string | null; image_url: string; video_url: string | null;
  collection_id: string | null; alt_text: string | null; season: "spring" | "summer" | "festive" | "monsoon" | "winter" | null; sort_order: number;
  products: { product: Product; defaultSize: string | null; defaultColor: string | null; defaultQuantity: number; sortOrder: number }[];
};
type PublicLookRow = {
  id: string; slug: string; title: string; description: string | null; image_url: string; video_url: string | null;
  collection_id: string | null; alt_text: string | null; season: "spring" | "summer" | "festive" | "monsoon" | "winter" | null; sort_order: number;
  lookbook_look_products?: {
    sort_order: number; default_size: string | null; default_color: string | null; default_quantity: number;
    products: DatabaseProduct | null;
  }[];
};
export async function fetchPublicLooks(): Promise<PublicLook[] | null> {
  if (!url || !key) return null;
  const rows = await publicRows<PublicLookRow>(
    "lookbook_looks?select=id,slug,title,description,image_url,video_url,collection_id,alt_text,season,sort_order,lookbook_look_products(sort_order,default_size,default_color,default_quantity,products(slug,name,price,image_url,image_urls,video_url,category,sizes,colors,description,created_at,is_featured,is_out_of_stock,stock_quantity,tags,brands(name)))&is_active=eq.true&order=sort_order.asc"
  );
  return rows.map((look) => ({
    id: look.id, slug: look.slug, title: look.title, description: look.description,
    image_url: look.image_url, video_url: look.video_url, collection_id: look.collection_id, alt_text: look.alt_text, season: look.season, sort_order: look.sort_order,
    products: (look.lookbook_look_products ?? [])
      .filter((item) => item.products)
      .sort((a, b) => a.sort_order - b.sort_order)
      .map((item) => ({
        product: toCatalogProduct(item.products as DatabaseProduct),
        defaultSize: item.default_size, defaultColor: item.default_color,
        defaultQuantity: item.default_quantity, sortOrder: item.sort_order,
      })),
  }));
}
