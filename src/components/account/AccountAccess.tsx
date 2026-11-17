import { useEffect, useState, type FormEvent } from "react";
import { useNavigate } from "@tanstack/react-router";
import { ArrowRight, LoaderCircle, ShieldCheck, UserRound, LogOut } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { signInAdmin } from "@/lib/supabase-admin";

type AccessMode = "customer" | "admin";
type CustomerMode = "login" | "register";

export function AccountAccess({ defaultMode = "customer" }: { defaultMode?: AccessMode }) {
  const navigate = useNavigate();
  const [customerMode, setCustomerMode] = useState<CustomerMode>("login");
  const [identifier, setIdentifier] = useState("");
  const [email, setEmail] = useState("");
  const [username, setUsername] = useState("");
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [address, setAddress] = useState("");
  const [password, setPassword] = useState("");
  const [adminEmail, setAdminEmail] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [customerEmail, setCustomerEmail] = useState("");

  useEffect(() => {
    if (defaultMode !== "customer") return;
    supabase.auth.getUser().then(({ data }) => {
      if (data.user) setCustomerEmail(data.user.email ?? "");
    });
    const { data: listener } = supabase.auth.onAuthStateChange((_event, session) => {
      setCustomerEmail(session?.user?.email ?? "");
    });
    return () => listener.subscription.unsubscribe();
  }, [defaultMode]);

  function clearMessages() {
    setError("");
    setSuccess("");
  }

  async function submitCustomerLogin(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setBusy(true);
    clearMessages();
    try {
      // Admins use the same sign-in form, but are authenticated and authorised
      // against admin_users before being routed to the private dashboard.
      if (identifier.trim().includes("@")) {
        try {
          await signInAdmin(identifier.trim(), password);
          setPassword("");
          await navigate({ to: "/admin" });
          return;
        } catch {
          // Not an authorised admin (or not an admin account): continue with
          // the customer identifier flow below.
        }
      }

      const { data, error: invokeError } = await supabase.functions.invoke("customer-login", {
        body: { identifier: identifier.trim(), password },
      });
      if (invokeError) throw invokeError;
      if (!data?.access_token || !data?.refresh_token) {
        throw new Error("Sign-in failed. Check your details and try again.");
      }
      const { error: sessionError } = await supabase.auth.setSession({
        access_token: data.access_token,
        refresh_token: data.refresh_token,
      });
      if (sessionError) throw sessionError;
      setPassword("");
      setSuccess("You’re signed in. Welcome back.");
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "Sign-in failed. Check your details and try again.");
    } finally {
      setBusy(false);
    }
  }

  async function submitCustomerRegistration(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setBusy(true);
    clearMessages();
    const normalizedPhone = phone.replace(/\D/g, "");
    if (!/^(?:880)?01[3-9]\d{8}$/.test(normalizedPhone)) {
      setError("Enter a valid Bangladeshi mobile number.");
      setBusy(false);
      return;
    }
    if (!/^[a-zA-Z0-9_]{3,24}$/.test(username.trim())) {
      setError("Username must be 3–24 characters using letters, numbers or underscores.");
      setBusy(false);
      return;
    }
    if (password.length < 8) {
      setError("Use a password with at least 8 characters.");
      setBusy(false);
      return;
    }
    try {
      const mobile = normalizedPhone.startsWith("880") ? `+${normalizedPhone}` : `+88${normalizedPhone}`;
      const { data, error: signUpError } = await supabase.auth.signUp({
        email: email.trim().toLowerCase(),
        password,
        options: {
          data: {
            account_type: "customer",
            full_name: name.trim(),
            mobile_number: mobile,
            delivery_address: address.trim(),
            username: username.trim().toLowerCase(),
          },
        },
      });
      if (signUpError) throw signUpError;
      setPassword("");
      if (data.session) {
        setSuccess("Your customer account is ready. You’re signed in.");
      } else {
        setSuccess("Your account has been created. Check your email to confirm it, then sign in.");
        setCustomerMode("login");
      }
      setIdentifier(email.trim().toLowerCase());
    } catch (cause) {
      const message = cause instanceof Error ? cause.message : "We couldn’t create your account.";
      setError(/duplicate key|unique constraint|already exists/i.test(message)
        ? "That username or mobile number is already in use. Try another."
        : message);
    } finally {
      setBusy(false);
    }
  }

  async function submitAdmin(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setBusy(true);
    clearMessages();
    try {
      await signInAdmin(adminEmail, password);
      setPassword("");
      await navigate({ to: "/admin" });
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "Sign-in failed. Check your details and try again.");
    } finally {
      setBusy(false);
    }
  }

  async function signOutCustomer() {
    setBusy(true);
    const { error: signOutError } = await supabase.auth.signOut();
    setBusy(false);
    if (signOutError) setError(signOutError.message);
    else {
      setCustomerEmail("");
      setSuccess("You have been signed out.");
    }
  }

  const isAdmin = defaultMode === "admin";

  return (
    <main className="min-h-[75vh] bg-[#F0EAE0] px-4 py-14 text-[#171717] md:py-20">
      <section className="mx-auto w-full max-w-xl border border-black/15 bg-[#F7F3EC] p-6 shadow-[8px_8px_0_#171717] sm:p-10">
        <div className="flex items-center justify-between">
          <span className="font-display text-2xl font-black tracking-[-0.07em]">ISHTILE<span className="text-black/35">+</span></span>
          <span className="text-[9px] font-bold uppercase tracking-[0.2em] text-black/45">{isAdmin ? "Administrator" : "Your account"}</span>
        </div>

        {isAdmin ? (
          <>
            <h1 className="mt-9 font-display text-4xl font-black leading-none tracking-[-0.06em] sm:text-5xl">Administrator access.</h1>
            <p className="mt-3 max-w-md text-sm leading-6 text-black/55">This private sign-in is reserved for authorised ISHTILE administrators.</p>
            <div className="mt-8 flex items-center gap-2 border border-black/15 bg-black/[0.03] px-3 py-3 text-[10px] font-bold uppercase tracking-[0.12em]"><ShieldCheck className="h-4 w-4" /> Restricted administrator access</div>
            <form onSubmit={submitAdmin} className="mt-7 space-y-5">
              <label className="block text-xs font-bold uppercase tracking-[0.12em]">Administrator email
                <input required type="email" autoComplete="username" value={adminEmail} onChange={(event) => setAdminEmail(event.target.value)} placeholder="admin@ishtile.com" className="mt-2 h-12 w-full border border-black/20 bg-white/70 px-3 text-sm font-normal outline-none focus:border-black focus:ring-2 focus:ring-[#D5FE00]" />
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
          </>
        ) : customerEmail ? (
          <>
            <h1 className="mt-9 font-display text-4xl font-black leading-none tracking-[-0.06em] sm:text-5xl">Welcome back.</h1>
            <p className="mt-3 text-sm leading-6 text-black/55">Signed in as {customerEmail}</p>
            {success && <p role="status" className="mt-5 border border-green-700/20 bg-green-50 px-3 py-3 text-sm text-green-900">{success}</p>}
            {error && <p role="alert" className="mt-5 border border-red-300 bg-red-50 px-3 py-3 text-sm text-red-800">{error}</p>}
            <button type="button" onClick={signOutCustomer} disabled={busy} className="mt-7 flex h-12 w-full items-center justify-center gap-2 bg-[#171717] px-4 text-xs font-bold uppercase tracking-[0.15em] text-[#F0EAE0] disabled:opacity-60">
              {busy ? <LoaderCircle className="h-4 w-4 animate-spin" /> : <LogOut className="h-4 w-4" />} Sign out
            </button>
          </>
        ) : (
          <>
            <h1 className="mt-9 font-display text-4xl font-black leading-none tracking-[-0.06em] sm:text-5xl">{customerMode === "login" ? "Sign in." : "Create account."}</h1>
            <p className="mt-3 max-w-md text-sm leading-6 text-black/55">
              {customerMode === "login" ? "One account. Sign in with your email, mobile number or username." : "Create your ISHTILE customer account with your contact and delivery details."}
            </p>
            <div className="mt-7 flex border-b border-black/15 text-xs font-bold uppercase tracking-[0.12em]">
              <button type="button" onClick={() => { setCustomerMode("login"); clearMessages(); }} className={`border-b-2 px-4 py-3 ${customerMode === "login" ? "border-[#171717] text-[#171717]" : "border-transparent text-black/40"}`}>Sign in</button>
              <button type="button" onClick={() => { setCustomerMode("register"); clearMessages(); }} className={`border-b-2 px-4 py-3 ${customerMode === "register" ? "border-[#171717] text-[#171717]" : "border-transparent text-black/40"}`}>Create account</button>
            </div>

            {customerMode === "login" ? (
              <form onSubmit={submitCustomerLogin} className="mt-7 space-y-5">
                <label className="block text-xs font-bold uppercase tracking-[0.12em]">Email / Mobile / Username
                  <input required autoComplete="username" value={identifier} onChange={(event) => setIdentifier(event.target.value)} placeholder="Email, mobile number or username" className="mt-2 h-12 w-full border border-black/20 bg-white/70 px-3 text-sm font-normal normal-case tracking-normal outline-none focus:border-black focus:ring-2 focus:ring-[#D5FE00]" />
                </label>
                <label className="block text-xs font-bold uppercase tracking-[0.12em]">Password
                  <input required type="password" autoComplete="current-password" value={password} onChange={(event) => setPassword(event.target.value)} placeholder="Your password" className="mt-2 h-12 w-full border border-black/20 bg-white/70 px-3 text-sm font-normal outline-none focus:border-black focus:ring-2 focus:ring-[#D5FE00]" />
                </label>
                {success && <p role="status" className="border border-green-700/20 bg-green-50 px-3 py-3 text-sm text-green-900">{success}</p>}
                {error && <p role="alert" className="border border-red-300 bg-red-50 px-3 py-3 text-sm text-red-800">{error}</p>}
                <button disabled={busy} className="flex h-12 w-full items-center justify-center gap-2 bg-[#171717] px-4 text-xs font-bold uppercase tracking-[0.15em] text-[#F0EAE0] transition hover:bg-black disabled:opacity-60">
                  {busy ? <LoaderCircle className="h-4 w-4 animate-spin" /> : <ArrowRight className="h-4 w-4" />} {busy ? "Signing in" : "Sign in"}
                </button>
              </form>
            ) : (
              <form onSubmit={submitCustomerRegistration} className="mt-7 space-y-4">
                <label className="block text-xs font-bold uppercase tracking-[0.12em]">Full name
                  <input required minLength={2} maxLength={120} autoComplete="name" value={name} onChange={(event) => setName(event.target.value)} placeholder="Your name" className="mt-2 h-12 w-full border border-black/20 bg-white/70 px-3 text-sm font-normal outline-none focus:border-black focus:ring-2 focus:ring-[#D5FE00]" />
                </label>
                <label className="block text-xs font-bold uppercase tracking-[0.12em]">Username
                  <input required minLength={3} maxLength={24} pattern="[A-Za-z0-9_]{3,24}" autoComplete="username" value={username} onChange={(event) => setUsername(event.target.value)} placeholder="Choose a unique username" className="mt-2 h-12 w-full border border-black/20 bg-white/70 px-3 text-sm font-normal outline-none focus:border-black focus:ring-2 focus:ring-[#D5FE00]" />
                </label>
                <label className="block text-xs font-bold uppercase tracking-[0.12em]">Email
                  <input required type="email" autoComplete="email" value={email} onChange={(event) => setEmail(event.target.value)} placeholder="you@example.com" className="mt-2 h-12 w-full border border-black/20 bg-white/70 px-3 text-sm font-normal outline-none focus:border-black focus:ring-2 focus:ring-[#D5FE00]" />
                </label>
                <label className="block text-xs font-bold uppercase tracking-[0.12em]">Mobile number
                  <input required type="tel" inputMode="tel" autoComplete="tel" value={phone} onChange={(event) => setPhone(event.target.value)} placeholder="01712345678" className="mt-2 h-12 w-full border border-black/20 bg-white/70 px-3 text-sm font-normal outline-none focus:border-black focus:ring-2 focus:ring-[#D5FE00]" />
                </label>
                <label className="block text-xs font-bold uppercase tracking-[0.12em]">Delivery address
                  <textarea required minLength={6} maxLength={500} rows={3} autoComplete="street-address" value={address} onChange={(event) => setAddress(event.target.value)} placeholder="House, road, area, city" className="mt-2 w-full resize-y border border-black/20 bg-white/70 px-3 py-3 text-sm font-normal outline-none focus:border-black focus:ring-2 focus:ring-[#D5FE00]" />
                </label>
                <label className="block text-xs font-bold uppercase tracking-[0.12em]">Password
                  <input required type="password" minLength={8} autoComplete="new-password" value={password} onChange={(event) => setPassword(event.target.value)} placeholder="At least 8 characters" className="mt-2 h-12 w-full border border-black/20 bg-white/70 px-3 text-sm font-normal outline-none focus:border-black focus:ring-2 focus:ring-[#D5FE00]" />
                </label>
                {success && <p role="status" className="border border-green-700/20 bg-green-50 px-3 py-3 text-sm text-green-900">{success}</p>}
                {error && <p role="alert" className="border border-red-300 bg-red-50 px-3 py-3 text-sm text-red-800">{error}</p>}
                <button disabled={busy} className="flex h-12 w-full items-center justify-center gap-2 bg-[#171717] px-4 text-xs font-bold uppercase tracking-[0.15em] text-[#F0EAE0] transition hover:bg-black disabled:opacity-60">
                  {busy ? <LoaderCircle className="h-4 w-4 animate-spin" /> : <UserRound className="h-4 w-4" />} {busy ? "Creating account" : "Create account"}
                </button>
                <p className="text-[11px] leading-5 text-black/45">A confirmation email may be required before your first sign-in.</p>
              </form>
            )}
          </>
        )}
      </section>
    </main>
  );
}
