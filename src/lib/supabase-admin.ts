const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL as string | undefined;
const SUPABASE_KEY = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY as string | undefined;
const SESSION_KEY = "ishtile.admin.session.v1";

export type AdminSession = {
  access_token: string;
  refresh_token: string;
  expires_at: number;
  user: { id: string; email?: string };
};

export type BrandRecord = {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  sort_order: number;
};

export type ProductRecord = {
  id: string;
  name: string;
  slug: string;
  brand_id: string;
  category: string;
  price: number | string;
  stock_quantity: number | null;
  is_active: boolean;
};

export type OrderItemRecord = {
  product_id: string | null;
  product_name: string;
  brand_name: string;
  unit_price: number | string;
  quantity: number;
  line_total: number | string;
};

export type OrderRecord = {
  id: string;
  order_number: string;
  customer_name: string;
  customer_phone: string;
  customer_email: string;
  payment_method: string;
  payment_status: "pending" | "paid" | "failed" | "refunded" | string;
  fulfillment_status: "new" | "confirmed" | "processing" | "shipped" | "delivered" | "cancelled" | "returned" | string;
  subtotal: number | string;
  shipping_fee: number | string;
  total: number | string;
  created_at: string;
  order_items: OrderItemRecord[];
};

export type DashboardData = {
  brands: BrandRecord[];
  products: ProductRecord[];
  orders: OrderRecord[];
};

function config() {
  if (!SUPABASE_URL || !SUPABASE_KEY) {
    throw new Error("Supabase environment variables are missing. Add VITE_SUPABASE_URL and VITE_SUPABASE_PUBLISHABLE_KEY to your deployment settings.");
  }
  return { url: SUPABASE_URL.replace(/\/$/, ""), key: SUPABASE_KEY };
}

async function responseJson<T>(response: Response): Promise<T> {
  const body = await response.json().catch(() => ({}));
  if (!response.ok) {
    const message = typeof body.message === "string" ? body.message : typeof body.msg === "string" ? body.msg : "Supabase request failed.";
    throw new Error(message);
  }
  return body as T;
}

function saveSession(session: AdminSession) {
  window.localStorage.setItem(SESSION_KEY, JSON.stringify(session));
}

function readSession(): AdminSession | null {
  try {
    const raw = window.localStorage.getItem(SESSION_KEY);
    if (!raw) return null;
    const session = JSON.parse(raw) as AdminSession;
    return session.access_token && session.refresh_token && session.user?.id ? session : null;
  } catch {
    return null;
  }
}

async function refreshSession(session: AdminSession): Promise<AdminSession> {
  const { url, key } = config();
  const response = await fetch(`${url}/auth/v1/token?grant_type=refresh_token`, {
    method: "POST",
    headers: { apikey: key, "Content-Type": "application/json" },
    body: JSON.stringify({ refresh_token: session.refresh_token }),
  });
  const data = await responseJson<{
    access_token: string;
    refresh_token: string;
    expires_in: number;
    user: AdminSession["user"];
  }>(response);
  const next = { ...data, expires_at: Math.floor(Date.now() / 1000) + data.expires_in };
  saveSession(next);
  return next;
}

async function validSession(session: AdminSession): Promise<AdminSession> {
  if (session.expires_at < Math.floor(Date.now() / 1000) + 60) {
    return refreshSession(session);
  }
  return session;
}

async function authRequest<T>(path: string, session: AdminSession): Promise<T> {
  const { url, key } = config();
  const current = await validSession(session);
  const response = await fetch(`${url}${path}`, {
    headers: {
      apikey: key,
      Authorization: `Bearer ${current.access_token}`,
      "Content-Type": "application/json",
    },
  });
  return responseJson<T>(response);
}

async function assertAdmin(session: AdminSession) {
  const rows = await authRequest<{ user_id: string }[]>(
    `/rest/v1/admin_users?select=user_id&user_id=eq.${encodeURIComponent(session.user.id)}&limit=1`,
    session,
  );
  if (!rows.length) throw new Error("This account does not have ISHTILE administrator access.");
}

export async function signInAdmin(email: string, password: string): Promise<AdminSession> {
  const { url, key } = config();
  const response = await fetch(`${url}/auth/v1/token?grant_type=password`, {
    method: "POST",
    headers: { apikey: key, "Content-Type": "application/json" },
    body: JSON.stringify({ email: email.trim(), password }),
  });
  const data = await responseJson<{
    access_token: string;
    refresh_token: string;
    expires_in: number;
    user: AdminSession["user"];
  }>(response);
  const session: AdminSession = {
    ...data,
    expires_at: Math.floor(Date.now() / 1000) + data.expires_in,
  };
  try {
    await assertAdmin(session);
  } catch (error) {
    await fetch(`${url}/auth/v1/logout`, {
      method: "POST",
      headers: { apikey: key, Authorization: `Bearer ${session.access_token}` },
    }).catch(() => undefined);
    throw error;
  }
  saveSession(session);
  return session;
}

export async function restoreAdminSession(): Promise<AdminSession | null> {
  const session = readSession();
  if (!session) return null;
  try {
    const current = await validSession(session);
    await authRequest("/auth/v1/user", current);
    await assertAdmin(current);
    return current;
  } catch {
    window.localStorage.removeItem(SESSION_KEY);
    return null;
  }
}

export async function signOutAdmin(session: AdminSession) {
  const { url, key } = config();
  const current = await validSession(session).catch(() => session);
  window.localStorage.removeItem(SESSION_KEY);
  await fetch(`${url}/auth/v1/logout`, {
    method: "POST",
    headers: { apikey: key, Authorization: `Bearer ${current.access_token}` },
  }).catch(() => undefined);
}

async function getRows<T>(path: string, session: AdminSession): Promise<T[]> {
  return authRequest<T[]>(path, session);
}

export async function getDashboardData(session: AdminSession, days: number): Promise<DashboardData> {
  const from = new Date(Date.now() - days * 24 * 60 * 60 * 1000).toISOString();
  const [brands, products, orders] = await Promise.all([
    getRows<BrandRecord>(
      "/rest/v1/brands?select=id,name,slug,description,sort_order&order=sort_order.asc",
      session,
    ),
    getRows<ProductRecord>(
      "/rest/v1/products?select=id,name,slug,brand_id,category,price,stock_quantity,is_active&order=name.asc",
      session,
    ),
    getRows<OrderRecord>(
      `/rest/v1/orders?select=id,order_number,customer_name,customer_phone,customer_email,payment_method,payment_status,fulfillment_status,subtotal,shipping_fee,total,created_at,order_items(product_id,product_name,brand_name,unit_price,quantity,line_total)&created_at=gte.${encodeURIComponent(from)}&order=created_at.desc&limit=1000`,
      session,
    ),
  ]);
  return { brands, products, orders };
}
