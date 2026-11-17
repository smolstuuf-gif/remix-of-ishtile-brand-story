import "jsr:@supabase/functions-js/edge-runtime.d.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};
const json = (body: unknown, status = 200) =>
  new Response(JSON.stringify(body), { status, headers: { ...corsHeaders, "Content-Type": "application/json" } });
const isBangladeshPhone = (value: string) => /^(?:\+?88)?01[3-9]\d{8}$/.test(value.replace(/[\s()-]/g, ""));
const normalizePhone = (value: string) => {
  const digits = value.replace(/\D/g, "");
  if (/^01[3-9]\d{8}$/.test(digits)) return `+88${digits}`;
  if (/^8801[3-9]\d{8}$/.test(digits)) return `+${digits}`;
  return value.trim();
};

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });
  if (req.method !== "POST") return json({ error: "Method not allowed" }, 405);
  try {
    const { identifier, password } = await req.json();
    if (typeof identifier !== "string" || typeof password !== "string" || !identifier.trim() || !password) {
      return json({ error: "Enter your login details." }, 400);
    }
    if (identifier.length > 254 || password.length > 1024) return json({ error: "Invalid login details." }, 400);

    const supabaseUrl = Deno.env.get("SUPABASE_URL");
    const serviceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
    const anonKey = Deno.env.get("SUPABASE_ANON_KEY");
    if (!supabaseUrl || !serviceRoleKey || !anonKey) {
      console.error("Customer login function is missing required Supabase environment variables.");
      return json({ error: "Sign-in is temporarily unavailable." }, 500);
    }

    const value = identifier.trim();
    let column: string;
    let lookupValue: string;
    if (value.includes("@")) {
      column = "email";
      lookupValue = value.toLowerCase();
    } else if (isBangladeshPhone(value)) {
      column = "mobile_number";
      lookupValue = normalizePhone(value);
    } else {
      column = "username";
      lookupValue = value.toLowerCase();
    }

    const query = new URLSearchParams({ select: "email", [column]: `eq.${lookupValue}`, limit: "1" });
    const profileResponse = await fetch(`${supabaseUrl}/rest/v1/customer_profiles?${query.toString()}`, {
      headers: { apikey: serviceRoleKey, Authorization: `Bearer ${serviceRoleKey}` },
    });
    if (!profileResponse.ok) {
      console.error("Customer identifier lookup failed:", profileResponse.status);
      return json({ error: "Sign-in failed. Check your details and try again." }, 401);
    }
    const profiles = await profileResponse.json();
    const email = Array.isArray(profiles) && typeof profiles[0]?.email === "string" ? profiles[0].email : null;
    if (!email) return json({ error: "Sign-in failed. Check your details and try again." }, 401);

    const authResponse = await fetch(`${supabaseUrl}/auth/v1/token?grant_type=password`, {
      method: "POST",
      headers: { apikey: anonKey, "Content-Type": "application/json" },
      body: JSON.stringify({ email, password }),
    });
    if (!authResponse.ok) return json({ error: "Sign-in failed. Check your details and try again." }, 401);
    const session = await authResponse.json();
    return json({ access_token: session.access_token, refresh_token: session.refresh_token, expires_in: session.expires_in, token_type: session.token_type });
  } catch (error) {
    console.error("Customer login request failed:", error);
    return json({ error: "Sign-in failed. Check your details and try again." }, 400);
  }
});
