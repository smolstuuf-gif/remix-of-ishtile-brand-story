import { useEffect, useState } from "react";
import { Link, useRouterState } from "@tanstack/react-router";
import { Menu, Search, ShoppingBag, UserRound } from "lucide-react";
import { Logo } from "@/components/home/Logo";
import { useCart } from "@/lib/store";

const nav = [
  { label: "Shop", to: "/shop" as const },
  { label: "Collections", to: "/collections" as const },
  { label: "Brands", to: "/brands" as const },
  { label: "Editorial", to: "/editorial" as const },
  { label: "Stores", to: "/stores" as const },
  { label: "About", to: "/about" as const },
];

function CountBadge({ n }: { n: number }) {
  if (n <= 0) return null;
  return <span className="absolute -right-1.5 -top-1.5 grid h-4 min-w-4 place-items-center rounded-full bg-lime px-1 text-[10px] font-semibold tabular-nums text-primary-foreground">{n > 99 ? "99+" : n}</span>;
}

/** Persistent transparent navigation whose foreground follows the section underneath. */
export function SiteHeader() {
  const isHome = useRouterState({ select: (s) => s.location.pathname === "/" });
  const isBrands = useRouterState({ select: (s) => s.location.pathname === "/brands" });
  const [theme, setTheme] = useState<"dark" | "light">("dark");
  const { count, openCart, openSearch, openMenu } = useCart();

  useEffect(() => {
    const updateTheme = () => {
      const probeY = 36;
      let nextTheme: "dark" | "light" = "light";
      let matchedSection = false;
      document.querySelectorAll<HTMLElement>("[data-header-theme]").forEach((section) => {
        const rect = section.getBoundingClientRect();
        if (rect.top <= probeY && rect.bottom > probeY) {
          nextTheme = section.dataset["headerTheme"] === "dark" ? "dark" : "light";
          matchedSection = true;
        }
      });

      // For untagged sections, inspect the actual surface beneath the center of the header.
      if (!matchedSection) {
        const stack = document.elementsFromPoint(window.innerWidth / 2, probeY);
        for (const element of stack) {
          if (element.closest(".site-header")) continue;
          let current: HTMLElement | null = element instanceof HTMLElement ? element : null;
          while (current && current !== document.body) {
            const color = window.getComputedStyle(current).backgroundColor;
            const match = color.match(/rgba?\(([^)]+)\)/);
            if (match) {
              const channels = (match[1] ?? "").split(/[\s,/]+/).filter(Boolean).map(Number);
              const alpha = channels[3] ?? 1;
              const red = channels[0] ?? 255;
              const green = channels[1] ?? red;
              const blue = channels[2] ?? red;
              if (channels.length >= 3 && alpha > 0.12 && channels.slice(0, 3).every(Number.isFinite)) {
                const luminance = (0.2126 * red + 0.7152 * green + 0.0722 * blue) / 255;
                nextTheme = luminance < 0.48 ? "dark" : "light";
                break;
              }
            }
            current = current.parentElement;
          }
          break;
        }
      }

      setTheme((current) => current === nextTheme ? current : nextTheme);
    };
    updateTheme();
    window.addEventListener("scroll", updateTheme, { passive: true });
    window.addEventListener("resize", updateTheme);
    return () => {
      window.removeEventListener("scroll", updateTheme);
      window.removeEventListener("resize", updateTheme);
    };
  }, [isHome]);

  return (
    <header data-theme={theme} className={`site-header z-50 w-full text-[color:var(--header-foreground)] ${isHome || isBrands ? "fixed inset-x-0 top-0" : "sticky top-0"}`}>
      <div className="mx-auto flex h-16 max-w-[1600px] items-center justify-between gap-4 px-4 md:h-[72px] md:px-6">
        <Link to="/" aria-label="ISHTILE+ home" className="text-[1.35rem]"><Logo /></Link>
        <nav className="hidden items-center gap-9 md:flex">
          {nav.map((item) => "to" in item ? (
            <Link key={item.label} to={item.to} activeProps={{ className: "opacity-100" }} className="text-[15px] font-medium opacity-85 transition-colors hover:text-lime hover:opacity-100">{item.label}</Link>
          ) : (
            <a key={item.label} href={item.href} className="text-[15px] font-medium opacity-85 transition-colors hover:text-lime hover:opacity-100">{item.label}</a>
          ))}
        </nav>
        <div className="flex items-center gap-5">
          <Link to="/account" aria-label="Your account" title="Your account" className="hidden transition-colors hover:text-lime sm:block"><UserRound className="h-5 w-5" strokeWidth={1.7} /></Link>
          <button type="button" aria-label="Search" onClick={openSearch} className="transition-colors hover:text-lime"><Search className="h-6 w-6" strokeWidth={1.7} /></button>
          <button type="button" aria-label={`Bag, ${count} item${count === 1 ? "" : "s"}`} onClick={openCart} className="relative transition-colors hover:text-lime"><ShoppingBag className="h-6 w-6" strokeWidth={1.7} /><CountBadge n={count} /></button>
          <button type="button" aria-label="Menu" onClick={openMenu} className="transition-colors hover:text-lime md:hidden"><Menu className="h-6 w-6" strokeWidth={1.7} /></button>
        </div>
      </div>
    </header>
  );
}
