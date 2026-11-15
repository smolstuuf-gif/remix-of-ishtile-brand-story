import { Link, useRouterState } from "@tanstack/react-router";
import { Menu, Search, ShoppingBag, UserRound } from "lucide-react";
import { Logo } from "@/components/home/Logo";
import { useCart } from "@/lib/store";

const nav = [
  { label: "Shop", to: "/shop" as const },
  { label: "Brands", href: "/#brands" },
  { label: "Editorial", to: "/editorial" as const },
  { label: "Stores", to: "/stores" as const },
  { label: "About", to: "/about" as const },
];

function CountBadge({ n }: { n: number }) {
  if (n <= 0) return null;
  return (
    <span className="absolute -right-1.5 -top-1.5 grid h-4 min-w-4 place-items-center rounded-full bg-lime px-1 text-[10px] font-semibold tabular-nums text-primary-foreground">
      {n > 99 ? "99+" : n}
    </span>
  );
}

/**
 * Site-wide bar shown on every page except the homepage, which carries its own
 * header inside the opening photo.
 */
export function SiteHeader() {
  const isHome = useRouterState({ select: (s) => s.location.pathname === "/" });
  const { count, openCart, openSearch, openMenu } = useCart();

  if (isHome) return null;

  return (
    <header className="sticky top-0 z-40 border-b border-border/70 bg-background/85 backdrop-blur-md">
      <div className="mx-auto flex h-16 max-w-[1600px] items-center justify-between gap-4 px-4 md:h-[72px] md:px-6">
        <Link to="/" aria-label="ISHTILE+ home" className="text-[1.35rem] text-foreground">
          <Logo />
        </Link>

        <nav className="hidden items-center gap-9 md:flex">
          {nav.map((item) =>
            "to" in item ? (
              <Link
                key={item.label}
                to={item.to}
                activeProps={{ className: "text-foreground" }}
                className="text-[15px] font-medium text-muted-foreground transition-colors hover:text-foreground"
              >
                {item.label}
              </Link>
            ) : (
              <a
                key={item.label}
                href={item.href}
                className="text-[15px] font-medium text-muted-foreground transition-colors hover:text-foreground"
              >
                {item.label}
              </a>
            ),
          )}
        </nav>

        <div className="flex items-center gap-5 text-foreground">
          <Link to="/account" aria-label="Your account" title="Your account" className="hidden transition-colors hover:text-lime sm:block">
            <UserRound className="h-5 w-5" strokeWidth={1.7} />
          </Link>
          <button type="button" aria-label="Search" onClick={openSearch} className="transition-colors hover:text-lime">
            <Search className="h-6 w-6" strokeWidth={1.7} />
          </button>
          <button
            type="button"
            aria-label={`Bag, ${count} item${count === 1 ? "" : "s"}`}
            onClick={openCart}
            className="relative transition-colors hover:text-lime"
          >
            <ShoppingBag className="h-6 w-6" strokeWidth={1.7} />
            <CountBadge n={count} />
          </button>
          <button type="button" aria-label="Menu" onClick={openMenu} className="md:hidden">
            <Menu className="h-6 w-6" strokeWidth={1.7} />
          </button>
        </div>
      </div>
    </header>
  );
}
