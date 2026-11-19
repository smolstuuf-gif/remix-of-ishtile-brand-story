import type { AdminSession } from "@/lib/supabase-admin";

const SUPABASE_URL = (import.meta.env["VITE_SUPABASE_URL"] as string | undefined)?.replace(/\/$/, "");
const SUPABASE_KEY = import.meta.env["VITE_SUPABASE_PUBLISHABLE_KEY"] as string | undefined;
const BUCKET = "ishtile-media";

function config() {
  if (!SUPABASE_URL || !SUPABASE_KEY) {
    throw new Error("Supabase environment variables are missing. Add VITE_SUPABASE_URL and VITE_SUPABASE_PUBLISHABLE_KEY to your deployment settings.");
  }
  return { url: SUPABASE_URL, key: SUPABASE_KEY };
}

async function parse<T>(response: Response): Promise<T> {
  const body = await response.json().catch(() => null);
  if (!response.ok) {
    throw new Error(body?.message || body?.msg || body?.error || "The request could not be completed.");
  }
  return body as T;
}

export async function adminData<T>(path: string, session: AdminSession): Promise<T> {
  const { url, key } = config();
  return parse<T>(await fetch(`${url}/rest/v1/${path}`, {
    headers: { apikey: key, Authorization: `Bearer ${session.access_token}` },
  }));
}

export async function adminWrite<T = unknown>(
  path: string,
  session: AdminSession,
  method: "POST" | "PATCH" | "DELETE",
  body?: unknown,
): Promise<T> {
  const { url, key } = config();
  const response = await fetch(`${url}/rest/v1/${path}`, {
    method,
    headers: {
      apikey: key,
      Authorization: `Bearer ${session.access_token}`,
      "Content-Type": "application/json",
      Prefer: method === "POST" ? "return=representation" : "return=minimal",
    },
    ...(body === undefined ? {} : { body: JSON.stringify(body) }),
  });
  if (response.status === 204 || response.headers.get("content-length") === "0") return undefined as T;
  return parse<T>(response);
}

export async function uploadAdminMedia(file: File, session: AdminSession, folder: string): Promise<string> {
  const { url, key } = config();
  if (!file.type.startsWith("image/")) throw new Error("Please choose an image file.");
  if (file.size > 12 * 1024 * 1024) throw new Error("Images must be 12 MB or smaller.");
  const extension = file.name.split(".").pop()?.toLowerCase().replace(/[^a-z0-9]/g, "") || "jpg";
  const objectPath = `${folder}/${crypto.randomUUID()}.${extension}`;
  const response = await fetch(`${url}/storage/v1/object/${BUCKET}/${objectPath.split("/").map(encodeURIComponent).join("/")}`, {
    method: "POST",
    headers: {
      apikey: key,
      Authorization: `Bearer ${session.access_token}`,
      "Content-Type": file.type,
      "x-upsert": "false",
    },
    body: file,
  });
  await parse(response);
  return `${url}/storage/v1/object/public/${BUCKET}/${objectPath.split("/").map(encodeURIComponent).join("/")}`;
}

export async function uploadAdminVideoMedia(file: File, session: AdminSession, folder: string): Promise<string> {
  const { url, key } = config();
  const allowed = ["video/mp4", "video/webm"];
  if (!allowed.includes(file.type)) throw new Error("Choose an MP4 (H.264) or WebM video. MOV files must be converted to MP4 before uploading.");
  if (file.size > 100 * 1024 * 1024) throw new Error("Videos must be 100 MB or smaller.");
  const extension = file.name.split(".").pop()?.toLowerCase().replace(/[^a-z0-9]/g, "") || "mp4";
  const objectPath = `${folder}/videos/${crypto.randomUUID()}.${extension}`;
  const response = await fetch(`${url}/storage/v1/object/${BUCKET}/${objectPath.split("/").map(encodeURIComponent).join("/")}`, {
    method: "POST",
    headers: { apikey: key, Authorization: `Bearer ${session.access_token}`, "Content-Type": file.type, "x-upsert": "false" },
    body: file,
  });
  await parse(response);
  return `${url}/storage/v1/object/public/${BUCKET}/${objectPath.split("/").map(encodeURIComponent).join("/")}`;
}

export type AdminBrand = {
  id: string; name: string; slug: string; description: string | null; sort_order: number; is_active: boolean;
  logo_url: string | null; image_url: string | null; video_url: string | null; website_url: string | null; instagram_url: string | null;
  facebook_url: string | null; contact_email: string | null; contact_phone: string | null;
  contact_address: string | null; motto: string | null; social_links: Record<string, string>;
};
export type AdminProduct = {
  id: string; slug: string; name: string; brand_id: string; category: string; price: number;
  image_url: string | null; image_urls: string[]; video_url: string | null; description: string | null; sizes: string[]; size_guide: { size: string; chest: string; length: string }[]; care_instructions: string | null;
  colors: { name: string; hex: string; images?: string[] }[]; stock_quantity: number | null; sku: string | null; is_active: boolean; is_featured: boolean; is_out_of_stock: boolean; tags: string[];
};
export type HeroSlide = {
  id: string; title: string | null; subtitle: string | null; image_url: string | null; mobile_image_url: string | null; video_url: string | null; mobile_video_url: string | null;
  link_url: string | null; sort_order: number; is_active: boolean; starts_at: string | null; ends_at: string | null;
};
export type AdminCollection = {
  id: string; slug: string; title: string; description: string | null; image_url: string | null;
  campaign_label: string | null; video_url: string | null; show_homepage: boolean; is_active: boolean; starts_at: string | null;
  ends_at: string | null; sort_order: number; collection_products?: { product_id: string; sort_order: number }[];
};
export type AdminLook = {
  id: string; slug: string; title: string; description: string | null; image_url: string; video_url: string | null;
  collection_id: string | null; alt_text: string | null; season: "spring" | "summer" | "festive" | "monsoon" | "winter" | null; sort_order: number; is_active: boolean; starts_at: string | null; ends_at: string | null;
  lookbook_look_products?: { product_id: string; sort_order: number; default_size: string | null; default_color: string | null; default_quantity: number }[];
};
export type SiteBrandInfo = {
  id: number; social_links: Record<string, string>; contact_numbers: string[]; address: string | null;
  motto: string | null; about_text: string | null; logo_url: string | null; symbol_url: string | null;
  hero_autoplay_ms: number;
  homepage_editorial_image_url: string | null; homepage_summer_image_url: string | null;
  editorial_fashion_image_url: string | null; editorial_art_image_url: string | null;
  stores_image_url: string | null; footer_building_image_url: string | null; footer_band_image_url: string | null;
};
export type CustomerProfile = {
  id: string; full_name: string; mobile_number: string; delivery_address: string; created_at: string;
};
export type AdminOrder = {
  id: string; order_number: string; customer_phone: string; created_at: string;
  total: number | string; payment_status: string; fulfillment_status: string;
  order_items?: { brand_name: string; quantity: number; line_total: number | string }[] | null;
};

export async function loadAdminWorkspace(session: AdminSession) {
  const [brands, products, slides, collections, looks, customers, admins, settings, orders] = await Promise.all([
    adminData<AdminBrand[]>("brands?select=*&order=sort_order.asc,name.asc", session),
    adminData<AdminProduct[]>("products?select=*&order=created_at.desc", session),
    adminData<HeroSlide[]>("hero_slides?select=*&order=sort_order.asc,created_at.desc", session),
    adminData<AdminCollection[]>("collections?select=*,collection_products(product_id,sort_order)&order=sort_order.asc,created_at.desc", session),
    adminData<AdminLook[]>("lookbook_looks?select=*,lookbook_look_products(product_id,sort_order,default_size,default_color,default_quantity)&order=sort_order.asc,created_at.desc", session),
    adminData<CustomerProfile[]>("customer_profiles?select=*&order=created_at.desc&limit=500", session),
    adminData<{ user_id: string; created_at: string }[]>("admin_users?select=user_id,created_at&order=created_at.asc", session),
    adminData<SiteBrandInfo[]>("site_brand_info?select=*&id=eq.1&limit=1", session),
    adminData<AdminOrder[]>("orders?select=id,order_number,customer_phone,created_at,total,payment_status,fulfillment_status,order_items(brand_name,quantity,line_total)&order=created_at.desc&limit=500", session),
  ]);
  return { brands, products, slides, collections, looks, customers, admins, settings: settings[0], orders };
}

export async function adminRpc<T>(name: string, session: AdminSession, body: unknown): Promise<T> {
  const { url, key } = config();
  const response = await fetch(`${url}/rest/v1/rpc/${name}`, {
    method: "POST",
    headers: { apikey: key, Authorization: `Bearer ${session.access_token}`, "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  return parse<T>(response);
}

export function slugify(value: string) {
  return value.toLowerCase().trim().normalize("NFKD").replace(/[\u0300-\u036f]/g, "").replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
}
