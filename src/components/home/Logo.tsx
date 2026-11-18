import { useEffect, useState } from "react";
import { cn } from "@/lib/utils";
import { fetchPublicBrandInfo } from "@/lib/public-store";
import { STAR_PATH, TAGLINE_PATHS, WORDMARK_PATHS } from "./brand-paths";

/** Official ISHTILE vector wordmark + starburst. Inherits text color; sized by font-size (height = 1em). */
export function Logo({ className, tagline = false }: { className?: string; sparkleClassName?: string; tagline?: boolean }) {
  const [brandAssets, setBrandAssets] = useState<{ logo_url: string | null; symbol_url: string | null } | null>(null);
  useEffect(() => { let live = true; fetchPublicBrandInfo().then((info) => { if (live && info) setBrandAssets({ logo_url: info.logo_url, symbol_url: info.symbol_url }); }).catch(() => undefined); return () => { live = false; }; }, []);
  const vb = tagline ? "40 68 540 124" : "40 68 540 124";
  if (brandAssets?.logo_url) return <span className={cn("inline-flex items-center gap-[0.2em] leading-none", className)} role="img" aria-label="ISHTILE"><img src={brandAssets.logo_url} alt="" className="h-[1.3em] max-w-[8em] object-contain" />{brandAssets.symbol_url && <img src={brandAssets.symbol_url} alt="" className="h-[0.9em] w-[0.9em] object-contain" />}</span>;
  return (
    <span className={cn("inline-flex items-center leading-none", className)} role="img" aria-label="ISHTILE">
      <svg viewBox={vb} fill="currentColor" className="h-[1.3em] w-auto" aria-hidden="true">
        {WORDMARK_PATHS.map((d, i) => <path key={i} d={d} />)}
        <path d={STAR_PATH} />
        {tagline && TAGLINE_PATHS.map((d, i) => <path key={`t${i}`} d={d} />)}
      </svg>
    </span>
  );
}
