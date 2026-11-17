import { useCallback, useEffect, useState, type FormEvent, type ReactNode } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import {
  ArrowLeft, Check, ChevronRight, ImagePlus, LoaderCircle, LogOut, Plus, RefreshCw,
  Save, Trash2, Upload, X,
} from "lucide-react";
import { MenuToggleIcon } from "@/components/ui/menu-toggle-icon";
import { productById } from "@/lib/catalog";
import { AccountAccess } from "@/components/account/AccountAccess";
import { restoreAdminSession, signOutAdmin, type AdminSession } from "@/lib/supabase-admin";
import {
  adminData, adminWrite, adminRpc, loadAdminWorkspace, slugify, uploadAdminMedia,
  type AdminBrand, type AdminCollection, type AdminLook, type AdminOrder, type AdminProduct, type CustomerProfile,
  type HeroSlide, type SiteBrandInfo,
} from "@/lib/supabase-admin-management";

export const Route = createFileRoute("/admin/management")({
  head: () => ({ meta: [{ title: "Store Controls — ISHTILE+" }, { name: "robots", content: "noindex,nofollow" }] }),
  component: ManagementPage,
});

type Tab = "products" | "hero" | "collections" | "brands" | "accounts" | "brand-info";
const tabs: { id: Tab; label: string; hint: string }[] = [
  { id: "products", label: "Products", hint: "Catalogue and inventory" },
  { id: "hero", label: "Hero controls", hint: "Slides and scheduling" },
  { id: "collections", label: "Collections", hint: "Homepage campaigns" },
  { id: "brands", label: "Brands", hint: "Brand workspaces" },
  { id: "accounts", label: "Accounts", hint: "Administrators and customers" },
  { id: "brand-info", label: "Brand info", hint: "Main ISHTILE identity" },
];
const inputClass = "mt-1 w-full border border-black/15 bg-white/60 px-3 py-2.5 text-sm outline-none transition focus:border-black";
const labelClass = "block text-[10px] font-bold uppercase tracking-[0.13em] text-black/55";
const buttonClass = "inline-flex items-center justify-center gap-2 bg-[#171717] px-4 py-2.5 text-xs font-bold uppercase tracking-[0.08em] text-[#F0EAE0] transition hover:bg-black/80 disabled:cursor-not-allowed disabled:opacity-40";
const secondaryClass = "inline-flex items-center justify-center gap-2 border border-black/20 px-3 py-2 text-xs font-bold transition hover:bg-black/5 disabled:opacity-40";
const money = (value: number) => new Intl.NumberFormat("en-BD", { style: "currency", currency: "BDT", maximumFractionDigits: 0 }).format(value);
const dateInputValue = (value: string | null) => value ? new Date(value).toLocaleString("sv-SE", { hour12: false }).replace(" ", "T").slice(0, 16) : "";

function ManagementPage() {
  const [session, setSession] = useState<AdminSession | null>(null);
  const [checking, setChecking] = useState(true);
  const [tab, setTab] = useState<Tab>("products");
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [brandFilterRequest, setBrandFilterRequest] = useState("all");
  const [workspace, setWorkspace] = useState<Awaited<ReturnType<typeof loadAdminWorkspace>> | null>(null);
  const [loading, setLoading] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");

  useEffect(() => {
    let live = true;
    restoreAdminSession().then((value) => { if (live) setSession(value); }).finally(() => { if (live) setChecking(false); });
    return () => { live = false; };
  }, []);

  // Dashboard burger links deep-link directly to a management workspace.
  useEffect(() => {
    const syncTabFromHash = () => {
      const requested = window.location.hash.slice(1) as Tab;
      if (tabs.some((item) => item.id === requested)) setTab(requested);
    };
    syncTabFromHash();
    window.addEventListener("hashchange", syncTabFromHash);
    return () => window.removeEventListener("hashchange", syncTabFromHash);
  }, []);

  const refresh = useCallback(async () => {
    const current = await restoreAdminSession();
    if (!current) { setSession(null); setWorkspace(null); return; }
    setSession(current);
    setLoading(true);
    setError("");
    try { setWorkspace(await loadAdminWorkspace(current)); }
    catch (e) { setError(e instanceof Error ? e.message : "Could not load store controls."); }
    finally { setLoading(false); }
  }, []);

  useEffect(() => { if (session) void refresh(); }, [session?.user.id, refresh]);

  async function perform(action: () => Promise<unknown>, message: string) {
    setBusy(true); setError(""); setNotice("");
    try { await action(); await refresh(); setNotice(message); }
    catch (e) { setError(e instanceof Error ? e.message : "The change could not be saved."); }
    finally { setBusy(false); }
  }

  async function handleSignOut() {
    if (session) await signOutAdmin(session);
    setSession(null); setWorkspace(null);
  }

  if (checking) return <div className="grid min-h-screen place-items-center bg-[#F0EAE0]"><LoaderCircle className="h-7 w-7 animate-spin" /></div>;
  if (!session) return <AccountAccess defaultMode="admin" />;

  return (
    <main className="min-h-screen bg-[#F0EAE0] text-[#171717]">
      <div className="min-h-screen">
        {drawerOpen && <button type="button" aria-label="Close navigation drawer" onClick={() => setDrawerOpen(false)} className="fixed inset-0 z-40 cursor-default bg-[#171717]/55 backdrop-blur-[2px]" />}
        <aside className={`fixed inset-y-0 left-0 z-50 flex w-[min(86vw,320px)] flex-col bg-[#171717] px-5 py-6 text-[#F0EAE0] shadow-[24px_0_70px_rgba(0,0,0,.24)] transition-transform duration-300 ease-[cubic-bezier(.22,1,.36,1)] ${drawerOpen ? "translate-x-0" : "-translate-x-full"}`} aria-hidden={!drawerOpen}>
          <div className="flex items-center justify-between">
            <div><div className="font-display text-2xl font-black tracking-[-0.07em]">ISHTILE<span className="text-[#D5FE00]">+</span></div><p className="mt-1 text-[9px] font-bold uppercase tracking-[0.24em] text-white/40">Store controls</p></div>
            <button type="button" onClick={() => setDrawerOpen(false)} className="grid h-9 w-9 place-items-center border border-white/15 text-white/70 transition hover:border-[#D5FE00] hover:text-[#D5FE00]" aria-label="Close menu"><MenuToggleIcon open className="h-5 w-5" strokeWidth={2.2} duration={500} /></button>
          </div>
          <Link to="/admin" onClick={() => setDrawerOpen(false)} className="mt-8 flex items-center gap-2 border border-white/15 px-3 py-3 text-xs font-semibold text-white/65 transition hover:border-[#D5FE00] hover:text-[#D5FE00]"><ArrowLeft className="h-4 w-4" /> Back to dashboard</Link>
          <p className="mb-3 mt-9 text-[9px] font-bold uppercase tracking-[0.2em] text-white/35">Management sections</p>
          <nav className="space-y-1.5" aria-label="Store management sections">
            {tabs.map((item, index) => <button key={item.id} type="button" onClick={() => { setTab(item.id); setDrawerOpen(false); }} aria-current={tab === item.id ? "page" : undefined} className={`group flex w-full items-center gap-3 px-3 py-3.5 text-left transition-all duration-200 ${tab === item.id ? "bg-[#D5FE00] text-[#171717] shadow-[4px_4px_0_rgba(213,254,0,.18)]" : "text-white/65 hover:translate-x-1 hover:bg-white/10 hover:text-white"}`}>
              <span className={`grid h-8 w-8 shrink-0 place-items-center text-[10px] font-black ${tab === item.id ? "bg-[#171717] text-[#D5FE00]" : "bg-white/10 text-white/55"}`}>{`0${index + 1}`}</span>
              <span className="min-w-0 flex-1"><span className="block text-xs font-black uppercase tracking-[0.07em]">{item.label}</span><span className={`mt-1 block text-[10px] ${tab === item.id ? "text-black/60" : "text-white/35"}`}>{item.hint}</span></span>
              <ChevronRight className={`h-4 w-4 transition-transform ${tab === item.id ? "translate-x-0 text-[#171717]" : "-translate-x-1 opacity-0 group-hover:translate-x-0 group-hover:opacity-70"}`} />
            </button>)}
          </nav>
          <div className="mt-auto border-t border-white/10 pt-5"><p className="text-[9px] font-bold uppercase tracking-[0.16em] text-white/35">Signed in as</p><p className="mt-2 truncate text-xs font-semibold">{session.user.email}</p><button onClick={handleSignOut} className="mt-4 flex w-full items-center gap-2 border border-white/15 px-3 py-3 text-xs font-bold text-white/60 transition hover:border-[#D5FE00] hover:text-[#D5FE00]"><LogOut className="h-4 w-4" /> Sign out</button></div>
        </aside>
        <section className="min-w-0">
          <header className="sticky top-0 z-30 flex items-center justify-between border-b border-black/10 bg-[#F0EAE0]/95 px-4 py-4 backdrop-blur md:px-8">
            <div className="flex min-w-0 items-center gap-3">
              <button type="button" onClick={() => setDrawerOpen(true)} className="grid h-10 w-10 shrink-0 place-items-center bg-[#171717] text-[#D5FE00] transition hover:bg-black" aria-label="Open management menu" aria-expanded={drawerOpen}><MenuToggleIcon open={drawerOpen} className="h-6 w-6" strokeWidth={2.2} duration={500} /></button>
              <div className="min-w-0"><p className="text-[9px] font-bold uppercase tracking-[0.2em] text-black/45">ISHTILE / Operations</p><h1 className="mt-1 truncate font-display text-2xl font-black tracking-[-0.055em] md:text-3xl">{tabs.find((item) => item.id === tab)?.label}<span className="text-black/25">.</span></h1></div>
            </div>
            <div className="flex shrink-0 items-center gap-2"><Link to="/admin" className={secondaryClass}><ArrowLeft className="h-4 w-4" /><span className="hidden sm:inline">Dashboard</span></Link><button onClick={() => void refresh()} className={secondaryClass} aria-label="Refresh"><RefreshCw className={`h-4 w-4 ${loading ? "animate-spin" : ""}`} /></button></div>
          </header>
          <div className="space-y-5 px-4 py-6 md:px-8 md:py-8">
            {error && <div role="alert" className="flex items-start justify-between gap-3 border border-red-300 bg-red-50 px-4 py-3 text-sm text-red-800"><span>{error}</span><button onClick={() => setError("")} aria-label="Dismiss"><X className="h-4 w-4" /></button></div>}
            {notice && <div className="flex items-center gap-2 border border-[#171717]/15 bg-[#D5FE00]/35 px-4 py-3 text-sm"><Check className="h-4 w-4" />{notice}</div>}
            {loading && !workspace ? <div className="flex items-center gap-3 py-16 text-sm text-black/55"><LoaderCircle className="h-5 w-5 animate-spin" /> Loading live store records…</div> : workspace && (
              <>
                {tab === "products" && <ProductsPanel products={workspace.products} brands={workspace.brands} initialBrandFilter={brandFilterRequest} session={session} busy={busy} perform={perform} />}
                {tab === "hero" && <HeroPanel slides={workspace.slides} settings={workspace.settings} session={session} busy={busy} perform={perform} />}
                {tab === "collections" && <CollectionsPanel collections={workspace.collections} looks={workspace.looks} products={workspace.products} session={session} busy={busy} perform={perform} />}
                {tab === "brands" && <BrandsPanel brands={workspace.brands} products={workspace.products} orders={workspace.orders} onManageProducts={(brandId) => { setBrandFilterRequest(brandId); setTab("products"); }} session={session} busy={busy} perform={perform} />}
                {tab === "accounts" && <AccountsPanel admins={workspace.admins} customers={workspace.customers} orders={workspace.orders} session={session} busy={busy} perform={perform} />}
                {tab === "brand-info" && <BrandInfoPanel settings={workspace.settings} session={session} busy={busy} perform={perform} />}
              </>
            )}
            <footer className="border-t border-black/10 pt-4 text-[10px] text-black/40">ISHTILE+ · Changes are saved directly to the connected Supabase project.</footer>
          </div>
        </section>
      </div>
    </main>
  );
}

function PanelHeading({ eyebrow, title, detail, action }: { eyebrow: string; title: string; detail: string; action?: ReactNode }) {
  return <div className="mb-5 flex flex-wrap items-end justify-between gap-3"><div><p className="text-[9px] font-bold uppercase tracking-[0.2em] text-black/45">{eyebrow}</p><h2 className="mt-1 text-xl font-black tracking-tight">{title}</h2><p className="mt-1 max-w-2xl text-xs leading-5 text-black/50">{detail}</p></div>{action}</div>;
}
function Field({ label, name, value, onChange, type = "text", placeholder, required = false }: { label: string; name: string; value: string | number; onChange: (value: string) => void; type?: string; placeholder?: string; required?: boolean }) {
  return <label className={labelClass}>{label}<input className={inputClass} name={name} type={type} value={value} placeholder={placeholder} required={required} onChange={(e) => onChange(e.target.value)} /></label>;
}
function TextField({ label, name, value, onChange, rows = 3 }: { label: string; name: string; value: string; onChange: (value: string) => void; rows?: number }) {
  return <label className={labelClass}>{label}<textarea className={inputClass} name={name} rows={rows} value={value} onChange={(e) => onChange(e.target.value)} /></label>;
}
function UploadField({ label, session, folder, onUploaded, busy }: { label: string; session: AdminSession; folder: string; onUploaded: (url: string) => void; busy: boolean }) {
  const [uploading, setUploading] = useState(false);
  const [message, setMessage] = useState("");
  async function upload(file?: File) {
    if (!file) return;
    setUploading(true); setMessage("");
    try { onUploaded(await uploadAdminMedia(file, session, folder)); setMessage("Uploaded"); }
    catch (e) { setMessage(e instanceof Error ? e.message : "Upload failed"); }
    finally { setUploading(false); }
  }
  return <label className="flex cursor-pointer items-center gap-3 border border-dashed border-black/25 bg-white/35 px-3 py-3 text-xs font-semibold hover:bg-white/70"><ImagePlus className="h-4 w-4" />{label}<span className="ml-auto text-[10px] text-black/45">{uploading || busy ? "Uploading…" : message || "Choose image"}</span><input type="file" accept="image/*" className="hidden" disabled={uploading || busy} onChange={(e) => { void upload(e.target.files?.[0]); e.currentTarget.value = ""; }} /></label>;
}
function ImageUrlPreview({ urls, alt = "Image preview", compact = false }: { urls: string[]; alt?: string; compact?: boolean }) {
  const validUrls = [...new Set(urls.map((url) => url.trim()).filter((url) => /^https?:\/\//i.test(url)))];
  if (!validUrls.length) return null;
  return <div className={`flex flex-wrap gap-2 ${compact ? "mt-1" : "mt-2"}`} aria-label={alt}>
    {validUrls.map((url, index) => <div key={url} className={`overflow-hidden border border-black/10 bg-[#E8E1D6] ${compact ? "h-14 w-12" : "h-20 w-16"}`}>
      <img src={url} alt={`${alt} ${index + 1}`} loading="lazy" className="h-full w-full object-cover" onError={(event) => { event.currentTarget.style.opacity = "0.15"; }} />
    </div>)}
    {validUrls.length > 1 && <span className="self-end pb-1 text-[10px] text-black/45">{validUrls.length} images</span>}
  </div>;
}
function ImageUrlField({ label, name, value, onChange, multiple = false }: { label: string; name: string; value: string; onChange: (value: string) => void; multiple?: boolean }) {
  const urls = multiple ? value.split(",") : [value];
  return <div><Field label={label} name={name} value={value} onChange={onChange} /><ImageUrlPreview urls={urls} alt={label} compact /></div>;
}
function ProductSelectionCard({ product, checked, onChange, children }: { product: AdminProduct; checked: boolean; onChange: () => void; children?: ReactNode }) {
  const image = product.image_url || product.image_urls?.[0] || productById(product.slug)?.image;
  return <div className={`border transition-colors ${checked ? "border-black bg-[#D5FE00]/15" : "border-black/10 bg-white/45 hover:bg-white/80"}`}>
    <label className="flex min-w-0 cursor-pointer items-center gap-2 p-2">
      <input type="checkbox" checked={checked} onChange={onChange} className="shrink-0" />
      <div className="h-12 w-10 shrink-0 overflow-hidden bg-[#E8E1D6]">
        {image ? <img src={image} alt="" loading="lazy" className="h-full w-full object-cover" /> : <div className="grid h-full place-items-center"><ImagePlus className="h-4 w-4 text-black/30" /></div>}
      </div>
      <span className="min-w-0 flex-1">
        <span className="block truncate text-[11px] font-bold">{product.name}</span>
        <span className="mt-0.5 block truncate text-[9px] text-black/45">{product.sku || product.slug}</span>
        <span className="mt-0.5 block text-[10px] font-semibold">{money(Number(product.price))}</span>
      </span>
      {product.is_out_of_stock && <span className="shrink-0 text-[8px] font-bold uppercase text-red-700">Out</span>}
    </label>
    {children && <div className="border-t border-black/10 px-2 pb-2 pt-2">{children}</div>}
  </div>;
}


function ProductsPanel({ products, brands, initialBrandFilter, session, busy, perform }: { products: AdminProduct[]; brands: AdminBrand[]; initialBrandFilter: string; session: AdminSession; busy: boolean; perform: (action: () => Promise<unknown>, message: string) => Promise<void> }) {
  const [selected, setSelected] = useState<AdminProduct | null>(null);
  const [query, setQuery] = useState("");
  const [brandFilter, setBrandFilter] = useState(initialBrandFilter);
  const [draft, setDraft] = useState({ name: "", slug: "", sku: "", brand_id: brands[0]?.id ?? "", category: "Men", price: "0", stock_quantity: "", image_url: "", image_urls: "", description: "", sizes: "S, M, L, XL, XXL", colors: "Black:#000000", is_active: true, is_featured: false, is_out_of_stock: false, tags: "" });
  useEffect(() => { if (selected) setDraft({ name: selected.name, slug: selected.slug, sku: selected.sku ?? "", brand_id: selected.brand_id, category: selected.category, price: String(selected.price), stock_quantity: selected.stock_quantity === null ? "" : String(selected.stock_quantity), image_url: selected.image_url ?? "", image_urls: (selected.image_urls ?? []).join(", "), description: selected.description ?? "", sizes: selected.sizes.join(", "), colors: (selected.colors ?? []).map((color) => color.name + ":" + color.hex).join(", "), is_active: selected.is_active, is_featured: selected.is_featured, is_out_of_stock: selected.is_out_of_stock, tags: selected.tags.join(", ") }); }, [selected]);
  const tagOptions = ["Best Seller", "Customer Favorite", "New Arrival", "Limited Edition", "Trending", "Staff Pick", "Exclusive", "Back in Stock"];
  const filtered = products.filter((p) => (brandFilter === "all" || p.brand_id === brandFilter) && `${p.name} ${p.sku ?? ""} ${p.slug} ${(p.tags ?? []).join(" ")}`.toLowerCase().includes(query.toLowerCase()));
  function reset() { setSelected(null); setDraft({ name: "", slug: "", sku: "", brand_id: brands[0]?.id ?? "", category: "Men", price: "0", stock_quantity: "", image_url: "", image_urls: "", description: "", sizes: "S, M, L, XL, XXL", colors: "Black:#000000", is_active: true, is_featured: false, is_out_of_stock: false, tags: "" }); }
  async function save(e: FormEvent) { e.preventDefault(); const payload = { ...draft, tags: draft.tags.split(",").map((tag) => tag.trim()).filter(Boolean), slug: slugify(draft.slug || draft.name), price: Number(draft.price), stock_quantity: draft.stock_quantity === "" ? null : Number(draft.stock_quantity), sizes: draft.sizes.split(",").map((v) => v.trim()).filter(Boolean), colors: draft.colors.split(",").map((pair) => { const [name, hex] = pair.split(":"); return { name: name?.trim() ?? "", hex: hex?.trim() || "#000000" }; }).filter((color) => color.name), image_urls: draft.image_urls.split(",").map((v) => v.trim()).filter(Boolean) }; await perform(() => selected ? adminWrite(`products?id=eq.${selected.id}`, session, "PATCH", payload) : adminWrite("products", session, "POST", payload), selected ? "Product updated." : "Product added."); if (!busy) reset(); }
  return <><PanelHeading eyebrow="Catalogue" title="Product management" detail="Create, edit, publish, unpublish and remove products. Stock left blank remains untracked, not zero." action={<span className="text-xs text-black/45">{products.length} products</span>} />
    <div className="grid gap-5 xl:grid-cols-[minmax(0,1.1fr)_minmax(340px,0.9fr)]">
      <div className="border border-black/10 bg-[#F7F3EC]">
        <div className="flex flex-wrap gap-2 border-b border-black/10 p-3"><input className="min-w-[150px] flex-1 border border-black/15 bg-white/60 px-3 py-2 text-xs" placeholder="Search products or SKU" value={query} onChange={(e) => setQuery(e.target.value)} /><select className="border border-black/15 bg-white/60 px-3 py-2 text-xs" value={brandFilter} onChange={(e) => setBrandFilter(e.target.value)}><option value="all">All brands</option>{brands.map((b) => <option key={b.id} value={b.id}>{b.name}</option>)}</select></div>
        <div className="max-h-[680px] divide-y divide-black/10 overflow-y-auto">{filtered.map((p) => <button key={p.id} onClick={() => setSelected(p)} className={`flex w-full items-center gap-3 p-3 text-left hover:bg-black/[0.035] ${selected?.id === p.id ? "bg-[#D5FE00]/20" : ""}`}><div className="grid h-12 w-12 shrink-0 place-items-center overflow-hidden bg-[#E8E1D6]">{(p.image_url || p.image_urls?.[0] || productById(p.slug)?.image) ? <img src={p.image_url || p.image_urls?.[0] || productById(p.slug)?.image} alt={p.name} className="h-full w-full object-cover" /> : <ImagePlus className="h-4 w-4 text-black/30" />}</div><div className="min-w-0 flex-1"><p className="truncate text-xs font-bold">{p.name}</p><p className="mt-1 text-[10px] text-black/45">{p.is_featured ? "FEATURED · " : ""}{p.is_out_of_stock ? "OUT OF STOCK · " : ""}{brands.find((b) => b.id === p.brand_id)?.name ?? "Unassigned"} · {p.sku || "No SKU"}</p></div><div className="text-right"><p className="text-xs font-bold">{money(Number(p.price))}</p><p className="mt-1 text-[10px] text-black/45">{p.stock_quantity === null ? "Stock —" : `${p.stock_quantity} in stock`}</p></div></button>)}</div>
      </div>
      <form onSubmit={save} className="space-y-4 border border-black/10 bg-[#F7F3EC] p-4 md:p-5">
        <div className="flex items-center justify-between"><h3 className="text-sm font-black">{selected ? "Edit product" : "New product"}</h3>{selected && <button type="button" onClick={reset} className="text-xs underline">Clear selection</button>}</div>{selected && (selected.image_url || selected.image_urls?.length || productById(selected.slug)?.image) && <div className="flex gap-3 border border-black/10 bg-white/60 p-3"><img src={selected.image_url || selected.image_urls?.[0] || productById(selected.slug)?.image} alt={selected.name} className="h-28 w-24 shrink-0 object-cover" /><div className="min-w-0 self-center"><p className="text-xs font-bold">{selected.name}</p><p className="mt-1 text-[10px] text-black/45">Current catalogue artwork · {selected.image_urls?.length || (productById(selected.slug)?.galleryImages?.length ?? 1)} image(s)</p></div></div>}
        <Field label="Product name" name="name" value={draft.name} required onChange={(v) => setDraft({ ...draft, name: v, slug: selected ? draft.slug : slugify(v) })} />
        <div className="grid grid-cols-2 gap-3"><Field label="Product slug" name="slug" value={draft.slug} onChange={(v) => setDraft({ ...draft, slug: v })} /><Field label="Product code / SKU" name="sku" value={draft.sku} onChange={(v) => setDraft({ ...draft, sku: v })} /></div>
        <div className="grid grid-cols-2 gap-3"><label className={labelClass}>Brand<select className={inputClass} value={draft.brand_id} onChange={(e) => setDraft({ ...draft, brand_id: e.target.value })}>{brands.map((b) => <option key={b.id} value={b.id}>{b.name}</option>)}</select></label><label className={labelClass}>Category<select className={inputClass} value={draft.category} onChange={(e) => setDraft({ ...draft, category: e.target.value })}>{["Men","Women","Accessories","Traditional"].map((v) => <option key={v}>{v}</option>)}</select></label></div>
        <div className="grid grid-cols-2 gap-3"><Field label="Price (BDT)" name="price" type="number" value={draft.price} onChange={(v) => setDraft({ ...draft, price: v })} /><Field label="Stock quantity (blank = untracked)" name="stock_quantity" type="number" value={draft.stock_quantity} onChange={(v) => setDraft({ ...draft, stock_quantity: v })} /></div>
        <ImageUrlField label="Primary image URL" name="image_url" value={draft.image_url} onChange={(v) => setDraft({ ...draft, image_url: v })} />
        <UploadField label="Upload product image" session={session} folder="products" busy={busy} onUploaded={(url) => setDraft((d) => ({ ...d, image_url: url, image_urls: d.image_urls ? d.image_urls + ", " + url : url }))} />
        <ImageUrlField label="Additional image URLs (comma separated)" name="image_urls" value={draft.image_urls} onChange={(v) => setDraft({ ...draft, image_urls: v })} multiple />
        <Field label="Available sizes (comma separated)" name="sizes" value={draft.sizes} onChange={(v) => setDraft({ ...draft, sizes: v })} />
        <Field label="Colours (Name:#HEX, comma separated)" name="colors" value={draft.colors} onChange={(v) => setDraft({ ...draft, colors: v })} />
        <TextField label="Description" name="description" value={draft.description} onChange={(v) => setDraft({ ...draft, description: v })} />
        <div className="space-y-3 border border-black/10 bg-white/45 p-3">
          <p className="text-[10px] font-black uppercase tracking-[0.14em] text-black/55">Merchandising & availability</p>
          <label className="flex items-center gap-2 text-xs font-semibold"><input type="checkbox" checked={draft.is_featured} onChange={(e) => setDraft({ ...draft, is_featured: e.target.checked })} /> Feature this product</label>
          <label className="flex items-center gap-2 text-xs font-semibold"><input type="checkbox" checked={draft.is_out_of_stock} onChange={(e) => setDraft({ ...draft, is_out_of_stock: e.target.checked })} /> Mark as out of stock (keep visible, disable purchase)</label>
          <div><p className={labelClass}>Quick tags · select any</p><div className="mt-2 flex flex-wrap gap-1.5">{tagOptions.map((tag) => { const active = draft.tags.split(",").map((value) => value.trim()).includes(tag); return <button key={tag} type="button" onClick={() => { const current = draft.tags.split(",").map((value) => value.trim()).filter(Boolean); setDraft({ ...draft, tags: (active ? current.filter((value) => value !== tag) : [...current, tag]).join(", ") }); }} className={`border px-2.5 py-1.5 text-[10px] font-bold transition ${active ? "border-[#171717] bg-[#D5FE00] text-[#171717]" : "border-black/15 bg-white/60 text-black/55 hover:border-black/40"}`} aria-pressed={active}>{tag}</button>; })}</div></div>
          <Field label="Custom tags (comma separated)" name="tags" value={draft.tags} placeholder="Add your own product labels" onChange={(v) => setDraft({ ...draft, tags: v })} />
        </div>
        <label className="flex items-center gap-2 text-xs font-semibold"><input type="checkbox" checked={draft.is_active} onChange={(e) => setDraft({ ...draft, is_active: e.target.checked })} /> Published on storefront</label>
        <div className="flex flex-wrap gap-2"><button className={buttonClass} disabled={busy || !draft.name || !draft.brand_id}><Save className="h-4 w-4" />{busy ? "Saving…" : selected ? "Save changes" : "Add product"}</button>{selected && <button type="button" className={secondaryClass} disabled={busy} onClick={() => { if (confirm(`Remove ${selected.name}?`)) void perform(() => adminWrite(`products?id=eq.${selected.id}`, session, "DELETE"), "Product removed."); }}> <Trash2 className="h-4 w-4" /> Remove</button>}</div>
      </form>
    </div>
  </>;
}

function HeroPanel({ slides, settings, session, busy, perform }: { slides: HeroSlide[]; settings?: SiteBrandInfo; session: AdminSession; busy: boolean; perform: (action: () => Promise<unknown>, message: string) => Promise<void> }) {
  const [draft, setDraft] = useState({ title: "", subtitle: "", image_url: "", mobile_image_url: "", link_url: "", sort_order: String(slides.length), starts_at: "", ends_at: "" });
  const [interval, setInterval] = useState(String(settings?.hero_autoplay_ms ?? 5000));
  async function addSlide(e: FormEvent) { e.preventDefault(); await perform(() => adminWrite("hero_slides", session, "POST", { ...draft, sort_order: Number(draft.sort_order), starts_at: draft.starts_at ? new Date(draft.starts_at).toISOString() : null, ends_at: draft.ends_at ? new Date(draft.ends_at).toISOString() : null, is_active: true }), "Hero slide added."); setDraft({ title: "", subtitle: "", image_url: "", mobile_image_url: "", link_url: "", sort_order: String(slides.length + 1), starts_at: "", ends_at: "" }); }
  return <><PanelHeading eyebrow="Homepage media" title="Hero controls" detail="Choose which slide is live, set autoplay timing and schedule slides for campaigns." />
    <div className="mb-5 flex flex-wrap items-end gap-3 border border-black/10 bg-[#171717] p-4 text-[#F0EAE0]"><label className="text-[10px] font-bold uppercase tracking-wide text-white/60">Auto-scroll interval (milliseconds)<input className="mt-2 block w-44 border border-white/20 bg-white/10 px-3 py-2 text-sm text-white" type="number" min="1000" max="15000" step="500" value={interval} onChange={(e) => setInterval(e.target.value)} /></label><button className={`${buttonClass} bg-[#D5FE00] text-[#171717] hover:bg-[#c5ed00]`} disabled={busy} onClick={() => void perform(() => adminWrite("site_brand_info?id=eq.1", session, "PATCH", { hero_autoplay_ms: Math.min(15000, Math.max(1000, Number(interval))) }), "Hero autoplay timing saved.")}><Save className="h-4 w-4" /> Save timing</button><span className="text-[10px] text-white/45">1,000–15,000 ms</span></div>
    <div className="grid gap-5 xl:grid-cols-[minmax(0,1fr)_360px]">
      <div className="space-y-3">{slides.map((slide) => <div key={slide.id} className="flex flex-wrap items-center gap-3 border border-black/10 bg-[#F7F3EC] p-3"><img src={slide.image_url} alt="" className="h-20 w-28 bg-[#E8E1D6] object-cover" /><div className="min-w-[130px] flex-1"><p className="text-sm font-bold">{slide.title || "Untitled slide"}</p><p className="mt-1 text-[10px] text-black/45">Order {slide.sort_order} · {slide.starts_at ? new Date(slide.starts_at).toLocaleString() : "No start date"}{slide.ends_at ? ` → ${new Date(slide.ends_at).toLocaleString()}` : ""}</p><p className="mt-1 text-[10px] text-black/45">{slide.is_active ? "Enabled" : "Disabled"}</p></div><button className={secondaryClass} disabled={busy} onClick={() => void perform(() => adminWrite(`hero_slides?id=eq.${slide.id}`, session, "PATCH", { is_active: !slide.is_active }), slide.is_active ? "Slide disabled." : "Slide enabled.")}>{slide.is_active ? "Disable" : "Enable"}</button><button className={secondaryClass} disabled={busy} onClick={() => { if (confirm("Remove this hero slide?")) void perform(() => adminWrite(`hero_slides?id=eq.${slide.id}`, session, "DELETE"), "Hero slide removed."); }}><Trash2 className="h-4 w-4" /></button></div>)}{!slides.length && <Empty title="No hero slides yet" detail="Add the first slide using the form." />}</div>
      <form onSubmit={addSlide} className="space-y-3 border border-black/10 bg-[#F7F3EC] p-4"><h3 className="text-sm font-black">Add hero slide</h3><Field label="Title" name="title" value={draft.title} onChange={(v) => setDraft({ ...draft, title: v })} /><Field label="Subtitle" name="subtitle" value={draft.subtitle} onChange={(v) => setDraft({ ...draft, subtitle: v })} /><ImageUrlField label="Desktop image URL" name="image_url" value={draft.image_url} onChange={(v) => setDraft({ ...draft, image_url: v })} /><UploadField label="Upload desktop image" session={session} folder="hero" busy={busy} onUploaded={(url) => setDraft((d) => ({ ...d, image_url: url }))} /><ImageUrlField label="Mobile image URL (optional)" name="mobile_image_url" value={draft.mobile_image_url} onChange={(v) => setDraft({ ...draft, mobile_image_url: v })} /><UploadField label="Upload mobile image" session={session} folder="hero" busy={busy} onUploaded={(url) => setDraft((d) => ({ ...d, mobile_image_url: url }))} /><Field label="Link URL" name="link_url" value={draft.link_url} onChange={(v) => setDraft({ ...draft, link_url: v })} /><Field label="Display order" name="sort_order" type="number" value={draft.sort_order} onChange={(v) => setDraft({ ...draft, sort_order: v })} /><div className="grid grid-cols-2 gap-2"><Field label="Starts" name="starts_at" type="datetime-local" value={draft.starts_at} onChange={(v) => setDraft({ ...draft, starts_at: v })} /><Field label="Ends" name="ends_at" type="datetime-local" value={draft.ends_at} onChange={(v) => setDraft({ ...draft, ends_at: v })} /></div><button className={buttonClass} disabled={busy || !draft.image_url}><Plus className="h-4 w-4" /> Add slide</button></form>
    </div>
  </>;
}

function collectionSeason(slug: string): AdminLook["season"] {
  if (slug.includes("spring")) return "spring";
  if (slug.includes("summer")) return "summer";
  if (slug.includes("festive")) return "festive";
  if (slug.includes("monsoon")) return "monsoon";
  if (slug.includes("winter")) return "winter";
  return null;
}

function CollectionsPanel({ collections, looks, products, session, busy, perform }: {
  collections: AdminCollection[]; looks: AdminLook[]; products: AdminProduct[]; session: AdminSession; busy: boolean;
  perform: (action: () => Promise<unknown>, message: string) => Promise<void>;
}) {
  const [draft, setDraft] = useState({ title: "", slug: "", description: "", image_url: "", campaign_label: "", sort_order: String(collections.length), starts_at: "", ends_at: "" });
  const [filter, setFilter] = useState("all");
  const active = collections.filter((c) => filter === "all" || (filter === "home" ? c.show_homepage : !c.show_homepage));

  async function add(e: FormEvent) {
    e.preventDefault();
    await perform(() => adminWrite("collections", session, "POST", {
      ...draft, slug: slugify(draft.slug || draft.title), sort_order: Number(draft.sort_order),
      show_homepage: false, is_active: true,
      starts_at: draft.starts_at ? new Date(draft.starts_at).toISOString() : null,
      ends_at: draft.ends_at ? new Date(draft.ends_at).toISOString() : null,
    }), "Collection created.");
    setDraft({ title: "", slug: "", description: "", image_url: "", campaign_label: "", sort_order: String(collections.length + 1), starts_at: "", ends_at: "" });
  }

  return <>
    <PanelHeading eyebrow="Collection workspace" title="Collections & lookbooks" detail="Each collection owns its lookbook images. Open a collection, edit its identity, add editorial images, then assign a separate product set to every image." action={<select className="border border-black/15 bg-white/60 px-3 py-2 text-xs" value={filter} onChange={(e) => setFilter(e.target.value)}><option value="all">All collections</option><option value="home">Homepage only</option><option value="hidden">Not on homepage</option></select>} />
    <div className="space-y-3">
      {active.map((collection) => {
        const collectionLooks = looks.filter((look) => look.collection_id === collection.id).sort((a, b) => a.sort_order - b.sort_order);
        return <details key={collection.id} className="group border border-black/15 bg-[#F7F3EC]">
          <summary className="flex cursor-pointer list-none flex-wrap items-center gap-3 p-4 [&::-webkit-details-marker]:hidden">
            {collection.image_url ? <img src={collection.image_url} alt="" className="h-16 w-24 shrink-0 object-cover" /> : <div className="grid h-16 w-24 shrink-0 place-items-center bg-[#E8E1D6] text-[9px] font-bold uppercase text-black/35">No cover</div>}
            <span className="min-w-0 flex-1"><span className="block text-sm font-black">{collection.title}</span><span className="mt-1 block text-[10px] text-black/45">/{collection.slug} · {collectionLooks.length} lookbook images · {collection.is_active ? "Active" : "Paused"}</span><span className="mt-1 block text-[10px] text-black/45">{collection.show_homepage ? "Shown on homepage" : "Hidden from homepage"}</span></span>
            <span className="flex items-center gap-2 text-[10px] font-bold uppercase text-black/45"><span className="hidden sm:inline">Manage collection</span><ChevronRight className="h-4 w-4 transition-transform group-open:rotate-90" /></span>
          </summary>
          <div className="space-y-5 border-t border-black/10 p-4 md:p-5">
            <CollectionDetailsEditor collection={collection} session={session} busy={busy} perform={perform} />
            <div className="flex flex-wrap items-center justify-between gap-2 border-t border-black/10 pt-4">
              <div><h3 className="text-sm font-black">Lookbook images</h3><p className="mt-1 text-[10px] text-black/45">Each image has its own linked products, default size, colour and quantity.</p></div>
              <span className="text-[10px] font-bold uppercase text-black/45">{collectionLooks.length} images</span>
            </div>
            <div className="space-y-3">
              {collectionLooks.map((look) => <CollectionLookEditor key={look.id} collection={collection} look={look} looksCount={collectionLooks.length} products={products} session={session} busy={busy} perform={perform} />)}
              <CollectionLookEditor key={`new-${collection.id}`} collection={collection} looksCount={collectionLooks.length} products={products} session={session} busy={busy} perform={perform} />
            </div>
            <div className="flex flex-wrap gap-2 border-t border-black/10 pt-4">
              <button type="button" className={secondaryClass} disabled={busy} onClick={() => void perform(() => adminWrite(`collections?id=eq.${collection.id}`, session, "PATCH", { show_homepage: !collection.show_homepage }), collection.show_homepage ? "Collection hidden from homepage." : "Collection shown on homepage.")}>{collection.show_homepage ? "Hide from homepage" : "Show on homepage"}</button>
              <button type="button" className={secondaryClass} disabled={busy} onClick={() => void perform(() => adminWrite(`collections?id=eq.${collection.id}`, session, "PATCH", { is_active: !collection.is_active }), collection.is_active ? "Collection paused." : "Collection activated.")}>{collection.is_active ? "Pause collection" : "Activate collection"}</button>
              <button type="button" className={secondaryClass} disabled={busy} onClick={() => { if (confirm(`Delete collection “${collection.title}” and all its nested lookbook images?`)) void perform(() => adminWrite(`collections?id=eq.${collection.id}`, session, "DELETE"), "Collection and its lookbook images deleted."); }}><Trash2 className="h-4 w-4" /> Delete collection</button>
            </div>
          </div>
        </details>;
      })}
      {!active.length && <Empty title="No collections found" detail="Create a collection with the form below." />}
    </div>
    <form onSubmit={add} className="grid gap-3 border border-black/10 bg-[#F7F3EC] p-4 md:grid-cols-2">
      <div className="md:col-span-2"><h3 className="text-sm font-black">Add collection</h3><p className="mt-1 text-[10px] text-black/45">A new collection starts with an empty lookbook. Add its editorial images after saving.</p></div>
      <Field label="Collection name" name="title" value={draft.title} required onChange={(v) => setDraft({ ...draft, title: v, slug: slugify(v) })} />
      <Field label="Slug" name="slug" value={draft.slug} onChange={(v) => setDraft({ ...draft, slug: v })} />
      <Field label="Campaign label" name="campaign_label" value={draft.campaign_label} onChange={(v) => setDraft({ ...draft, campaign_label: v })} />
      <Field label="Display order" name="sort_order" type="number" value={draft.sort_order} onChange={(v) => setDraft({ ...draft, sort_order: v })} />
      <div className="space-y-2 md:col-span-2"><ImageUrlField label="Collection cover image URL" name="image_url" value={draft.image_url} onChange={(v) => setDraft({ ...draft, image_url: v })} /><UploadField label="Upload collection cover" session={session} folder="collections" busy={busy} onUploaded={(url) => setDraft((d) => ({ ...d, image_url: url }))} /></div>
      <div className="md:col-span-2"><TextField label="Description" name="description" value={draft.description} onChange={(v) => setDraft({ ...draft, description: v })} /></div>
      <Field label="Starts" name="starts_at" type="datetime-local" value={draft.starts_at} onChange={(v) => setDraft({ ...draft, starts_at: v })} />
      <Field label="Ends" name="ends_at" type="datetime-local" value={draft.ends_at} onChange={(v) => setDraft({ ...draft, ends_at: v })} />
      <button className={buttonClass} disabled={busy || !draft.title.trim()}><Plus className="h-4 w-4" /> Create collection</button>
    </form>
  </>;
}

function CollectionDetailsEditor({ collection, session, busy, perform }: {
  collection: AdminCollection; session: AdminSession; busy: boolean;
  perform: (action: () => Promise<unknown>, message: string) => Promise<void>;
}) {
  const [draft, setDraft] = useState({
    title: collection.title, slug: collection.slug, description: collection.description ?? "",
    image_url: collection.image_url ?? "", campaign_label: collection.campaign_label ?? "",
    sort_order: String(collection.sort_order), starts_at: dateInputValue(collection.starts_at), ends_at: dateInputValue(collection.ends_at),
  });
  useEffect(() => setDraft({
    title: collection.title, slug: collection.slug, description: collection.description ?? "",
    image_url: collection.image_url ?? "", campaign_label: collection.campaign_label ?? "",
    sort_order: String(collection.sort_order), starts_at: dateInputValue(collection.starts_at), ends_at: dateInputValue(collection.ends_at),
  }), [collection]);
  async function save(event: FormEvent) {
    event.preventDefault();
    await perform(() => adminWrite(`collections?id=eq.${collection.id}`, session, "PATCH", {
      ...draft, slug: slugify(draft.slug || draft.title), sort_order: Number(draft.sort_order),
      starts_at: draft.starts_at ? new Date(draft.starts_at).toISOString() : null,
      ends_at: draft.ends_at ? new Date(draft.ends_at).toISOString() : null,
    }), "Collection details saved.");
  }
  return <form onSubmit={save} className="grid gap-3 border-b border-black/10 pb-5 sm:grid-cols-2">
    <div className="sm:col-span-2"><p className="text-[9px] font-bold uppercase tracking-[.16em] text-black/45">Collection details</p></div>
    <Field label="Collection name" name="title" value={draft.title} required onChange={(v) => setDraft({ ...draft, title: v })} />
    <Field label="Slug" name="slug" value={draft.slug} onChange={(v) => setDraft({ ...draft, slug: v })} />
    <Field label="Campaign label" name="campaign_label" value={draft.campaign_label} onChange={(v) => setDraft({ ...draft, campaign_label: v })} />
    <Field label="Display order" name="sort_order" type="number" value={draft.sort_order} onChange={(v) => setDraft({ ...draft, sort_order: v })} />
    <div className="space-y-2 sm:col-span-2"><ImageUrlField label="Collection cover image URL" name="image_url" value={draft.image_url} onChange={(v) => setDraft({ ...draft, image_url: v })} /><UploadField label="Replace collection cover" session={session} folder="collections" busy={busy} onUploaded={(url) => setDraft((d) => ({ ...d, image_url: url }))} /></div>
    <div className="sm:col-span-2"><TextField label="Description" name="description" value={draft.description} onChange={(v) => setDraft({ ...draft, description: v })} /></div>
    <Field label="Starts" name="starts_at" type="datetime-local" value={draft.starts_at} onChange={(v) => setDraft({ ...draft, starts_at: v })} />
    <Field label="Ends" name="ends_at" type="datetime-local" value={draft.ends_at} onChange={(v) => setDraft({ ...draft, ends_at: v })} />
    <button className={buttonClass} disabled={busy || !draft.title.trim()}><Save className="h-4 w-4" /> Save collection</button>
  </form>;
}

function CollectionLookEditor({ collection, look, looksCount, products, session, busy, perform }: {
  collection: AdminCollection; look?: AdminLook; looksCount: number; products: AdminProduct[]; session: AdminSession; busy: boolean;
  perform: (action: () => Promise<unknown>, message: string) => Promise<void>;
}) {
  const [draft, setDraft] = useState({
    title: look?.title ?? "", slug: look?.slug ?? "", description: look?.description ?? "",
    image_url: look?.image_url ?? "", alt_text: look?.alt_text ?? "",
    season: look?.season ?? collectionSeason(collection.slug) ?? "",
    sort_order: String(look?.sort_order ?? looksCount), is_active: look?.is_active ?? true,
    starts_at: dateInputValue(look?.starts_at ?? null), ends_at: dateInputValue(look?.ends_at ?? null),
  });
  const [linked, setLinked] = useState((look?.lookbook_look_products ?? []).slice().sort((a, b) => a.sort_order - b.sort_order).map((item) => ({
    product_id: item.product_id, default_size: item.default_size ?? "", default_color: item.default_color ?? "", default_quantity: String(item.default_quantity ?? 1),
  })));
  const [query, setQuery] = useState("");
  useEffect(() => {
    setDraft({
      title: look?.title ?? "", slug: look?.slug ?? "", description: look?.description ?? "",
      image_url: look?.image_url ?? "", alt_text: look?.alt_text ?? "",
      season: look?.season ?? collectionSeason(collection.slug) ?? "",
      sort_order: String(look?.sort_order ?? looksCount), is_active: look?.is_active ?? true,
      starts_at: dateInputValue(look?.starts_at ?? null), ends_at: dateInputValue(look?.ends_at ?? null),
    });
    setLinked((look?.lookbook_look_products ?? []).slice().sort((a, b) => a.sort_order - b.sort_order).map((item) => ({
      product_id: item.product_id, default_size: item.default_size ?? "", default_color: item.default_color ?? "", default_quantity: String(item.default_quantity ?? 1),
    })));
  }, [look, collection.slug, looksCount]);

  function toggleProduct(product: AdminProduct) {
    setLinked((current) => current.some((item) => item.product_id === product.id)
      ? current.filter((item) => item.product_id !== product.id)
      : [...current, { product_id: product.id, default_size: product.sizes[0] ?? "", default_color: product.colors[0]?.name ?? "", default_quantity: "1" }]);
  }
  async function save(event: FormEvent) {
    event.preventDefault();
    if (!draft.season) throw new Error("Choose a season for this lookbook image.");
    if (!draft.image_url.trim()) throw new Error("Add a lookbook image before saving.");
    if (!linked.length) throw new Error("Add at least one product to this image.");
    const payload = {
      ...(look ? { id: look.id } : {}), ...draft, collection_id: collection.id,
      slug: slugify(draft.slug || draft.title), sort_order: Number(draft.sort_order),
      starts_at: draft.starts_at ? new Date(draft.starts_at).toISOString() : null,
      ends_at: draft.ends_at ? new Date(draft.ends_at).toISOString() : null,
    };
    const associations = linked.map((item) => ({
      product_id: item.product_id, default_size: item.default_size || null,
      default_color: item.default_color || null, default_quantity: Number(item.default_quantity) || 1,
    }));
    await perform(() => adminRpc<string>("save_lookbook_look", session, { p_look: payload, p_products: associations }), look ? "Lookbook image and product set saved." : "Lookbook image created with its product set.");
  }
  const visibleProducts = products.filter((product) => product.is_active && `${product.name} ${product.slug} ${product.sku ?? ""}`.toLowerCase().includes(query.toLowerCase()));
  return <details className="group border border-black/10 bg-white/55" defaultOpen={!look}>
    <summary className="flex cursor-pointer list-none items-center gap-3 p-3 [&::-webkit-details-marker]:hidden">
      {look?.image_url ? <img src={look.image_url} alt="" className="h-16 w-12 shrink-0 object-cover" /> : <div className="grid h-16 w-12 shrink-0 place-items-center bg-[#E8E1D6]"><ImagePlus className="h-4 w-4 text-black/35" /></div>}
      <span className="min-w-0 flex-1"><span className="block truncate text-xs font-black">{look?.title || "Add a lookbook image"}</span><span className="mt-1 block text-[10px] text-black/45">{look ? `${look.slug} · ${linked.length} products · ${look.is_active ? "Published" : "Hidden"}` : "New editorial image · add its own products"}</span></span>
      <ChevronRight className="h-4 w-4 shrink-0 text-black/45 transition-transform group-open:rotate-90" />
    </summary>
    <form onSubmit={(event) => { void save(event).catch((error: unknown) => window.alert(error instanceof Error ? error.message : "Could not save this lookbook image.")); }} className="grid gap-3 border-t border-black/10 p-4 md:grid-cols-2">
      <Field label="Image title" name="title" value={draft.title} required onChange={(value) => setDraft((d) => ({ ...d, title: value, slug: look ? d.slug : slugify(value) }))} />
      <Field label="URL slug" name="slug" value={draft.slug} onChange={(value) => setDraft((d) => ({ ...d, slug: value }))} />
      <label className={labelClass}>Season<select required className={inputClass} value={draft.season} onChange={(event) => setDraft((d) => ({ ...d, season: event.target.value }))}><option value="">Choose season</option><option value="spring">Spring</option><option value="summer">Summer</option><option value="festive">Festive</option><option value="monsoon">Monsoon</option><option value="winter">Winter</option></select></label>
      <Field label="Display order" name="sort_order" type="number" value={draft.sort_order} onChange={(value) => setDraft((d) => ({ ...d, sort_order: value }))} />
      <div className="md:col-span-2"><TextField label="Description" name="description" value={draft.description} onChange={(value) => setDraft((d) => ({ ...d, description: value }))} /></div>
      <div className="space-y-2 md:col-span-2"><ImageUrlField label="Lookbook image URL" name="image_url" value={draft.image_url} onChange={(value) => setDraft((d) => ({ ...d, image_url: value }))} /><UploadField label="Upload lookbook image" session={session} folder="lookbook" busy={busy} onUploaded={(url) => setDraft((d) => ({ ...d, image_url: url }))} /></div>
      {draft.image_url && <img src={draft.image_url} alt={draft.alt_text || draft.title} className="h-48 w-full bg-[#E8E1D6] object-cover md:col-span-2" />}
      <div className="md:col-span-2"><Field label="Image alt text" name="alt_text" value={draft.alt_text} onChange={(value) => setDraft((d) => ({ ...d, alt_text: value }))} /></div>
      <label className={labelClass}>Visibility<select className={inputClass} value={draft.is_active ? "active" : "hidden"} onChange={(event) => setDraft((d) => ({ ...d, is_active: event.target.value === "active" }))}><option value="active">Published</option><option value="hidden">Hidden</option></select></label>
      <Field label="Publish from" name="starts_at" type="datetime-local" value={draft.starts_at} onChange={(value) => setDraft((d) => ({ ...d, starts_at: value }))} />
      <Field label="Unpublish at" name="ends_at" type="datetime-local" value={draft.ends_at} onChange={(value) => setDraft((d) => ({ ...d, ends_at: value }))} />
      <section className="space-y-3 border-t border-black/10 pt-4 md:col-span-2">
        <div className="flex flex-wrap items-center justify-between gap-2"><div><h4 className="text-xs font-black uppercase tracking-wider">Products attached to this image</h4><p className="mt-1 text-[10px] text-black/45">Product selection is independent for every lookbook image.</p></div><span className="text-[10px] font-bold">{linked.length} selected</span></div>
        <input className={inputClass} placeholder="Search catalogue products" value={query} onChange={(event) => setQuery(event.target.value)} />
        <div className="grid max-h-[460px] gap-2 overflow-y-auto sm:grid-cols-2">
          {visibleProducts.map((product) => {
            const item = linked.find((entry) => entry.product_id === product.id);
            return <ProductSelectionCard key={product.id} product={product} checked={!!item} onChange={() => toggleProduct(product)}>
              {item && <div className="grid grid-cols-3 gap-2">
                <label className={labelClass}>Default size<select className={inputClass} value={item.default_size} onChange={(event) => setLinked((current) => current.map((entry) => entry.product_id === product.id ? { ...entry, default_size: event.target.value } : entry))}><option value="">Choose in drawer</option>{product.sizes.map((size) => <option key={size}>{size}</option>)}</select></label>
                <label className={labelClass}>Default colour<select className={inputClass} value={item.default_color} onChange={(event) => setLinked((current) => current.map((entry) => entry.product_id === product.id ? { ...entry, default_color: event.target.value } : entry))}><option value="">Choose in drawer</option>{product.colors.map((color) => <option key={color.name}>{color.name}</option>)}</select></label>
                <label className={labelClass}>Qty<input className={inputClass} type="number" min="1" max="10" value={item.default_quantity} onChange={(event) => setLinked((current) => current.map((entry) => entry.product_id === product.id ? { ...entry, default_quantity: event.target.value } : entry))} /></label>
              </div>}
              {item && (product.is_out_of_stock || product.stock_quantity === 0) && <p className="mt-2 text-[10px] font-bold text-red-700">Currently out of stock — customers cannot add it.</p>}
            </ProductSelectionCard>;
          })}
        </div>
      </section>
      <div className="flex flex-wrap gap-2 border-t border-black/10 pt-4 md:col-span-2">
        <button className={buttonClass} disabled={busy || !draft.title.trim() || !draft.season || !draft.image_url.trim() || !linked.length}><Save className="h-4 w-4" /> Save image & products</button>
        {look && <button type="button" className={secondaryClass} disabled={busy} onClick={() => { if (confirm(`Delete lookbook image “${look.title}” and its product links?`)) void perform(() => adminWrite(`lookbook_looks?id=eq.${look.id}`, session, "DELETE"), "Lookbook image deleted."); }}><Trash2 className="h-4 w-4" /> Delete image</button>}
      </div>
    </form>
  </details>;
}

function BrandsPanel({ brands, products, orders, onManageProducts, session, busy, perform }: { brands: AdminBrand[]; products: AdminProduct[]; orders: AdminOrder[]; onManageProducts: (brandId: string) => void; session: AdminSession; busy: boolean; perform: (action: () => Promise<unknown>, message: string) => Promise<void> }) {
  const [selected, setSelected] = useState<AdminBrand | null>(null);
  const [draft, setDraft] = useState({ name: "", slug: "", description: "", motto: "", logo_url: "", image_url: "", website_url: "", instagram_url: "", facebook_url: "", tiktok_url: "", youtube_url: "", whatsapp_url: "", contact_email: "", contact_phone: "", contact_address: "", sort_order: String(brands.length + 1), is_active: true });
  useEffect(() => { if (selected) setDraft({ name: selected.name, slug: selected.slug, description: selected.description ?? "", motto: selected.motto ?? "", logo_url: selected.logo_url ?? "", image_url: selected.image_url ?? "", website_url: selected.website_url ?? "", instagram_url: selected.instagram_url ?? "", facebook_url: selected.facebook_url ?? "", tiktok_url: selected.social_links?.tiktok ?? "", youtube_url: selected.social_links?.youtube ?? "", whatsapp_url: selected.social_links?.whatsapp ?? "", contact_email: selected.contact_email ?? "", contact_phone: selected.contact_phone ?? "", contact_address: selected.contact_address ?? "", sort_order: String(selected.sort_order), is_active: selected.is_active }); }, [selected]);
  const brandProducts = selected ? products.filter((p) => p.brand_id === selected.id) : [];
  const brandOrderItems = selected ? orders.filter((order) => order.payment_status === "paid" && order.fulfillment_status !== "cancelled" && order.fulfillment_status !== "returned").flatMap((order) => (order.order_items ?? []).filter((item) => item.brand_name === selected.name)) : [];
  const brandRevenue = brandOrderItems.reduce((sum, item) => sum + Number(item.line_total), 0);
  const brandUnits = brandOrderItems.reduce((sum, item) => sum + item.quantity, 0);
  async function save(e: FormEvent) { e.preventDefault(); const { tiktok_url, youtube_url, whatsapp_url, ...brandFields } = draft; const payload = { ...brandFields, slug: slugify(draft.slug || draft.name), sort_order: Number(draft.sort_order), social_links: { ...(selected?.social_links ?? {}), instagram: draft.instagram_url, facebook: draft.facebook_url, tiktok: tiktok_url, youtube: youtube_url, whatsapp: whatsapp_url, website: draft.website_url } }; await perform(() => selected ? adminWrite(`brands?id=eq.${selected.id}`, session, "PATCH", payload) : adminWrite("brands", session, "POST", payload), selected ? "Brand updated." : "Brand created."); }
  return <><PanelHeading eyebrow="Brand portfolio" title="Individual brand workspaces" detail="Add as many labels as needed. Each brand has its own imagery, contact details, social links and linked product catalogue." action={<button className={buttonClass} onClick={() => { setSelected(null); setDraft({ name: "", slug: "", description: "", motto: "", logo_url: "", image_url: "", website_url: "", instagram_url: "", facebook_url: "", tiktok_url: "", youtube_url: "", whatsapp_url: "", contact_email: "", contact_phone: "", contact_address: "", sort_order: String(brands.length + 1), is_active: true }); }}><Plus className="h-4 w-4" /> Add brand</button>} />
    <div className="grid gap-3 sm:grid-cols-2 2xl:grid-cols-3">{brands.map((b) => <button key={b.id} onClick={() => setSelected(b)} className={`border p-4 text-left transition hover:border-black ${selected?.id === b.id ? "border-black bg-[#D5FE00]/20" : "border-black/10 bg-[#F7F3EC]"}`}><div className="flex items-center gap-3">{b.logo_url ? <img src={b.logo_url} alt="" className="h-12 w-12 object-contain" /> : <div className="grid h-12 w-12 place-items-center bg-[#171717] text-sm font-black text-[#D5FE00]">{b.name.slice(0, 2)}</div>}<div><p className="text-sm font-black">{b.name}</p><p className="mt-1 text-[10px] text-black/45">{products.filter((p) => p.brand_id === b.id).length} products · {b.is_active ? "Active" : "Hidden"}</p></div></div><p className="mt-3 line-clamp-2 text-xs text-black/55">{b.description || "No brand description yet."}</p></button>)}</div>
    <div className="grid gap-5 xl:grid-cols-[minmax(0,1fr)_340px]">
      <form onSubmit={save} className="grid gap-3 border border-black/10 bg-[#F7F3EC] p-4 md:grid-cols-2 md:p-5"><div className="md:col-span-2 flex items-center justify-between"><h3 className="text-sm font-black">{selected ? `Edit ${selected.name}` : "Create brand"}</h3>{selected && <button type="button" onClick={() => setSelected(null)} className="text-xs underline">New brand</button>}</div><Field label="Brand name" name="name" value={draft.name} required onChange={(v) => setDraft({ ...draft, name: v, slug: selected ? draft.slug : slugify(v) })} /><Field label="Slug" name="slug" value={draft.slug} onChange={(v) => setDraft({ ...draft, slug: v })} /><Field label="Motto" name="motto" value={draft.motto} onChange={(v) => setDraft({ ...draft, motto: v })} /><Field label="Display order" name="sort_order" type="number" value={draft.sort_order} onChange={(v) => setDraft({ ...draft, sort_order: v })} /><TextField label="Brand description" name="description" value={draft.description} onChange={(v) => setDraft({ ...draft, description: v })} /><div className="space-y-2"><ImageUrlField label="Logo URL" name="logo_url" value={draft.logo_url} onChange={(v) => setDraft({ ...draft, logo_url: v })} /><UploadField label="Upload brand logo" session={session} folder="brands" busy={busy} onUploaded={(url) => setDraft((d) => ({ ...d, logo_url: url }))} /></div><div className="space-y-2"><ImageUrlField label="Brand image URL" name="image_url" value={draft.image_url} onChange={(v) => setDraft({ ...draft, image_url: v })} /><UploadField label="Upload brand image" session={session} folder="brands" busy={busy} onUploaded={(url) => setDraft((d) => ({ ...d, image_url: url }))} /></div><Field label="Website" name="website_url" value={draft.website_url} onChange={(v) => setDraft({ ...draft, website_url: v })} /><Field label="Instagram" name="instagram_url" value={draft.instagram_url} onChange={(v) => setDraft({ ...draft, instagram_url: v })} /><Field label="Facebook" name="facebook_url" value={draft.facebook_url} onChange={(v) => setDraft({ ...draft, facebook_url: v })} /><Field label="TikTok" name="tiktok_url" value={draft.tiktok_url} onChange={(v) => setDraft({ ...draft, tiktok_url: v })} /><Field label="YouTube" name="youtube_url" value={draft.youtube_url} onChange={(v) => setDraft({ ...draft, youtube_url: v })} /><Field label="WhatsApp" name="whatsapp_url" value={draft.whatsapp_url} onChange={(v) => setDraft({ ...draft, whatsapp_url: v })} /><Field label="Contact email" name="contact_email" value={draft.contact_email} onChange={(v) => setDraft({ ...draft, contact_email: v })} /><Field label="Contact phone" name="contact_phone" value={draft.contact_phone} onChange={(v) => setDraft({ ...draft, contact_phone: v })} /><div className="md:col-span-2"><TextField label="Contact address" name="contact_address" value={draft.contact_address} onChange={(v) => setDraft({ ...draft, contact_address: v })} /></div><label className="flex items-center gap-2 text-xs font-semibold md:col-span-2"><input type="checkbox" checked={draft.is_active} onChange={(e) => setDraft({ ...draft, is_active: e.target.checked })} /> Brand is active on storefront</label><div className="flex flex-wrap gap-2 md:col-span-2"><button className={buttonClass} disabled={busy || !draft.name}><Save className="h-4 w-4" /> Save brand</button>{selected && <button type="button" className={secondaryClass} disabled={busy} onClick={() => { if (confirm(`Delete ${selected.name}? It must have no linked products.`)) void perform(() => adminWrite(`brands?id=eq.${selected.id}`, session, "DELETE"), "Brand deleted."); }}><Trash2 className="h-4 w-4" /> Delete brand</button>}</div></form>
      <div className="border border-black/10 bg-[#171717] p-4 text-[#F0EAE0]"><p className="text-[9px] font-bold uppercase tracking-[0.18em] text-white/45">Brand workspace</p><h3 className="mt-1 text-lg font-black">{selected?.name ?? "Select a brand"}</h3>{selected ? <><p className="mt-1 text-xs text-white/45">{brandProducts.length} linked products</p><div className="mt-4 grid grid-cols-3 gap-2"><div className="bg-white/10 p-2"><p className="text-[9px] uppercase text-white/45">Paid sales</p><p className="mt-1 text-sm font-black text-[#D5FE00]">{money(brandRevenue)}</p></div><div className="bg-white/10 p-2"><p className="text-[9px] uppercase text-white/45">Units</p><p className="mt-1 text-sm font-black">{brandUnits}</p></div><div className="bg-white/10 p-2"><p className="text-[9px] uppercase text-white/45">Products</p><p className="mt-1 text-sm font-black">{brandProducts.length}</p></div></div><div className="mt-4 space-y-2">{brandProducts.map((p) => <div key={p.id} className="flex justify-between gap-2 border-t border-white/10 py-2 text-xs"><span className="truncate">{p.name}</span><span className="shrink-0 text-[#D5FE00]">{money(Number(p.price))}</span></div>)}</div><p className="mt-4 text-[10px] leading-5 text-white/40">Product details, SKU and stock can be managed directly for this brand.</p><button className="mt-3 inline-flex items-center gap-2 bg-[#D5FE00] px-3 py-2 text-xs font-bold text-[#171717]" onClick={() => onManageProducts(selected.id)}>Manage this brand’s products <ChevronRight className="h-4 w-4" /></button></> : <p className="mt-3 text-xs text-white/45">Choose a brand above to see its catalogue and edit its identity.</p>}</div>
    </div>
  </>;
}

function AccountsPanel({ admins, customers, orders, session, busy, perform }: { admins: { user_id: string; created_at: string }[]; customers: CustomerProfile[]; orders: AdminOrder[]; session: AdminSession; busy: boolean; perform: (action: () => Promise<unknown>, message: string) => Promise<void> }) {
  const [userId, setUserId] = useState("");
  return <><PanelHeading eyebrow="People and access" title="Accounts" detail="Administrator access and customer records are shown separately. Admin access can be granted to an existing Supabase Auth user by their Auth user UUID." />
    <div className="grid gap-5 xl:grid-cols-2"><section className="border border-black/10 bg-[#F7F3EC] p-4"><div className="mb-4 flex items-center justify-between"><div><h3 className="text-sm font-black">Admin accounts</h3><p className="mt-1 text-[10px] text-black/45">{admins.length} authorised administrators</p></div></div><form onSubmit={(e) => { e.preventDefault(); void perform(() => adminWrite("admin_users", session, "POST", { user_id: userId.trim() }), "Administrator access granted."); setUserId(""); }} className="mb-4 flex flex-wrap gap-2"><input className="min-w-0 flex-1 border border-black/15 bg-white/60 px-3 py-2 text-xs" placeholder="Existing Auth user UUID" value={userId} onChange={(e) => setUserId(e.target.value)} /><button className={buttonClass} disabled={busy || !/^[0-9a-f-]{36}$/i.test(userId.trim())}><Plus className="h-4 w-4" /> Add admin</button></form><div className="divide-y divide-black/10">{admins.map((a) => <div key={a.user_id} className="flex items-center justify-between gap-3 py-3"><div className="min-w-0"><p className="break-all text-xs font-bold">{a.user_id}</p><p className="mt-1 text-[10px] text-black/45">Added {new Date(a.created_at).toLocaleDateString()}</p></div><button className={secondaryClass} disabled={busy || a.user_id === session.user.id || admins.length < 2} title={a.user_id === session.user.id ? "You cannot remove your own active administrator access." : admins.length < 2 ? "At least one admin must remain." : "Remove admin"} onClick={() => { if (confirm("Remove administrator access for this user?")) void perform(() => adminWrite(`admin_users?user_id=eq.${a.user_id}`, session, "DELETE"), "Administrator access removed."); }}><Trash2 className="h-4 w-4" /></button></div>)}</div><p className="mt-3 text-[10px] leading-5 text-black/45">Create the user in Supabase Authentication first, then paste their Auth user UUID here. This avoids exposing privileged Auth APIs or service keys in the browser.</p></section>
      <section className="border border-black/10 bg-[#F7F3EC] p-4"><div className="mb-4"><h3 className="text-sm font-black">Customer accounts</h3><p className="mt-1 text-[10px] text-black/45">{customers.length} customer records · latest 500</p></div><div className="max-h-[620px] divide-y divide-black/10 overflow-y-auto">{customers.map((c) => <div key={c.id} className="py-3"><div className="flex items-start justify-between gap-3"><div><p className="text-xs font-bold">{c.full_name}</p><p className="mt-1 text-xs">{c.mobile_number}</p><p className="mt-1 whitespace-pre-wrap text-[10px] leading-4 text-black/50">{c.delivery_address}</p><p className="mt-1 text-[10px] text-black/35">Registered {new Date(c.created_at).toLocaleDateString()}</p><p className="mt-1 text-[10px] font-semibold text-black/55">{orders.filter((o) => o.customer_phone.replace(/\D/g, "").slice(-10) === c.mobile_number.replace(/\D/g, "").slice(-10)).length} linked orders</p></div><button className={secondaryClass} disabled={busy} aria-label="Delete customer account" onClick={() => { if (confirm(`Delete customer record for ${c.full_name}?`)) void perform(() => adminWrite(`customer_profiles?id=eq.${c.id}`, session, "DELETE"), "Customer record deleted."); }}><Trash2 className="h-4 w-4" /></button></div></div>)}{!customers.length && <Empty title="No customer accounts yet" detail="Customer registrations will appear here." />}</div><p className="mt-3 text-[10px] leading-5 text-black/45">These are customer profile records, not verified Auth accounts. Phone ownership is not verified and this panel does not create private customer login sessions.</p></section></div>
  </>;
}

function BrandInfoPanel({ settings, session, busy, perform }: { settings?: SiteBrandInfo; session: AdminSession; busy: boolean; perform: (action: () => Promise<unknown>, message: string) => Promise<void> }) {
  const [draft, setDraft] = useState({ motto: settings?.motto ?? "", about_text: settings?.about_text ?? "", address: settings?.address ?? "", contact_numbers: settings?.contact_numbers?.join(", ") ?? "", logo_url: settings?.logo_url ?? "", symbol_url: settings?.symbol_url ?? "", instagram: settings?.social_links?.instagram ?? "", facebook: settings?.social_links?.facebook ?? "", whatsapp: settings?.social_links?.whatsapp ?? "", website: settings?.social_links?.website ?? "", hero_autoplay_ms: String(settings?.hero_autoplay_ms ?? 5000) });
  useEffect(() => { if (settings) setDraft({ motto: settings.motto ?? "", about_text: settings.about_text ?? "", address: settings.address ?? "", contact_numbers: settings.contact_numbers?.join(", ") ?? "", logo_url: settings.logo_url ?? "", symbol_url: settings.symbol_url ?? "", instagram: settings.social_links?.instagram ?? "", facebook: settings.social_links?.facebook ?? "", whatsapp: settings.social_links?.whatsapp ?? "", website: settings.social_links?.website ?? "", hero_autoplay_ms: String(settings.hero_autoplay_ms ?? 5000) }); }, [settings]);
  async function save(e: FormEvent) { e.preventDefault(); const { instagram, facebook, whatsapp, website, ...rest } = draft; await perform(() => adminWrite("site_brand_info?id=eq.1", session, "PATCH", { ...rest, contact_numbers: rest.contact_numbers.split(",").map((v) => v.trim()).filter(Boolean), hero_autoplay_ms: Number(rest.hero_autoplay_ms), social_links: { instagram, facebook, whatsapp, website } }), "Main ISHTILE brand information saved."); }
  return <><PanelHeading eyebrow="Website identity" title="Brand info" detail="This section controls the main ISHTILE identity shown across the website. Individual label details remain in Brands." />
    <form onSubmit={save} className="grid gap-4 border border-black/10 bg-[#F7F3EC] p-4 md:grid-cols-2 md:p-6"><div className="md:col-span-2"><Field label="Main motto / tagline" name="motto" value={draft.motto} onChange={(v) => setDraft({ ...draft, motto: v })} /></div><div className="md:col-span-2"><TextField label="About ISHTILE" name="about_text" rows={6} value={draft.about_text} onChange={(v) => setDraft({ ...draft, about_text: v })} /></div><TextField label="Business address" name="address" value={draft.address} onChange={(v) => setDraft({ ...draft, address: v })} /><Field label="Contact numbers (comma separated)" name="contact_numbers" value={draft.contact_numbers} onChange={(v) => setDraft({ ...draft, contact_numbers: v })} /><div className="space-y-2"><ImageUrlField label="Main logo URL" name="logo_url" value={draft.logo_url} onChange={(v) => setDraft({ ...draft, logo_url: v })} /><UploadField label="Upload main logo" session={session} folder="brand-info" busy={busy} onUploaded={(url) => setDraft((d) => ({ ...d, logo_url: url }))} /></div><div className="space-y-2"><ImageUrlField label="Brand symbol URL" name="symbol_url" value={draft.symbol_url} onChange={(v) => setDraft({ ...draft, symbol_url: v })} /><UploadField label="Upload brand symbol" session={session} folder="brand-info" busy={busy} onUploaded={(url) => setDraft((d) => ({ ...d, symbol_url: url }))} /></div><Field label="Instagram URL" name="instagram" value={draft.instagram} onChange={(v) => setDraft({ ...draft, instagram: v })} /><Field label="Facebook URL" name="facebook" value={draft.facebook} onChange={(v) => setDraft({ ...draft, facebook: v })} /><Field label="WhatsApp URL" name="whatsapp" value={draft.whatsapp} onChange={(v) => setDraft({ ...draft, whatsapp: v })} /><Field label="Website URL" name="website" value={draft.website} onChange={(v) => setDraft({ ...draft, website: v })} /><div className="md:col-span-2"><button className={buttonClass} disabled={busy}><Save className="h-4 w-4" /> Save brand information</button></div></form>
  </>;
}
function Empty({ title, detail }: { title: string; detail: string }) {
  return <div className="border border-dashed border-black/15 px-5 py-12 text-center"><p className="text-sm font-bold">{title}</p><p className="mx-auto mt-2 max-w-sm text-xs leading-5 text-black/45">{detail}</p></div>;
}
