const SUPABASE_URL = import.meta.env["VITE_SUPABASE_URL"] as string | undefined;
const SUPABASE_KEY = import.meta.env["VITE_SUPABASE_PUBLISHABLE_KEY"] as string | undefined;
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
  image_url: string | null;
};

export type OrderItemRecord = {
  product_id: string | null;
  product_name: string;
  brand_name: string;
  unit_price: number | string;
  quantity: number;
  line_total: number | string;
  season: string | null;
  size: string | null;
  color: string | null;
  product?: { image_url: string | null } | null;
};

export type OrderRecord = {
  id: string;
  order_number: string;
  customer_name: string;
  customer_phone: string;
  customer_email: string | null;
  shipping_address: string;
  shipping_city: string | null;
  shipping_postal: string | null;
  payment_method: string;
  payment_status: "pending" | "paid" | "failed" | "refunded" | string;
  fulfillment_status: "new" | "confirmed" | "processing" | "shipped" | "delivered" | "cancelled" | "returned" | string;
  subtotal: number | string;
  shipping_fee: number | string;
  total: number | string;
  created_at: string;
  special_note: string | null;
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

export async function createCustomerProfile(input: {
  full_name: string;
  mobile_number: string;
  delivery_address: string;
}): Promise<void> {
  const { url, key } = config();
  const response = await fetch(`${url}/rest/v1/customer_profiles`, {
    method: "POST",
    headers: {
      apikey: key,
      Authorization: `Bearer ${key}`,
      "Content-Type": "application/json",
      Prefer: "return=minimal",
    },
    body: JSON.stringify({
      full_name: input.full_name.trim(),
      mobile_number: input.mobile_number.trim(),
      delivery_address: input.delivery_address.trim(),
    }),
  });
  if (!response.ok) {
    const body = await response.json().catch(() => ({}));
    if (response.status === 409 || body.code === "23505") {
      throw new Error("An account with this mobile number already exists.");
    }
    throw new Error(body.message || body.msg || "We couldn't save your details. Please try again.");
  }
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

  let current: AdminSession;
  try {
    current = await validSession(session);
  } catch (error) {
    const message = error instanceof Error ? error.message : "";
    // Only discard a session when Supabase explicitly rejects its refresh token.
    // Network failures and temporary service errors must not sign an administrator out.
    if (/invalid refresh token|refresh token.*(not found|expired|invalid)|invalid grant/i.test(message)) {
      window.localStorage.removeItem(SESSION_KEY);
      return null;
    }
    return session;
  }

  try {
    await authRequest("/auth/v1/user", current);
    await assertAdmin(current);
    return current;
  } catch (error) {
    const message = error instanceof Error ? error.message : "";
    if (/invalid jwt|jwt expired|unauthorized|not authenticated|does not have ISHTILE administrator access/i.test(message)) {
      window.localStorage.removeItem(SESSION_KEY);
      return null;
    }
    // Keep the last known-good admin session during transient API or connectivity
    // failures. The dashboard can then surface its own retryable data error.
    return current;
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

async function getAllRows<T>(path: string, session: AdminSession): Promise<T[]> {
  const pageSize = 1000;
  const rows: T[] = [];
  for (let offset = 0; ; offset += pageSize) {
    const page = await getRows<T>(`${path}&limit=${pageSize}&offset=${offset}`, session);
    rows.push(...page);
    if (page.length < pageSize) return rows;
  }
}

export async function getDashboardData(session: AdminSession, _days: number): Promise<DashboardData> {
  const [brands, products, orders] = await Promise.all([
    getRows<BrandRecord>(
      "/rest/v1/brands?select=id,name,slug,description,sort_order&order=sort_order.asc",
      session,
    ),
    getRows<ProductRecord>(
      "/rest/v1/products?select=id,name,slug,brand_id,category,price,stock_quantity,is_active,image_url&order=name.asc",
      session,
    ),
    getAllRows<OrderRecord>(
      "/rest/v1/orders?select=id,order_number,customer_name,customer_phone,customer_email,shipping_address,shipping_city,shipping_postal,special_note,payment_method,payment_status,fulfillment_status,subtotal,shipping_fee,total,created_at,order_items(product_id,product_name,brand_name,season,size,color,unit_price,quantity,line_total,product:products(image_url))&order=created_at.desc",
      session,
    ),
  ]);
  return { brands, products, orders };
}


export async function updateOrderStatus(
  session: AdminSession,
  orderId: string,
  fulfillmentStatus: OrderRecord["fulfillment_status"],
): Promise<void> {
  const { url, key } = config();
  const current = await validSession(session);
  const response = await fetch(
    `${url}/rest/v1/orders?id=eq.${encodeURIComponent(orderId)}`,
    {
      method: "PATCH",
      headers: {
        apikey: key,
        Authorization: `Bearer ${current.access_token}`,
        "Content-Type": "application/json",
        Prefer: "return=minimal",
      },
      body: JSON.stringify({ fulfillment_status: fulfillmentStatus, updated_at: new Date().toISOString() }),
    },
  );
  await responseJson<unknown>(response);
}

export type EditableOrderItem = {
  product_id: string;
  quantity: number;
  unit_price: number;
  size: string;
  color: string;
};

export type EditableOrder = Pick<OrderRecord,
  "customer_name" | "customer_phone" | "customer_email" | "shipping_address" |
  "shipping_city" | "shipping_postal" | "payment_method" | "payment_status" |
  "fulfillment_status" | "shipping_fee" | "special_note"
>;

export async function saveOrderEdits(
  session: AdminSession,
  orderId: string,
  order: EditableOrder,
  items: EditableOrderItem[],
): Promise<void> {
  const { url, key } = config();
  const current = await validSession(session);
  const response = await fetch(`${url}/rest/v1/rpc/admin_update_store_order`, {
    method: "POST",
    headers: {
      apikey: key,
      Authorization: `Bearer ${current.access_token}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      p_order_id: orderId,
      p_order: { ...order, shipping_fee: Number(order.shipping_fee) },
      p_items: items,
    }),
  });
  await responseJson<unknown>(response);
}
