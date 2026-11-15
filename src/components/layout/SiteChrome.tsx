import { CartDrawer } from "@/components/layout/CartDrawer";
import { MenuDrawer } from "@/components/layout/MenuDrawer";
import { SearchDrawer } from "@/components/layout/SearchDrawer";
import { SiteHeader } from "@/components/layout/SiteHeader";

/** Site-wide chrome: the bar plus the three overlays every page can open. */
export function SiteChrome() {
  return (
    <>
      <SiteHeader />
      <CartDrawer />
      <SearchDrawer />
      <MenuDrawer />
    </>
  );
}
