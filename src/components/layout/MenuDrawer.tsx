import { Link } from "@tanstack/react-router";
import { Sheet, SheetContent, SheetDescription, SheetTitle } from "@/components/ui/sheet";
import { Logo } from "@/components/home/Logo";
import { FacebookIcon, InstagramIcon, Sparkle, WhatsAppIcon } from "@/components/home/icons";
import { useCart } from "@/lib/store";

const links = [
  { label: "Home", href: "/" },
  { label: "Shop", to: "/shop" as const },
  { label: "Cart", to: "/cart" as const },
  { label: "Checkout", to: "/checkout" as const },
  { label: "Brands", href: "/#brands" },
  { label: "Editorial", to: "/editorial" as const },
  { label: "Collections", to: "/collections" as const },
  { label: "Stores", to: "/stores" as const },
  { label: "Wishlist", to: "/wishlist" as const },
  { label: "Account", to: "/account" as const },
  { label: "About", to: "/about" as const },
];

const socials = [
  { label: "Instagram", href: "https://www.instagram.com/ishtilewear/", icon: InstagramIcon },
  { label: "Facebook", href: "https://www.facebook.com/profile.php?id=61596685345300", icon: FacebookIcon },
  { label: "WhatsApp", href: "https://wa.me/8801627397098", icon: WhatsAppIcon },
];

export function MenuDrawer() {
  const { menuOpen, closeMenu } = useCart();

  return (
    <Sheet open={menuOpen} onOpenChange={(open) => (open ? undefined : closeMenu())}>
      <SheetContent side="left" className="flex w-full flex-col gap-0 border-white/15 bg-ink p-0 text-[#f5f0e6] sm:max-w-sm">
        <SheetTitle className="sr-only">Menu</SheetTitle>
        <SheetDescription className="sr-only">Site navigation</SheetDescription>

        <div className="border-b border-white/15 px-6 pb-5 pt-6 pr-12">
          <Logo className="text-[1.6rem]" />
        </div>

        <nav className="flex-1 overflow-y-auto px-6 py-4">
          <ul className="divide-y divide-white/15">
            {links.map((item) => (
              <li key={item.label}>
                {"to" in item ? (
                  <Link
                    to={item.to}
                    onClick={closeMenu}
                    className="block py-4 font-display text-2xl font-semibold tracking-[-0.02em] transition-colors hover:text-lime"
                  >
                    {item.label}
                  </Link>
                ) : (
                  <a href={item.href} onClick={closeMenu} className="block py-4 font-display text-2xl font-semibold tracking-[-0.02em] transition-colors hover:text-lime">
                    {item.label}
                  </a>
                )}
              </li>
            ))}
          </ul>
        </nav>

        <div className="border-t border-white/15 px-6 py-5">
          <ul className="flex items-center gap-5">
            {socials.map(({ label, href, icon: Icon }) => (
              <li key={label}>
                <a href={href} target="_blank" rel="noopener noreferrer" aria-label={label} className="block transition-colors hover:text-lime">
                  <Icon className="h-5 w-5" />
                </a>
              </li>
            ))}
          </ul>
          <p className="mt-4 inline-flex items-center gap-2 text-xs text-[#bdb7aa]">
            <Sparkle className="h-3.5 w-3.5 text-lime" />
            Discover beyond labels.
          </p>
        </div>
      </SheetContent>
    </Sheet>
  );
}
