import { CartDrawer } from "@/components/layout/CartDrawer";
import { MenuDrawer } from "@/components/layout/MenuDrawer";
import { SearchDrawer } from "@/components/layout/SearchDrawer";
import { SiteHeader } from "@/components/layout/SiteHeader";

/** Site-wide chrome: the bar plus the three overlays every page can open. */
export function SiteChrome({ hideHeader = false }: { hideHeader?: boolean }) {
  return (
    <>
      {!hideHeader && <SiteHeader />}
      <CartDrawer />
      <SearchDrawer />
      <MenuDrawer />
    </>
  );
}
