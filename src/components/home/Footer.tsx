import { useState, type FormEvent } from "react";
import { ArrowRight, ArrowUp, Plus } from "lucide-react";
import { Link } from "@tanstack/react-router";
import footerBuilding from "@/assets/footer-building.jpg";
import footerBand from "@/assets/footer-band.jpg";
import { cn } from "@/lib/utils";
import { footerLinks } from "./data";
import { Logo } from "./Logo";
import { FacebookIcon, InstagramIcon, Sparkle, TikTokIcon, YoutubeIcon } from "./icons";

const socials = [
  { label: "Instagram", icon: InstagramIcon },
  { label: "YouTube", icon: YoutubeIcon },
  { label: "TikTok", icon: TikTokIcon },
  { label: "Facebook", icon: FacebookIcon },
];

function Socials({ className }: { className?: string }) {
  return (
    <ul className={cn("flex items-center gap-11 md:gap-9", className)}>
      {socials.map(({ label, icon: Icon }) => (
        <li key={label}>
          <a href="#" aria-label={label} className="block text-ink-foreground transition-colors hover:text-lime">
            <Icon className="h-6 w-6" />
          </a>
        </li>
      ))}
    </ul>
  );
}

function Newsletter() {
  const [email, setEmail] = useState("");
  const [done, setDone] = useState(false);
  const onSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (!/^\S+@\S+\.\S+$/.test(email)) return;
    setDone(true);
    setEmail("");
  };
  return (
    <form onSubmit={onSubmit} className="mt-6">
      <label htmlFor="newsletter-email" className="sr-only">
        Email address
      </label>
      <div className="flex h-14 items-center rounded-full border border-ink-foreground/60 pl-6 focus-within:border-lime">
        <input
          id="newsletter-email"
          type="email"
          required
          value={email}
          onChange={(e) => {
            setEmail(e.target.value);
            setDone(false);
          }}
          placeholder="Your email address"
          className="min-w-0 flex-1 bg-transparent text-base text-ink-foreground placeholder:text-ink-muted focus:outline-none"
        />
        <button
          type="submit"
          aria-label="Subscribe"
          className="-mr-px grid h-14 w-14 shrink-0 place-items-center rounded-full bg-lime text-primary-foreground transition-transform hover:scale-105"
        >
          <ArrowRight className="h-6 w-6" strokeWidth={2} />
        </button>
      </div>
      <p role="status" className="mt-2 h-5 text-sm text-lime">
        {done ? "You're on the list. Welcome to ISHTILE+." : ""}
      </p>
    </form>
  );
}

function AccordionGroup({ title, items }: { title: string; items: readonly string[] }) {
  const [open, setOpen] = useState(false);
  return (
    <div className="border-b border-ink-foreground/30">
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        aria-expanded={open}
        className="flex w-full items-center justify-between py-4 text-left text-xl font-semibold text-ink-foreground"
      >
        {title}
        <Plus className={cn("h-6 w-6 transition-transform", open && "rotate-45")} strokeWidth={1.6} />
      </button>
      <div className={cn("grid transition-[grid-template-rows] duration-300", open ? "grid-rows-[1fr]" : "grid-rows-[0fr]")}>
        <ul className="overflow-hidden">
          {items.map((item) => (
            <li key={item}>
              <FooterLink item={item} className="block pb-3 text-base text-ink-muted hover:text-lime" />
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}

function FooterLink({ item, className, children }: { item: string; className?: string; children?: React.ReactNode }) {
  const destinations: Record<string, string> = {
    "All Products": "/shop",
    "New Arrivals": "/shop",
    "Best Sellers": "/shop",
    "On Sale": "/shop",
    "ONEN +": "/shop",
    FARAK: "/shop",
    "MOCHA +": "/shop",
    PILGRIM: "/shop",
    "More Brands": "/#brands",
    Editorial: "/editorial",
    Culture: "/about",
    Stores: "/stores",
    About: "/about",
    Account: "/account",
    Wishlist: "/wishlist",
    "Our Story": "/about",
    Careers: "/about",
    Contact: "/stores",
    "Help & FAQ": "/account",
  };
  const to = destinations[item] ?? "/shop";
  if (to.startsWith("/#")) {
    return <a href={to} className={className}>{children ?? item}</a>;
  }
  return <Link to={to as "/shop"} className={className}>{children ?? item}</Link>;
}

const toTop = () => window.scrollTo({ top: 0, behavior: "smooth" });

export function Footer() {
  const columns = (["Shop", "Brands", "Explore"] as const).map((k) => [k, footerLinks[k]] as const);

  return (
    <footer id="about" data-header-theme="dark" className="relative overflow-hidden bg-ink text-ink-foreground">
      <div className="absolute inset-x-0 top-0">
        <img
          src={footerBuilding}
          alt=""
          aria-hidden="true"
          width={1536}
          height={720}
          loading="lazy"
          className="h-[620px] w-full object-cover object-top md:h-auto md:max-h-[880px]"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-ink/20 to-ink" />
      </div>

      <div className="relative mx-auto max-w-[1600px] px-6 pt-36 md:px-[4.2%] md:pt-[27vw] lg:pt-[min(27vw,420px)]">
        {/* desktop */}
        <div className="hidden md:grid md:grid-cols-[1.25fr_0.6fr_0.55fr_0.7fr_1.35fr] md:gap-6">
          <div>
            <Logo className="text-[clamp(2rem,3vw,2.9rem)]" />
            <p className="mt-5 text-[17px] leading-snug text-ink-foreground">
              Fashion, culture and beyond.
              <br />
              Explore. Discover. Belong.
            </p>
            <Socials className="mt-14" />
          </div>
          {columns.map(([title, items]) => (
            <div key={title}>
              <FooterLink item={title} className="group inline-flex items-center gap-1.5 text-xl font-semibold">
                {title}
                <ArrowRight className="h-5 w-5 transition-transform group-hover:translate-x-0.5" />
              </FooterLink>
              <ul className="mt-5 space-y-3.5">
                {items.map((item) => (
                  <li key={item}>
                    <FooterLink item={item} className="text-[17px] text-ink-foreground/85 transition-colors hover:text-lime" />
                  </li>
                ))}
              </ul>
            </div>
          ))}
          <div>
            <p className="inline-flex items-center gap-1.5 text-xl font-semibold">
              Join the ISHTILE+ Community <ArrowRight className="h-5 w-5" />
            </p>
            <p className="mt-3 max-w-xs text-[17px] leading-snug text-ink-foreground/90">
              Get updates on new drops, exclusive collections and more.
            </p>
            <Newsletter />
          </div>
        </div>

        {/* mobile */}
        <div className="md:hidden">
          <Logo className="text-[2.6rem]" />
          <p className="mt-5 text-xl leading-snug">
            Fashion, culture and
            <br />
            beyond.
            <br />
            Explore. Discover. Belong.
          </p>
          <svg viewBox="0 0 220 16" className="mt-1 h-4 w-56 text-lime" aria-hidden="true">
            <path d="M2 14C60 6 120 3 218 2" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" />
          </svg>
          <div className="mt-10">
            {(Object.keys(footerLinks) as (keyof typeof footerLinks)[]).map((k) => (
              <AccordionGroup key={k} title={k} items={footerLinks[k]} />
            ))}
          </div>
          <div className="mt-10 flex gap-4">
            <Sparkle className="h-8 w-8 shrink-0 text-lime" />
            <div>
              <p className="text-xl font-semibold leading-tight">Join the ISHTILE+ Community</p>
              <p className="mt-1.5 text-base leading-snug text-ink-foreground/90">
                Get updates on new drops, exclusive collections and more.
              </p>
            </div>
          </div>
          <Newsletter />
          <Socials className="mt-6" />
        </div>

        <div className="mt-10 border-t border-ink-foreground/40 md:mt-12" />
        <div className="flex flex-wrap items-center justify-between gap-y-5 py-5 text-base md:text-[15px]">
          <p className="order-3 w-full md:order-1 md:w-auto">© 2025 ISHTILE+. All rights reserved.</p>
          <ul className="order-1 flex gap-7 md:order-2 md:gap-8">
            {["Privacy", "Terms", "Cookies"].map((l) => (
              <li key={l}>
                <a href="#" className="hover:text-lime">
                  {l}
                </a>
              </li>
            ))}
          </ul>
          <button onClick={toTop} className="order-2 inline-flex items-center gap-2 hover:text-lime md:order-3">
            Back to top <ArrowUp className="h-4 w-4" />
          </button>
        </div>
      </div>

      <img
        src={footerBand}
        alt="ISHTILE"
        width={1536}
        height={264}
        loading="lazy"
        className="relative mt-4 block aspect-[1536/264] w-full object-cover max-md:aspect-[1536/330]"
      />
    </footer>
  );
}
