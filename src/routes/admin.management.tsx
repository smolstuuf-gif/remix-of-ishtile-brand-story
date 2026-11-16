import { useCallback, useEffect, useState, type FormEvent, type ReactNode } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import {
  ArrowLeft, Check, ChevronRight, ImagePlus, LoaderCircle, LogOut, Plus, RefreshCw,
  Save, Trash2, Upload, X,
} from "lucide-react";
import { AccountAccess } from "@/components/account/AccountAccess";
import { restoreAdminSession, signOutAdmin, type AdminSession } from "@/lib/supabase-admin";
import {
  adminData, adminWrite, loadAdminWorkspace, slugify, uploadAdminMedia,
  type AdminBrand, type AdminCollection, type AdminProduct, type CustomerProfile,
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

function ManagementPage() {
  const [session, setSession] = useState<AdminSession | null>(null);
  const [checking, setChecking] = useState(true);
  const [tab, setTab] = useState<Tab>("products");
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
      <div className="flex min-h-screen">
        <aside className="hidden w-[250px] shrink-0 flex-col bg-[#171717] px-5 py-7 text-[#F0EAE0] lg:flex">
          <Link to="/admin" className="flex items-center gap-2 text-xs font-semibold text-white/55 hover:text-[#D5FE00]"><ArrowLeft className="h-4 w-4" /> Dashboard</Link>
          <div className="mt-8 font-display text-2xl font-black tracking-[-0.07em]">ISHTILE<span className="text-[#D5FE00]">+</span></div>
          <p className="mt-1 text-[9px] font-bold uppercase tracking-[0.24em] text-white/40">Store controls</p>
          <nav className="mt-10 space-y-1">
            {tabs.map((item) => <button key={item.id} onClick={() => setTab(item.id)} className={`flex w-full items-center justify-between px-3 py-3 text-left text-xs font-bold transition ${tab === item.id ? "bg-[#D5FE00] text-[#171717]" : "text-white/65 hover:bg-white/10 hover:text-white"}`}><span>{item.label}</span>{tab === item.id && <ChevronRight className="h-4 w-4" />}</button>)}
          </nav>
          <div className="mt-auto border-t border-white/10 pt-5"><p className="truncate text-xs font-semibold">{session.user.email}</p><button onClick={handleSignOut} className="mt-4 flex items-center gap-2 text-xs text-white/55 hover:text-[#D5FE00]"><LogOut className="h-4 w-4" /> Sign out</button></div>
        </aside>
        <section className="min-w-0 flex-1">
          <header className="sticky top-0 z-20 flex items-center justify-between border-b border-black/10 bg-[#F0EAE0]/95 px-4 py-4 backdrop-blur md:px-8">
            <div><p className="text-[9px] font-bold uppercase tracking-[0.2em] text-black/45">ISHTILE / Operations</p><h1 className="mt-1 font-display text-2xl font-black tracking-[-0.055em] md:text-3xl">{tabs.find((item) => item.id === tab)?.label}<span className="text-black/25">.</span></h1></div>
            <div className="flex items-center gap-2"><Link to="/admin" className={secondaryClass}><ArrowLeft className="h-4 w-4" /> Dashboard</Link><button onClick={() => void refresh()} className={secondaryClass} aria-label="Refresh"><RefreshCw className={`h-4 w-4 ${loading ? "animate-spin" : ""}`} /></button><button onClick={handleSignOut} className={`${secondaryClass} lg:hidden`} aria-label="Sign out"><LogOut className="h-4 w-4" /></button></div>
          </header>
          <div className="border-b border-black/10 bg-[#E8E1D6] px-4 py-2 lg:hidden"><div className="flex gap-2 overflow-x-auto">{tabs.map((item) => <button key={item.id} onClick={() => setTab(item.id)} className={`shrink-0 px-3 py-2 text-[10px] font-bold uppercase tracking-wide ${tab === item.id ? "bg-[#171717] text-white" : "bg-white/60"}`}>{item.label}</button>)}</div></div>
          <div className="space-y-5 px-4 py-6 md:px-8 md:py-8">
            {error && <div role="alert" className="flex items-start justify-between gap-3 border border-red-300 bg-red-50 px-4 py-3 text-sm text-red-800"><span>{error}</span><button onClick={() => setError("")} aria-label="Dismiss"><X className="h-4 w-4" /></button></div>}
            {notice && <div className="flex items-center gap-2 border border-[#171717]/15 bg-[#D5FE00]/35 px-4 py-3 text-sm"><Check className="h-4 w-4" />{notice}</div>}
            {loading && !workspace ? <div className="flex items-center gap-3 py-16 text-sm text-black/55"><LoaderCircle className="h-5 w-5 animate-spin" /> Loading live store records…</div> : workspace && (
              <>
                {tab === "products" && <ProductsPanel products={workspace.products} brands={workspace.brands} session={session} busy={busy} perform={perform} />}
                {tab === "hero" && <HeroPanel slides={workspace.slides} settings={workspace.settings} session={session} busy={busy} perform={perform} />}
                {tab === "collections" && <CollectionsPanel collections={workspace.collections} products={workspace.products} session={session} busy={busy} perform={perform} />}
                {tab === "brands" && <BrandsPanel brands={workspace.brands} products={workspace.products} session={session} busy={busy} perform={perform} />}
                {tab === "accounts" && <AccountsPanel admins={workspace.admins} customers={workspace.customers} session={session} busy={busy} perform={perform} />}
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

function ProductsPanel({ products, brands, session, busy, perform }: { products: AdminProduct[]; brands: AdminBrand[]; session: AdminSession; busy: boolean; perform: (action: () => Promise<unknown>, message: string) => Promise<void> }) {
  const [selected, setSelected] = useState<AdminProduct | null>(null);
  const [query, setQuery] = useState("");
  const [brandFilter, setBrandFilter] = useState("all");
  const [draft, setDraft] = useState({ name: "", slug: "", sku: "", brand_id: brands[0]?.id ?? "", category: "Men", price: "0", stock_quantity: "", image_url: "", description: "", sizes: "S, M, L, XL, XXL", is_active: true });
  useEffect(() => { if (selected) setDraft({ name: selected.name, slug: selected.slug, sku: selected.sku ?? "", brand_id: selected.brand_id, category: selected.category, price: String(selected.price), stock_quantity: selected.stock_quantity === null ? "" : String(selected.stock_quantity), image_url: selected.image_url ?? "", description: selected.description ?? "", sizes: selected.sizes.join(", "), is_active: selected.is_active }); }, [selected]);
  const filtered = products.filter((p) => (brandFilter === "all" || p.brand_id === brandFilter) && `${p.name} ${p.sku ?? ""} ${p.slug}`.toLowerCase().includes(query.toLowerCase()));
  function reset() { setSelected(null); setDraft({ name: "", slug: "", sku: "", brand_id: brands[0]?.id ?? "", category: "Men", price: "0", stock_quantity: "", image_url: "", description: "", sizes: "S, M, L, XL, XXL", is_active: true }); }
  async function save(e: FormEvent) { e.preventDefault(); const payload = { ...draft, slug: slugify(draft.slug || draft.name), price: Number(draft.price), stock_quantity: draft.stock_quantity === "" ? null : Number(draft.stock_quantity), sizes: draft.sizes.split(",").map((v) => v.trim()).filter(Boolean), colors: selected?.colors ?? [], image_urls: draft.image_url ? [draft.image_url] : [] }; await perform(() => selected ? adminWrite(`products?id=eq.${selected.id}`, session, "PATCH", payload) : adminWrite("products", session, "POST", payload), selected ? "Product updated." : "Product added."); if (!busy) reset(); }
  return <><PanelHeading eyebrow="Catalogue" title="Product management" detail="Create, edit, publish, unpublish and remove products. Stock left blank remains untracked, not zero." action={<span className="text-xs text-black/45">{products.length} products</span>} />
    <div className="grid gap-5 xl:grid-cols-[minmax(0,1.1fr)_minmax(340px,0.9fr)]">
      <div className="border border-black/10 bg-[#F7F3EC]">
        <div className="flex flex-wrap gap-2 border-b border-black/10 p-3"><input className="min-w-[150px] flex-1 border border-black/15 bg-white/60 px-3 py-2 text-xs" placeholder="Search products or SKU" value={query} onChange={(e) => setQuery(e.target.value)} /><select className="border border-black/15 bg-white/60 px-3 py-2 text-xs" value={brandFilter} onChange={(e) => setBrandFilter(e.target.value)}><option value="all">All brands</option>{brands.map((b) => <option key={b.id} value={b.id}>{b.name}</option>)}</select></div>
        <div className="max-h-[680px] divide-y divide-black/10 overflow-y-auto">{filtered.map((p) => <button key={p.id} onClick={() => setSelected(p)} className={`flex w-full items-center gap-3 p-3 text-left hover:bg-black/[0.035] ${selected?.id === p.id ? "bg-[#D5FE00]/20" : ""}`}><div className="grid h-12 w-12 shrink-0 place-items-center overflow-hidden bg-[#E8E1D6]">{p.image_url ? <img src={p.image_url} alt="" className="h-full w-full object-cover" /> : <ImagePlus className="h-4 w-4 text-black/30" />}</div><div className="min-w-0 flex-1"><p className="truncate text-xs font-bold">{p.name}</p><p className="mt-1 text-[10px] text-black/45">{brands.find((b) => b.id === p.brand_id)?.name ?? "Unassigned"} · {p.sku || "No SKU"}</p></div><div className="text-right"><p className="text-xs font-bold">{money(Number(p.price))}</p><p className="mt-1 text-[10px] text-black/45">{p.stock_quantity === null ? "Stock —" : `${p.stock_quantity} in stock`}</p></div></button>)}</div>
      </div>
      <form onSubmit={save} className="space-y-4 border border-black/10 bg-[#F7F3EC] p-4 md:p-5">
        <div className="flex items-center justify-between"><h3 className="text-sm font-black">{selected ? "Edit product" : "New product"}</h3>{selected && <button type="button" onClick={reset} className="text-xs underline">Clear selection</button>}</div>
        <Field label="Product name" name="name" value={draft.name} required onChange={(v) => setDraft({ ...draft, name: v, slug: selected ? draft.slug : slugify(v) })} />
        <div className="grid grid-cols-2 gap-3"><Field label="Product slug" name="slug" value={draft.slug} onChange={(v) => setDraft({ ...draft, slug: v })} /><Field label="Product code / SKU" name="sku" value={draft.sku} onChange={(v) => setDraft({ ...draft, sku: v })} /></div>
        <div className="grid grid-cols-2 gap-3"><label className={labelClass}>Brand<select className={inputClass} value={draft.brand_id} onChange={(e) => setDraft({ ...draft, brand_id: e.target.value })}>{brands.map((b) => <option key={b.id} value={b.id}>{b.name}</option>)}</select></label><label className={labelClass}>Category<select className={inputClass} value={draft.category} onChange={(e) => setDraft({ ...draft, category: e.target.value })}>{["Men","Women","Accessories","Traditional"].map((v) => <option key={v}>{v}</option>)}</select></label></div>
        <div className="grid grid-cols-2 gap-3"><Field label="Price (BDT)" name="price" type="number" value={draft.price} onChange={(v) => setDraft({ ...draft, price: v })} /><Field label="Stock quantity (blank = untracked)" name="stock_quantity" type="number" value={draft.stock_quantity} onChange={(v) => setDraft({ ...draft, stock_quantity: v })} /></div>
        <Field label="Primary image URL" name="image_url" value={draft.image_url} onChange={(v) => setDraft({ ...draft, image_url: v })} />
        <UploadField label="Upload product image" session={session} folder="products" busy={busy} onUploaded={(url) => setDraft((d) => ({ ...d, image_url: url }))} />
        <Field label="Available sizes (comma separated)" name="sizes" value={draft.sizes} onChange={(v) => setDraft({ ...draft, sizes: v })} />
        <TextField label="Description" name="description" value={draft.description} onChange={(v) => setDraft({ ...draft, description: v })} />
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
      <form onSubmit={addSlide} className="space-y-3 border border-black/10 bg-[#F7F3EC] p-4"><h3 className="text-sm font-black">Add hero slide</h3><Field label="Title" name="title" value={draft.title} onChange={(v) => setDraft({ ...draft, title: v })} /><Field label="Subtitle" name="subtitle" value={draft.subtitle} onChange={(v) => setDraft({ ...draft, subtitle: v })} /><Field label="Desktop image URL" name="image_url" value={draft.image_url} required onChange={(v) => setDraft({ ...draft, image_url: v })} /><UploadField label="Upload desktop image" session={session} folder="hero" busy={busy} onUploaded={(url) => setDraft((d) => ({ ...d, image_url: url }))} /><Field label="Mobile image URL (optional)" name="mobile_image_url" value={draft.mobile_image_url} onChange={(v) => setDraft({ ...draft, mobile_image_url: v })} /><UploadField label="Upload mobile image" session={session} folder="hero" busy={busy} onUploaded={(url) => setDraft((d) => ({ ...d, mobile_image_url: url }))} /><Field label="Link URL" name="link_url" value={draft.link_url} onChange={(v) => setDraft({ ...draft, link_url: v })} /><Field label="Display order" name="sort_order" type="number" value={draft.sort_order} onChange={(v) => setDraft({ ...draft, sort_order: v })} /><div className="grid grid-cols-2 gap-2"><Field label="Starts" name="starts_at" type="datetime-local" value={draft.starts_at} onChange={(v) => setDraft({ ...draft, starts_at: v })} /><Field label="Ends" name="ends_at" type="datetime-local" value={draft.ends_at} onChange={(v) => setDraft({ ...draft, ends_at: v })} /></div><button className={buttonClass} disabled={busy || !draft.image_url}><Plus className="h-4 w-4" /> Add slide</button></form>
    </div>
  </>;
}

function CollectionsPanel({ collections, products, session, busy, perform }: { collections: AdminCollection[]; products: AdminProduct[]; session: AdminSession; busy: boolean; perform: (action: () => Promise<unknown>, message: string) => Promise<void> }) {
  const [draft, setDraft] = useState({ title: "", slug: "", description: "", image_url: "", campaign_label: "", sort_order: String(collections.length), starts_at: "", ends_at: "" });
  const [selected, setSelected] = useState<AdminCollection | null>(null);
  const [chosen, setChosen] = useState<string[]>([]);
  const [collectionDraft, setCollectionDraft] = useState({ title: "", slug: "", description: "", image_url: "", campaign_label: "", sort_order: "0" });
  const [filter, setFilter] = useState("all");
  const active = collections.filter((c) => filter === "all" || (filter === "home" ? c.show_homepage : !c.show_homepage));
  useEffect(() => { setChosen(selected?.collection_products?.map((x) => x.product_id) ?? []); if (selected) setCollectionDraft({ title: selected.title, slug: selected.slug, description: selected.description ?? "", image_url: selected.image_url ?? "", campaign_label: selected.campaign_label ?? "", sort_order: String(selected.sort_order) }); }, [selected]);
  async function add(e: FormEvent) { e.preventDefault(); await perform(() => adminWrite("collections", session, "POST", { ...draft, slug: slugify(draft.slug || draft.title), sort_order: Number(draft.sort_order), show_homepage: false, is_active: true, starts_at: draft.starts_at ? new Date(draft.starts_at).toISOString() : null, ends_at: draft.ends_at ? new Date(draft.ends_at).toISOString() : null }), "Collection campaign added."); setDraft({ title: "", slug: "", description: "", image_url: "", campaign_label: "", sort_order: String(collections.length + 1), starts_at: "", ends_at: "" }); }
  async function saveProducts() { if (!selected) return; await perform(async () => { await adminWrite(`collection_products?collection_id=eq.${selected.id}`, session, "DELETE"); if (chosen.length) await adminWrite("collection_products", session, "POST", chosen.map((product_id, sort_order) => ({ collection_id: selected.id, product_id, sort_order }))); }, "Collection products updated."); }
  async function saveCollectionDetails(e: FormEvent) { e.preventDefault(); if (!selected) return; await perform(() => adminWrite(`collections?id=eq.${selected.id}`, session, "PATCH", { ...collectionDraft, slug: slugify(collectionDraft.slug || collectionDraft.title), sort_order: Number(collectionDraft.sort_order) }), "Collection details updated."); }
  return <><PanelHeading eyebrow="Homepage campaigns" title="Collection controls" detail="Manage current and previous campaigns, homepage visibility, campaign dates, artwork and the products inside each collection." action={<select className="border border-black/15 bg-white/60 px-3 py-2 text-xs" value={filter} onChange={(e) => setFilter(e.target.value)}><option value="all">All collections</option><option value="home">Homepage only</option><option value="hidden">Not on homepage</option></select>} />
    <div className="grid gap-5 xl:grid-cols-[minmax(0,1fr)_360px]"><div className="space-y-3">{active.map((c) => <div key={c.id} className={`border bg-[#F7F3EC] p-4 ${selected?.id === c.id ? "border-black" : "border-black/10"}`}><div className="flex flex-wrap items-center gap-3">{c.image_url && <img src={c.image_url} alt="" className="h-16 w-24 object-cover" />}<div className="min-w-[140px] flex-1"><p className="text-sm font-bold">{c.title}</p><p className="mt-1 text-[10px] text-black/45">{c.campaign_label || "Campaign"} · {c.collection_products?.length ?? 0} products</p><p className="mt-1 text-[10px] text-black/45">{c.is_active ? "Active" : "Inactive"} · {c.show_homepage ? "Shown on homepage" : "Hidden from homepage"}</p></div><button className={secondaryClass} onClick={() => setSelected(c)}>Edit products</button><button className={secondaryClass} disabled={busy} onClick={() => void perform(() => adminWrite(`collections?id=eq.${c.id}`, session, "PATCH", { show_homepage: !c.show_homepage }), c.show_homepage ? "Collection hidden from homepage." : "Collection shown on homepage.")}>{c.show_homepage ? "Hide" : "Show"}</button><button className={secondaryClass} disabled={busy} onClick={() => void perform(() => adminWrite(`collections?id=eq.${c.id}`, session, "PATCH", { is_active: !c.is_active }), c.is_active ? "Campaign paused." : "Campaign activated.")}>{c.is_active ? "Pause" : "Activate"}</button><button className={secondaryClass} disabled={busy} onClick={() => { if (confirm(`Delete collection ${c.title}?`)) void perform(() => adminWrite(`collections?id=eq.${c.id}`, session, "DELETE"), "Collection deleted."); }}><Trash2 className="h-4 w-4" /></button></div></div>)}{!active.length && <Empty title="No collections found" detail="Create a campaign with the form." />}
      {selected && <div className="space-y-5 border border-black/10 bg-white/60 p-4">
        <form onSubmit={saveCollectionDetails} className="grid gap-3 border-b border-black/10 pb-5 sm:grid-cols-2">
          <div className="flex items-center justify-between sm:col-span-2"><h3 className="text-sm font-black">Edit {selected.title}</h3><button type="button" onClick={() => setSelected(null)} className="text-xs underline">Close</button></div>
          <Field label="Collection title" name="title" value={collectionDraft.title} required onChange={(v) => setCollectionDraft({ ...collectionDraft, title: v })} />
          <Field label="Slug" name="slug" value={collectionDraft.slug} onChange={(v) => setCollectionDraft({ ...collectionDraft, slug: v })} />
          <Field label="Campaign label" name="campaign_label" value={collectionDraft.campaign_label} onChange={(v) => setCollectionDraft({ ...collectionDraft, campaign_label: v })} />
          <Field label="Display order" name="sort_order" type="number" value={collectionDraft.sort_order} onChange={(v) => setCollectionDraft({ ...collectionDraft, sort_order: v })} />
          <div className="space-y-2 sm:col-span-2"><Field label="Collection image URL" name="image_url" value={collectionDraft.image_url} onChange={(v) => setCollectionDraft({ ...collectionDraft, image_url: v })} /><UploadField label="Replace collection artwork" session={session} folder="collections" busy={busy} onUploaded={(url) => setCollectionDraft((d) => ({ ...d, image_url: url }))} /></div>
          <div className="sm:col-span-2"><TextField label="Description" name="description" value={collectionDraft.description} onChange={(v) => setCollectionDraft({ ...collectionDraft, description: v })} /></div>
          <button className={buttonClass} disabled={busy || !collectionDraft.title}><Save className="h-4 w-4" /> Save collection details</button>
        </form>
        <div><div className="mb-3 flex items-center justify-between"><h3 className="text-sm font-black">Products in {selected.title}</h3><span className="text-[10px] text-black/45">{chosen.length} selected</span></div><div className="grid gap-2 sm:grid-cols-2">{products.map((p) => <label key={p.id} className="flex items-center gap-2 border border-black/10 p-2 text-xs"><input type="checkbox" checked={chosen.includes(p.id)} onChange={(e) => setChosen((old) => e.target.checked ? [...old, p.id] : old.filter((id) => id !== p.id))} /><span className="min-w-0 flex-1 truncate">{p.name}</span><span className="text-[10px] text-black/40">{money(Number(p.price))}</span></label>)}</div><button className={`${buttonClass} mt-4`} disabled={busy} onClick={() => void saveProducts()}><Save className="h-4 w-4" /> Save product selection</button></div></div>}
    </div>
    <form onSubmit={add} className="space-y-3 border border-black/10 bg-[#F7F3EC] p-4"><h3 className="text-sm font-black">Add collection campaign</h3><Field label="Collection title" name="title" value={draft.title} required onChange={(v) => setDraft({ ...draft, title: v, slug: slugify(v) })} /><Field label="Slug" name="slug" value={draft.slug} onChange={(v) => setDraft({ ...draft, slug: v })} /><Field label="Campaign label" name="campaign_label" value={draft.campaign_label} onChange={(v) => setDraft({ ...draft, campaign_label: v })} /><Field label="Image URL" name="image_url" value={draft.image_url} onChange={(v) => setDraft({ ...draft, image_url: v })} /><UploadField label="Upload collection artwork" session={session} folder="collections" busy={busy} onUploaded={(url) => setDraft((d) => ({ ...d, image_url: url }))} /><TextField label="Description" name="description" value={draft.description} onChange={(v) => setDraft({ ...draft, description: v })} /><Field label="Display order" name="sort_order" type="number" value={draft.sort_order} onChange={(v) => setDraft({ ...draft, sort_order: v })} /><div className="grid grid-cols-2 gap-2"><Field label="Starts" name="starts_at" type="datetime-local" value={draft.starts_at} onChange={(v) => setDraft({ ...draft, starts_at: v })} /><Field label="Ends" name="ends_at" type="datetime-local" value={draft.ends_at} onChange={(v) => setDraft({ ...draft, ends_at: v })} /></div><button className={buttonClass} disabled={busy || !draft.title}><Plus className="h-4 w-4" /> Add collection</button></form></div>
  </>;
}

function BrandsPanel({ brands, products, session, busy, perform }: { brands: AdminBrand[]; products: AdminProduct[]; session: AdminSession; busy: boolean; perform: (action: () => Promise<unknown>, message: string) => Promise<void> }) {
  const [selected, setSelected] = useState<AdminBrand | null>(null);
  const [draft, setDraft] = useState({ name: "", slug: "", description: "", motto: "", logo_url: "", image_url: "", website_url: "", instagram_url: "", facebook_url: "", contact_email: "", contact_phone: "", contact_address: "", sort_order: String(brands.length + 1), is_active: true });
  useEffect(() => { if (selected) setDraft({ name: selected.name, slug: selected.slug, description: selected.description ?? "", motto: selected.motto ?? "", logo_url: selected.logo_url ?? "", image_url: selected.image_url ?? "", website_url: selected.website_url ?? "", instagram_url: selected.instagram_url ?? "", facebook_url: selected.facebook_url ?? "", contact_email: selected.contact_email ?? "", contact_phone: selected.contact_phone ?? "", contact_address: selected.contact_address ?? "", sort_order: String(selected.sort_order), is_active: selected.is_active }); }, [selected]);
  const brandProducts = selected ? products.filter((p) => p.brand_id === selected.id) : [];
  async function save(e: FormEvent) { e.preventDefault(); const payload = { ...draft, slug: slugify(draft.slug || draft.name), sort_order: Number(draft.sort_order) }; await perform(() => selected ? adminWrite(`brands?id=eq.${selected.id}`, session, "PATCH", payload) : adminWrite("brands", session, "POST", payload), selected ? "Brand updated." : "Brand created."); }
  return <><PanelHeading eyebrow="Brand portfolio" title="Individual brand workspaces" detail="Add as many labels as needed. Each brand has its own imagery, contact details, social links and linked product catalogue." action={<button className={buttonClass} onClick={() => { setSelected(null); setDraft({ name: "", slug: "", description: "", motto: "", logo_url: "", image_url: "", website_url: "", instagram_url: "", facebook_url: "", contact_email: "", contact_phone: "", contact_address: "", sort_order: String(brands.length + 1), is_active: true }); }}><Plus className="h-4 w-4" /> Add brand</button>} />
    <div className="grid gap-3 sm:grid-cols-2 2xl:grid-cols-3">{brands.map((b) => <button key={b.id} onClick={() => setSelected(b)} className={`border p-4 text-left transition hover:border-black ${selected?.id === b.id ? "border-black bg-[#D5FE00]/20" : "border-black/10 bg-[#F7F3EC]"}`}><div className="flex items-center gap-3">{b.logo_url ? <img src={b.logo_url} alt="" className="h-12 w-12 object-contain" /> : <div className="grid h-12 w-12 place-items-center bg-[#171717] text-sm font-black text-[#D5FE00]">{b.name.slice(0, 2)}</div>}<div><p className="text-sm font-black">{b.name}</p><p className="mt-1 text-[10px] text-black/45">{products.filter((p) => p.brand_id === b.id).length} products · {b.is_active ? "Active" : "Hidden"}</p></div></div><p className="mt-3 line-clamp-2 text-xs text-black/55">{b.description || "No brand description yet."}</p></button>)}</div>
    <div className="grid gap-5 xl:grid-cols-[minmax(0,1fr)_340px]">
      <form onSubmit={save} className="grid gap-3 border border-black/10 bg-[#F7F3EC] p-4 md:grid-cols-2 md:p-5"><div className="md:col-span-2 flex items-center justify-between"><h3 className="text-sm font-black">{selected ? `Edit ${selected.name}` : "Create brand"}</h3>{selected && <button type="button" onClick={() => setSelected(null)} className="text-xs underline">New brand</button>}</div><Field label="Brand name" name="name" value={draft.name} required onChange={(v) => setDraft({ ...draft, name: v, slug: selected ? draft.slug : slugify(v) })} /><Field label="Slug" name="slug" value={draft.slug} onChange={(v) => setDraft({ ...draft, slug: v })} /><Field label="Motto" name="motto" value={draft.motto} onChange={(v) => setDraft({ ...draft, motto: v })} /><Field label="Display order" name="sort_order" type="number" value={draft.sort_order} onChange={(v) => setDraft({ ...draft, sort_order: v })} /><TextField label="Brand description" name="description" value={draft.description} onChange={(v) => setDraft({ ...draft, description: v })} /><div className="space-y-2"><Field label="Logo URL" name="logo_url" value={draft.logo_url} onChange={(v) => setDraft({ ...draft, logo_url: v })} /><UploadField label="Upload brand logo" session={session} folder="brands" busy={busy} onUploaded={(url) => setDraft((d) => ({ ...d, logo_url: url }))} /></div><div className="space-y-2"><Field label="Brand image URL" name="image_url" value={draft.image_url} onChange={(v) => setDraft({ ...draft, image_url: v })} /><UploadField label="Upload brand image" session={session} folder="brands" busy={busy} onUploaded={(url) => setDraft((d) => ({ ...d, image_url: url }))} /></div><Field label="Website" name="website_url" value={draft.website_url} onChange={(v) => setDraft({ ...draft, website_url: v })} /><Field label="Instagram" name="instagram_url" value={draft.instagram_url} onChange={(v) => setDraft({ ...draft, instagram_url: v })} /><Field label="Facebook" name="facebook_url" value={draft.facebook_url} onChange={(v) => setDraft({ ...draft, facebook_url: v })} /><Field label="Contact email" name="contact_email" value={draft.contact_email} onChange={(v) => setDraft({ ...draft, contact_email: v })} /><Field label="Contact phone" name="contact_phone" value={draft.contact_phone} onChange={(v) => setDraft({ ...draft, contact_phone: v })} /><div className="md:col-span-2"><TextField label="Contact address" name="contact_address" value={draft.contact_address} onChange={(v) => setDraft({ ...draft, contact_address: v })} /></div><label className="flex items-center gap-2 text-xs font-semibold md:col-span-2"><input type="checkbox" checked={draft.is_active} onChange={(e) => setDraft({ ...draft, is_active: e.target.checked })} /> Brand is active on storefront</label><div className="flex flex-wrap gap-2 md:col-span-2"><button className={buttonClass} disabled={busy || !draft.name}><Save className="h-4 w-4" /> Save brand</button>{selected && <button type="button" className={secondaryClass} disabled={busy} onClick={() => { if (confirm(`Delete ${selected.name}? It must have no linked products.`)) void perform(() => adminWrite(`brands?id=eq.${selected.id}`, session, "DELETE"), "Brand deleted."); }}><Trash2 className="h-4 w-4" /> Delete brand</button>}</div></form>
      <div className="border border-black/10 bg-[#171717] p-4 text-[#F0EAE0]"><p className="text-[9px] font-bold uppercase tracking-[0.18em] text-white/45">Brand workspace</p><h3 className="mt-1 text-lg font-black">{selected?.name ?? "Select a brand"}</h3>{selected ? <><p className="mt-1 text-xs text-white/45">{brandProducts.length} linked products</p><div className="mt-4 space-y-2">{brandProducts.map((p) => <div key={p.id} className="flex justify-between gap-2 border-t border-white/10 py-2 text-xs"><span className="truncate">{p.name}</span><span className="shrink-0 text-[#D5FE00]">{money(Number(p.price))}</span></div>)}</div><p className="mt-4 text-[10px] leading-5 text-white/40">Product details, SKU and stock are managed in Products. Sales performance is available in the main dashboard.</p></> : <p className="mt-3 text-xs text-white/45">Choose a brand above to see its catalogue and edit its identity.</p>}</div>
    </div>
  </>;
}

function AccountsPanel({ admins, customers, session, busy, perform }: { admins: { user_id: string; created_at: string }[]; customers: CustomerProfile[]; session: AdminSession; busy: boolean; perform: (action: () => Promise<unknown>, message: string) => Promise<void> }) {
  const [userId, setUserId] = useState("");
  return <><PanelHeading eyebrow="People and access" title="Accounts" detail="Administrator access and customer records are shown separately. Admin access can be granted to an existing Supabase Auth user by their Auth user UUID." />
    <div className="grid gap-5 xl:grid-cols-2"><section className="border border-black/10 bg-[#F7F3EC] p-4"><div className="mb-4 flex items-center justify-between"><div><h3 className="text-sm font-black">Admin accounts</h3><p className="mt-1 text-[10px] text-black/45">{admins.length} authorised administrators</p></div></div><form onSubmit={(e) => { e.preventDefault(); void perform(() => adminWrite("admin_users", session, "POST", { user_id: userId.trim() }), "Administrator access granted."); setUserId(""); }} className="mb-4 flex flex-wrap gap-2"><input className="min-w-0 flex-1 border border-black/15 bg-white/60 px-3 py-2 text-xs" placeholder="Existing Auth user UUID" value={userId} onChange={(e) => setUserId(e.target.value)} /><button className={buttonClass} disabled={busy || !/^[0-9a-f-]{36}$/i.test(userId.trim())}><Plus className="h-4 w-4" /> Add admin</button></form><div className="divide-y divide-black/10">{admins.map((a) => <div key={a.user_id} className="flex items-center justify-between gap-3 py-3"><div className="min-w-0"><p className="break-all text-xs font-bold">{a.user_id}</p><p className="mt-1 text-[10px] text-black/45">Added {new Date(a.created_at).toLocaleDateString()}</p></div><button className={secondaryClass} disabled={busy || a.user_id === session.user.id || admins.length < 2} title={a.user_id === session.user.id ? "You cannot remove your own active administrator access." : admins.length < 2 ? "At least one admin must remain." : "Remove admin"} onClick={() => { if (confirm("Remove administrator access for this user?")) void perform(() => adminWrite(`admin_users?user_id=eq.${a.user_id}`, session, "DELETE"), "Administrator access removed."); }}><Trash2 className="h-4 w-4" /></button></div>)}</div><p className="mt-3 text-[10px] leading-5 text-black/45">Create the user in Supabase Authentication first, then paste their Auth user UUID here. This avoids exposing privileged Auth APIs or service keys in the browser.</p></section>
      <section className="border border-black/10 bg-[#F7F3EC] p-4"><div className="mb-4"><h3 className="text-sm font-black">Customer accounts</h3><p className="mt-1 text-[10px] text-black/45">{customers.length} customer records · latest 500</p></div><div className="max-h-[620px] divide-y divide-black/10 overflow-y-auto">{customers.map((c) => <div key={c.id} className="py-3"><div className="flex items-start justify-between gap-3"><div><p className="text-xs font-bold">{c.full_name}</p><p className="mt-1 text-xs">{c.mobile_number}</p><p className="mt-1 whitespace-pre-wrap text-[10px] leading-4 text-black/50">{c.delivery_address}</p><p className="mt-1 text-[10px] text-black/35">Registered {new Date(c.created_at).toLocaleDateString()}</p></div><button className={secondaryClass} disabled={busy} aria-label="Delete customer account" onClick={() => { if (confirm(`Delete customer record for ${c.full_name}?`)) void perform(() => adminWrite(`customer_profiles?id=eq.${c.id}`, session, "DELETE"), "Customer record deleted."); }}><Trash2 className="h-4 w-4" /></button></div></div>)}{!customers.length && <Empty title="No customer accounts yet" detail="Customer registrations will appear here." />}</div><p className="mt-3 text-[10px] leading-5 text-black/45">These are customer profile records, not verified Auth accounts. Phone ownership is not verified and this panel does not create private customer login sessions.</p></section></div>
  </>;
}

function BrandInfoPanel({ settings, session, busy, perform }: { settings?: SiteBrandInfo; session: AdminSession; busy: boolean; perform: (action: () => Promise<unknown>, message: string) => Promise<void> }) {
  const [draft, setDraft] = useState({ motto: settings?.motto ?? "", about_text: settings?.about_text ?? "", address: settings?.address ?? "", contact_numbers: settings?.contact_numbers?.join(", ") ?? "", logo_url: settings?.logo_url ?? "", symbol_url: settings?.symbol_url ?? "", instagram: settings?.social_links?.instagram ?? "", facebook: settings?.social_links?.facebook ?? "", whatsapp: settings?.social_links?.whatsapp ?? "", website: settings?.social_links?.website ?? "", hero_autoplay_ms: String(settings?.hero_autoplay_ms ?? 5000) });
  useEffect(() => { if (settings) setDraft({ motto: settings.motto ?? "", about_text: settings.about_text ?? "", address: settings.address ?? "", contact_numbers: settings.contact_numbers?.join(", ") ?? "", logo_url: settings.logo_url ?? "", symbol_url: settings.symbol_url ?? "", instagram: settings.social_links?.instagram ?? "", facebook: settings.social_links?.facebook ?? "", whatsapp: settings.social_links?.whatsapp ?? "", website: settings.social_links?.website ?? "", hero_autoplay_ms: String(settings.hero_autoplay_ms ?? 5000) }); }, [settings]);
  async function save(e: FormEvent) { e.preventDefault(); const { instagram, facebook, whatsapp, website, ...rest } = draft; await perform(() => adminWrite("site_brand_info?id=eq.1", session, "PATCH", { ...rest, contact_numbers: rest.contact_numbers.split(",").map((v) => v.trim()).filter(Boolean), hero_autoplay_ms: Number(rest.hero_autoplay_ms), social_links: { instagram, facebook, whatsapp, website } }), "Main ISHTILE brand information saved."); }
  return <><PanelHeading eyebrow="Website identity" title="Brand info" detail="This section controls the main ISHTILE identity shown across the website. Individual label details remain in Brands." />
    <form onSubmit={save} className="grid gap-4 border border-black/10 bg-[#F7F3EC] p-4 md:grid-cols-2 md:p-6"><div className="md:col-span-2"><Field label="Main motto / tagline" name="motto" value={draft.motto} onChange={(v) => setDraft({ ...draft, motto: v })} /></div><div className="md:col-span-2"><TextField label="About ISHTILE" name="about_text" rows={6} value={draft.about_text} onChange={(v) => setDraft({ ...draft, about_text: v })} /></div><TextField label="Business address" name="address" value={draft.address} onChange={(v) => setDraft({ ...draft, address: v })} /><Field label="Contact numbers (comma separated)" name="contact_numbers" value={draft.contact_numbers} onChange={(v) => setDraft({ ...draft, contact_numbers: v })} /><div className="space-y-2"><Field label="Main logo URL" name="logo_url" value={draft.logo_url} onChange={(v) => setDraft({ ...draft, logo_url: v })} /><UploadField label="Upload main logo" session={session} folder="brand-info" busy={busy} onUploaded={(url) => setDraft((d) => ({ ...d, logo_url: url }))} /></div><div className="space-y-2"><Field label="Brand symbol URL" name="symbol_url" value={draft.symbol_url} onChange={(v) => setDraft({ ...draft, symbol_url: v })} /><UploadField label="Upload brand symbol" session={session} folder="brand-info" busy={busy} onUploaded={(url) => setDraft((d) => ({ ...d, symbol_url: url }))} /></div><Field label="Instagram URL" name="instagram" value={draft.instagram} onChange={(v) => setDraft({ ...draft, instagram: v })} /><Field label="Facebook URL" name="facebook" value={draft.facebook} onChange={(v) => setDraft({ ...draft, facebook: v })} /><Field label="WhatsApp URL" name="whatsapp" value={draft.whatsapp} onChange={(v) => setDraft({ ...draft, whatsapp: v })} /><Field label="Website URL" name="website" value={draft.website} onChange={(v) => setDraft({ ...draft, website: v })} /><div className="md:col-span-2"><button className={buttonClass} disabled={busy}><Save className="h-4 w-4" /> Save brand information</button></div></form>
  </>;
}
function Empty({ title, detail }: { title: string; detail: string }) {
  return <div className="border border-dashed border-black/15 px-5 py-12 text-center"><p className="text-sm font-bold">{title}</p><p className="mx-auto mt-2 max-w-sm text-xs leading-5 text-black/45">{detail}</p></div>;
}
