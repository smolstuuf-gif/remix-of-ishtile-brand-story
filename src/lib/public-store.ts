const url = (import.meta.env.VITE_SUPABASE_URL as string | undefined)?.replace(/\/$/, "");
const key = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY as string | undefined;
import type { Product } from "@/lib/catalog";

async function publicRows<T>(path: string): Promise<T[]> {
  if (!url || !key) return [];
  const response = await fetch(`${url}/rest/v1/${path}`, { headers: { apikey: key, Authorization: `Bearer ${key}` } });
  if (!response.ok) return [];
  return (await response.json()) as T[];
}

export type PublicHeroSlide = {
  id: string; title: string | null; subtitle: string | null; image_url: string;
  mobile_image_url: string | null; link_url: string | null;
};
export type PublicCollection = {
  id: string; title: string; image_url: string | null; description: string | null;
  campaign_label: string | null; slug: string; show_homepage: boolean;
};

export async function fetchHeroContent() {
  const [slides, settings] = await Promise.all([
    publicRows<PublicHeroSlide>("hero_slides?select=id,title,subtitle,image_url,mobile_image_url,link_url&is_active=eq.true&order=sort_order.asc"),
    publicRows<{ hero_autoplay_ms: number }>("site_brand_info?select=hero_autoplay_ms&id=eq.1&limit=1"),
  ]);
  return { slides, interval: Math.min(15000, Math.max(1000, settings[0]?.hero_autoplay_ms ?? 7000)) };
}

export async function fetchHomepageCollections() {
  return publicRows<PublicCollection>("collections?select=id,title,image_url,description,campaign_label,slug,show_homepage&is_active=eq.true&order=sort_order.asc");
}

export type PublicBrand = { id: string; name: string; logo_url: string | null; image_url: string | null };
export async function fetchPublicBrands() {
  return publicRows<PublicBrand[]>("brands?select=id,name,logo_url,image_url&is_active=eq.true&order=sort_order.asc");
}

type DatabaseProduct = {
  slug: string; name: string; price: number | string; image_url: string | null; image_urls: string[] | null;
  category: string; sizes: string[] | null; colors: { name: string; hex: string }[] | null;
  description: string | null; created_at: string; brands?: { name: string } | null;
};
function toCatalogProduct(row: DatabaseProduct): Product {
  const allowed = ["Men", "Women", "Accessories", "Traditional"] as const;
  return {
    id: row.slug, name: row.name, price: Number(row.price), image: row.image_url || row.image_urls?.[0] || "",
    alt: row.name, category: allowed.includes(row.category as (typeof allowed)[number]) ? row.category as Product["category"] : "Men",
    brand: (row.brands?.name || "ISHTILE") as Product["brand"],
    sizes: row.sizes || [], colors: row.colors || [], rating: 0, reviews: 0,
    blurb: row.description || "", details: row.description ? [row.description] : [], care: "",
    added: row.created_at,
  };
}
export async function fetchPublicProducts(): Promise<Product[] | null> {
  if (!url || !key) return null;
  const response = await fetch(`${url}/rest/v1/products?select=slug,name,price,image_url,image_urls,category,sizes,colors,description,created_at,brands(name)&is_active=eq.true&order=created_at.desc`, {
    headers: { apikey: key, Authorization: `Bearer ${key}` },
  });
  if (!response.ok) return null;
  const rows = await response.json() as DatabaseProduct[];
  return rows.map(toCatalogProduct);
}
export async function fetchPublicProduct(slug: string): Promise<Product | null | undefined> {
  if (!url || !key) return undefined;
  const response = await fetch(`${url}/rest/v1/products?select=slug,name,price,image_url,image_urls,category,sizes,colors,description,created_at,brands(name)&slug=eq.${encodeURIComponent(slug)}&is_active=eq.true&limit=1`, {
    headers: { apikey: key, Authorization: `Bearer ${key}` },
  });
  if (!response.ok) return undefined;
  const rows = await response.json() as DatabaseProduct[];
  return rows[0] ? toCatalogProduct(rows[0]) : null;
}
