import { useEffect, useMemo, useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { AccountAccess } from "@/components/account/AccountAccess";
import {
  Activity,
  ArrowUpRight,
  Boxes,
  ChartNoAxesCombined,
  CircleDollarSign,
  Clock3,
  LoaderCircle,
  LogOut,
  Package,
  RefreshCw,
  ShoppingBag,
  TrendingUp,
} from "lucide-react";
import {
  Area,
  AreaChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import {
  getDashboardData,
  restoreAdminSession,
  signOutAdmin,
  type AdminSession,
  type DashboardData,
  type OrderRecord,
} from "@/lib/supabase-admin";

export const Route = createFileRoute("/admin")({
  head: () => ({
    meta: [
      { title: "Admin Dashboard — ISHTILE+" },
      { name: "robots", content: "noindex,nofollow" },
    ],
  }),
  component: AdminPage,
});

const money = (value: number) =>
  new Intl.NumberFormat("en-BD", {
    style: "currency",
    currency: "BDT",
    maximumFractionDigits: 0,
  }).format(value);

const number = (value: number) => new Intl.NumberFormat("en-BD").format(value);
const amount = (value: number | string | null | undefined) => Number(value ?? 0);
const shortDate = (value: string) =>
  new Intl.DateTimeFormat("en-BD", { day: "numeric", month: "short" }).format(new Date(value));
const dateTime = (value: string) =>
  new Intl.DateTimeFormat("en-BD", { day: "numeric", month: "short", hour: "numeric", minute: "2-digit" }).format(new Date(value));

function AdminPage() {
  const [session, setSession] = useState<AdminSession | null>(null);
  const [checking, setChecking] = useState(true);
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState<DashboardData | null>(null);
  const [days, setDays] = useState(30);
  const [refreshKey, setRefreshKey] = useState(0);

  useEffect(() => {
    let active = true;
    restoreAdminSession()
      .then((restored) => {
        if (active) setSession(restored);
      })
      .finally(() => {
        if (active) setChecking(false);
      });
    return () => {
      active = false;
    };
  }, []);

  useEffect(() => {
    if (!session) return <AccountAccess defaultMode="admin" />;

  return <Dashboard session={session} data={data} days={days} setDays={setDays} loading={loading} error={dataError} onRefresh={() => setRefreshKey((value) => value + 1)} onSignOut={handleSignOut} />;
}

function Dashboard({
  session,
  data,
  days,
  setDays,
  loading,
  error,
  onRefresh,
  onSignOut,
}: {
  session: AdminSession;
  data: DashboardData | null;
  days: number;
  setDays: (days: number) => void;
  loading: boolean;
  error: string;
  onRefresh: () => void;
  onSignOut: () => void;
}) {
  const paidOrders = useMemo(
    () => (data?.orders ?? []).filter((order) => order.payment_status === "paid" && order.fulfillment_status !== "cancelled"),
    [data],
  );
  const validOrders = useMemo(
    () => (data?.orders ?? []).filter((order) => order.fulfillment_status !== "cancelled" && order.fulfillment_status !== "returned"),
    [data],
  );
  const revenue = paidOrders.reduce((sum, order) => sum + amount(order.total), 0);
  const units = paidOrders.reduce((sum, order) => sum + (order.order_items ?? []).reduce((n, item) => n + item.quantity, 0), 0);
  const average = paidOrders.length ? revenue / paidOrders.length : 0;
  const brandStats = (data?.brands ?? []).map((brand) => {
    const matching = paidOrders.flatMap((order) => order.order_items ?? []).filter((item) => item.brand_name === brand.name);
    const brandRevenue = matching.reduce((sum, item) => sum + amount(item.line_total), 0);
    const brandUnits = matching.reduce((sum, item) => sum + item.quantity, 0);
    const brandOrders = new Set(paidOrders.filter((order) => (order.order_items ?? []).some((item) => item.brand_name === brand.name)).map((order) => order.id)).size;
    return { ...brand, revenue: brandRevenue, units: brandUnits, orders: brandOrders, share: revenue ? (brandRevenue / revenue) * 100 : 0 };
  });
  const chartData = useMemo(() => {
    const grouped = new Map<string, number>();
    for (const order of paidOrders) {
      const key = new Date(order.created_at).toISOString().slice(0, 10);
      grouped.set(key, (grouped.get(key) ?? 0) + amount(order.total));
    }
    return Array.from({ length: days }, (_, index) => {
      const date = new Date(Date.now() - (days - index - 1) * 24 * 60 * 60 * 1000);
      const key = date.toISOString().slice(0, 10);
      return { day: shortDate(key), revenue: grouped.get(key) ?? 0 };
    });
  }, [paidOrders, days]);
  const productStats = useMemo(() => {
    const totals = new Map<string, { name: string; brand: string; units: number; revenue: number }>();
    for (const order of paidOrders) {
      for (const item of order.order_items ?? []) {
        const key = item.product_id ?? item.product_name;
        const current = totals.get(key) ?? { name: item.product_name, brand: item.brand_name, units: 0, revenue: 0 };
        current.units += item.quantity;
        current.revenue += amount(item.line_total);
        totals.set(key, current);
      }
    }
    return [...totals.values()].sort((a, b) => b.units - a.units).slice(0, 5);
  }, [paidOrders]);
  const lowStock = (data?.products ?? []).filter((product) => product.stock_quantity !== null && product.stock_quantity <= 5);
  const untrackedStock = (data?.products ?? []).filter((product) => product.stock_quantity === null).length;
  const pendingOrders = validOrders.filter((order) => order.fulfillment_status === "new" || order.fulfillment_status === "confirmed" || order.fulfillment_status === "processing").length;

  return (
    <main className="min-h-screen bg-[#F0EAE0] text-[#171717]">
      <div className="flex min-h-screen">
        <aside className="hidden w-[236px] shrink-0 flex-col border-r border-white/10 bg-[#171717] px-5 py-7 text-[#F0EAE0] lg:flex">
          <div className="font-display text-2xl font-black tracking-[-0.07em]">ISHTILE<span className="text-[#D5FE00]">+</span></div>
          <p className="mt-1 text-[9px] font-bold uppercase tracking-[0.24em] text-white/40">Operations desk</p>
          <div className="mt-12 space-y-1">
            <a href="#overview" className="flex items-center gap-3 bg-[#D5FE00] px-3 py-3 text-xs font-bold uppercase tracking-[0.1em] text-[#171717]"><ChartNoAxesCombined className="h-4 w-4" /> Overview</a>
            <a href="#brands" className="flex items-center gap-3 px-3 py-3 text-xs font-semibold text-white/65 transition hover:bg-white/10 hover:text-white"><TrendingUp className="h-4 w-4" /> Brand sales</a>
            <a href="#orders" className="flex items-center gap-3 px-3 py-3 text-xs font-semibold text-white/65 transition hover:bg-white/10 hover:text-white"><ShoppingBag className="h-4 w-4" /> Orders</a>
            <a href="#inventory" className="flex items-center gap-3 px-3 py-3 text-xs font-semibold text-white/65 transition hover:bg-white/10 hover:text-white"><Boxes className="h-4 w-4" /> Inventory</a>
          </div>
          <div className="mt-auto border-t border-white/10 pt-5">
            <p className="truncate text-xs font-semibold">{session.user.email ?? "Administrator"}</p>
            <p className="mt-1 text-[10px] text-white/40">Authorised administrator</p>
            <button onClick={onSignOut} className="mt-5 flex items-center gap-2 text-xs font-semibold text-white/55 transition hover:text-[#D5FE00]"><LogOut className="h-4 w-4" /> Sign out</button>
          </div>
        </aside>

        <div className="min-w-0 flex-1">
          <header className="sticky top-0 z-20 flex items-center justify-between border-b border-black/10 bg-[#F0EAE0]/95 px-5 py-4 backdrop-blur md:px-8">
            <div>
              <p className="text-[9px] font-bold uppercase tracking-[0.22em] text-black/45">ISHTILE+ / Admin</p>
              <h1 className="mt-1 font-display text-2xl font-black tracking-[-0.055em] md:text-3xl">Overview<span className="text-black/25">.</span></h1>
            </div>
            <div className="flex items-center gap-2">
              <select value={days} onChange={(event) => setDays(Number(event.target.value))} className="h-10 border border-black/15 bg-transparent px-3 text-xs font-semibold outline-none focus:border-black">
                <option value={7}>Last 7 days</option>
                <option value={30}>Last 30 days</option>
                <option value={90}>Last 90 days</option>
              </select>
              <button onClick={onRefresh} aria-label="Refresh dashboard" className="grid h-10 w-10 place-items-center border border-black/15 transition hover:bg-black hover:text-[#F0EAE0]"><RefreshCw className={`h-4 w-4 ${loading ? "animate-spin" : ""}`} /></button>
              <button onClick={onSignOut} aria-label="Sign out" className="grid h-10 w-10 place-items-center border border-black/15 lg:hidden"><LogOut className="h-4 w-4" /></button>
            </div>
          </header>

          <div className="space-y-7 px-5 py-7 md:px-8 md:py-9">
            {error && <div role="alert" className="flex flex-wrap items-center justify-between gap-3 border border-red-300 bg-red-50 px-4 py-3 text-sm text-red-800"><span>{error}</span><button onClick={onRefresh} className="font-bold underline">Retry</button></div>}
            {!error && loading && !data && <div className="flex items-center gap-3 py-16 text-sm text-black/55"><LoaderCircle className="h-5 w-5 animate-spin" /> Loading live store data…</div>}

            {data && (
              <>
                <section id="overview">
                  <div className="mb-4 flex items-end justify-between gap-4">
                    <div>
                      <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-black/45">Store performance</p>
                      <h2 className="mt-1 text-sm font-semibold">Paid revenue and order activity</h2>
                    </div>
                    <span className="text-[10px] font-medium text-black/40">BDT · {days} day window</span>
                  </div>
                  <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
                    <Metric icon={CircleDollarSign} label="Paid revenue" value={money(revenue)} detail="Orders marked paid" />
                    <Metric icon={ShoppingBag} label="Orders placed" value={number(validOrders.length)} detail={`${number(pendingOrders)} awaiting fulfilment`} />
                    <Metric icon={Activity} label="Average order value" value={money(average)} detail="Paid orders only" />
                    <Metric icon={Package} label="Units sold" value={number(units)} detail="From paid order items" />
                  </div>
                </section>

                <section className="grid gap-4 xl:grid-cols-[minmax(0,1.65fr)_minmax(300px,0.9fr)]">
                  <div className="border border-black/10 bg-[#F7F3EC] p-4 md:p-6">
                    <div className="flex items-start justify-between gap-3">
                      <div><p className="text-[10px] font-bold uppercase tracking-[0.2em] text-black/45">Sales analytics</p><h2 className="mt-1 text-lg font-bold">Revenue over time</h2></div>
                      <span className="bg-[#D5FE00] px-2 py-1 text-[9px] font-bold uppercase tracking-[0.12em]">Paid</span>
                    </div>
                    {paidOrders.length ? (
                      <div className="mt-5 h-[260px] w-full">
                        <ResponsiveContainer width="100%" height="100%">
                          <AreaChart data={chartData} margin={{ top: 10, right: 8, left: -18, bottom: 0 }}>
                            <defs><linearGradient id="salesFill" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor="#D5FE00" stopOpacity={0.65} /><stop offset="95%" stopColor="#D5FE00" stopOpacity={0.02} /></linearGradient></defs>
                            <CartesianGrid stroke="#171717" strokeOpacity={0.1} vertical={false} />
                            <XAxis dataKey="day" tick={{ fill: "#171717", fontSize: 10 }} axisLine={false} tickLine={false} minTickGap={22} />
                            <YAxis tick={{ fill: "#171717", fontSize: 10 }} axisLine={false} tickLine={false} tickFormatter={(value: number | string) => Number(value) >= 1000 ? `${Math.round(Number(value) / 1000)}k` : String(value)} />
                            <Tooltip formatter={(value) => [money(Number(value)), "Paid revenue"]} contentStyle={{ border: "1px solid #171717", borderRadius: 0, background: "#F0EAE0", fontSize: 12 }} />
                            <Area type="monotone" dataKey="revenue" stroke="#171717" strokeWidth={2} fill="url(#salesFill)" />
                          </AreaChart>
                        </ResponsiveContainer>
                      </div>
                    ) : <EmptyState title="No paid sales in this period" detail="Once an order is recorded and marked paid, the daily revenue chart will appear here." />}
                  </div>

                  <div id="brands" className="border border-black/10 bg-[#171717] p-4 text-[#F0EAE0] md:p-6">
                    <div className="flex items-start justify-between"><div><p className="text-[10px] font-bold uppercase tracking-[0.2em] text-white/45">Brand portfolio</p><h2 className="mt-1 text-lg font-bold">Sales by brand</h2></div><TrendingUp className="h-5 w-5 text-[#D5FE00]" /></div>
                    <div className="mt-5 space-y-5">
                      {brandStats.map((brand) => (
                        <div key={brand.id}>
                          <div className="flex items-center justify-between gap-3 text-xs"><span className="font-bold tracking-wide">{brand.name}</span><span className="tabular-nums text-white/65">{money(brand.revenue)}</span></div>
                          <div className="mt-2 h-1.5 bg-white/15"><div className="h-full bg-[#D5FE00] transition-all" style={{ width: `${Math.min(100, brand.share)}%` }} /></div>
                          <div className="mt-1.5 flex justify-between text-[10px] text-white/40"><span>{number(brand.units)} units · {number(brand.orders)} orders</span><span>{brand.share.toFixed(1)}%</span></div>
                        </div>
                      ))}
                    </div>
                    {!paidOrders.length && <p className="mt-5 border-t border-white/10 pt-4 text-xs leading-5 text-white/45">Brand totals will populate automatically from paid order items. No sample sales are being displayed.</p>}
                  </div>
                </section>

                <section className="grid gap-4 xl:grid-cols-2">
                  <div className="border border-black/10 bg-[#F7F3EC] p-4 md:p-6">
                    <div className="flex items-center justify-between"><div><p className="text-[10px] font-bold uppercase tracking-[0.2em] text-black/45">Product performance</p><h2 className="mt-1 text-lg font-bold">Top products</h2></div><ArrowUpRight className="h-5 w-5" /></div>
                    {productStats.length ? <div className="mt-4 divide-y divide-black/10">{productStats.map((product, index) => <div key={product.name} className="flex items-center justify-between gap-3 py-3"><div className="flex min-w-0 items-center gap-3"><span className="grid h-7 w-7 shrink-0 place-items-center bg-[#D5FE00] text-[10px] font-black">{String(index + 1).padStart(2, "0")}</span><div className="min-w-0"><p className="truncate text-sm font-semibold">{product.name}</p><p className="text-[10px] uppercase tracking-[0.12em] text-black/45">{product.brand}</p></div></div><div className="text-right"><p className="text-sm font-bold tabular-nums">{number(product.units)} sold</p><p className="text-[10px] text-black/45">{money(product.revenue)}</p></div></div>)}</div> : <EmptyState title="No product sales yet" detail="Top sellers will be ranked from paid order items." />}
                  </div>

                  <div id="inventory" className="border border-black/10 bg-[#F7F3EC] p-4 md:p-6">
                    <div className="flex items-center justify-between"><div><p className="text-[10px] font-bold uppercase tracking-[0.2em] text-black/45">Inventory watch</p><h2 className="mt-1 text-lg font-bold">Stock attention</h2></div><Boxes className="h-5 w-5" /></div>
                    <div className="mt-4 grid grid-cols-2 gap-3">
                      <div className="bg-[#D5FE00] p-3"><p className="text-[9px] font-bold uppercase tracking-[0.14em]">Low stock</p><p className="mt-1 text-2xl font-black tabular-nums">{number(lowStock.length)}</p><p className="mt-1 text-[10px]">5 units or fewer</p></div>
                      <div className="bg-[#171717] p-3 text-[#F0EAE0]"><p className="text-[9px] font-bold uppercase tracking-[0.14em] text-white/55">Untracked</p><p className="mt-1 text-2xl font-black tabular-nums">{number(untrackedStock)}</p><p className="mt-1 text-[10px] text-white/55">Stock count missing</p></div>
                    </div>
                    {lowStock.length ? <div className="mt-3 divide-y divide-black/10">{lowStock.slice(0, 4).map((product) => <div key={product.id} className="flex items-center justify-between gap-3 py-2 text-xs"><span className="truncate font-medium">{product.name}</span><span className="font-bold text-red-700">{product.stock_quantity} left</span></div>)}</div> : <p className="mt-4 text-xs leading-5 text-black/45">{untrackedStock ? "Stock counts have not been entered yet. Unreported stock is not treated as zero." : "No products are currently at the low-stock threshold."}</p>}
                  </div>
                </section>

                <section id="orders" className="border border-black/10 bg-[#F7F3EC]">
                  <div className="flex items-center justify-between border-b border-black/10 px-4 py-4 md:px-6"><div><p className="text-[10px] font-bold uppercase tracking-[0.2em] text-black/45">Latest activity</p><h2 className="mt-1 text-lg font-bold">Recent orders</h2></div><span className="text-[10px] text-black/45">{number(validOrders.length)} in range</span></div>
                  {data.orders.length ? (
                    <div className="overflow-x-auto">
                      <table className="w-full min-w-[760px] text-left text-xs">
                        <thead className="bg-black/[0.035] text-[9px] uppercase tracking-[0.14em] text-black/45"><tr><th className="px-5 py-3 font-bold">Order</th><th className="px-5 py-3 font-bold">Customer</th><th className="px-5 py-3 font-bold">Date</th><th className="px-5 py-3 font-bold">Payment</th><th className="px-5 py-3 font-bold">Fulfilment</th><th className="px-5 py-3 text-right font-bold">Total</th></tr></thead>
                        <tbody className="divide-y divide-black/10">{data.orders.slice(0, 8).map((order) => <OrderRow key={order.id} order={order} />)}</tbody>
                      </table>
                    </div>
                  ) : <EmptyState title="No orders in this period" detail="Orders will appear here when checkout is connected to Supabase and records are created." />}
                </section>
              </>
            )}
            <footer className="flex flex-wrap items-center justify-between gap-2 border-t border-black/10 pt-4 text-[10px] text-black/40"><span>ISHTILE+ · Internal operations</span><span>Signed in as {session.user.email ?? "administrator"}</span></footer>
          </div>
        </div>
      </div>
    </main>
  );
}

function Metric({ icon: Icon, label, value, detail }: { icon: typeof CircleDollarSign; label: string; value: string; detail: string }) {
  return <div className="border border-black/10 bg-[#F7F3EC] p-4 md:p-5"><div className="flex items-center justify-between"><p className="text-[9px] font-bold uppercase tracking-[0.16em] text-black/45">{label}</p><Icon className="h-4 w-4 text-black/55" /></div><p className="mt-4 break-words font-display text-2xl font-black tracking-[-0.055em] md:text-[1.7rem]">{value}</p><p className="mt-1 text-[10px] text-black/45">{detail}</p></div>;
}

function EmptyState({ title, detail }: { title: string; detail: string }) {
  return <div className="flex min-h-[150px] flex-col items-center justify-center px-5 py-8 text-center"><div className="grid h-10 w-10 place-items-center border border-black/10"><Clock3 className="h-4 w-4 text-black/45" /></div><p className="mt-3 text-sm font-bold">{title}</p><p className="mt-1 max-w-sm text-xs leading-5 text-black/45">{detail}</p></div>;
}

function OrderRow({ order }: { order: OrderRecord }) {
  return <tr className="hover:bg-black/[0.025]"><td className="px-5 py-3 font-bold">{order.order_number}</td><td className="px-5 py-3"><p className="font-semibold">{order.customer_name}</p><p className="mt-0.5 text-[10px] text-black/45">{order.customer_phone}</p></td><td className="px-5 py-3 text-black/60">{dateTime(order.created_at)}</td><td className="px-5 py-3"><StatusPill value={order.payment_status} /></td><td className="px-5 py-3"><StatusPill value={order.fulfillment_status} /></td><td className="px-5 py-3 text-right font-bold tabular-nums">{money(amount(order.total))}</td></tr>;
}

function StatusPill({ value }: { value: string }) {
  const good = value === "paid" || value === "delivered";
  const warning = value === "pending" || value === "new" || value === "processing";
  return <span className={`inline-flex rounded-full px-2 py-1 text-[9px] font-bold uppercase tracking-[0.08em] ${good ? "bg-[#D5FE00] text-[#171717]" : warning ? "bg-amber-100 text-amber-900" : "bg-black/5 text-black/55"}`}>{value}</span>;
}
