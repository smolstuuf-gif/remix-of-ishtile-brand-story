import { useEffect, useMemo, useRef, useState } from "react";
import { createFileRoute, Link, Outlet, useRouterState } from "@tanstack/react-router";
import { AccountAccess } from "@/components/account/AccountAccess";
import { MenuToggleIcon } from "@/components/ui/menu-toggle-icon";
import {
  Activity,
  ArrowUpRight,
  Boxes,
  ChartNoAxesCombined,
  CircleDollarSign,
  Clock3,
  ExternalLink,
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
  updateOrderStatus,
  saveOrderEdits,
  type EditableOrder,
  type EditableOrderItem,
  type ProductRecord,
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
  const pathname = useRouterState({ select: (state) => state.location.pathname });
  const [session, setSession] = useState<AdminSession | null>(null);
  const [checking, setChecking] = useState(true);
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState<DashboardData | null>(null);
  const [days, setDays] = useState(30);
  const [refreshKey, setRefreshKey] = useState(0);
  const [dataError, setDataError] = useState("");

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
    if (!session) {
      setData(null);
      return;
    }
    let active = true;
    setLoading(true);
    setDataError("");
    getDashboardData(session, days)
      .then((result) => {
        if (active) setData(result);
      })
      .catch((error: unknown) => {
        if (active) setDataError(error instanceof Error ? error.message : "Could not load dashboard data.");
      })
      .finally(() => {
        if (active) setLoading(false);
      });
    return () => {
      active = false;
    };
  }, [session, days, refreshKey]);

  const lastHashTarget = useRef("");
  useEffect(() => {
    if (!data) return;
    const targetId = window.location.hash.slice(1);
    const targetKey = `${pathname}#${targetId}`;
    if (!targetId || lastHashTarget.current === targetKey) return;
    lastHashTarget.current = targetKey;
    const frame = window.requestAnimationFrame(() => {
      document.getElementById(targetId)?.scrollIntoView({ behavior: "smooth", block: "start" });
    });
    return () => window.cancelAnimationFrame(frame);
  }, [data, pathname]);

  async function handleSignOut() {
    if (session) await signOutAdmin(session);
    setSession(null);
    setData(null);
  }

  // /admin/management is a nested route; render its page instead of the dashboard.
  if (pathname === "/admin/management") return <Outlet />;

  if (checking) {
    return (
      <div className="grid min-h-screen place-items-center bg-[#F0EAE0] text-[#171717]">
        <LoaderCircle className="h-7 w-7 animate-spin" />
      </div>
    );
  }

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
  const periodOrders = useMemo(
    () => (data?.orders ?? []).filter((order) => new Date(order.created_at).getTime() >= Date.now() - days * 24 * 60 * 60 * 1000),
    [data, days],
  );
  const paidOrders = useMemo(
    () => periodOrders.filter((order) => order.payment_status === "paid" && order.fulfillment_status !== "cancelled"),
    [periodOrders],
  );
  const validOrders = useMemo(
    () => periodOrders.filter((order) => order.fulfillment_status !== "cancelled" && order.fulfillment_status !== "returned"),
    [periodOrders],
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
  const rankedBrands = [...brandStats].sort((a, b) => b.revenue - a.revenue);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [orderStatusFilter, setOrderStatusFilter] = useState("new");
  const [orderPage, setOrderPage] = useState(1);
  const [expandedOrderId, setExpandedOrderId] = useState<string | null>(null);
  const [orderActionError, setOrderActionError] = useState("");
  const [orderFilters, setOrderFilters] = useState({ from: "", to: "", minAmount: "", maxAmount: "", product: "", season: "", brand: "" });
  const updateOrderFilter = (key: keyof typeof orderFilters, value: string) => {
    setOrderFilters((current) => ({ ...current, [key]: value }));
    setOrderPage(1);
  };
  const allOrders = useMemo(() => data?.orders ?? [], [data?.orders]);
  const seasonOptions = [...new Set(allOrders.flatMap((order) => (order.order_items ?? []).map((item) => item.season).filter((season): season is string => Boolean(season))))].sort();
  const brandOptions = [...new Set(allOrders.flatMap((order) => (order.order_items ?? []).map((item) => item.brand_name).filter(Boolean)))].sort();
  const filteredOrders = useMemo(() => allOrders.filter((order) => {
    const status = order.fulfillment_status;
    if (orderStatusFilter === "new" && status !== "new") return false;
    if (orderStatusFilter === "pending" && !["confirmed", "processing", "shipped"].includes(status)) return false;
    if (orderStatusFilter !== "all" && orderStatusFilter !== "new" && orderStatusFilter !== "pending" && status !== orderStatusFilter) return false;
    const date = new Intl.DateTimeFormat("en-CA", { timeZone: "Asia/Dhaka" }).format(new Date(order.created_at));
    if (orderFilters.from && date < orderFilters.from) return false;
    if (orderFilters.to && date > orderFilters.to) return false;
    const total = amount(order.total);
    if (orderFilters.minAmount && total < Number(orderFilters.minAmount)) return false;
    if (orderFilters.maxAmount && total > Number(orderFilters.maxAmount)) return false;
    if (orderFilters.product && !(order.order_items ?? []).some((item) => item.product_name.toLowerCase().includes(orderFilters.product.toLowerCase()))) return false;
    if (orderFilters.season && !(order.order_items ?? []).some((item) => item.season === orderFilters.season)) return false;
    if (orderFilters.brand && !(order.order_items ?? []).some((item) => item.brand_name === orderFilters.brand)) return false;
    return true;
  }), [allOrders, orderStatusFilter, orderFilters]);
  const orderPageSize = 10;
  const orderPageCount = Math.max(1, Math.ceil(filteredOrders.length / orderPageSize));
  const visibleOrders = filteredOrders.slice((orderPage - 1) * orderPageSize, orderPage * orderPageSize);
  const orderCountFor = (status: string) => allOrders.filter((order) => {
    if (status === "all") return true;
    if (status === "pending") return ["confirmed", "processing", "shipped"].includes(order.fulfillment_status);
    return order.fulfillment_status === status;
  }).length;
  const [orderActionSaving, setOrderActionSaving] = useState<string | null>(null);
  const changeOrderStatus = async (orderId: string, status: OrderRecord["fulfillment_status"]) => {
    setOrderActionError("");
    setOrderActionSaving(orderId);
    try {
      await updateOrderStatus(session, orderId, status);
      onRefresh();
    } catch (error) {
      setOrderActionError(error instanceof Error ? error.message : "Could not update this order.");
    } finally {
      setOrderActionSaving(null);
    }
  };

  return (
    <main className="min-h-screen bg-[#F0EAE0] text-[#171717]">
      <div className="flex min-h-screen">
        {drawerOpen && <button type="button" aria-label="Close dashboard menu" onClick={() => setDrawerOpen(false)} className="fixed inset-0 z-40 cursor-default bg-[#171717]/55 backdrop-blur-[2px]" />}
        <aside className={`fixed inset-y-0 left-0 z-50 flex w-[min(86vw,300px)] flex-col border-r border-white/10 bg-[#171717] px-5 py-7 text-[#F0EAE0] shadow-[24px_0_70px_rgba(0,0,0,.24)] transition-transform duration-300 ease-[cubic-bezier(.22,1,.36,1)] ${drawerOpen ? "translate-x-0" : "-translate-x-full"}`} aria-hidden={!drawerOpen}>
          <div className="flex items-center justify-between"><div><div className="font-display text-2xl font-black tracking-[-0.07em]">ISHTILE<span className="text-[#D5FE00]">+</span></div><p className="mt-1 text-[9px] font-bold uppercase tracking-[0.24em] text-white/40">Operations desk</p></div><button type="button" onClick={() => setDrawerOpen(false)} aria-label="Close menu" className="grid h-9 w-9 place-items-center border border-white/15 text-white/70 hover:border-[#D5FE00] hover:text-[#D5FE00]"><MenuToggleIcon open className="h-5 w-5" strokeWidth={2.2} duration={500} /></button></div>
          <p className="mb-3 mt-12 text-[9px] font-bold uppercase tracking-[0.2em] text-white/35">Store management</p>
          <nav className="space-y-1.5" aria-label="Store management controls">
            {[
              ["orders", "00", "Orders", "Incoming orders and fulfilment"],
              ["products", "01", "Products", "Catalogue, pricing and stock"],
              ["hero", "02", "Hero controls", "Homepage slides and schedule"],
              ["collections", "03", "Collections", "Campaigns and featured edits"],
              ["brands", "04", "Brands", "Brand profiles and performance"],
              ["accounts", "05", "Accounts", "Admins and customers"],
              ["brand-info", "06", "Brand info", "Store identity and contact details"],
            ].map(([tab, number, label, hint]) => (
              <Link key={tab} to={tab === "orders" ? "/admin" : "/admin/management"} hash={tab ?? ""} onClick={() => setDrawerOpen(false)} className="group flex items-center gap-3 px-3 py-3 text-white/70 transition-all duration-200 hover:translate-x-1 hover:bg-white/10 hover:text-white">
                <span className="grid h-8 w-8 shrink-0 place-items-center bg-white/10 text-[10px] font-black text-[#D5FE00]">{number}</span>
                <span className="min-w-0 flex-1"><span className="block text-xs font-black uppercase tracking-[0.07em]">{label}</span><span className="mt-1 block text-[10px] text-white/35">{hint}</span></span>
                <ArrowUpRight className="h-4 w-4 opacity-35 transition group-hover:opacity-100" />
              </Link>
            ))}
          </nav>
          <div className="mt-auto border-t border-white/10 pt-5"><p className="truncate text-xs font-semibold">{session.user.email ?? "Administrator"}</p><p className="mt-1 text-[10px] text-white/40">Authorised administrator</p><button onClick={onSignOut} className="mt-5 flex items-center gap-2 text-xs font-semibold text-white/55 transition hover:text-[#D5FE00]"><LogOut className="h-4 w-4" /> Sign out</button></div>
        </aside>

        <div className="min-w-0 flex-1">
          <header className="sticky top-0 z-20 flex items-center justify-between border-b border-black/10 bg-[#F0EAE0]/95 px-5 py-4 backdrop-blur md:px-8">
            <div className="flex min-w-0 items-center gap-3">
              <button type="button" onClick={() => setDrawerOpen(true)} aria-label="Open dashboard menu" aria-expanded={drawerOpen} className="grid h-10 w-10 shrink-0 place-items-center bg-[#171717] text-[#D5FE00] transition hover:bg-black"><MenuToggleIcon open={drawerOpen} className="h-6 w-6" strokeWidth={2.2} duration={500} /></button>
              <div className="min-w-0">
              <p className="text-[9px] font-bold uppercase tracking-[0.22em] text-black/45">ISHTILE+ / Admin</p>
              <h1 className="mt-1 font-display text-2xl font-black tracking-[-0.055em] md:text-3xl">Overview<span className="text-black/25">.</span></h1>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Link to="/" aria-label="View storefront" className="inline-flex h-10 items-center gap-2 border border-black/20 px-3 text-xs font-bold uppercase tracking-wide transition hover:bg-black hover:text-[#F0EAE0]"><ExternalLink className="h-4 w-4" /><span>View site</span></Link>
              <Link to="/admin/management" className="hidden h-10 items-center gap-2 bg-[#171717] px-3 text-xs font-bold uppercase tracking-wide text-[#F0EAE0] transition hover:bg-black/80 sm:inline-flex">Manage store</Link>
              <select value={days} onChange={(event) => setDays(Number(event.target.value))} className="h-10 border border-black/15 bg-transparent px-3 text-xs font-semibold outline-none focus:border-black">
                <option value={7}>Weekly performance · 7 days</option>
                <option value={30}>Monthly performance · 30 days</option>
                <option value={90}>Last 90 days</option>
              </select>
              <button onClick={onRefresh} aria-label="Refresh dashboard" className="grid h-10 w-10 place-items-center border border-black/15 transition hover:bg-black hover:text-[#F0EAE0]"><RefreshCw className={`h-4 w-4 ${loading ? "animate-spin" : ""}`} /></button>
            </div>
          </header>

          <div className="space-y-7 px-5 py-7 md:px-8 md:py-9">
            {error && <div role="alert" className="flex flex-wrap items-center justify-between gap-3 border border-red-300 bg-red-50 px-4 py-3 text-sm text-red-800"><span>{error}</span><button onClick={onRefresh} className="font-bold underline">Retry</button></div>}
            {!error && loading && !data && <div className="flex items-center gap-3 py-16 text-sm text-black/55"><LoaderCircle className="h-5 w-5 animate-spin" /> Loading live store data…</div>}

            {data && (
              <>
                <section id="overview" className="scroll-mt-24">
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

                  <div id="brands" className="scroll-mt-24 border border-black/10 bg-[#171717] p-4 text-[#F0EAE0] md:p-6">
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
                  <div className="border border-black/10 bg-[#F7F3EC] p-4 md:p-5">
                    <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-black/45">Brand ranking</p>
                    <h2 className="mt-1 text-base font-black">Top-selling brands</h2>
                    <div className="mt-3 divide-y divide-black/10">
                      {rankedBrands.slice(0, 5).map((brand, index) => <div key={brand.id} className="flex items-center justify-between gap-3 py-2.5 text-xs"><span><b className="mr-2 text-black/35">{String(index + 1).padStart(2, "0")}</b>{brand.name}</span><b className="tabular-nums">{money(brand.revenue)}</b></div>)}
                    </div>
                    {!paidOrders.length && <p className="mt-2 text-[10px] text-black/45">No paid sales in the selected period.</p>}
                  </div>
                  <div className="border border-black/10 bg-[#F7F3EC] p-4 md:p-5">
                    <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-black/45">Brand ranking</p>
                    <h2 className="mt-1 text-base font-black">Least-selling brands</h2>
                    <div className="mt-3 divide-y divide-black/10">
                      {[...rankedBrands].reverse().slice(0, 5).map((brand, index) => <div key={brand.id} className="flex items-center justify-between gap-3 py-2.5 text-xs"><span><b className="mr-2 text-black/35">{String(index + 1).padStart(2, "0")}</b>{brand.name}</span><b className="tabular-nums">{money(brand.revenue)}</b></div>)}
                    </div>
                    {!paidOrders.length && <p className="mt-2 text-[10px] text-black/45">No paid sales in the selected period.</p>}
                  </div>
                </section>

                <section className="grid gap-4 xl:grid-cols-2">
                  <div className="border border-black/10 bg-[#F7F3EC] p-4 md:p-6">
                    <div className="flex items-center justify-between"><div><p className="text-[10px] font-bold uppercase tracking-[0.2em] text-black/45">Product performance</p><h2 className="mt-1 text-lg font-bold">Top products</h2></div><ArrowUpRight className="h-5 w-5" /></div>
                    {productStats.length ? <div className="mt-4 divide-y divide-black/10">{productStats.map((product, index) => <div key={product.name} className="flex items-center justify-between gap-3 py-3"><div className="flex min-w-0 items-center gap-3"><span className="grid h-7 w-7 shrink-0 place-items-center bg-[#D5FE00] text-[10px] font-black">{String(index + 1).padStart(2, "0")}</span><div className="min-w-0"><p className="truncate text-sm font-semibold">{product.name}</p><p className="text-[10px] uppercase tracking-[0.12em] text-black/45">{product.brand}</p></div></div><div className="text-right"><p className="text-sm font-bold tabular-nums">{number(product.units)} sold</p><p className="text-[10px] text-black/45">{money(product.revenue)}</p></div></div>)}</div> : <EmptyState title="No product sales yet" detail="Top sellers will be ranked from paid order items." />}
                  </div>

                  <div id="inventory" className="scroll-mt-24 border border-black/10 bg-[#F7F3EC] p-4 md:p-6">
                    <div className="flex items-center justify-between"><div><p className="text-[10px] font-bold uppercase tracking-[0.2em] text-black/45">Inventory watch</p><h2 className="mt-1 text-lg font-bold">Stock attention</h2></div><Boxes className="h-5 w-5" /></div>
                    <div className="mt-4 grid grid-cols-2 gap-3">
                      <div className="bg-[#D5FE00] p-3"><p className="text-[9px] font-bold uppercase tracking-[0.14em]">Low stock</p><p className="mt-1 text-2xl font-black tabular-nums">{number(lowStock.length)}</p><p className="mt-1 text-[10px]">5 units or fewer</p></div>
                      <div className="bg-[#171717] p-3 text-[#F0EAE0]"><p className="text-[9px] font-bold uppercase tracking-[0.14em] text-white/55">Untracked</p><p className="mt-1 text-2xl font-black tabular-nums">{number(untrackedStock)}</p><p className="mt-1 text-[10px] text-white/55">Stock count missing</p></div>
                    </div>
                    {lowStock.length ? <div className="mt-3 divide-y divide-black/10">{lowStock.slice(0, 4).map((product) => <div key={product.id} className="flex items-center justify-between gap-3 py-2 text-xs"><span className="truncate font-medium">{product.name}</span><span className="font-bold text-red-700">{product.stock_quantity} left</span></div>)}</div> : <p className="mt-4 text-xs leading-5 text-black/45">{untrackedStock ? "Stock counts have not been entered yet. Unreported stock is not treated as zero." : "No products are currently at the low-stock threshold."}</p>}
                  </div>
                </section>

                <section id="orders" className="scroll-mt-24 border border-black/10 bg-[#F7F3EC]">
                  <div className="flex flex-wrap items-end justify-between gap-4 border-b border-black/10 px-4 py-5 md:px-6">
                    <div><p className="text-[10px] font-bold uppercase tracking-[0.2em] text-black/45">Order desk</p><h2 className="mt-1 text-xl font-black tracking-tight">Order management<span className="text-black/30">.</span></h2><p className="mt-1 text-xs text-black/45">Review incoming orders, update fulfilment and search the complete order history.</p></div>
                    <span className="bg-[#D5FE00] px-3 py-2 text-[10px] font-black uppercase tracking-wide">{number(allOrders.length)} total orders</span>
                  </div>
                  <div className="flex gap-1 overflow-x-auto border-b border-black/10 px-3 py-3 md:px-5">
                    {([
                      ["new", "New orders"], ["pending", "Pending orders"], ["cancelled", "Cancelled"],
                      ["delivered", "Delivered"], ["returned", "Returned"], ["all", "All orders"],
                    ] as const).map(([key, label]) => (
                      <button key={key} type="button" onClick={() => { setOrderStatusFilter(key); setOrderPage(1); }} className={`shrink-0 border px-3 py-2 text-[10px] font-bold uppercase tracking-wide transition ${orderStatusFilter === key ? "border-[#171717] bg-[#171717] text-[#F0EAE0]" : "border-black/10 text-black/55 hover:border-black/40"}`}>
                        {label}<span className={`ml-2 ${orderStatusFilter === key ? "text-[#D5FE00]" : "text-black/35"}`}>{number(orderCountFor(key))}</span>
                      </button>
                    ))}
                  </div>
                  <div className="grid gap-3 border-b border-black/10 p-4 md:grid-cols-3 md:p-5 xl:grid-cols-7">
                    <label className="text-[9px] font-bold uppercase tracking-[0.12em] text-black/45">From date<input type="date" value={orderFilters.from} onChange={(event) => updateOrderFilter("from", event.target.value)} className="mt-1.5 h-10 w-full border border-black/15 bg-transparent px-2 text-xs font-medium text-[#171717] outline-none focus:border-black" /></label>
                    <label className="text-[9px] font-bold uppercase tracking-[0.12em] text-black/45">To date<input type="date" value={orderFilters.to} onChange={(event) => updateOrderFilter("to", event.target.value)} className="mt-1.5 h-10 w-full border border-black/15 bg-transparent px-2 text-xs font-medium text-[#171717] outline-none focus:border-black" /></label>
                    <label className="text-[9px] font-bold uppercase tracking-[0.12em] text-black/45">Min amount<input type="number" min="0" value={orderFilters.minAmount} onChange={(event) => updateOrderFilter("minAmount", event.target.value)} placeholder="৳ Min" className="mt-1.5 h-10 w-full border border-black/15 bg-transparent px-3 text-xs font-medium outline-none focus:border-black" /></label>
                    <label className="text-[9px] font-bold uppercase tracking-[0.12em] text-black/45">Max amount<input type="number" min="0" value={orderFilters.maxAmount} onChange={(event) => updateOrderFilter("maxAmount", event.target.value)} placeholder="৳ Max" className="mt-1.5 h-10 w-full border border-black/15 bg-transparent px-3 text-xs font-medium outline-none focus:border-black" /></label>
                    <label className="text-[9px] font-bold uppercase tracking-[0.12em] text-black/45">Product<input type="search" value={orderFilters.product} onChange={(event) => updateOrderFilter("product", event.target.value)} placeholder="Search product" className="mt-1.5 h-10 w-full border border-black/15 bg-transparent px-3 text-xs font-medium outline-none focus:border-black" /></label>
                    <label className="text-[9px] font-bold uppercase tracking-[0.12em] text-black/45">Season<select value={orderFilters.season} onChange={(event) => updateOrderFilter("season", event.target.value)} className="mt-1.5 h-10 w-full border border-black/15 bg-[#F7F3EC] px-2 text-xs font-medium outline-none focus:border-black"><option value="">All seasons</option>{seasonOptions.map((season) => <option key={season} value={season}>{season.charAt(0).toUpperCase() + season.slice(1)}</option>)}</select></label>
                    <label className="text-[9px] font-bold uppercase tracking-[0.12em] text-black/45">Brand<select value={orderFilters.brand} onChange={(event) => updateOrderFilter("brand", event.target.value)} className="mt-1.5 h-10 w-full border border-black/15 bg-[#F7F3EC] px-2 text-xs font-medium outline-none focus:border-black"><option value="">All brands</option>{brandOptions.map((brand) => <option key={brand} value={brand}>{brand}</option>)}</select></label>
                    <div className="flex items-end xl:col-span-7"><button type="button" onClick={() => { setOrderFilters({ from: "", to: "", minAmount: "", maxAmount: "", product: "", season: "", brand: "" }); setOrderPage(1); }} className="text-[10px] font-bold uppercase tracking-wide text-black/50 underline underline-offset-4 hover:text-black">Clear all filters</button></div>
                  </div>
                  {orderActionError && <p role="alert" className="mx-4 mt-4 border border-red-300 bg-red-50 px-3 py-2 text-xs text-red-800 md:mx-5">{orderActionError}</p>}
                  {visibleOrders.length ? <div className="overflow-x-auto">
                    <table className="w-full min-w-[980px] text-left text-xs">
                      <thead className="bg-black/[0.035] text-[9px] uppercase tracking-[0.14em] text-black/45"><tr><th className="px-4 py-3 font-bold">Order / Customer</th><th className="px-4 py-3 font-bold">Date</th><th className="px-4 py-3 font-bold">Products</th><th className="px-4 py-3 font-bold">Brand / Season</th><th className="px-4 py-3 font-bold">Payment</th><th className="px-4 py-3 font-bold">Fulfilment</th><th className="px-4 py-3 text-right font-bold">Amount</th></tr></thead>
                      <tbody className="divide-y divide-black/10">
                        {visibleOrders.map((order) => <FragmentOrderRow key={order.id} order={order} products={data?.products ?? []} session={session} expanded={expandedOrderId === order.id} saving={orderActionSaving === order.id} onToggle={() => setExpandedOrderId((current) => current === order.id ? null : order.id)} onStatusChange={(status) => void changeOrderStatus(order.id, status)} onSaved={onRefresh} />)}
                      </tbody>
                    </table>
                  </div> : <EmptyState title="No matching orders" detail={allOrders.length ? "Try another status view or clear one or more filters." : "New checkout submissions will appear here as soon as customers place orders."} />}
                  <div className="flex flex-wrap items-center justify-between gap-3 border-t border-black/10 px-4 py-4 md:px-6">
                    <p className="text-[10px] text-black/45">Showing {filteredOrders.length ? (orderPage - 1) * orderPageSize + 1 : 0}–{Math.min(orderPage * orderPageSize, filteredOrders.length)} of {number(filteredOrders.length)} orders</p>
                    <div className="flex items-center gap-2"><button type="button" disabled={orderPage <= 1} onClick={() => setOrderPage((page) => Math.max(1, page - 1))} className="border border-black/15 px-3 py-2 text-[10px] font-bold uppercase disabled:opacity-30">Previous</button><span className="min-w-14 text-center text-[10px] font-bold tabular-nums">{orderPage} / {orderPageCount}</span><button type="button" disabled={orderPage >= orderPageCount} onClick={() => setOrderPage((page) => Math.min(orderPageCount, page + 1))} className="border border-black/15 px-3 py-2 text-[10px] font-bold uppercase disabled:opacity-30">Next</button></div>
                  </div>
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

type OrderEditorItem = EditableOrderItem;

function FragmentOrderRow({ order, products, session, expanded, saving, onToggle, onStatusChange, onSaved }: {
  order: OrderRecord;
  products: ProductRecord[];
  session: AdminSession;
  expanded: boolean;
  saving: boolean;
  onToggle: () => void;
  onStatusChange: (status: OrderRecord["fulfillment_status"]) => void;
  onSaved: () => void;
}) {
  const items = order.order_items ?? [];
  const productNames = [...new Set(items.map((item) => item.product_name))];
  const brands = [...new Set(items.map((item) => item.brand_name))];
  const seasons = [...new Set(items.map((item) => item.season).filter(Boolean))];
  const [editing, setEditing] = useState(false);
  const [savingEdit, setSavingEdit] = useState(false);
  const [saveError, setSaveError] = useState("");
  const [newProductId, setNewProductId] = useState("");
  const [draft, setDraft] = useState<EditableOrder>({
    customer_name: order.customer_name,
    customer_phone: order.customer_phone,
    customer_email: order.customer_email,
    shipping_address: order.shipping_address,
    shipping_city: order.shipping_city,
    shipping_postal: order.shipping_postal,
    payment_method: order.payment_method,
    payment_status: order.payment_status,
    fulfillment_status: order.fulfillment_status,
    shipping_fee: order.shipping_fee,
    special_note: order.special_note,
  });
  const [draftItems, setDraftItems] = useState<OrderEditorItem[]>(items.map((item) => ({
    product_id: item.product_id ?? "",
    quantity: item.quantity,
    unit_price: amount(item.unit_price),
    size: item.size ?? "",
    color: item.color ?? "",
  })));

  const beginEdit = () => {
    setDraft({
      customer_name: order.customer_name,
      customer_phone: order.customer_phone,
      customer_email: order.customer_email,
      shipping_address: order.shipping_address,
      shipping_city: order.shipping_city,
      shipping_postal: order.shipping_postal,
      payment_method: order.payment_method,
      payment_status: order.payment_status,
      fulfillment_status: order.fulfillment_status,
      shipping_fee: order.shipping_fee,
      special_note: order.special_note,
    });
    setDraftItems(items.map((item) => ({
      product_id: item.product_id ?? "",
      quantity: item.quantity,
      unit_price: amount(item.unit_price),
      size: item.size ?? "",
      color: item.color ?? "",
    })));
    setSaveError("");
    setEditing(true);
  };
  const updateDraft = (key: keyof EditableOrder, value: string | number | null) => setDraft((current) => ({ ...current, [key]: value }));
  const updateItem = (index: number, patch: Partial<OrderEditorItem>) => setDraftItems((current) => current.map((item, i) => i === index ? { ...item, ...patch } : item));
  const addProduct = () => {
    if (!newProductId) return;
    setDraftItems((current) => [...current, { product_id: newProductId, quantity: 1, unit_price: amount(products.find((product) => product.id === newProductId)?.price), size: "", color: "" }]);
    setNewProductId("");
  };
  const save = async () => {
    if (!draftItems.length) {
      setSaveError("An order must contain at least one product. Remove the order by cancelling it instead.");
      return;
    }
    if (draftItems.some((item) => !item.product_id)) {
      setSaveError("One or more older order items are missing a product link. Remove those items and add the correct catalogue product before saving.");
      return;
    }
    setSavingEdit(true);
    setSaveError("");
    try {
      await saveOrderEdits(session, order.id, draft, draftItems);
      setEditing(false);
      onSaved();
    } catch (error) {
      setSaveError(error instanceof Error ? error.message : "Could not save order changes.");
    } finally {
      setSavingEdit(false);
    }
  };
  const inputClass = "mt-1 h-10 w-full border border-black/15 bg-[#F7F3EC] px-3 text-xs text-[#171717] outline-none focus:border-black";
  const labelClass = "block text-[9px] font-bold uppercase tracking-[0.12em] text-black/45";
  return <>
    <tr className="transition hover:bg-black/[0.025]">
      <td className="px-4 py-3"><button type="button" onClick={onToggle} className="text-left"><span className="block font-black underline decoration-black/20 underline-offset-4">{order.order_number}</span><span className="mt-1 block font-semibold">{order.customer_name}</span><span className="mt-0.5 block text-[10px] text-black/45">{order.customer_phone}</span></button></td>
      <td className="px-4 py-3 whitespace-nowrap text-black/60">{dateTime(order.created_at)}</td>
      <td className="px-4 py-3"><span className="block max-w-[190px] truncate font-semibold">{productNames.join(", ") || "—"}</span><span className="mt-1 text-[10px] text-black/45">{items.reduce((sum, item) => sum + item.quantity, 0)} units</span></td>
      <td className="px-4 py-3"><span className="block max-w-[150px] truncate">{brands.join(", ") || "—"}</span><span className="mt-1 block text-[10px] text-black/45">{seasons.join(", ") || "Season unassigned"}</span></td>
      <td className="px-4 py-3"><StatusPill value={order.payment_status} /><span className="mt-1 block text-[10px] text-black/45">{order.payment_method}</span></td>
      <td className="px-4 py-3"><select aria-label={`Fulfilment status for ${order.order_number}`} value={order.fulfillment_status} disabled={saving || savingEdit} onChange={(event) => onStatusChange(event.target.value as OrderRecord["fulfillment_status"])} className="h-8 max-w-[140px] border border-black/15 bg-[#F7F3EC] px-2 text-[10px] font-bold uppercase outline-none focus:border-black disabled:opacity-50"><option value="new">New</option><option value="confirmed">Pending · Confirmed</option><option value="processing">Pending · Processing</option><option value="shipped">Pending · Shipped</option><option value="delivered">Delivered</option><option value="cancelled">Cancelled</option><option value="returned">Returned</option></select></td>
      <td className="px-4 py-3 text-right font-black tabular-nums">{money(amount(order.total))}<button type="button" onClick={onToggle} className="mt-1 block w-full text-right text-[9px] font-bold uppercase tracking-wide text-black/40 underline underline-offset-2">{expanded ? "Hide details" : "View details"}</button></td>
    </tr>
    {expanded && <tr className="bg-black/[0.025]"><td colSpan={7} className="px-4 py-5 md:px-5">
      <div className="mb-5 flex flex-wrap items-center justify-between gap-3"><div><p className="text-[9px] font-bold uppercase tracking-[0.15em] text-black/40">Order workspace</p><h3 className="mt-1 text-sm font-black">{order.order_number}</h3></div>{!editing ? <button type="button" onClick={beginEdit} className="bg-[#171717] px-4 py-2.5 text-[10px] font-bold uppercase tracking-wide text-[#F0EAE0] hover:bg-black/80">Edit full order</button> : <span className="bg-[#D5FE00] px-3 py-2 text-[9px] font-black uppercase tracking-wide">Editing order</span>}</div>
      {!editing ? <div className="grid gap-6 md:grid-cols-[0.9fr_1.1fr]">
        <div><p className="text-[9px] font-bold uppercase tracking-[0.15em] text-black/40">Customer & delivery</p><p className="mt-2 text-xs font-bold">{order.customer_name}</p><p className="mt-1 text-xs">{order.shipping_address}</p><p className="mt-1 text-xs text-black/60">{[order.shipping_city, order.shipping_postal].filter(Boolean).join(" · ") || "City / postal not provided"}</p><p className="mt-1 text-xs text-black/60">{order.customer_phone}</p>{order.customer_email && <p className="mt-1 text-xs text-black/60">{order.customer_email}</p>}<p className="mt-3 text-[10px] text-black/45">Payment: {order.payment_method} · {order.payment_status}</p><div className="mt-5 border-l-2 border-[#D5FE00] bg-white/60 p-3"><p className="text-[9px] font-bold uppercase tracking-[0.12em] text-black/40">Special note · Admin only</p><p className="mt-1 whitespace-pre-wrap text-xs">{order.special_note || "No special note added."}</p></div></div>
        <div><p className="text-[9px] font-bold uppercase tracking-[0.15em] text-black/40">Product preview</p><div className="mt-2 divide-y divide-black/10">{items.map((item, index) => <div key={item.product_id ?? item.product_name + index} className="flex items-center gap-3 py-3"><div className="h-16 w-14 shrink-0 overflow-hidden bg-[#E8E1D6]">{item.product?.image_url ? <img src={item.product.image_url} alt={item.product_name} className="h-full w-full object-cover" /> : <div className="grid h-full place-items-center text-[8px] font-bold uppercase text-black/30">No image</div>}</div><div className="min-w-0 flex-1"><p className="truncate text-xs font-bold">{item.product_name}</p><p className="mt-1 text-[10px] text-black/45">{item.brand_name}{item.season ? ` · ${item.season}` : ""}</p><p className="mt-1 text-[10px] text-black/55">{[item.size, item.color].filter(Boolean).join(" / ") || "No variant"} · Qty {item.quantity}</p></div><p className="text-xs font-bold tabular-nums">{money(amount(item.line_total))}</p></div>)}</div><div className="mt-3 flex flex-wrap justify-end gap-x-6 gap-y-2 border-t border-black/10 pt-3 text-xs"><span>Subtotal {money(amount(order.subtotal))}</span><span>Delivery {money(amount(order.shipping_fee))}</span><b>Total {money(amount(order.total))}</b></div></div>
      </div> : <div className="grid gap-5 xl:grid-cols-[0.9fr_1.1fr]">
        <div className="space-y-4">
          <div className="grid gap-3 sm:grid-cols-2"><label className={labelClass}>Customer name<input className={inputClass} value={String(draft.customer_name)} onChange={(e) => updateDraft("customer_name", e.target.value)} /></label><label className={labelClass}>Mobile number<input className={inputClass} value={String(draft.customer_phone)} onChange={(e) => updateDraft("customer_phone", e.target.value)} /></label><label className={labelClass}>Email<input className={inputClass} value={draft.customer_email ?? ""} onChange={(e) => updateDraft("customer_email", e.target.value)} /></label><label className={labelClass}>City<input className={inputClass} value={draft.shipping_city ?? ""} onChange={(e) => updateDraft("shipping_city", e.target.value)} /></label><label className={`${labelClass} sm:col-span-2`}>Delivery address<textarea rows={2} className="mt-1 w-full border border-black/15 bg-[#F7F3EC] px-3 py-2 text-xs outline-none focus:border-black" value={draft.shipping_address} onChange={(e) => updateDraft("shipping_address", e.target.value)} /></label><label className={labelClass}>Postal code<input className={inputClass} value={draft.shipping_postal ?? ""} onChange={(e) => updateDraft("shipping_postal", e.target.value)} /></label><label className={labelClass}>Delivery fee (৳)<input type="number" min="0" className={inputClass} value={String(draft.shipping_fee)} onChange={(e) => updateDraft("shipping_fee", Number(e.target.value))} /></label></div>
          <div className="grid gap-3 sm:grid-cols-3"><label className={labelClass}>Payment method<select className={inputClass} value={draft.payment_method} onChange={(e) => updateDraft("payment_method", e.target.value)}><option>Cash on Delivery</option><option>bKash</option><option>Nagad</option><option>Card Payment</option></select></label><label className={labelClass}>Payment status<select className={inputClass} value={draft.payment_status} onChange={(e) => updateDraft("payment_status", e.target.value)}><option value="pending">Pending</option><option value="paid">Paid</option><option value="failed">Failed</option><option value="refunded">Refunded</option></select></label><label className={labelClass}>Fulfilment status<select className={inputClass} value={draft.fulfillment_status} onChange={(e) => updateDraft("fulfillment_status", e.target.value)}><option value="new">New</option><option value="confirmed">Confirmed</option><option value="processing">Processing</option><option value="shipped">Shipped</option><option value="delivered">Delivered</option><option value="cancelled">Cancelled</option><option value="returned">Returned</option></select></label></div>
          <label className={labelClass}>Special note · Admin only<textarea rows={4} maxLength={2000} className="mt-1 w-full resize-y border border-black/15 bg-[#F7F3EC] px-3 py-3 text-xs leading-5 outline-none focus:border-black" placeholder="Internal handling instructions, customer requests, delivery reminders…" value={draft.special_note ?? ""} onChange={(e) => updateDraft("special_note", e.target.value)} /></label>
        </div>
        <div><div className="flex flex-wrap items-center justify-between gap-2"><p className="text-[9px] font-bold uppercase tracking-[0.15em] text-black/40">Products in this order</p><span className="text-[10px] text-black/40">Prices update to current catalogue price</span></div>
          <div className="mt-2 divide-y divide-black/10">{draftItems.map((item, index) => { const product = products.find((entry) => entry.id === item.product_id); const original = items[index]; return <div key={`${item.product_id}-${index}`} className="flex gap-3 py-3"><div className="h-16 w-14 shrink-0 overflow-hidden bg-[#E8E1D6]">{product?.image_url || original?.product?.image_url ? <img src={product?.image_url ?? original?.product?.image_url ?? ""} alt={product?.name ?? original?.product_name ?? "Order item"} className="h-full w-full object-cover" /> : <div className="grid h-full place-items-center text-[8px] text-black/30">No image</div>}</div><div className="min-w-0 flex-1"><p className="truncate text-xs font-bold">{product?.name ?? original?.product_name ?? "Unlinked product"}</p><div className="mt-2 grid grid-cols-2 gap-2 sm:grid-cols-4"><label className={labelClass}>Qty<input type="number" min="1" max="99" className="mt-1 h-9 w-full border border-black/15 bg-[#F7F3EC] px-2 text-xs" value={item.quantity} onChange={(e) => updateItem(index, { quantity: Math.max(1, Math.min(99, Number(e.target.value) || 1)) })} /></label><label className={labelClass}>Unit price<input type="number" min="0" className="mt-1 h-9 w-full border border-black/15 bg-[#F7F3EC] px-2 text-xs" value={item.unit_price} onChange={(e) => updateItem(index, { unit_price: Math.max(0, Number(e.target.value) || 0) })} /></label><label className={labelClass}>Size<input className="mt-1 h-9 w-full border border-black/15 bg-[#F7F3EC] px-2 text-xs" value={item.size} onChange={(e) => updateItem(index, { size: e.target.value })} /></label><label className={labelClass}>Colour<input className="mt-1 h-9 w-full border border-black/15 bg-[#F7F3EC] px-2 text-xs" value={item.color} onChange={(e) => updateItem(index, { color: e.target.value })} /></label></div></div><button type="button" onClick={() => setDraftItems((current) => current.filter((_, i) => i !== index))} className="self-start px-2 py-1 text-[9px] font-bold uppercase text-red-700 underline underline-offset-2">Remove</button></div>; })}</div>
          <div className="mt-4 flex flex-wrap gap-2 border border-dashed border-black/20 p-3"><select value={newProductId} onChange={(e) => setNewProductId(e.target.value)} className="h-10 min-w-0 flex-1 border border-black/15 bg-[#F7F3EC] px-3 text-xs"><option value="">Choose a product to add…</option>{products.filter((product) => product.is_active).map((product) => <option key={product.id} value={product.id}>{product.name} · {money(amount(product.price))}</option>)}</select><button type="button" disabled={!newProductId} onClick={addProduct} className="bg-[#171717] px-4 py-2 text-[10px] font-bold uppercase text-[#F0EAE0] disabled:opacity-40">Add product</button></div>
          {draftItems.some((item) => !item.product_id) && <p className="mt-2 text-[10px] text-amber-800">This order contains an older item without a catalogue link. Remove it and add the correct product before saving.</p>}
          <div className="mt-4 flex flex-wrap justify-end gap-2 border-t border-black/10 pt-4"><button type="button" disabled={savingEdit} onClick={() => { setEditing(false); setSaveError(""); }} className="border border-black/20 px-4 py-2.5 text-[10px] font-bold uppercase">Discard</button><button type="button" disabled={savingEdit} onClick={() => void save()} className="bg-[#D5FE00] px-5 py-2.5 text-[10px] font-black uppercase disabled:opacity-50">{savingEdit ? "Saving order…" : "Save all changes"}</button></div>
          {saveError && <p role="alert" className="mt-3 border border-red-300 bg-red-50 px-3 py-2 text-xs text-red-800">{saveError}</p>}
        </div>
      </div>}
    </td></tr>}
  </>;
}

function Metric({ icon: Icon, label, value, detail }: { icon: typeof CircleDollarSign; label: string; value: string; detail: string }) {
  return <div className="border border-black/10 bg-[#F7F3EC] p-4 md:p-5"><div className="flex items-center justify-between"><p className="text-[9px] font-bold uppercase tracking-[0.16em] text-black/45">{label}</p><Icon className="h-4 w-4 text-black/55" /></div><p className="mt-4 break-words font-display text-2xl font-black tracking-[-0.055em] md:text-[1.7rem]">{value}</p><p className="mt-1 text-[10px] text-black/45">{detail}</p></div>;
}

function EmptyState({ title, detail }: { title: string; detail: string }) {
  return <div className="flex min-h-[150px] flex-col items-center justify-center px-5 py-8 text-center"><div className="grid h-10 w-10 place-items-center border border-black/10"><Clock3 className="h-4 w-4 text-black/45" /></div><p className="mt-3 text-sm font-bold">{title}</p><p className="mt-1 max-w-sm text-xs leading-5 text-black/45">{detail}</p></div>;
}

function StatusPill({ value }: { value: string }) {
  const good = value === "paid" || value === "delivered";
  const warning = value === "pending" || value === "new" || value === "processing";
  return <span className={`inline-flex rounded-full px-2 py-1 text-[9px] font-bold uppercase tracking-[0.08em] ${good ? "bg-[#D5FE00] text-[#171717]" : warning ? "bg-amber-100 text-amber-900" : "bg-black/5 text-black/55"}`}>{value}</span>;
}
