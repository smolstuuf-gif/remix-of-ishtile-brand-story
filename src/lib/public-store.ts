const url = (import.meta.env.VITE_SUPABASE_URL as string | undefined)?.replace(/\/$/, "");
const key = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY as string | undefined;

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
