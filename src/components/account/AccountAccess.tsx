import { useState, type FormEvent } from "react";
import { useNavigate } from "@tanstack/react-router";
import { ArrowRight, LoaderCircle, ShieldCheck, UserRound } from "lucide-react";
import { createCustomerProfile, signInAdmin } from "@/lib/supabase-admin";

type AccessMode = "customer" | "admin";

export function AccountAccess({ defaultMode = "customer" }: { defaultMode?: AccessMode }) {
  const navigate = useNavigate();
  const [mode, setMode] = useState<AccessMode>(defaultMode);
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [address, setAddress] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  async function submitCustomer(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setBusy(true);
    setError("");
    setSuccess("");
    if (name.trim().length < 2) {
      setError("Please enter your full name.");
      setBusy(false);
      return;
    }
    if (!/^(?:\+?88)?01[3-9]\d{8}$/.test(phone.replace(/[\s-]/g, ""))) {
      setError("Enter a valid Bangladeshi mobile number.");
      setBusy(false);
      return;
    }
    if (address.trim().length < 6) {
      setError("Please enter your complete delivery address.");
      setBusy(false);
      return;
    }
    try {
      const digits = phone.replace(/\D/g, "");
      const normalizedPhone = digits.startsWith("880") ? `+${digits}` : `+88${digits}`;
      await createCustomerProfile({ full_name: name, mobile_number: normalizedPhone, delivery_address: address });
      setSuccess("Your details have been saved. You can use this mobile number when placing an order.");
      setName("");
      setPhone("");
      setAddress("");
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "We couldn't create your account.");
    } finally {
      setBusy(false);
    }
  }

  async function submitAdmin(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setBusy(true);
    setError("");
    try {
      await signInAdmin(email, password);
      setPassword("");
      await navigate({ to: "/admin" });
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "Sign-in failed. Check your details and try again.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <main className="min-h-[75vh] bg-[#F0EAE0] px-4 py-14 text-[#171717] md:py-20">
      <section className="mx-auto w-full max-w-xl border border-black/15 bg-[#F7F3EC] p-6 shadow-[8px_8px_0_#171717] sm:p-10">
        <div className="flex items-center justify-between">
          <span className="font-display text-2xl font-black tracking-[-0.07em]">ISHTILE<span className="text-black/35">+</span></span>
          <span className="text-[9px] font-bold uppercase tracking-[0.2em] text-black/45">Your account</span>
        </div>
        <h1 className="mt-9 font-display text-4xl font-black leading-none tracking-[-0.06em] sm:text-5xl">
          {mode === "customer" ? "Create account." : "Admin sign in."}
        </h1>
        <p className="mt-3 max-w-md text-sm leading-6 text-black/55">
          {mode === "customer"
            ? "Save your contact and delivery details for a quicker checkout."
            : "Sign in with your authorised administrator email and password."}
        </p>

        <div className="mt-8 grid grid-cols-2 border border-black/15 p-1">
          <button type="button" onClick={() => { setMode("customer"); setError(""); setSuccess(""); }} className={`flex items-center justify-center gap-2 px-3 py-3 text-[10px] font-bold uppercase tracking-[0.12em] transition ${mode === "customer" ? "bg-[#D5FE00] text-[#171717]" : "text-black/55 hover:bg-black/5"}`}>
            <UserRound className="h-4 w-4" /> Customer
          </button>
          <button type="button" onClick={() => { setMode("admin"); setError(""); setSuccess(""); }} className={`flex items-center justify-center gap-2 px-3 py-3 text-[10px] font-bold uppercase tracking-[0.12em] transition ${mode === "admin" ? "bg-[#171717] text-[#F0EAE0]" : "text-black/55 hover:bg-black/5"}`}>
            <ShieldCheck className="h-4 w-4" /> Admin
          </button>
        </div>

        {mode === "customer" ? (
          <form onSubmit={submitCustomer} className="mt-7 space-y-5">
            <label className="block text-xs font-bold uppercase tracking-[0.12em]">Full name
              <input required minLength={2} maxLength={120} autoComplete="name" value={name} onChange={(event) => setName(event.target.value)} placeholder="Your name" className="mt-2 h-12 w-full border border-black/20 bg-white/70 px-3 text-sm font-normal outline-none focus:border-black focus:ring-2 focus:ring-[#D5FE00]" />
            </label>
            <label className="block text-xs font-bold uppercase tracking-[0.12em]">Mobile number
              <input required type="tel" inputMode="tel" autoComplete="tel" value={phone} onChange={(event) => setPhone(event.target.value)} placeholder="01712345678" className="mt-2 h-12 w-full border border-black/20 bg-white/70 px-3 text-sm font-normal outline-none focus:border-black focus:ring-2 focus:ring-[#D5FE00]" />
            </label>
            <label className="block text-xs font-bold uppercase tracking-[0.12em]">Delivery address
              <textarea required minLength={6} maxLength={500} rows={3} autoComplete="street-address" value={address} onChange={(event) => setAddress(event.target.value)} placeholder="House, road, area, city" className="mt-2 w-full resize-y border border-black/20 bg-white/70 px-3 py-3 text-sm font-normal outline-none focus:border-black focus:ring-2 focus:ring-[#D5FE00]" />
            </label>
            <p className="text-[11px] leading-5 text-black/45">No password or OTP is required right now. This saves your details as a customer profile; it does not verify ownership of the mobile number or unlock private order history.</p>
            {success && <p role="status" className="border border-green-700/20 bg-green-50 px-3 py-3 text-sm text-green-900">{success}</p>}
            {error && <p role="alert" className="border border-red-300 bg-red-50 px-3 py-3 text-sm text-red-800">{error}</p>}
            <button disabled={busy} className="flex h-12 w-full items-center justify-center gap-2 bg-[#171717] px-4 text-xs font-bold uppercase tracking-[0.15em] text-[#F0EAE0] transition hover:bg-black disabled:opacity-60">
              {busy ? <LoaderCircle className="h-4 w-4 animate-spin" /> : <ArrowRight className="h-4 w-4" />}
              {busy ? "Saving details" : "Create customer profile"}
            </button>
          </form>
        ) : (
          <form onSubmit={submitAdmin} className="mt-7 space-y-5">
            <label className="block text-xs font-bold uppercase tracking-[0.12em]">Administrator email
              <input required type="email" autoComplete="username" value={email} onChange={(event) => setEmail(event.target.value)} placeholder="admin@ishtile.com" className="mt-2 h-12 w-full border border-black/20 bg-white/70 px-3 text-sm font-normal outline-none focus:border-black focus:ring-2 focus:ring-[#D5FE00]" />
            </label>
            <label className="block text-xs font-bold uppercase tracking-[0.12em]">Password
              <input required type="password" autoComplete="current-password" value={password} onChange={(event) => setPassword(event.target.value)} placeholder="Your password" className="mt-2 h-12 w-full border border-black/20 bg-white/70 px-3 text-sm font-normal outline-none focus:border-black focus:ring-2 focus:ring-[#D5FE00]" />
            </label>
            {error && <p role="alert" className="border border-red-300 bg-red-50 px-3 py-3 text-sm text-red-800">{error}</p>}
            <button disabled={busy} className="flex h-12 w-full items-center justify-center gap-2 bg-[#171717] px-4 text-xs font-bold uppercase tracking-[0.15em] text-[#F0EAE0] transition hover:bg-black disabled:opacity-60">
              {busy ? <LoaderCircle className="h-4 w-4 animate-spin" /> : <ShieldCheck className="h-4 w-4" />}
              {busy ? "Verifying access" : "Sign in to admin"}
            </button>
            <p className="text-[11px] leading-5 text-black/45">Only accounts already authorised in the ISHTILE admin list can enter the dashboard.</p>
          </form>
        )}
      </section>
    </main>
  );
}
