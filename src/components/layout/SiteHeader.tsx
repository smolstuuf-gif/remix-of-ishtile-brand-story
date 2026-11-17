import { useEffect, useState } from "react";
import { Link, useRouterState } from "@tanstack/react-router";
import { Search, ShoppingBag, UserRound } from "lucide-react";
import { MenuToggleIcon } from "@/components/ui/menu-toggle-icon";
import { Logo } from "@/components/home/Logo";
import { useCart } from "@/lib/store";

const nav = [
  { label: "Shop", to: "/shop" as const },
  { label: "Brands", to: "/brands" as const },
  { label: "Editorial", to: "/editorial" as const },
  { label: "Collections", to: "/collections" as const },
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
  const { count, menuOpen, openCart, openSearch, openMenu, closeMenu } = useCart();

  return (
    <header className={`site-header z-50 w-full text-white ${isHome || isBrands ? "fixed inset-x-0 top-0" : "sticky top-0"}`}>
      <div className="site-header__content mx-auto flex h-16 max-w-[1600px] items-center justify-between gap-4 px-4 text-white md:h-[72px] md:px-6">
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
          <button type="button" aria-label={menuOpen ? "Close menu" : "Open menu"} aria-expanded={menuOpen} onClick={() => (menuOpen ? closeMenu() : openMenu())} className="grid h-10 w-10 place-items-center transition-colors hover:text-lime md:hidden"><MenuToggleIcon open={menuOpen} className="h-7 w-7" strokeWidth={2.2} duration={500} /></button>
        </div>
      </div>
    </header>
  );
}
