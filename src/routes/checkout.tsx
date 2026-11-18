import { useState } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import { Check, CreditCard, Truck, Wallet } from "lucide-react";
import { Footer } from "@/components/home/Footer";
import { Sparkle } from "@/components/home/icons";
import { formatTaka } from "@/lib/catalog";
import { isBdPhone, isEmail, isPostalCode, type Order } from "@/lib/commerce";
import { useCart } from "@/lib/store";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/checkout")({
  head: () => ({
    meta: [
      { title: "Checkout — ISHTILE+" },
      {
        name: "description",
        content:
          "Place your ISHTILE+ order with bKash, Nagad, card or cash on delivery. Delivery across Bangladesh in 2–4 working days.",
      },
      { property: "og:title", content: "Checkout — ISHTILE+" },
      {
        property: "og:description",
        content: "Three quick steps to your ISHTILE+ order — details, payment, done.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: CheckoutPage,
});

type Method = "bkash" | "nagad" | "card" | "cod";

const methods: { id: Method; label: string; note: string; tint: string; icon: typeof Wallet }[] = [
  { id: "bkash", label: "bKash", note: "Pay from your bKash account", tint: "#E2136E", icon: Wallet },
  { id: "nagad", label: "Nagad", note: "Pay from your Nagad account", tint: "#EE7A22", icon: Wallet },
  { id: "card", label: "Card Payment", note: "Visa, Mastercard, Amex", tint: "#141414", icon: CreditCard },
  { id: "cod", label: "Cash on Delivery", note: "Pay the courier at your door", tint: "#6C7049", icon: Truck },
];

const steps = ["Information", "Payment", "Confirmation"];

/** Form fields that can carry a validation message. */
type FieldErrors = Partial<
  Record<
    | "name" | "phone" | "email" | "address" | "city" | "postal"
    | "payNumber" | "cardNumber" | "cardExpiry" | "cardCvc" | "cardName",
    string
  >
>;

function Field({
  id,
  label,
  value,
  onChange,
  error,
  type = "text",
  placeholder,
  autoComplete,
  inputMode,
  className,
  required = false,
}: {
  id: string;
  label: string;
  required?: boolean;
  value: string;
  onChange: (v: string) => void;
  error?: string | undefined;
  type?: string;
  placeholder?: string;
  autoComplete?: string;
  inputMode?: React.ComponentProps<"input">["inputMode"];
  className?: string;
}) {
  return (
    <div className={className}>
      <label htmlFor={id} className="text-sm font-medium">
        {label}
        {required && (
          <span aria-hidden="true" className="ml-1 inline-block animate-pulse text-sm font-bold leading-none text-red-600">*</span>
        )}
      </label>
      <input
        id={id}
        type={type}
        value={value}
        placeholder={placeholder}
        autoComplete={autoComplete}
        inputMode={inputMode}
        aria-invalid={!!error}
        aria-required={required}
        required={required}
        aria-describedby={error ? `${id}-error` : undefined}
        onChange={(e) => onChange(e.target.value)}
        className={cn(
          "mt-1.5 h-11 w-full rounded-lg border bg-background px-3.5 text-[15px] outline-none transition-colors focus:border-lime",
          error ? "border-destructive" : "border-border",
        )}
      />
      {error && (
        <p id={`${id}-error`} role="alert" className="mt-1 text-xs text-destructive">
          {error}
        </p>
      )}
    </div>
  );
}

function Stepper({ step }: { step: number }) {
  return (
    <ol className="flex items-center gap-3 md:gap-5">
      {steps.map((label, i) => {
        const n = i + 1;
        const done = n < step;
        const current = n === step;
        return (
          <li key={label} className="flex items-center gap-3 md:gap-5">
            <span className="flex items-center gap-2">
              <span
                className={cn(
                  "grid h-7 w-7 place-items-center rounded-full text-xs font-semibold transition-colors",
                  done ? "bg-lime text-primary-foreground" : current ? "bg-ink text-ink-foreground" : "border border-border text-muted-foreground",
                )}
              >
                {done ? <Check className="h-3.5 w-3.5" strokeWidth={2.6} /> : n}
              </span>
              <span className={cn("text-sm", current ? "font-medium text-foreground" : "text-muted-foreground")}>
                {label}
              </span>
            </span>
            {n < steps.length && <span aria-hidden="true" className="h-px w-6 bg-border md:w-12" />}
          </li>
        );
      })}
    </ol>
  );
}

function Summary() {
  const { lines, subtotal, shipping, total } = useCart();
  return (
    <div className="rounded-xl border border-border bg-panel/70 p-5">
      <h2 className="font-display text-lg font-semibold tracking-[-0.02em]">Order Summary</h2>
      <ul className="mt-4 space-y-3">
        {lines.map((l) => (
          <li key={l.key} className="flex items-center gap-3">
            <img src={l.image} alt={l.name} width={52} height={52} className="h-13 w-13 shrink-0 rounded-md object-cover" />
            <span className="min-w-0 flex-1">
              <span className="block truncate text-sm">{l.name}</span>
              <span className="block text-xs text-muted-foreground">
                {l.color} · {l.size} · ×{l.qty}
              </span>
            </span>
            <span className="text-sm tabular-nums">{formatTaka(l.price * l.qty)}</span>
          </li>
        ))}
      </ul>
      <dl className="mt-4 space-y-1.5 border-t border-border pt-3 text-sm">
        <div className="flex justify-between">
          <dt className="text-muted-foreground">Subtotal</dt>
          <dd className="tabular-nums">{formatTaka(subtotal)}</dd>
        </div>
        <div className="flex justify-between">
          <dt className="text-muted-foreground">Delivery</dt>
          <dd className="tabular-nums">{shipping === 0 ? "Free" : formatTaka(shipping)}</dd>
        </div>
        <div className="flex justify-between border-t border-border pt-2 text-base font-semibold">
          <dt>Total</dt>
          <dd className="tabular-nums">{formatTaka(total)}</dd>
        </div>
      </dl>
    </div>
  );
}

function CheckoutPage() {
  const { lines, subtotal, shipping, total, placeOrder } = useCart();
  const [step, setStep] = useState(1);
  const [info, setInfo] = useState({ name: "", phone: "", email: "", address: "", city: "", postal: "" });
  const [errors, setErrors] = useState<FieldErrors>({});
  const [method, setMethod] = useState<Method>("bkash");
  const [payNumber, setPayNumber] = useState("");
  const [card, setCard] = useState({ name: "", number: "", expiry: "", cvc: "" });
  const [order, setOrder] = useState<Order | null>(null);

  const set = (key: keyof typeof info) => (v: string) => {
    setInfo((prev) => ({ ...prev, [key]: v }));
    setErrors((prev) => ({ ...prev, [key]: "" }));
  };

  const submitInfo = (e: React.FormEvent) => {
    e.preventDefault();
    const next: FieldErrors = {};
    if (info.name.trim().length < 2) next.name = "Tell us who to address the parcel to.";
    if (!isBdPhone(info.phone)) next.phone = "Use a Bangladeshi mobile, e.g. 01712345678.";
    if (info.email.trim() && !isEmail(info.email)) next.email = "That email doesn't look right.";
    if (info.address.trim().length < 6) next.address = "Add the house, road and area.";
    if (info.city.trim() && info.city.trim().length < 2) next.city = "Enter a valid city name.";
    if (info.postal.trim() && !isPostalCode(info.postal)) next.postal = "Postal code is 4 digits.";
    setErrors(next);
    if (Object.keys(next).length === 0) setStep(2);
  };

  const submitPayment = (e: React.FormEvent) => {
    e.preventDefault();
    const next: FieldErrors = {};
    if (method === "bkash" || method === "nagad") {
      if (!isBdPhone(payNumber)) next.payNumber = `Enter the ${method === "bkash" ? "bKash" : "Nagad"} number to pay from.`;
    }
    if (method === "card") {
      const digits = card.number.replace(/\s/g, "");
      if (!/^\d{16}$/.test(digits)) next.cardNumber = "Card number is 16 digits.";
      if (!/^(0[1-9]|1[0-2])\/\d{2}$/.test(card.expiry)) next.cardExpiry = "Use MM/YY.";
      if (!/^\d{3}$/.test(card.cvc)) next.cardCvc = "CVC is 3 digits.";
      if (card.name.trim().length < 2) next.cardName = "Name as printed on the card.";
    }
    setErrors(next);
    if (Object.keys(next).length > 0) return;

    const label = methods.find((m) => m.id === method)!.label;
    setOrder(placeOrder({ ...info, method: label }));
    setStep(3);
  };

  if (lines.length === 0 && step !== 3) {
    return (
      <div className="min-h-screen">
        <main className="mx-auto flex max-w-2xl flex-col items-center px-4 py-24 text-center">
          <Sparkle className="h-10 w-10 text-lime" />
          <h1 className="mt-4 font-display text-3xl font-bold tracking-[-0.03em]">Nothing to check out.</h1>
          <p className="mt-2 max-w-sm text-sm text-muted-foreground">
            Your bag is empty, so there's no order to place yet.
          </p>
          <Link
            to="/shop"
            className="mt-7 rounded-full bg-ink px-6 py-3 text-sm font-medium text-ink-foreground"
          >
            Shop the collection
          </Link>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen">
      <main className="mx-auto max-w-[1200px] px-4 pb-14 pt-6 md:px-6 md:pt-8">
        <nav aria-label="Breadcrumb" className="text-sm text-muted-foreground">
          <ol className="flex items-center gap-2">
            <li>
              <Link to="/" className="hover:text-foreground">
                Home
              </Link>
            </li>
            <li aria-hidden="true">/</li>
            <li>
              <Link to="/cart" className="hover:text-foreground">
                Bag
              </Link>
            </li>
            <li aria-hidden="true">/</li>
            <li aria-current="page" className="text-foreground">
              Checkout
            </li>
          </ol>
        </nav>

        <h1 className="mt-4 font-display text-[2.2rem] font-bold leading-none tracking-[-0.03em] md:text-[2.8rem]">
          Checkout.
        </h1>

        <div className="mt-6">
          <Stepper step={step} />
        </div>

        {step === 1 && (
          <form onSubmit={submitInfo} noValidate className="mt-8 grid gap-8 lg:grid-cols-[1fr_360px]">
            <div>
              <h2 className="font-display text-xl font-semibold tracking-[-0.02em]">Contact</h2>
              <p className="mt-1 text-xs text-muted-foreground"><span className="font-bold text-red-600">*</span> Required fields · All other details are optional</p>
              <div className="mt-4 grid gap-4 sm:grid-cols-2">
                <Field id="name" label="Full name" required value={info.name} onChange={set("name")} error={errors.name} autoComplete="name" placeholder="Shahid Rahman" />
                <Field id="phone" label="Mobile number" required value={info.phone} onChange={set("phone")} error={errors.phone} type="tel" autoComplete="tel" placeholder="01712345678" />
                <Field id="email" label="Email" value={info.email} onChange={set("email")} error={errors.email} type="email" autoComplete="email" placeholder="you@example.com" className="sm:col-span-2" />
              </div>

              <h2 className="mt-8 font-display text-xl font-semibold tracking-[-0.02em]">Delivery Address</h2>
              <div className="mt-4 grid gap-4 sm:grid-cols-2">
                <Field id="address" label="Address" required value={info.address} onChange={set("address")} error={errors.address} autoComplete="street-address" placeholder="House 42, Road 11, Banani" className="sm:col-span-2" />
                <Field id="city" label="City" value={info.city} onChange={set("city")} error={errors.city} autoComplete="address-level2" placeholder="Dhaka" />
                <Field id="postal" label="Postal code" value={info.postal} onChange={set("postal")} error={errors.postal} autoComplete="postal-code" placeholder="1213" />
              </div>

              <div className="mt-8 flex flex-wrap gap-3">
                <button
                  type="submit"
                  className="rounded-full bg-lime px-8 py-3.5 text-sm font-semibold text-primary-foreground transition-transform hover:scale-[1.01]"
                >
                  Continue to Payment
                </button>
                <Link
                  to="/cart"
                  className="inline-flex items-center rounded-full border border-border px-6 py-3.5 text-sm font-medium transition-colors hover:bg-accent"
                >
                  Back to bag
                </Link>
              </div>
            </div>

            <aside>
              <Summary />
            </aside>
          </form>
        )}

        {step === 2 && (
          <form onSubmit={submitPayment} noValidate className="mt-8 grid gap-8 lg:grid-cols-[1fr_360px]">
            <div>
              <h2 className="font-display text-xl font-semibold tracking-[-0.02em]">Payment Method</h2>

              <ul className="mt-4 grid gap-3 sm:grid-cols-2">
                {methods.map((m) => {
                  const on = method === m.id;
                  return (
                    <li key={m.id}>
                      <button
                        type="button"
                        onClick={() => {
                          setMethod(m.id);
                          setErrors({});
                        }}
                        aria-pressed={on}
                        className={cn(
                          "flex w-full items-center gap-3 rounded-xl border p-4 text-left transition-colors",
                          on ? "border-ink bg-panel" : "border-border hover:border-foreground",
                        )}
                      >
                        <span
                          className="grid h-9 w-9 shrink-0 place-items-center rounded-lg text-ink-foreground"
                          style={{ backgroundColor: m.tint }}
                        >
                          <m.icon className="h-4.5 w-4.5" strokeWidth={1.8} />
                        </span>
                        <span className="min-w-0">
                          <span className="block text-sm font-medium">{m.label}</span>
                          <span className="block text-xs text-muted-foreground">{m.note}</span>
                        </span>
                        {on && <Check className="ml-auto h-4 w-4 shrink-0" strokeWidth={2.4} />}
                      </button>
                    </li>
                  );
                })}
              </ul>

              {(method === "bkash" || method === "nagad") && (
                <div className="mt-5 max-w-sm">
                  <Field
                    id="payNumber"
                    label={`${method === "bkash" ? "bKash" : "Nagad"} personal number`}
                    value={payNumber}
                    onChange={(v) => {
                      setPayNumber(v);
                      setErrors({});
                    }}
                    error={errors.payNumber}
                    type="tel"
                    placeholder="01712345678"
                  />
                  <p className="mt-2 text-xs text-muted-foreground">
                    You'll get a payment request on this number. Approve it with your account PIN.
                  </p>
                </div>
              )}

              {method === "card" && (
                <div className="mt-5 grid max-w-lg gap-4 sm:grid-cols-2">
                  <Field id="cardName" label="Name on card" value={card.name} onChange={(v) => { setCard((c) => ({ ...c, name: v })); setErrors({}); }} error={errors.cardName} autoComplete="cc-name" />
                  <Field id="cardNumber" label="Card number" value={card.number} onChange={(v) => { setCard((c) => ({ ...c, number: v })); setErrors({}); }} error={errors.cardNumber} inputMode="numeric" autoComplete="cc-number" placeholder="4242 4242 4242 4242" className="sm:col-span-2" />
                  <Field id="cardExpiry" label="Expiry" value={card.expiry} onChange={(v) => { setCard((c) => ({ ...c, expiry: v })); setErrors({}); }} error={errors.cardExpiry} inputMode="numeric" autoComplete="cc-exp" placeholder="MM/YY" />
                  <Field id="cardCvc" label="CVC" value={card.cvc} onChange={(v) => { setCard((c) => ({ ...c, cvc: v })); setErrors({}); }} error={errors.cardCvc} inputMode="numeric" autoComplete="cc-csc" placeholder="123" />
                </div>
              )}

              {method === "cod" && (
                <p className="mt-5 max-w-md rounded-lg bg-panel px-4 py-3 text-sm text-muted-foreground">
                  Keep the exact amount ready — our courier carries no change.
                </p>
              )}

              <div className="mt-8 flex flex-wrap gap-3">
                <button
                  type="submit"
                  className="rounded-full bg-lime px-8 py-3.5 text-sm font-semibold text-primary-foreground transition-transform hover:scale-[1.01]"
                >
                  Place Order · {formatTaka(total)}
                </button>
                <button
                  type="button"
                  onClick={() => setStep(1)}
                  className="inline-flex items-center rounded-full border border-border px-6 py-3.5 text-sm font-medium transition-colors hover:bg-accent"
                >
                  Back
                </button>
              </div>
            </div>

            <aside>
              <Summary />
            </aside>
          </form>
        )}

        {step === 3 && order && (
          <div className="mt-10 grid gap-8 lg:grid-cols-[1fr_360px]">
            <div className="rounded-2xl border border-border bg-panel/60 p-6 md:p-10">
              <span className="grid h-14 w-14 place-items-center rounded-full bg-lime">
                <Check className="h-7 w-7 text-primary-foreground" strokeWidth={2.6} />
              </span>
              <h2 className="mt-5 font-display text-[2rem] font-bold leading-tight tracking-[-0.03em] md:text-[2.4rem]">
                Order placed.
              </h2>
              <p className="mt-2 text-[15px] text-muted-foreground">
                Thanks {order.name.split(" ")[0]} — we've got it.
                {order.email ? <> A confirmation is on its way to {order.email}.</> : " Your order details are confirmed."}
              </p>

              <p className="mt-6 inline-flex items-center gap-2 rounded-full border border-border bg-background px-4 py-2 text-sm">
                <span className="text-muted-foreground">Order number</span>
                <span className="font-semibold tabular-nums">{order.number}</span>
              </p>

              <div className="mt-8 grid gap-6 sm:grid-cols-2">
                <div>
                  <h3 className="text-xs uppercase tracking-[0.16em] text-muted-foreground">Delivering to</h3>
                  <p className="mt-2 text-[15px] leading-relaxed">
                    {order.name}
                    <br />
                    {order.address}
                    <br />
                    {[order.city, order.postal].filter(Boolean).join(" ")}
                    {(order.city || order.postal) && <br />}
                    {order.phone}
                  </p>
                </div>
                <div>
                  <h3 className="text-xs uppercase tracking-[0.16em] text-muted-foreground">Payment</h3>
                  <p className="mt-2 text-[15px]">{order.method}</p>
                  <p className="mt-1 text-sm text-muted-foreground">
                    Expected in 2–4 working days across Bangladesh.
                  </p>
                </div>
              </div>

              <div className="mt-8 flex flex-wrap gap-3">
                <Link
                  to="/shop"
                  className="rounded-full bg-ink px-6 py-3 text-sm font-medium text-ink-foreground transition-colors hover:bg-foreground"
                >
                  Continue Shopping
                </Link>
                <Link
                  to="/cart"
                  className="rounded-full border border-border px-6 py-3 text-sm font-medium transition-colors hover:bg-accent"
                >
                  Back to bag
                </Link>
              </div>
            </div>

            <aside>
              <div className="rounded-xl border border-border bg-panel/70 p-5">
                <h2 className="font-display text-lg font-semibold tracking-[-0.02em]">Receipt</h2>
                <ul className="mt-4 space-y-3">
                  {order.lines.map((l) => (
                    <li key={l.key} className="flex items-center gap-3">
                      <img src={l.image} alt={l.name} width={52} height={52} className="h-13 w-13 shrink-0 rounded-md object-cover" />
                      <span className="min-w-0 flex-1">
                        <span className="block truncate text-sm">{l.name}</span>
                        <span className="block text-xs text-muted-foreground">
                          {l.color} · {l.size} · ×{l.qty}
                        </span>
                      </span>
                      <span className="text-sm tabular-nums">{formatTaka(l.price * l.qty)}</span>
                    </li>
                  ))}
                </ul>
                <dl className="mt-4 space-y-1.5 border-t border-border pt-3 text-sm">
                  <div className="flex justify-between">
                    <dt className="text-muted-foreground">Subtotal</dt>
                    <dd className="tabular-nums">{formatTaka(order.subtotal)}</dd>
                  </div>
                  <div className="flex justify-between">
                    <dt className="text-muted-foreground">Delivery</dt>
                    <dd className="tabular-nums">{order.shipping === 0 ? "Free" : formatTaka(order.shipping)}</dd>
                  </div>
                  <div className="flex justify-between border-t border-border pt-2 text-base font-semibold">
                    <dt>Paid</dt>
                    <dd className="tabular-nums">{formatTaka(order.total)}</dd>
                  </div>
                </dl>
              </div>
            </aside>
          </div>
        )}
      </main>

      <Footer />
    </div>
  );
}
